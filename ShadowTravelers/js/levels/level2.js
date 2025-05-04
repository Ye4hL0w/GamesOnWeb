import { BaseLevel } from './BaseLevel.js';
import { Player } from '../entities/Player.js';
import { Exit } from '../elements/Exit.js';
import { Ghost } from '../entities/Ghost.js';
import { JumpingObstacle } from '../elements/JumpingObstacle.js';
import { DirectionalObstacle } from '../elements/DirectionalObstacle.js';
import { ShadowZone } from '../elements/ShadowZone.js';

export class Level2 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.player = new Player(canvas);
        this.ghosts = [];
        this.jumpingObstacles = [];
        this.directionalObstacles = [];
        this.shadowZones = [];
        
        this.levelTitle = "Niveau 2 - Le passage obscur";
    }

    initialize() {
        super.initialize();
        
        const floorY = this.canvas.height - this.floorHeight;
        
        this.player = new Player(this.canvas);
        this.player.inShadowZone = false;
        this.player.shadowInfluence = 0; // 0 = contrôles normaux, 1 = contrôles inversés
        
        const obstacleHeight = 100;
        this.obstacles.push(
            { x: 3500, y: floorY - obstacleHeight, width: 50, height: obstacleHeight }
        );

        this.jumpingObstacles.push(
            new JumpingObstacle(4500, 0, 70, floorY, 200, 8)
        );
        this.directionalObstacles.push(
            new DirectionalObstacle(5500, 0, 70, floorY, 200, 8)
        );

        const ghostY = floorY - 100;
        this.ghosts.push(
            new Ghost(this.canvas.width - 150, ghostY, "Tu ressens sa présence, n'est-ce pas ? Ce brouillard teste ta volonté. Écoute bien… tout ici a un double sens.")
        );

        this.ghosts.push(
            new Ghost(this.levelWidth - 400, ghostY, "Tu as percé son secret… mais cela suffira-t-il ?  Prépare-toi, le prochain pas est sans retour.")
        );

        this.exit = new Exit(this.levelWidth - 200, floorY - 100, 80, 80);

        this.shadowZones.push(            
            new ShadowZone(3000, 0, 3500, this.canvas.height)  
        );
    }

    update() {
        if (this.player) {
            const playerAbsoluteX = this.player.x + this.cameraX;
            
            // zones d'ombre
            const wasInShadow = this.player.inShadowZone;
            this.player.inShadowZone = false;
            
            // si le joueur est dans une zone d'ombre
            for (const zone of this.shadowZones) {
                zone.update();
                if (zone.checkCollision(this.player, this.cameraX)) {
                    zone.applyEffect(this.player, wasInShadow);
                }
            }
            
            // sinon, on réduit l'effet
            if (!this.player.inShadowZone) {
                for (const zone of this.shadowZones) {
                    zone.reduceEffect(this.player, wasInShadow);
                }
            }
            
            // maj du joueur
            let effectiveKeys = this.keys;
            if (this.player.shadowInfluence > 0 && this.shadowZones.length > 0) {
                effectiveKeys = this.shadowZones[0].getModifiedControls(this.player, this.keys);
            }
            
            this.player.update(effectiveKeys, this.floorHeight);
            
            // défilement de la caméra
            if (this.player.x > this.canvas.width * 0.6 && effectiveKeys.ArrowRight) {
                const scrollAmount = 15;
                if (this.cameraX + this.canvas.width < this.levelWidth) {
                    this.cameraX += scrollAmount;
                    this.player.x -= scrollAmount;
                }
            }
            
            if (this.player.x < this.canvas.width * 0.2 && effectiveKeys.ArrowLeft) {
                const scrollAmount = 15;
                if (this.cameraX > 0) {
                    this.cameraX -= scrollAmount;
                    this.player.x += scrollAmount;
                }
            }

            // limites du jeu
            if (this.player.x < 0 && this.cameraX === 0) {
                this.player.x = 0;
            }

            if (this.player.x + this.player.width > this.canvas.width && 
                this.cameraX + this.canvas.width >= this.levelWidth) {
                this.player.x = this.canvas.width - this.player.width;
            }
            
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
                
                // gestion des obstacles directionnels
                if (this.player.shadowInfluence > 0.5) {
                    // Principalement inversés
                    if (this.keys.ArrowRight) {
                        obstacle.onPlayerGoLeft(this.player.isJumping);
                    } else if (this.keys.ArrowLeft) {
                        obstacle.onPlayerGoRight(this.player.isJumping);
                    }
                } else {
                    // Principalement normaux
                    if (this.keys.ArrowLeft) {
                        obstacle.onPlayerGoLeft(this.player.isJumping);
                    } else if (this.keys.ArrowRight) {
                        obstacle.onPlayerGoRight(this.player.isJumping);
                    }
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

        this.updateObstacles();
        this.checkExitCollision();
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
        
        this.context.save();
        for (const zone of this.shadowZones) {
            zone.draw(this.context, this.cameraX);
        }
        this.context.restore();
    }

    
    onLevelComplete() {
        console.log('Niveau 2 terminé ! Passage au niveau suivant...');
        
        if (window.GameProgress) {
            window.GameProgress.saveGameProgress(
                window.GameProgress.GAME_IDS.SHADOW_TRAVELERS,
                2  // niveau 2 complété
            );
            console.log('Progression sauvegardée: Shadow Travelers - Niveau 2');
        } else {
            console.error('Module GameProgress non disponible');
        }
        
        // ajouter un effet de fondu avant la transition
        const canvas = this.canvas;
        const context = this.context;
        
        // créer l'effet de fondu en noir
        let opacity = 0;
        const fadeEffect = setInterval(() => {
            opacity += 0.05;
            context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            if (opacity >= 1) {
                clearInterval(fadeEffect);
                
                // stocker le niveau suivant dans localStorage
                localStorage.setItem('selectedLevel', 3);
                
                // rediriger vers le niveau 3
                setTimeout(() => {
                    window.location.href = 'level3.html';
                }, 500);
            }
        }, 50);
    }
} 