export class Guardian {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        
        // Paramètres de vitesse et poursuite
        this.baseSpeed = 3;
        this.maxChaseSpeed = 6;
        this.speed = this.baseSpeed;
        this.acceleration = 0.1;
        this.detectionRange = 600;
        this.isChasing = false;
        this.chaseTime = 0;
        this.direction = 'right';
        
        // Animation
        this.frameIndex = 0;
        this.frameCount = 8;
        this.frameDelay = 5;
        this.frameCounter = 0;
        
        // Chargement des frames d'animation (droite et gauche)
        this.framesRight = [];
        this.framesLeft = [];
        
        for (let i = 1; i <= this.frameCount; i++) {
            const frameRight = new Image();
            frameRight.src = `./assets/pnj/guardian/frame-${i}-right.png`;
            frameRight.onload = () => {
                if (i === 1) {
                    this.updateDimensions(frameRight);
                }
            };
            this.framesRight.push(frameRight);
            
            const frameLeft = new Image();
            frameLeft.src = `./assets/pnj/guardian/frame-${i}-left.png`;
            this.framesLeft.push(frameLeft);
        }
        
        this.currentFrame = this.framesRight[0];
    }
    
    update(playerX, playerY, playerWidth, playerHeight, obstacles = []) {
        // Sauvegarder la position actuelle
        const previousX = this.x;
        
        // Calculer la distance entre le gardien et le joueur
        const playerCenterX = playerX + playerWidth / 2;
        const guardianCenterX = this.x + this.width / 2;
        const distance = Math.abs(playerCenterX - guardianCenterX);
        
        // Vérifier si le joueur est dans la zone de détection
        if (distance < this.detectionRange) {
            this.isChasing = true;
            
            // Augmenter la vitesse pendant la poursuite
            if (this.speed < this.maxChaseSpeed) {
                this.speed += this.acceleration;
                if (this.speed > this.maxChaseSpeed) {
                    this.speed = this.maxChaseSpeed;
                }
            }
            
            // Déterminer la direction
            if (playerCenterX < guardianCenterX) {
                this.direction = 'left';
                this.x -= this.speed;
            } else {
                this.direction = 'right';
                this.x += this.speed;
            }
            
            // Vérifier les collisions avec TOUS les obstacles
            let collision = false;
            for (let i = 0; i < obstacles.length; i++) {
                const obstacle = obstacles[i];
                if (obstacle && 
                    typeof obstacle.x === 'number' && 
                    typeof obstacle.y === 'number' && 
                    typeof obstacle.width === 'number' && 
                    typeof obstacle.height === 'number') {
                    if (this.checkCollisionWithObstacle(obstacle)) {
                        collision = true;
                        break;
                    }
                }
            }
            
            // Si collision détectée, revenir à la position précédente
            if (collision) {
                this.x = previousX;
            }
            
            // Mettre à jour l'animation pendant la poursuite
            this.frameCounter++;
            if (this.frameCounter >= this.frameDelay) {
                this.frameCounter = 0;
                this.frameIndex = (this.frameIndex + 1) % this.frameCount;
                
                if (this.direction === 'left') {
                    this.currentFrame = this.framesLeft[this.frameIndex];
                } else {
                    this.currentFrame = this.framesRight[this.frameIndex];
                }
            }
        } else {
            this.isChasing = false;
            this.speed = this.baseSpeed; // réinitialiser la vitesse
        }
    }
    
    // vérifier la collision avec un obstacle
    checkCollisionWithObstacle(obstacle) {
        return (
            this.x < obstacle.x + obstacle.width &&
            this.x + this.width > obstacle.x &&
            this.y < obstacle.y + obstacle.height &&
            this.y + this.height > obstacle.y
        );
    }
    
    // Vérifier la collision avec le joueur
    checkCollision(playerX, playerY, playerWidth, playerHeight) {
        return (
            this.x < playerX + playerWidth &&
            this.x + this.width > playerX &&
            this.y < playerY + playerHeight &&
            this.y + this.height > playerY
        );
    }
    
    draw(context, cameraX) {
        const adjustedX = this.x - cameraX;
        
        // Dessiner le gardien avec le frame d'animation actuel
        if (this.currentFrame && this.currentFrame.complete) {
            context.drawImage(
                this.currentFrame,
                adjustedX,
                this.y,
                this.width,
                this.height
            );
        }
    }
    
    updateDimensions(image) {
        const ratio = image.height / image.width;
        this.height = this.width * ratio;
    }
}
