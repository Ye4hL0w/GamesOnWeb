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
    }

    init(spirit, jumpForce, handleJump) {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e, spirit, jumpForce, handleJump));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e, spirit));
        requestAnimationFrame(() => this.animateWalk(spirit));
    }

    animateWalk(spirit) {
        const now = performance.now();
        if (this.isWalking && now - this.lastFrameTime > this.walkAnimationSpeed) {
            this.walkAnimationFrame = (this.walkAnimationFrame + 1) % 2;
            this.lastFrameTime = now;
            this.updateWalkingAnimation(spirit);
        }
        requestAnimationFrame(() => this.animateWalk(spirit));
    }

    updateWalkingAnimation(spirit) {
        spirit.classList.remove('walking-left1', 'walking-left2', 'walking-right1', 'walking-right2');
        if (this.isWalking) {
            const animClass = this.facingRight ? 
                (this.walkAnimationFrame === 0 ? 'walking-right1' : 'walking-right2') : 
                (this.walkAnimationFrame === 0 ? 'walking-left1' : 'walking-left2');
            spirit.classList.add(animClass);
        }
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
                        this.startDash();
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
                        this.startDash();
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
        spirit.classList.remove('walking-left1', 'walking-left2', 'walking-right1', 'walking-right2');
    }

    startDash() {
        this.isDashing = true;
        this.dashCooldown = true;
        
        setTimeout(() => {
            this.isDashing = false;
        }, this.dashDuration);
        
        setTimeout(() => {
            this.dashCooldown = false;
        }, this.dashCooldownDuration);
    }
}
