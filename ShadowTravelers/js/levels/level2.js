import { BaseLevel } from './BaseLevel.js';
import { Player } from '../entities/Player.js';

export class Level2 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.player = new Player(canvas);
    }

    update() {
        this.player.update(this.keys, this.floorHeight);
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessiner le sol
        this.context.fillStyle = 'black';
        this.context.fillRect(0, this.canvas.height - this.floorHeight, this.canvas.width, this.floorHeight);

        // Dessiner le joueur
        this.player.draw(this.context);
    }
} 