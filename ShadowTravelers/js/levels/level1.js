export class Level1 {
    constructor(context, canvas) {
        this.context = context;
        this.canvas = canvas;
        
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height + 455,
            width: 100,
            height: 100,
            speed: 5,
            direction: 'right',
            lastDirection: 'right'
        };

        this.playerSprites = {
            runRight: new Image(),
            runLeft: new Image(),
            idleRight: new Image(),
            idleLeft: new Image()
        };

        this.playerSprites.runRight.src = './assets/player/run-right.png';
        this.playerSprites.runLeft.src = './assets/player/run-left.png';
        this.playerSprites.idleRight.src = './assets/player/idle-right.png';
        this.playerSprites.idleLeft.src = './assets/player/idle-left.png';

        this.keys = {
            ArrowLeft: false,
            ArrowRight: false
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

        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = 'black';
        this.context.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);

        let sprite;
        if (this.keys.ArrowLeft || this.keys.ArrowRight) {
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