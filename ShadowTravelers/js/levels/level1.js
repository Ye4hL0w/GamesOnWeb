import { BaseLevel } from './BaseLevel.js';
import { Exit } from '../elements/Exit.js';
import { Ghost } from '../entities/Ghost.js';
import { JumpingObstacle } from '../elements/JumpingObstacle.js';
import { DirectionalObstacle } from '../elements/DirectionalObstacle.js';

export class Level1 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.ghosts = [];
        this.jumpingObstacles = [];
        this.directionalObstacles = [];
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
            new JumpingObstacle(3200, obstacleY-850, 70, 1000, 200, 8)
        );
        
        this.directionalObstacles.push(
            new DirectionalObstacle(3800, obstacleY-850, 70, 1000, 200, 8)
        );

        const ghostY = obstacleY;
        this.ghosts.push(
            new Ghost(750, ghostY, "Bienvenue, voyageur de l'entre-deux mondes! Je sens que tu viens de t'éveiller... Ce royaume n'est qu'un passage vers Dream Land. Méfie-toi des ombres qui rôdent par ici.")
        );

        this.ghosts.push(
            new Ghost(this.levelWidth - 400, ghostY, "Tu as atteint la fin de ce passage obscur... *murmure* Si tu continues ta quête, arme-toi de courage. Le véritable voyage ne fait que commencer...")
        );

        this.exit = new Exit(
            this.levelWidth - 200,
            obstacleY,
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