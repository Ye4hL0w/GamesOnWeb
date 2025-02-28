export class DirectionalObstacle {
    constructor(x, y, width, height, riseHeight = 150, riseSpeed = 5) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.initialY = y;
        this.riseHeight = riseHeight; // Hauteur maximale de montée
        this.riseSpeed = riseSpeed; // Vitesse de montée
        this.isRising = false;
        this.targetY = y;
        this.color = '#4682B4'; // Couleur bleu acier pour distinguer cet obstacle
        this.playerWasInAir = false; // Pour suivre si le joueur était en l'air
    }

    // Méthode appelée quand le joueur va vers la gauche
    onPlayerGoLeft(playerIsJumping) {
        this.isRising = true;
        this.targetY = this.initialY - this.riseHeight;
        
        // Si le joueur est en l'air, on mémorise cet état
        if (playerIsJumping) {
            this.playerWasInAir = true;
        }
    }

    // Méthode appelée quand le joueur va vers la droite
    onPlayerGoRight(playerIsJumping) {
        // Ne redescend que si le joueur n'est pas en l'air ou n'était pas en l'air précédemment
        if (!playerIsJumping && !this.playerWasInAir) {
            this.isRising = false;
            this.targetY = this.initialY;
        }
    }
    
    // Méthode appelée quand le joueur atterrit
    onPlayerLand() {
        // Réinitialiser l'état "en l'air" quand le joueur atterrit
        this.playerWasInAir = false;
    }

    // Mise à jour de la position de l'obstacle
    update() {
        if (this.isRising && this.y > this.targetY) {
            this.y -= this.riseSpeed;
            if (this.y < this.targetY) {
                this.y = this.targetY;
            }
        } else if (!this.isRising && this.y < this.initialY) {
            this.y += this.riseSpeed;
            if (this.y > this.initialY) {
                this.y = this.initialY;
            }
        }
    }

    // Dessiner l'obstacle
    draw(context, cameraX) {
        const adjustedX = this.x - cameraX;
        
        // Ne dessiner que si l'obstacle est visible à l'écran
        if (adjustedX + this.width > 0 && adjustedX < context.canvas.width) {
            context.fillStyle = this.color;
            context.fillRect(adjustedX, this.y, this.width, this.height);
            
            // Ajouter des détails visuels pour le distinguer
            context.fillStyle = '#36648B'; // Couleur plus foncée pour les détails
            context.fillRect(adjustedX, this.y, this.width, this.height * 0.2);
            
            // Ajouter une flèche pour indiquer que l'obstacle réagit à la direction
            context.fillStyle = '#FFFFFF';
            context.beginPath();
            context.moveTo(adjustedX + this.width * 0.25, this.y + this.height * 0.5);
            context.lineTo(adjustedX + this.width * 0.75, this.y + this.height * 0.5);
            context.lineTo(adjustedX + this.width * 0.5, this.y + this.height * 0.7);
            context.fill();
        }
    }
} 