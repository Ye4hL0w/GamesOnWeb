import { Player } from '../entities/Player.js';
import { Exit } from '../elements/Exit.js';

export class BaseLevel {
    constructor(context, canvas) {
        this.context = context;
        this.canvas = canvas;
        this.floorHeight = 50;
        
        this.cameraX = 0;
        this.scrollSpeed = 5;
        this.scrollThreshold = this.canvas.width * 0.4;
        
        this.obstacles = [];
        this.platforms = [];
        this.levelWidth = 5000;
        
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            ArrowUp: false
        };

        this.exit = null;
        
        this.lastTime = performance.now();
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;

        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
            }
        });
    }

    update() {
        if (this.player) {
            this.player.update(this.keys, this.floorHeight);

            if (this.player.x > this.canvas.width * 0.6 && this.keys.ArrowRight) {
                const scrollAmount = 10;
                if (this.cameraX + this.canvas.width < this.levelWidth) {
                    this.cameraX += scrollAmount;
                    this.player.x -= scrollAmount;
                }
            }
            
            if (this.player.x < this.canvas.width * 0.2 && this.keys.ArrowLeft) {
                const scrollAmount = 10;
                if (this.cameraX > 0) {
                    this.cameraX -= scrollAmount;
                    this.player.x += scrollAmount;
                }
            }

            if (this.player.x < 0 && this.cameraX === 0) {
                this.player.x = 0;
            }

            if (this.player.x + this.player.width > this.canvas.width && 
                this.cameraX + this.canvas.width >= this.levelWidth) {
                this.player.x = this.canvas.width - this.player.width;
            }
        }

        this.updateObstacles();
        this.checkExitCollision();
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGround();
        this.drawObstacles();

        if (this.exit) {
            this.exit.draw(this.context, this.cameraX);
        }

        if (this.player) {
            this.player.draw(this.context);
        }
    }

    drawGround() {
        this.context.fillStyle = 'black';
        this.context.fillRect(0, this.canvas.height - this.floorHeight, this.canvas.width, this.floorHeight);
    }

    drawObstacles() {
        this.context.save();
        this.context.translate(-this.cameraX, 0);

        for (const obstacle of this.obstacles) {
            if (obstacle.x + obstacle.width > this.cameraX && 
                obstacle.x < this.cameraX + this.canvas.width) {
                this.context.fillStyle = 'black';
                this.context.fillRect(
                    obstacle.x,
                    obstacle.y,
                    obstacle.width,
                    obstacle.height
                );
            }
        }

        for (const platform of this.platforms) {
            if (platform.x + platform.width > this.cameraX && 
                platform.x < this.cameraX + this.canvas.width) {
                this.context.fillStyle = '#444';
                this.context.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
        }

        this.context.restore();
    }

    updateObstacles() {
        if (this.player) {
            for (const obstacle of this.obstacles) {
                if (this.checkCollision(this.player, obstacle)) {
                    this.handleCollision(this.player, obstacle);
                }
            }
        }
    }

    checkCollision(player, obstacle) {
        const adjustedObstacleX = obstacle.x - this.cameraX;
        
        return player.x < adjustedObstacleX + obstacle.width &&
               player.x + player.width > adjustedObstacleX &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }

    handleCollision(player, obstacle) {
        const adjustedObstacleX = obstacle.x - this.cameraX;
        const playerRight = player.x + player.width;
        const obstacleRight = adjustedObstacleX + obstacle.width;

        if (playerRight > adjustedObstacleX && player.x < adjustedObstacleX) {
            player.x = adjustedObstacleX - player.width;
        }
        else if (player.x < obstacleRight && playerRight > obstacleRight) {
            player.x = obstacleRight;
        }
    }

    checkExitCollision() {
        if (!this.exit || !this.player || !this.exit.isActive) return;

        const adjustedExitX = this.exit.x - this.cameraX;
        
        if (this.player.x < adjustedExitX + this.exit.width &&
            this.player.x + this.player.width > adjustedExitX &&
            this.player.y < this.exit.y + this.exit.height &&
            this.player.y + this.player.height > this.exit.y) {
            
            this.exit.isActive = false;
            this.onLevelComplete();
        }
    }

    initialize() {
        this.player = new Player(this.canvas);
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;
        
        if (elapsed > this.frameInterval) {
            this.lastTime = currentTime - (elapsed % this.frameInterval);
            this.update();
            this.draw();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    onLevelComplete() {
        console.log('Niveau terminé !');
    }
} 