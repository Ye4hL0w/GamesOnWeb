export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 100;
        this.height = 100;
        this.x = this.canvas.width / 2;
        this.y = 0;
        this.speed = 1000; // Augmenté de 500 à 1000 pour un déplacement plus rapide
        this.direction = 'right';
        this.lastDirection = 'right';
        this.isJumping = false;
        this.isMoving = false;
        this.jumpForce = -800; // Force de saut en pixels par seconde
        this.gravity = 1800; // Gravité en pixels par seconde²
        this.velocityY = 0;
        this.groundY = 0;
        this.frameCount = 0;
        this.animationSpeed = 20;
        this.lastTime = performance.now(); // Temps du dernier frame

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

    update(keys, floorHeight, deltaTime) {
        this.groundY = this.canvas.height - floorHeight - this.height + 10;
        
        if (!this.isJumping) {
            this.y = this.groundY;
        }
        
        // Si deltaTime n'est pas fourni, utiliser une valeur fixe
        // pour la compatibilité avec l'ancienne version
        if (deltaTime === undefined) {
            // Utiliser une vitesse fixe en pixels par frame
            this.isMoving = false;
            
            if (keys.ArrowLeft) {
                this.x -= 10; 
                this.direction = 'left';
                this.lastDirection = 'left';
                this.isMoving = true;
                this.frameCount++;
            }
            if (keys.ArrowRight) {
                this.x += 10;
                this.direction = 'right';
                this.lastDirection = 'right';
                this.isMoving = true;
                this.frameCount++;
            }
            
            if (!this.isMoving) {
                this.frameCount = 0;
            }
            
            if ((keys.Space || keys.ArrowUp) && !this.isJumping) {
                this.isJumping = true;
                this.velocityY = -15; // Vitesse fixe pour le saut
            }
            
            if (this.isJumping) {
                this.velocityY += 0.8; // Gravité fixe
                this.y += this.velocityY;
                
                if (this.y >= this.groundY) {
                    this.y = this.groundY;
                    this.isJumping = false;
                    this.velocityY = 0;
                }
            }
        } else {
            // Version avec deltaTime (pour la compatibilité future)
            this.isMoving = false;
            
            if (keys.ArrowLeft) {
                this.x -= this.speed * deltaTime;
                this.direction = 'left';
                this.lastDirection = 'left';
                this.isMoving = true;
                this.frameCount++;
            }
            if (keys.ArrowRight) {
                this.x += this.speed * deltaTime;
                this.direction = 'right';
                this.lastDirection = 'right';
                this.isMoving = true;
                this.frameCount++;
            }
            
            if (!this.isMoving) {
                this.frameCount = 0;
            }
            
            if ((keys.Space || keys.ArrowUp) && !this.isJumping) {
                this.isJumping = true;
                this.velocityY = this.jumpForce;
            }
            
            if (this.isJumping) {
                this.velocityY += this.gravity * deltaTime;
                this.y += this.velocityY * deltaTime;
                
                if (this.y >= this.groundY) {
                    this.y = this.groundY;
                    this.isJumping = false;
                    this.velocityY = 0;
                }
            }
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