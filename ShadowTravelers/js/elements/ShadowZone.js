export class ShadowZone {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.opacity = 0.85;
        this.pulseSpeed = 0.002;
        this.pulseDirection = 1;
    }
    
    update() {
        
    }
    
    draw(context, cameraX) {
        const adjustedX = this.x - cameraX;
        
        if (adjustedX + this.width > 0 && adjustedX < context.canvas.width) {
            context.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
            context.fillRect(adjustedX, this.y, this.width, this.height);
            
            context.strokeStyle = 'rgba(50, 50, 50, 0.5)';
            context.lineWidth = 2;
            context.strokeRect(adjustedX, this.y, this.width, this.height);
        }
    }
} 