import { PNJ } from './PNJ.js';

export class Ghost extends PNJ {
    constructor(x, y, text = '') {
        super(x, y, 100, 100, text);
        
        // Animation de flottement
        this.floatAmplitude = 10; // Amplitude du mouvement de flottement
        this.floatSpeed = 0.01; // Vitesse de l'animation
        this.floatOffset = 0; // Offset pour l'animation
        this.initialY = y; // Position Y initiale
        
        // Chargement des sprites
        this.spriteLeft = new Image();
        this.spriteRight = new Image();
        
        this.spriteLeft.src = './assets/pnj/ghost-left.png';
        this.spriteRight.src = './assets/pnj/ghost-right.png';
        this.currentSprite = this.spriteRight;
    }

    update(playerX) {
        super.update(playerX);

        // Mise à jour de l'animation de flottement
        this.floatOffset += this.floatSpeed;
        const floatY = Math.sin(this.floatOffset) * this.floatAmplitude;
        this.y = this.initialY + floatY;

        // Mise à jour de la direction en fonction de la position du joueur
        if (playerX < this.x) {
            this.currentSprite = this.spriteLeft;
        } else {
            this.currentSprite = this.spriteRight;
        }
    }

    drawCharacter(context, adjustedX) {
        // Dessiner le fantôme avec le sprite approprié
        if (this.currentSprite && this.currentSprite.complete && this.currentSprite.naturalWidth > 0) {
            try {
                context.drawImage(
                    this.currentSprite,
                    adjustedX,
                    this.y,
                    this.width,
                    this.height
                );
            } catch (error) {
                console.error('Erreur lors du dessin du sprite:', error);
            }
        }
    }
} 