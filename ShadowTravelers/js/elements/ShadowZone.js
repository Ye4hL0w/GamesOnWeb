export class ShadowZone {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.opacity = 0.85;
        this.pulseSpeed = 0.002;
        this.pulseDirection = 1;
        this.shadowTransitionRate = 0.03;
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
    
    // si le joueur est dans la zone d'ombre
    checkCollision(player, cameraX, detectionMargin = 5) {
        // position absolue
        const adjustedX = this.x - cameraX;
        
        // Zone d'effet légèrement plus petite que la zone visuelle
        const playerRect = {
            x: player.x + detectionMargin,
            y: player.y + detectionMargin,
            width: player.width - 2 * detectionMargin,
            height: player.height - 2 * detectionMargin
        };
        
        const zoneEffect = {
            x: adjustedX + detectionMargin,
            y: this.y + detectionMargin,
            width: this.width - 2 * detectionMargin,
            height: this.height - 2 * detectionMargin
        };
        
        return playerRect.x < zoneEffect.x + zoneEffect.width &&
               playerRect.x + playerRect.width > zoneEffect.x &&
               playerRect.y < zoneEffect.y + zoneEffect.height &&
               playerRect.y + playerRect.height > zoneEffect.y;
    }
    
    // applique l'effet au joueur
    applyEffect(player, wasInShadow) {
        player.inShadowZone = true;
        
        if (!wasInShadow) {
            console.log("Le joueur commence à entrer dans une zone d'ombre");
        }
        
        // augmenter progressivement l'effet de l'ombre
        if (player.shadowInfluence < 1) {
            player.shadowInfluence = Math.min(1, player.shadowInfluence + this.shadowTransitionRate);
            if (player.shadowInfluence >= 1) {
                console.log("Contrôles complètement inversés");
            }
        }
    }
    
    // sortie de l'ombre
    reduceEffect(player, wasInShadow) {
        if (wasInShadow && !player.inShadowZone) {
            console.log("Le joueur commence à sortir d'une zone d'ombre");
        }
        
        // diminuer progressivement l'effet de l'ombre
        if (player.shadowInfluence > 0) {
            player.shadowInfluence = Math.max(0, player.shadowInfluence - this.shadowTransitionRate);
            if (player.shadowInfluence <= 0) {
                console.log("Contrôles redevenus normaux");
            }
        }
    }
    
    // modifie les controles en fonction de l'influence de l'ombre
    getModifiedControls(player, keys) {
        if (player.shadowInfluence <= 0) {
            return keys;
        }
        
        const normalInfluence = 1 - player.shadowInfluence;
        const invertedInfluence = player.shadowInfluence;
        
        // "mélange" gauche/droite
        const effectiveLeftKey = 
            (keys.ArrowLeft * normalInfluence) + 
            (keys.ArrowRight * invertedInfluence);
            
        const effectiveRightKey = 
            (keys.ArrowRight * normalInfluence) + 
            (keys.ArrowLeft * invertedInfluence);
        
        return {
            ArrowLeft: effectiveLeftKey > 0.5,
            ArrowRight: effectiveRightKey > 0.5,
            Space: keys.Space,
            ArrowUp: keys.ArrowUp
        };
    }
} 