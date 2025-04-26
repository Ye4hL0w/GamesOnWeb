class Controls {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false
        };
        
        this.isEvolved = false;
        this.canJump = false;
        this.isJumping = false;
        this.facingRight = false;
        
        // Dash properties
        this.canDash = false;
        this.isDashing = false;
        this.wasOnGroundWhenDashStarted = false;
        this.lastKeyPressTime = { arrowLeft: 0, arrowRight: 0 };
        this.doubleTapThreshold = 400;
        this.dashDuration = 400;
        this.dashCooldown = false;
        this.dashCooldownDuration = 500;
        
        // Animation de marche améliorée
        this.walkAnimationFrame = 0;
        this.walkAnimationSpeed = 150; // Ajusté pour une meilleure fluidité
        this.isWalking = false;
        this.lastFrameTime = 0;

        // Ajout d'une référence à l'élément spirit pour l'utiliser dans les timeouts
        this.spiritElement = null;
    }

    init(spirit, jumpForce, handleJump) {
        this.spiritElement = spirit; // Stockage de la référence au spirit
        document.addEventListener('keydown', (e) => this.handleKeyDown(e, spirit, jumpForce, handleJump));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e, spirit));
        requestAnimationFrame(() => this.animateWalk(spirit));
    }

    animateWalk(spirit) {
        const now = performance.now();
        if (this.isWalking && !this.isDashing && now - this.lastFrameTime > this.walkAnimationSpeed) {
            this.walkAnimationFrame = (this.walkAnimationFrame + 1) % 2;
            this.lastFrameTime = now;
            this.updateWalkingAnimation(spirit);
        }
        requestAnimationFrame(() => this.animateWalk(spirit));
    }

    updateWalkingAnimation(spirit) {
        // Ne mettre à jour l'animation de marche que si le personnage ne dash pas
        if (!this.isDashing) {
            this.removeAllAnimationClasses(spirit);
            if (this.isWalking) {
                const animClass = this.facingRight ? 
                    (this.walkAnimationFrame === 0 ? 'walking-right1' : 'walking-right2') : 
                    (this.walkAnimationFrame === 0 ? 'walking-left1' : 'walking-left2');
                spirit.classList.add(animClass);
            }
        }
    }

    // Nouvelle méthode pour supprimer toutes les classes d'animation
    removeAllAnimationClasses(spirit) {
        spirit.classList.remove(
            'walking-left1', 'walking-left2', 
            'walking-right1', 'walking-right2',
            'dashing-left', 'dashing-right'
        );
    }

    handleKeyDown(e, spirit, jumpForce, handleJump) {
        if (!this.isEvolved) return;
        const now = Date.now();
        switch(e.key.toLowerCase()) {
            case 'arrowup':
                if (this.canJump) {
                    handleJump(jumpForce);
                    this.isJumping = true;
                    this.canJump = false;
                }
                break;
            case 'arrowleft':
                if (!this.keys.left && this.canDash && !this.dashCooldown) {
                    if (now - this.lastKeyPressTime.arrowLeft < this.doubleTapThreshold) {
                        this.startDash(spirit, 'left');
                    }
                    this.lastKeyPressTime.arrowLeft = now;
                }
                this.keys.left = true;
                this.facingRight = false;
                spirit.classList.remove('facing-right');
                this.isWalking = true;
                break;
            case 'arrowright':
                if (!this.keys.right && this.canDash && !this.dashCooldown) {
                    if (now - this.lastKeyPressTime.arrowRight < this.doubleTapThreshold) {
                        this.startDash(spirit, 'right');
                    }
                    this.lastKeyPressTime.arrowRight = now;
                }
                this.keys.right = true;
                this.facingRight = true;
                spirit.classList.add('facing-right');
                this.isWalking = true;
                break;
        }
    }

    handleKeyUp(e, spirit) {
        if (!this.isEvolved) return;
        switch(e.key.toLowerCase()) {
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'arrowright':
                this.keys.right = false;
                break;
        }
        this.isWalking = this.keys.left || this.keys.right;
        if (!this.isWalking) {
            this.resetWalkAnimation(spirit);
        }
    }

    resetWalkAnimation(spirit) {
        if (!this.isDashing) {
            this.removeAllAnimationClasses(spirit);
        }
    }

    startDash(spirit, direction) {
        this.isDashing = true;
        this.dashCooldown = true;
        
        // Enregistre si on était au sol au début du dash
        this.wasOnGroundWhenDashStarted = this.canJump;
        
        // Supprime toutes les classes d'animation et ajoute la classe de dash appropriée
        this.removeAllAnimationClasses(spirit);
        spirit.classList.add(direction === 'right' ? 'dashing-right' : 'dashing-left');
        
        setTimeout(() => {
            this.isDashing = false;
            this.wasOnGroundWhenDashStarted = false;
            
            // Si on était au sol au début du dash, on garde la possibilité de sauter
            if (this.wasOnGroundWhenDashStarted) {
                this.canJump = true;
                this.isJumping = false;
            }
            
            // Supprime les classes de dash
            spirit.classList.remove('dashing-right', 'dashing-left');
            
            // Restaure l'animation de marche si le joueur se déplace toujours
            if (this.isWalking) {
                this.updateWalkingAnimation(spirit);
            }
        }, this.dashDuration);
        
        setTimeout(() => {
            this.dashCooldown = false;
        }, this.dashCooldownDuration);
    }
}
