export class JumpingObstacle {
    constructor(x, y, width, height, riseHeight = 150, riseSpeed = 5) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.initialY = y;
        this.riseHeight = riseHeight;
        this.riseSpeed = riseSpeed;
        this.isRising = false;
        this.targetY = y;
        this.color = 'black';
    }

    onPlayerJump() {
        this.isRising = true;
        this.targetY = this.initialY - this.riseHeight;
    }

    onPlayerLand() {
        this.isRising = false;
        this.targetY = this.initialY;
    }

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

    draw(context, cameraX) {
        const adjustedX = this.x - cameraX;
        
        if (adjustedX + this.width > 0 && adjustedX < context.canvas.width) {
            context.fillStyle = this.color;
            context.fillRect(adjustedX, this.y, this.width, this.height);
        }
    }
} 