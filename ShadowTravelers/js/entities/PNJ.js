export class PNJ {
    constructor(x, y, width, height, text = '') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        
        // Style du texte
        this.textColor = 'white';
        this.textBackground = 'rgba(0, 0, 0, 0.7)';
        this.textPadding = 5;
        this.textOffsetY = -30; // Distance au-dessus du PNJ
        this.font = '16px Arial';

        // Distance d'apparition du texte
        this.textVisibilityDistance = 500; // Distance en pixels
        this.showText = false; // État de visibilité du texte
    }

    update(playerX) {
        // Calculer la distance entre le joueur et le PNJ
        const distance = Math.abs(playerX - (this.x + this.width / 2));
        this.showText = distance <= this.textVisibilityDistance;
    }

    draw(context, cameraX) {
        const adjustedX = this.x - cameraX;
        
        // Dessiner le PNJ (à implémenter dans les classes filles)
        this.drawCharacter(context, adjustedX);
        
        // Dessiner le texte si présent et si le joueur est assez proche
        if (this.text && this.showText) {
            this.drawText(context, adjustedX);
        }
    }

    drawText(context, adjustedX) {
        context.save();
        
        // Configurer le style du texte
        context.font = this.font;
        context.textAlign = 'center';
        
        // Mesurer le texte pour le fond
        const metrics = context.measureText(this.text);
        const textWidth = metrics.width + this.textPadding * 2;
        const textHeight = 20 + this.textPadding * 2;
        
        // Position du texte
        const textX = adjustedX + this.width / 2;
        const textY = this.y + this.textOffsetY;
        
        // Dessiner le fond
        context.fillStyle = this.textBackground;
        context.fillRect(
            textX - textWidth / 2,
            textY - textHeight + this.textPadding,
            textWidth,
            textHeight
        );
        
        // Dessiner le texte
        context.fillStyle = this.textColor;
        context.fillText(this.text, textX, textY);
        
        context.restore();
    }

    drawCharacter(context, adjustedX) {
        // À implémenter dans les classes filles
    }
} 