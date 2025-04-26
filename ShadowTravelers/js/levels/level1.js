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
        
        this.levelTitle = "Niveau 1 - L'éveil des ombres";
    }

    initialize() {
        super.initialize();

        const floorY = this.canvas.height - this.floorHeight;
        const obstacleHeight = 100;
        
        this.obstacles.push(
            { x: 2800, y: floorY - obstacleHeight, width: 50, height: obstacleHeight },
            { x: 8000, y: floorY - 200, width: 50, height: 200 },
        );

        this.jumpingObstacles.push(
            new JumpingObstacle(4000, 0, 70, floorY, 200, 8),
            new JumpingObstacle(8000, floorY - 300, 50, 100, 200, 8)
        );
        this.directionalObstacles.push(
            new DirectionalObstacle(6000, 0, 70, floorY, 200, 8)
        );

        const ghostY = floorY - 100;
        this.ghosts.push(
            new Ghost(this.canvas.width - 150, ghostY, "Bienvenue, voyageur perdu… Tu as quitté le néant, mais ton chemin est encore obscur. Ce monde est un labyrinthe façonné par l'oubli. Seuls ceux qui perçoivent l'invisible peuvent avancer…")
        );

        this.ghosts.push(
            new Ghost(this.levelWidth - 600, ghostY, "Tu as franchi la première épreuve… mais ce n'était qu'une illusion. Je suis un ange déchu… J'étais comme toi, autrefois en quête de lumière. Maintenant, j'erre sans fin, piégé entre le rêve et la nuit.")
        );

        this.exit = new Exit(this.levelWidth - 150, floorY - 100, 80, 80);
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
        
        // Sauvegarder la progression si GameProgress est disponible
        if (typeof window.GameProgress !== 'undefined') {
            window.GameProgress.saveGameProgress(
                window.GameProgress.GAME_IDS.SHADOW_TRAVELERS,
                1  // niveau 1 complété
            );
        }
        
        const canvas = this.canvas;
        const context = this.context;
        
        let opacity = 0;
        const fadeEffect = setInterval(() => {
            opacity += 0.05;
            context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            if (opacity >= 1) {
                clearInterval(fadeEffect);
                
                // Stocker le niveau suivant dans localStorage
                localStorage.setItem('selectedLevel', 2);
                
                // rediriger vers le niveau 2
                setTimeout(() => {
                    window.location.href = 'level2.html';
                }, 500);
            }
        }, 50);
    }
}