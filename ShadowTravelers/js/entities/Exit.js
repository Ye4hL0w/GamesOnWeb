export class Exit {
    constructor(x, y, width = 50, height = 50) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isActive = true;
    }

    draw(context, cameraX) {
        if (!this.isActive) return;
        
        const adjustedX = this.x - cameraX;
        
        context.fillStyle = '#0095ff';
        context.fillRect(adjustedX, this.y, this.width, this.height);
    }
}