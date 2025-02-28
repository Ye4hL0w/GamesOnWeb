import { Player } from '../entities/Player.js';
import { Exit } from '../entities/Exit.js';

export class BaseLevel {
    constructor(context, canvas) {
        this.context = context;
        this.canvas = canvas;
        this.floorHeight = 50;
        
        // Position de la caméra pour le défilement
        this.cameraX = 0;
        this.scrollSpeed = 5; // Vitesse fixe en pixels par frame
        this.scrollThreshold = this.canvas.width * 0.4; // Point à partir duquel le niveau commence à défiler
        
        // Gestion des obstacles et du sol
        this.obstacles = [];
        this.platforms = [];
        this.levelWidth = 5000; // Longueur totale du niveau
        
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            ArrowUp: false
        };

        // Gestion de la sortie
        this.exit = null;
        
        // Gestion du temps pour limiter le FPS
        this.lastTime = performance.now();
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS; // Intervalle entre les frames en ms

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
        // Mise à jour du joueur
        if (this.player) {
            // Mettre à jour le joueur sans deltaTime
            this.player.update(this.keys, this.floorHeight);

            // Gestion du défilement vers la droite
            if (this.player.x > this.canvas.width * 0.6 && this.keys.ArrowRight) {
                // Utiliser une valeur fixe pour le défilement
                const scrollAmount = 10;
                if (this.cameraX + this.canvas.width < this.levelWidth) {
                    this.cameraX += scrollAmount;
                    this.player.x -= scrollAmount;
                }
            }
            
            // Gestion du défilement vers la gauche
            if (this.player.x < this.canvas.width * 0.2 && this.keys.ArrowLeft) {
                // Utiliser une valeur fixe pour le défilement
                const scrollAmount = 10;
                if (this.cameraX > 0) {
                    this.cameraX -= scrollAmount;
                    this.player.x += scrollAmount;
                }
            }

            // Empêcher le joueur de sortir de l'écran à gauche quand on est au début du niveau
            if (this.player.x < 0 && this.cameraX === 0) {
                this.player.x = 0;
            }

            // Empêcher le joueur de sortir de l'écran à droite à la fin du niveau
            if (this.player.x + this.player.width > this.canvas.width && 
                this.cameraX + this.canvas.width >= this.levelWidth) {
                this.player.x = this.canvas.width - this.player.width;
            }
        }

        // Mise à jour des obstacles et des plateformes
        this.updateObstacles();

        // Vérifier la collision avec la sortie
        this.checkExitCollision();
    }

    draw() {
        // Effacer le canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessiner le sol
        this.drawGround();

        // Dessiner les obstacles et plateformes
        this.drawObstacles();

        // Dessiner la sortie
        if (this.exit) {
            this.exit.draw(this.context, this.cameraX);
        }

        // Dessiner le joueur
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

        // Dessiner les obstacles
        for (const obstacle of this.obstacles) {
            if (obstacle.x + obstacle.width > this.cameraX && 
                obstacle.x < this.cameraX + this.canvas.width) {
                this.context.fillStyle = 'black';
                // Dessiner directement à la position Y comme pour le joueur
                this.context.fillRect(
                    obstacle.x,
                    obstacle.y,
                    obstacle.width,
                    obstacle.height
                );
            }
        }

        // Dessiner les plateformes
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
        // Logique de collision avec les obstacles
        if (this.player) {
            for (const obstacle of this.obstacles) {
                // Vérification des collisions
                if (this.checkCollision(this.player, obstacle)) {
                    // Gérer la collision
                    this.handleCollision(this.player, obstacle);
                }
            }
        }
    }

    checkCollision(player, obstacle) {
        // Ajuster la position X de l'obstacle en fonction de la position de la caméra
        const adjustedObstacleX = obstacle.x - this.cameraX;
        
        return player.x < adjustedObstacleX + obstacle.width &&
               player.x + player.width > adjustedObstacleX &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }

    handleCollision(player, obstacle) {
        // Ajuster la position X de l'obstacle en fonction de la position de la caméra
        const adjustedObstacleX = obstacle.x - this.cameraX;
        const playerRight = player.x + player.width;
        const obstacleRight = adjustedObstacleX + obstacle.width;

        // Collision par la gauche
        if (playerRight > adjustedObstacleX && player.x < adjustedObstacleX) {
            player.x = adjustedObstacleX - player.width;
        }
        // Collision par la droite
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
        // Créer le joueur
        this.player = new Player(this.canvas);
        
        // Réinitialiser le temps
        this.lastTime = performance.now();

        this.gameLoop();
    }

    gameLoop() {
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;
        
        // Limiter le FPS pour assurer une vitesse constante
        if (elapsed > this.frameInterval) {
            // Ajuster le temps pour maintenir un timing régulier
            this.lastTime = currentTime - (elapsed % this.frameInterval);
            
            // Mettre à jour et dessiner le jeu
            this.update();
            this.draw();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    // Méthode à surcharger dans les niveaux spécifiques
    onLevelComplete() {
        console.log('Niveau terminé !');
    }
} 