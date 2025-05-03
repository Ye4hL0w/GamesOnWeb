import { Player } from '../entities/Player.js';
import { Exit } from '../elements/Exit.js';

export class BaseLevel {
    constructor(context, canvas) {
        this.context = context;
        this.canvas = canvas;
        
        console.log("BaseLevel constructor - Canvas:", canvas.width, "x", canvas.height);
        
        this.floorHeight = 50;
        this.floorY = this.canvas.height - this.floorHeight;
        
        this.cameraX = 0;
        this.scrollSpeed = 5;
        this.scrollAmount = 15
        this.scrollThreshold = this.canvas.width * 0.4;
        
        this.obstacles = [];
        this.platforms = [];
        this.levelWidth = 10000;
        
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

        this.isRunning = true;
        
        // Propriétés pour l'animation du titre
        this.levelTitle = "Niveau";
        this.titleY = this.canvas.height / 2;
        this.targetTitleY = 50;
        this.titleAnimationDone = false;
        this.titleAnimationStarted = false;
        this.titleAnimationSpeed = 2;
        this.titleDisplayTime = 0;
        
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
                if (this.cameraX + this.canvas.width < this.levelWidth) {
                    this.cameraX += this.scrollAmount;
                    this.player.x -= this.scrollAmount;
                }
            }
            
            if (this.player.x < this.canvas.width * 0.2 && this.keys.ArrowLeft) {
                if (this.cameraX > 0) {
                    this.cameraX -= this.scrollAmount;
                    this.player.x += this.scrollAmount;
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

        this.drawLevelTitle();
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
        this.floorY = this.canvas.height - this.floorHeight;
        
        // Créer le joueur si nécessaire
        if (!this.player) {
            this.player = new Player(this.canvas);
        }
        
        this.lastTime = performance.now();
    }

    onLevelComplete() {
        console.log('Niveau terminé !');
    }

    handleResize() {
        this.floorY = this.canvas.height - this.floorHeight;
        
        this.updateElementPositions();
        
        this.draw();
    }

    updateElementPositions() {
        if (this.player) {
            this.player.x = this.canvas.width * 0.1;
            
            // verifier que le joueur est au bon niveau vertical
            this.player.y = this.canvas.height - this.floorHeight - this.player.height + 10;
        }
        
        // recalcul des positions d'autres éléments si nécessaire
        if (this.exit) {
            // garder la position de la sortie relative à la taille du canvas
            this.exit.y = this.canvas.height - this.floorHeight - this.exit.height;
        }
    }

    drawLevelTitle() {
        if (!this.titleAnimationStarted) {
            this.titleDisplayTime++;
            if (this.titleDisplayTime > 30) {
                this.titleAnimationStarted = true;
            }
        }
        
        if (this.titleAnimationStarted && !this.titleAnimationDone) {
            this.titleY -= this.titleAnimationSpeed;
            
            if (this.titleY <= this.targetTitleY) {
                this.titleY = this.targetTitleY;
                this.titleAnimationDone = true;
            }
        }
        
        this.context.save();
        
        const fontSize = this.titleAnimationDone ? 24 : 36;
        this.context.font = `bold ${fontSize}px Arial`;
        
        const textWidth = this.context.measureText(this.levelTitle).width;
        
        this.context.fillStyle = 'black';
        this.context.textAlign = 'center';
        
        this.context.fillText(this.levelTitle, this.canvas.width / 2, this.titleY);
        this.context.restore();
    }
} 