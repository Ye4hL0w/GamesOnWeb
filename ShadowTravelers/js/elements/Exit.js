export class Exit {
    constructor(x, y, width = 80, height = 80) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isActive = true;
        
        // chargement des frames du portail
        this.frames = [];
        this.totalFrames = 19;
        this.currentFrame = 0;
        this.frameDelay = 5; // vitesse d'animation, petit = rapide
        this.frameCounter = 0;
        
        // préchargement de toutes les frames
        for (let i = 1; i <= this.totalFrames; i++) {
            const frameNumber = i.toString().padStart(2, '0');
            const frame = new Image();
            frame.src = `./assets/portal/shadow/frame-${frameNumber}.gif`;
            this.frames.push(frame);
        }
    }

    draw(context, cameraX) {
        if (!this.isActive) return;
        
        const adjustedX = this.x - cameraX;
        
        // animation du portail
        this.frameCounter++;
        
        // changement de frame selon le délai
        if (this.frameCounter >= this.frameDelay) {
            this.frameCounter = 0;
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }
        
        // affichage frame courante
        const currentImg = this.frames[this.currentFrame];
        
        if (currentImg && currentImg.complete) {
            context.drawImage(
                currentImg,
                adjustedX,
                this.y,
                this.width,
                this.height
            );
        } else {
            // en cas de non-chargement de l'image
            context.fillStyle = '#0095ff';
            context.fillRect(adjustedX, this.y, this.width, this.height);
        }
    }
}