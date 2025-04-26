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
        this.shadowTransitionRate = 0.03;
        
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
        // pas d'appel à super.update() car nous voulons personnaliser ce comportement

        if (this.player) {
            const playerAbsoluteX = this.player.x + this.cameraX;
            
            // vérifier si le joueur est dans une zone d'ombre
            const wasInShadow = this.player.inShadowZone;
            this.player.inShadowZone = false;
            
            const detectionMargin = 5;
            
            for (const zone of this.shadowZones) {
                zone.update();
                
                // Vérifier la collision
                const playerRect = {
                    x: this.player.x + detectionMargin,
                    y: this.player.y + detectionMargin,
                    width: this.player.width - 2 * detectionMargin,
                    height: this.player.height - 2 * detectionMargin
                };
                
                // Zone d'effet légèrement plus petite que la zone visuelle
                const zoneEffective = {
                    x: zone.x + detectionMargin,
                    y: zone.y + detectionMargin,
                    width: zone.width - 2 * detectionMargin,
                    height: zone.height - 2 * detectionMargin
                };
                
                if (this.checkCollisionCustom(playerRect, zoneEffective)) {
                    this.player.inShadowZone = true;
                    
                    // Si le joueur vient d'entrer dans la zone, on pourrait jouer un son
                    if (!wasInShadow) {
                        console.log("Le joueur commence à entrer dans une zone d'ombre");
                    }
                }
            }
            
            // gérer la transition de l'effet d'ombre
            if (this.player.inShadowZone && this.player.shadowInfluence < 1) {
                // Augmenter progressivement l'influence de l'ombre
                this.player.shadowInfluence = Math.min(1, this.player.shadowInfluence + this.shadowTransitionRate);
                if (this.player.shadowInfluence >= 1) {
                    console.log("Contrôles complètement inversés");
                }
            } else if (!this.player.inShadowZone && this.player.shadowInfluence > 0) {
                // Diminuer progressivement l'influence de l'ombre
                this.player.shadowInfluence = Math.max(0, this.player.shadowInfluence - this.shadowTransitionRate);
                if (this.player.shadowInfluence <= 0) {
                    console.log("Contrôles redevenus normaux");
                }
            }
            
            // Si le joueur vient de sortir d'une zone d'ombre
            if (wasInShadow && !this.player.inShadowZone) {
                console.log("Le joueur commence à sortir d'une zone d'ombre");
            }
            
            // Gestion des contrôles avec transition progressive
            if (this.player.shadowInfluence > 0) {
                // Calcul du mélange des contrôles en fonction de l'influence de l'ombre
                const normalLeftInfluence = 1 - this.player.shadowInfluence;
                const invertedLeftInfluence = this.player.shadowInfluence;
                
                // "mélange" des touches gauche/droite
                const effectiveLeftKey = 
                    (this.keys.ArrowLeft * normalLeftInfluence) + 
                    (this.keys.ArrowRight * invertedLeftInfluence);
                    
                const effectiveRightKey = 
                    (this.keys.ArrowRight * normalLeftInfluence) + 
                    (this.keys.ArrowLeft * invertedLeftInfluence);
                
                this.player.update({
                    ArrowLeft: effectiveLeftKey > 0.5,
                    ArrowRight: effectiveRightKey > 0.5,
                    Space: this.keys.Space,
                    ArrowUp: this.keys.ArrowUp
                }, this.floorHeight);
                
                // Gestion du défilement de la caméra avec contrôles partiellement inversés
                const leftScrollThreshold = this.canvas.width * 0.2;
                const rightScrollThreshold = this.canvas.width * 0.6;
                const scrollAmount = 15;
                
                // Défilement à droite (combinaison des deux touches selon l'influence)
                if ((this.player.x > rightScrollThreshold && this.keys.ArrowRight * normalLeftInfluence > 0.3) || 
                    (this.player.x > rightScrollThreshold && this.keys.ArrowLeft * invertedLeftInfluence > 0.3)) {
                    if (this.cameraX + this.canvas.width < this.levelWidth) {
                        this.cameraX += scrollAmount;
                        this.player.x -= scrollAmount;
                    }
                }
                
                // Défilement à gauche (combinaison des deux touches selon l'influence)
                if ((this.player.x < leftScrollThreshold && this.keys.ArrowLeft * normalLeftInfluence > 0.3) || 
                    (this.player.x < leftScrollThreshold && this.keys.ArrowRight * invertedLeftInfluence > 0.3)) {
                    if (this.cameraX > 0) {
                        this.cameraX -= scrollAmount;
                        this.player.x += scrollAmount;
                    }
                }
            } else {
                // si le joueur n'est pas sous l'influence de l'ombre maj normale
                this.player.update(this.keys, this.floorHeight);
                
                if (this.player.x > this.canvas.width * 0.6 && this.keys.ArrowRight) {
                    const scrollAmount = 15;
                    if (this.cameraX + this.canvas.width < this.levelWidth) {
                        this.cameraX += scrollAmount;
                        this.player.x -= scrollAmount;
                    }
                }
                
                if (this.player.x < this.canvas.width * 0.2 && this.keys.ArrowLeft) {
                    const scrollAmount = 15;
                    if (this.cameraX > 0) {
                        this.cameraX -= scrollAmount;
                        this.player.x += scrollAmount;
                    }
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
                
                // Transition pour les obstacles directionnels également
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
        
        // Dessiner les zones d'ombre
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
        
        // ajouter un effet visuel de "fondu" avant la transition
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

    // méthode personnalisée de détection de collisions pour les zones d'ombre
    checkCollisionCustom(player, obstacle) {
        // on utilise la position absolue
        const adjustedObstacleX = obstacle.x - this.cameraX;
        
        return player.x < adjustedObstacleX + obstacle.width &&
               player.x + player.width > adjustedObstacleX &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }
} 