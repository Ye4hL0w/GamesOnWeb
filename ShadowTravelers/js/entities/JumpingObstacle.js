export class JumpingObstacle {
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
        this.color = '#8B4513'; // Couleur marron pour distinguer cet obstacle
    }

    // Méthode appelée quand le joueur saute
    onPlayerJump() {
        this.isRising = true;
        this.targetY = this.initialY - this.riseHeight;
    }

    // Méthode appelée quand le joueur atterrit
    onPlayerLand() {
        this.isRising = false;
        this.targetY = this.initialY;
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
            context.fillStyle = '#654321'; // Couleur plus foncée pour les détails
            context.fillRect(adjustedX + this.width * 0.25, this.y, this.width * 0.5, this.height * 0.2);
        }
    }
} 