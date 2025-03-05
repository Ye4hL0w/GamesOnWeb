class Physics {
    constructor() {
        this.gravity = 1.2;
        this.jumpForce = -20;
        this.moveSpeed = 8;
        this.dashSpeed = 15;
        this.friction = 0.82;
        
        this.velocityX = 0;
        this.velocityY = 0;
        this.playerX = 0;
        this.playerY = 0;
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

        this.velocityX = controls.keys.left ? -this.moveSpeed : (controls.keys.right ? this.moveSpeed : 0);
        if (controls.isDashing) this.velocityX = Math.sign(this.velocityX) * this.dashSpeed;

        this.velocityY += this.gravity;
        this.playerX += this.velocityX;
        this.playerY += this.velocityY;

        const playerRect = spirit.getBoundingClientRect();
        const adjustedHitbox = this.getAdjustedHitbox(playerRect);

        const collision = levelManager.checkCollisions(adjustedHitbox);
        
        if (collision) {
            if (!(controls.isDashing && collision.type === 'obstacle' && collision.element.classList.contains('white'))) {
                this.handleCollision(collision, controls, adjustedHitbox);
            }
        }

        if (this.playerY > window.innerHeight) {
            onDeath();
            return;
        }

        this.playerX = Math.max(0, Math.min(this.playerX, window.innerWidth - 100));
        spirit.style.left = `${this.playerX}px`;
        spirit.style.top = `${this.playerY}px`;

        return collision;
    }

    handleCollision(collision, controls, adjustedHitbox) {
        switch (collision.type) {
            case 'platform':
                if (this.velocityY > 0 && adjustedHitbox.bottom > collision.rect.top &&
                    adjustedHitbox.bottom < collision.rect.top + 20) {
                    // Collision par le haut de la plateforme (le joueur atterrit dessus)
                    this.playerY = collision.rect.top - adjustedHitbox.height;
                    this.velocityY = 0;
                    controls.isJumping = false;
                    controls.canJump = true;
                } else if (this.velocityY < 0 && adjustedHitbox.top < collision.rect.bottom &&
                          adjustedHitbox.top > collision.rect.bottom - 20) {
                    // Collision par le bas de la plateforme (le joueur se cogne la tête)
                    this.playerY = collision.rect.bottom;
                    this.velocityY = 0;
                }
                break;

            case 'fragment':
                collision.element.style.display = 'none';
                break;

            case 'obstacle':
                if (!(collision.element.classList.contains('white') && controls.isDashing)) {
                    this.resolveObstacleCollision(collision.rect, adjustedHitbox, controls);
                }
                break;
        }
    }

    resolveObstacleCollision(obstacleRect, adjustedHitbox, controls) {
        const overlap = {
            top: adjustedHitbox.bottom - obstacleRect.top,
            bottom: obstacleRect.bottom - adjustedHitbox.top,
            left: adjustedHitbox.right - obstacleRect.left,
            right: obstacleRect.right - adjustedHitbox.left,
        };
        
        const minOverlap = Math.min(overlap.top, overlap.bottom, overlap.left, overlap.right);

        if (minOverlap === overlap.top && this.velocityY >= 0) {
            this.playerY = obstacleRect.top - adjustedHitbox.height;
            this.velocityY = 0;
            controls.isJumping = false;
            controls.canJump = true;
        } else if (minOverlap === overlap.bottom && this.velocityY <= 0) {
            this.playerY = obstacleRect.bottom;
            this.velocityY = 0;
        } else if (minOverlap === overlap.left && this.velocityX >= 0) {
            this.playerX = obstacleRect.left - adjustedHitbox.width;
            this.velocityX = 0;
        } else if (minOverlap === overlap.right && this.velocityX <= 0) {
            this.playerX = obstacleRect.right;
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
