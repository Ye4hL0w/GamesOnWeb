class Physics {
    constructor() {
        // Constantes de base (pixels par seconde)
        this.gravity = 2600; // Augmentation de la gravité
        this.jumpForce = -900;
        this.moveSpeed = 500;
        this.dashSpeed = 800;
        this.friction = 0.82;
        
        // État du mouvement
        this.velocityX = 0;
        this.velocityY = 0;
        this.playerX = 0;
        this.playerY = 0;
        this.lastTime = performance.now();
        this.maxFallSpeed = 1200;
        this.isOnGround = false; // Nouvel état pour tracker si le personnage est au sol
    }

    getAdjustedHitbox(playerRect) {
        const widthReduction = playerRect.width * 0.2;
        return {
            left: playerRect.left + widthReduction,
            right: playerRect.right - widthReduction,
            top: playerRect.top,
            bottom: playerRect.bottom,
            width: playerRect.width * 0.6,
            height: playerRect.height,
        };
    }

    update(controls, spirit, levelManager, onDeath) {
        if (!controls.isEvolved) return;

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.017);
        this.lastTime = currentTime;

        // Réinitialise l'état au sol
        this.isOnGround = false;

        // Mouvement horizontal avec deltaTime
        if (controls.isDashing) {
            const dashVelocity = this.dashSpeed * deltaTime;
            this.velocityX = controls.keys.left ? -dashVelocity : (controls.keys.right ? dashVelocity : 0);
            
            // Si on était au sol au début du dash, on maintient la vélocité Y à 0
            if (controls.wasOnGroundWhenDashStarted) {
                this.velocityY = 0;
            } else {
                // En l'air, on applique une gravité réduite pendant le dash
                this.velocityY += (this.gravity * 0.5) * deltaTime;
            }
        } else {
            const moveVelocity = this.moveSpeed * deltaTime;
            this.velocityX = controls.keys.left ? -moveVelocity : (controls.keys.right ? moveVelocity : 0);
            // Application normale de la gravité
            this.velocityY += this.gravity * deltaTime;
        }
        
        // Limite la vitesse de chute
        if (this.velocityY > this.maxFallSpeed) {
            this.velocityY = this.maxFallSpeed;
        }

        // Mise à jour des positions
        this.playerX += this.velocityX;
        this.playerY += this.velocityY * deltaTime;

        // Vérification des collisions
        const playerRect = spirit.getBoundingClientRect();
        const adjustedHitbox = this.getAdjustedHitbox(playerRect);
        
        // Récupérer toutes les collisions possibles
        const collisions = levelManager.getAllCollisions(adjustedHitbox);
        let hasFragmentCollision = false;

        // Traiter chaque type de collision
        for (const collision of collisions) {
            if (collision.type === 'fragment') {
                hasFragmentCollision = true;
                collision.element.style.display = 'none';
                continue;
            }

            // Pour les obstacles blancs en mode dash, on ignore la collision SEULEMENT si c'est une collision latérale
            if (controls.isDashing && collision.type === 'obstacle' && 
                collision.element.classList.contains('white')) {
                const isVerticalCollision = this.isVerticalCollision(adjustedHitbox, collision.rect);
                if (!isVerticalCollision) {
                    continue;
                }
            }

            // Traiter la collision en fonction de son type
            if (collision.type === 'platform') {
                this.handlePlatformCollision(collision, controls, adjustedHitbox);
            } else if (collision.type === 'obstacle') {
                this.handleObstacleCollision(collision, controls, adjustedHitbox);
            }
        }

        // Vérification de la mort par chute
        if (this.playerY > window.innerHeight) {
            onDeath();
            return;
        }

        // Limites de l'écran
        this.playerX = Math.max(0, Math.min(this.playerX, window.innerWidth - 100));
        
        // Application des positions
        spirit.style.left = `${this.playerX}px`;
        spirit.style.top = `${this.playerY}px`;

        return hasFragmentCollision ? { type: 'fragment' } : null;
    }

    isVerticalCollision(playerRect, obstacleRect) {
        const verticalOverlap = Math.min(
            Math.abs(playerRect.bottom - obstacleRect.top),
            Math.abs(playerRect.top - obstacleRect.bottom)
        );
        const horizontalOverlap = Math.min(
            Math.abs(playerRect.right - obstacleRect.left),
            Math.abs(playerRect.left - obstacleRect.right)
        );
        
        return verticalOverlap < horizontalOverlap;
    }

    handlePlatformCollision(collision, controls, adjustedHitbox) {
        if (this.velocityY > 0 && adjustedHitbox.bottom > collision.rect.top &&
            adjustedHitbox.bottom < collision.rect.top + 20) {
            // Atterrissage sur une plateforme
            this.playerY = collision.rect.top - adjustedHitbox.height;
            this.velocityY = 0;
            controls.isJumping = false;
            controls.canJump = true;
            this.isOnGround = true;
            controls.wasOnGroundWhenDashStarted = !controls.isDashing; // Met à jour l'état au sol si on ne dash pas
        } else if (this.velocityY < 0 && adjustedHitbox.top < collision.rect.bottom &&
                  adjustedHitbox.top > collision.rect.bottom - 20) {
            // Collision avec le dessous d'une plateforme
            this.playerY = collision.rect.bottom;
            this.velocityY = 0;
        }
    }

    handleObstacleCollision(collision, controls, adjustedHitbox) {
        const overlap = {
            top: adjustedHitbox.bottom - collision.rect.top,
            bottom: collision.rect.bottom - adjustedHitbox.top,
            left: adjustedHitbox.right - collision.rect.left,
            right: collision.rect.right - adjustedHitbox.left,
        };
        
        const minOverlap = Math.min(overlap.top, overlap.bottom, overlap.left, overlap.right);

        if (minOverlap === overlap.top && this.velocityY >= 0) {
            this.playerY = collision.rect.top - adjustedHitbox.height;
            this.velocityY = 0;
            controls.isJumping = false;
            controls.canJump = true;
        } else if (minOverlap === overlap.bottom && this.velocityY <= 0) {
            this.playerY = collision.rect.bottom;
            this.velocityY = 0;
        } else if (minOverlap === overlap.left && this.velocityX >= 0) {
            this.playerX = collision.rect.left - adjustedHitbox.width;
            this.velocityX = 0;
        } else if (minOverlap === overlap.right && this.velocityX <= 0) {
            this.playerX = collision.rect.right;
            this.velocityX = 0;
        }
    }

    setPosition(x, y) {
        this.playerX = x;
        this.playerY = y;
        this.velocityX = 0;
        this.velocityY = 0;
    }
}