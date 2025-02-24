export class Level1 {
    constructor(context, canvas) {
        this.context = context;
        this.canvas = canvas;
        
        this.floorHeight = 50; // hauteur du sol noir
        
        this.player = {
            x: this.canvas.width / 2,
            y: 0, // sera calculé dans le update
            width: 100,
            height: 100,
            speed: 5,
            direction: 'right',
            lastDirection: 'right',
            isJumping: false,
            jumpForce: -15,
            gravity: 0.3,
            velocityY: 0,
            groundY: 0 // sera calculé dans le update
        };

        this.playerSprites = {
            runRight: new Image(),
            runLeft: new Image(),
            idleRight: new Image(),
            idleLeft: new Image(),
            jumpRight: new Image(),
            jumpLeft: new Image(),
            fallRight: new Image(),
            fallLeft: new Image()
        };

        this.playerSprites.runRight.src = './assets/player/run-right.png';
        this.playerSprites.runLeft.src = './assets/player/run-left.png';
        this.playerSprites.idleRight.src = './assets/player/idle-right.png';
        this.playerSprites.idleLeft.src = './assets/player/idle-left.png';
        this.playerSprites.jumpRight.src = './assets/player/fall-right.png';
        this.playerSprites.jumpLeft.src = './assets/player/fall-left.png';
        this.playerSprites.fallRight.src = './assets/player/fall-right.png';
        this.playerSprites.fallLeft.src = './assets/player/fall-left.png';

        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            ArrowUp: false
        };

        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
            }
        });
    }

    update() {
        this.player.groundY = this.canvas.height - this.floorHeight + 10 - this.player.height;
        
        if (!this.player.isJumping) {
            this.player.y = this.player.groundY;
        }
        
        if (this.keys.ArrowLeft) {
            this.player.x -= this.player.speed;
            this.player.direction = 'left';
            this.player.lastDirection = 'left';
        }
        if (this.keys.ArrowRight) {
            this.player.x += this.player.speed;
            this.player.direction = 'right';
            this.player.lastDirection = 'right';
        }

        if ((this.keys.Space || this.keys.ArrowUp) && !this.player.isJumping) {
            this.player.isJumping = true;
            this.player.velocityY = this.player.jumpForce;
        }

        if (this.player.isJumping) {
            this.player.velocityY += this.player.gravity;
            this.player.y += this.player.velocityY;

            if (this.player.y >= this.player.groundY) {
                this.player.y = this.player.groundY;
                this.player.isJumping = false;
                this.player.velocityY = 0;
            }
        }

        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = 'black';
        this.context.fillRect(0, this.canvas.height - this.floorHeight, this.canvas.width, this.floorHeight);

        let sprite;
        if (this.player.isJumping) {
            if (this.player.velocityY > 0) {
                // Si la vélocité est positive, le joueur est en train de tomber
                sprite = this.player.lastDirection === 'right' ? this.playerSprites.fallRight : this.playerSprites.fallLeft;
            } else {
                // Si la vélocité est négative, le joueur est en train de monter
                sprite = this.player.lastDirection === 'right' ? this.playerSprites.jumpRight : this.playerSprites.jumpLeft;
            }
        } else if (this.keys.ArrowLeft || this.keys.ArrowRight) {
            sprite = this.player.direction === 'right' ? this.playerSprites.runRight : this.playerSprites.runLeft;
        } else {
            sprite = this.player.lastDirection === 'right' ? this.playerSprites.idleRight : this.playerSprites.idleLeft;
        }

        if (sprite.complete) {
            this.context.drawImage(
                sprite,
                0,
                0,
                sprite.width,
                sprite.height,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
        }
    }

    initialize() {
        this.gameLoop();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}