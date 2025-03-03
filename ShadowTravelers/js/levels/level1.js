import { BaseLevel } from './BaseLevel.js';
import { Exit } from '../entities/Exit.js';
import { Ghost } from '../entities/Ghost.js';
import { JumpingObstacle } from '../entities/JumpingObstacle.js';
import { DirectionalObstacle } from '../entities/DirectionalObstacle.js';

export class Level1 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.ghosts = [];
        this.jumpingObstacles = []; // Tableau pour stocker les obstacles interactifs
        this.directionalObstacles = []; // Tableau pour stocker les obstacles directionnels
    }

    initialize() {
        super.initialize();

        const obstacleHeight = 100;
        const obstacleY = this.canvas.height - this.floorHeight - (this.canvas.height * -4.9);
        
        this.obstacles.push(
            { x: 1500, y: obstacleY, width: 50, height: obstacleHeight },
            { x: 2000, y: obstacleY, width: 50, height: obstacleHeight },
            { x: 2500, y: obstacleY, width: 50, height: obstacleHeight }
        );

        this.jumpingObstacles.push(
            new JumpingObstacle(3200, obstacleY, 70, this.canvas.height, 200, 8)
        );
        
        this.directionalObstacles.push(
            new DirectionalObstacle(3800, obstacleY, 70, this.canvas.height, 200, 8)
        );

        const ghostY = obstacleY;
        this.ghosts.push(
            new Ghost(750, ghostY, "Bonjour voyageur !")
        );

        this.exit = new Exit(
            this.levelWidth - 200,
            this.canvas.height - this.floorHeight - 100,
            50,
            100
        );
    }

    update() {
        super.update();
        
        if (this.player) {
            const playerAbsoluteX = this.player.x + this.cameraX;
            for (const ghost of this.ghosts) {
                ghost.update(playerAbsoluteX);
            }
            
            for (const obstacle of this.jumpingObstacles) {
                obstacle.update();
                
                if (this.player.isJumping && !this.player.wasJumping) {
                    obstacle.onPlayerJump();
                } else if (!this.player.isJumping && this.player.wasJumping) {
                    obstacle.onPlayerLand();
                }
                
                if (this.checkCollision(this.player, obstacle)) {
                    this.handleCollision(this.player, obstacle);
                }
            }
            
            for (const obstacle of this.directionalObstacles) {
                obstacle.update();
                
                if (this.keys.ArrowLeft) {
                    obstacle.onPlayerGoLeft(this.player.isJumping);
                } else if (this.keys.ArrowRight) {
                    obstacle.onPlayerGoRight(this.player.isJumping);
                }
                
                if (!this.player.isJumping && this.player.wasJumping) {
                    obstacle.onPlayerLand();
                }
                
                if (this.checkCollision(this.player, obstacle)) {
                    this.handleCollision(this.player, obstacle);
                }
            }
            
            this.player.wasJumping = this.player.isJumping;
        }
    }

    draw() {
        super.draw();
        
        this.context.save();
        for (const ghost of this.ghosts) {
            ghost.draw(this.context, this.cameraX);
        }
        this.context.restore();
        
        this.context.save();
        for (const obstacle of this.jumpingObstacles) {
            obstacle.draw(this.context, this.cameraX);
        }
        this.context.restore();
        
        this.context.save();
        for (const obstacle of this.directionalObstacles) {
            obstacle.draw(this.context, this.cameraX);
        }
        this.context.restore();
    }

    onLevelComplete() {
        console.log('Niveau 1 terminé ! Passage au niveau suivant...');
    }
}