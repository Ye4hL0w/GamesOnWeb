import { BaseLevel } from './BaseLevel.js';
import { Player } from '../entities/Player.js';

export class Level1 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.player = new Player(canvas);
    }

    update() {
        this.player.update(this.keys, this.floorHeight);
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = 'black';
        this.context.fillRect(0, this.canvas.height - this.floorHeight, this.canvas.width, this.floorHeight);

        this.player.draw(this.context);
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