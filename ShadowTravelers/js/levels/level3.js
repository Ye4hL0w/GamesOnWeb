import { BaseLevel } from './BaseLevel.js';
import { Player } from '../entities/Player.js';
import { Exit } from '../elements/Exit.js';
import { Ghost } from '../entities/Ghost.js';
import { JumpingObstacle } from '../elements/JumpingObstacle.js';
import { DirectionalObstacle } from '../elements/DirectionalObstacle.js';
import { ShadowZone } from '../elements/ShadowZone.js';
import { Guardian } from '../entities/Guardian.js';

export class Level3 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.player = new Player(canvas);

        this.ghosts = [];
        this.jumpingObstacles = [];
        this.directionalObstacles = [];
        this.guardians = [];
        this.shadowZones = [];
        this.playerStartX = this.canvas.width * 0.1;
        this.playerStartY = this.canvas.height - this.floorHeight;
        
        this.levelTitle = "Niveau 3 - Le dernier voyage";
    }

    initialize() {
        super.initialize();

        const floorY = this.canvas.height - this.floorHeight;
        const obstacleHeight = 100;
        
        this.player.inShadowZone = false;
        this.player.shadowInfluence = 0; // 0 = contrôles normaux, 1 = contrôles inversés
        
        this.obstacles.push(
            { x: 1800, y: floorY - obstacleHeight, width: 50, height: obstacleHeight },
        );

        this.jumpingObstacles.push(
            new JumpingObstacle(3200, 0, 70, floorY, 200, 8)
        );

        this.directionalObstacles.push(
            new DirectionalObstacle(3800, 0, 70, floorY, 200, 8)
        );

        const ghostY = floorY - 100;
        this.ghosts.push(
            new Ghost(this.canvas.width - 450, ghostY, "Tu es arrivé au seuil… Regarde autour de toi. Dream Land brille au loin, mais les gardiens refusent de te laisser partir. La dernière énigme est la plus cruelle.")
        );

        this.ghosts.push(
            new Ghost(this.levelWidth - 400, ghostY, "Les portes s'ouvrent… mais à quel prix ? Dream Land t'attend… ou bien te piège ? Va, voyageur. Trouve la réponse par toi-même…")
        );

        this.guardians.push(
            new Guardian(2400, floorY - 80)
        );

        this.guardians.push(
            new Guardian(2800, floorY - 80)
        );

        this.shadowZones.push(
            new ShadowZone(4400, 0, 4000, this.canvas.height)
        );

        // this.guardians.push(
        //     new Guardian(4800, floorY - 80)
        // );

        this.directionalObstacles.push(
            new DirectionalObstacle(5400, 0, 70, floorY, 200, 8)
        );

        this.guardians.push(
            new Guardian(6000, floorY - 80)
        );

        this.jumpingObstacles.push(
            new JumpingObstacle(6600, 0, 70, floorY, 200, 8)
        );

        this.guardians.push(
            new Guardian(7200, floorY - 80)
        );


        this.directionalObstacles.push(
            new DirectionalObstacle(7800, 0, 70, floorY, 200, 8)
        );

        this.exit = new Exit(this.levelWidth - 200, floorY - 100, 80, 80);
    }

    resetPlayerPosition() {
        // réinitialiser la position du joueur au début du niveau
        if (this.player) {
            this.player.x = this.playerStartX;
            this.player.y = this.playerStartY - this.player.height + 10;
            this.cameraX = 0;
            this.player.inShadowZone = false;
            this.player.shadowInfluence = 0;
        }
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
            
            // maj des gardiens
            for (const guardian of this.guardians) {
                const allObstacles = [...this.obstacles, ...this.directionalObstacles, ...this.jumpingObstacles];
                guardian.update(
                    playerAbsoluteX, 
                    this.player.y, 
                    this.player.width, 
                    this.player.height,
                    allObstacles
                );
                
                // vérifier si le gardien a attrapé le joueur
                if (guardian.checkCollision(
                    playerAbsoluteX, 
                    this.player.y, 
                    this.player.width, 
                    this.player.height
                )) {
                    // téléporter le joueur au début du niveau
                    this.resetPlayerPosition();
                }
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
                
                // obstacles directionnels avec l'effet d'ombre
                if (this.player.shadowInfluence > 0.5) {
                    // principalement inversés
                    if (this.keys.ArrowRight) {
                        obstacle.onPlayerGoLeft(this.player.isJumping);
                    } else if (this.keys.ArrowLeft) {
                        obstacle.onPlayerGoRight(this.player.isJumping);
                    }
                } else {
                    // principalement normaux
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
        
        // gardiens
        this.context.save();
        for (const guardian of this.guardians) {
            guardian.draw(this.context, this.cameraX);
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
        
        // zones d'ombre
        this.context.save();
        for (const zone of this.shadowZones) {
            zone.draw(this.context, this.cameraX);
        }
        this.context.restore();
    }

    onLevelComplete() {
        console.log('Niveau 3 terminé ! Retour au menu...');
        
        // Sauvegarder la progression du jeu (Shadow Travelers = jeu 1, niveau 3 = jeu terminé)
        if (window.GameProgress) {
            window.GameProgress.saveGameProgress(
                window.GameProgress.GAME_IDS.SHADOW_TRAVELERS,
                3  // niveau 3 complété (jeu terminé)
            );
            console.log('Progression sauvegardée: Shadow Travelers - Jeu terminé!');
        } else {
            console.error('Module GameProgress non disponible');
        }
        
        // créer un effet de fondu
        const canvas = this.canvas;
        const context = this.context;
        
        let opacity = 0;
        const fadeEffect = setInterval(() => {
            opacity += 0.05;
            context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            if (opacity >= 1) {
                clearInterval(fadeEffect);
                // retour au menu principal
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }
        }, 50);
    }
} 