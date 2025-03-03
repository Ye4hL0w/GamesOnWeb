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
        
        // Largeur maximale du texte
        this.maxTextWidth = 250;
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
        
        // Découper le texte en lignes pour respecter la largeur maximale
        const lines = this.wrapText(context, this.text, this.maxTextWidth);
        
        // Calculer la hauteur totale du texte
        const lineHeight = 20;
        const textHeight = (lineHeight * lines.length) + this.textPadding * 2;
        
        // Position du texte
        const textX = adjustedX + this.width / 2;
        const textY = this.y + this.textOffsetY;
        
        // Dessiner le fond
        context.fillStyle = this.textBackground;
        context.fillRect(
            textX - (this.maxTextWidth + this.textPadding * 2) / 2,
            textY - textHeight + this.textPadding,
            this.maxTextWidth + this.textPadding * 2,
            textHeight
        );
        
        // Dessiner chaque ligne de texte
        context.fillStyle = this.textColor;
        lines.forEach((line, index) => {
            context.fillText(
                line, 
                textX, 
                textY - textHeight + this.textPadding + lineHeight * (index + 1)
            );
        });
        
        context.restore();
    }
    
    wrapText(context, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        
        lines.push(currentLine);
        return lines;
    }

    drawCharacter(context, adjustedX) {
        // À implémenter dans les classes filles
    }
} 