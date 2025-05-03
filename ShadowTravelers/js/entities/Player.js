export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 100;
        this.height = 100;
        this.x = this.canvas.width * 0.1;
        this.y = this.canvas.height - this.height +10;
        this.speed = 1000;
        this.direction = 'right';
        this.lastDirection = 'right';
        this.isJumping = false;
        this.wasJumping = false;
        this.isMoving = false;
        this.jumpForce = -800;
        this.gravity = 1800;
        this.velocityY = 0;
        this.groundY = 0;
        this.frameCount = 0;
        this.animationSpeed = 8;
        this.lastTime = performance.now();
        this.canJump = true;
        this.moveDistance = 15;
        this.jumpVelocity = -25;
        this.gravityValue = 1.2;

        // footsteps
        this.footstepSound = new Audio('./assets/sounds/none.mp3');
        this.footstepSound.loop = true;
        this.footstepSound.volume = 0.5;
        this.isPlayingFootsteps = false;

        this.sprites = {
            runRight: new Image(),
            runRight2: new Image(),
            runLeft: new Image(),
            runLeft2: new Image(),
            idleRight: new Image(),
            idleLeft: new Image(),
            jumpRight: new Image(),
            jumpLeft: new Image(),
            fallRight: new Image(),
            fallLeft: new Image()
        };

        this.loadSprites();
    }

    loadSprites() {
        this.sprites.runRight.src = './assets/player/run-right.png';
        this.sprites.runRight2.src = './assets/player/run-right-2.png';
        this.sprites.runLeft.src = './assets/player/run-left.png';
        this.sprites.runLeft2.src = './assets/player/run-left-2.png';
        this.sprites.idleRight.src = './assets/player/idle-right.png';
        this.sprites.idleLeft.src = './assets/player/idle-left.png';
        this.sprites.jumpRight.src = './assets/player/fall-right.png';
        this.sprites.jumpLeft.src = './assets/player/fall-left.png';
        this.sprites.fallRight.src = './assets/player/fall-right.png';
        this.sprites.fallLeft.src = './assets/player/fall-left.png';
    }

    update(keys, floorHeight) {
        this.groundY = this.canvas.height - floorHeight - this.height + 10;
        
        if (!this.isJumping && this.y >= this.groundY) {
            this.y = this.groundY;
            this.canJump = true;
        }
        
        this.isMoving = false;
        
        if (keys.ArrowLeft) {
            this.x -= this.moveDistance;
            this.direction = 'left';
            this.lastDirection = 'left';
            this.isMoving = true;
            this.frameCount++;
        }
        if (keys.ArrowRight) {
            this.x += this.moveDistance;
            this.direction = 'right';
            this.lastDirection = 'right';
            this.isMoving = true;
            this.frameCount++;
        }
        
        if (!this.isMoving) {
            this.frameCount = 0;
        }
        
        if ((keys.Space || keys.ArrowUp) && this.canJump) {
            this.isJumping = true;
            this.canJump = false;
            this.velocityY = this.jumpVelocity;
        }
        
        if (this.isJumping) {
            this.velocityY += this.gravityValue;
            this.y += this.velocityY;
            
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }

        if (this.isMoving && !this.isJumping && !this.isPlayingFootsteps) {
            this.footstepSound.play();
            this.isPlayingFootsteps = true;
        } else if ((!this.isMoving || this.isJumping) && this.isPlayingFootsteps) {
            this.footstepSound.pause();
            this.footstepSound.currentTime = 0;
            this.isPlayingFootsteps = false;
        }
        
        this.x = Math.max(0, Math.min(this.canvas.width - this.width, this.x));
    }

    draw(context) {
        let sprite;
        if (this.isJumping) {
            if (this.velocityY > 0) {
                sprite = this.lastDirection === 'right' ? this.sprites.fallRight : this.sprites.fallLeft;
            } else {
                sprite = this.lastDirection === 'right' ? this.sprites.jumpRight : this.sprites.jumpLeft;
            }
        } else if (this.isMoving) {
            const useSecondFrame = Math.floor(this.frameCount / this.animationSpeed) % 2 === 1;
            if (this.direction === 'right') {
                sprite = useSecondFrame ? this.sprites.runRight2 : this.sprites.runRight;
            } else {
                sprite = useSecondFrame ? this.sprites.runLeft2 : this.sprites.runLeft;
            }
        } else {
            sprite = this.lastDirection === 'right' ? this.sprites.idleRight : this.sprites.idleLeft;
        }

        if (sprite.complete) {
            context.drawImage(
                sprite,
                0,
                0,
                sprite.width,
                sprite.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }
} 