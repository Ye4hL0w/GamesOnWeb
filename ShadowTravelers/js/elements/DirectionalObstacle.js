export class DirectionalObstacle {
    constructor(x, y, width, height, riseHeight = 150, riseSpeed = 5) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.initialY = y;
        this.riseHeight = riseHeight; // hauteur max de montée
        this.riseSpeed = riseSpeed; // vitesse de montée
        this.isRising = false;
        this.targetY = y;
        this.color = 'black';
        this.playerWasInAir = false; // savoir si le joueur est en l'air
    }

    // quand le joueur va vers la gauche
    onPlayerGoLeft(playerIsJumping) {
        this.isRising = true;
        this.targetY = this.initialY - this.riseHeight;
        
        // si le joueur est en l'air, on mémorise l'état
        if (playerIsJumping) {
            this.playerWasInAir = true;
        }
    }

    // quand le joueur va vers la droite
    onPlayerGoRight(playerIsJumping) {
        // ne redescend que si le joueur n'est pas en l'air
        if (!playerIsJumping && !this.playerWasInAir) {
            this.isRising = false;
            this.targetY = this.initialY;
        }
    }
    
    // quand le joueur atterrit
    onPlayerLand() {
        // réinitialiser l'état quand le joueur atterrit
        this.playerWasInAir = false;
    }

    // maj de la position de l'obstacle
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

    // draw l'obstacle
    draw(context, cameraX) {
        const adjustedX = this.x - cameraX;
        
        // dessiner que si l'obstacle est visible
        if (adjustedX + this.width > 0 && adjustedX < context.canvas.width) {
            context.fillStyle = this.color;
            context.fillRect(adjustedX, this.y, this.width, this.height);
        }
    }
} 