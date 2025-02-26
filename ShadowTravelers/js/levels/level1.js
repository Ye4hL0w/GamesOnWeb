import { BaseLevel } from './BaseLevel.js';
import { Exit } from '../entities/Exit.js';
import { Ghost } from '../entities/Ghost.js';

export class Level1 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.ghosts = [];
    }

    initialize() {
        super.initialize();

        const obstacleHeight = 100;
        const obstacleY = this.canvas.height - this.floorHeight + 710;
        
        this.obstacles.push(
            { x: 1500, y: obstacleY, width: 50, height: obstacleHeight },
            { x: 2000, y: obstacleY, width: 50, height: obstacleHeight },
            { x: 2500, y: obstacleY, width: 50, height: obstacleHeight }
        );

        const ghostY = obstacleY;
        this.ghosts.push(
            new Ghost(750, ghostY, "Bonjour voyageur !")
        );

        this.exit = new Exit(
            this.levelWidth - 200,
            this.canvas.height - this.floorHeight + 710,
            50,
            100
        );
    }

    update() {
        super.update();
        
        // Mise à jour des fantômes
        if (this.player) {
            const playerAbsoluteX = this.player.x + this.cameraX;
            for (const ghost of this.ghosts) {
                ghost.update(playerAbsoluteX);
            }
        }
    }

    draw() {
        super.draw();
        
        // Dessiner les fantômes
        this.context.save();
        for (const ghost of this.ghosts) {
            ghost.draw(this.context, this.cameraX);
        }
        this.context.restore();
    }

    onLevelComplete() {
        console.log('Niveau 1 terminé ! Passage au niveau suivant...');
    }
}