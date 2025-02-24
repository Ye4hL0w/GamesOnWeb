import { Level1 } from './levels/level1.js';
import { Level2 } from './levels/level2.js';
import { Level3 } from './levels/level3.js';

class LevelManager {
    constructor() {
        // Initialisation du gestionnaire de niveau
        this.canvas = document.getElementById('myCanvas');
        this.context = this.canvas.getContext('2d');
        this.currentLevel = null;
    }

    startLevel(levelId) {
        // Logique pour démarrer un niveau spécifique
        this.clearCanvas();
        switch(levelId) {
            case 1:
                this.currentLevel = new Level1(this.context, this.canvas);
                break;
            case 2:
                this.currentLevel = new Level2(this.context, this.canvas);
                break;
            case 3:
                this.currentLevel = new Level3(this.context, this.canvas);
                break;
            default:
                console.error('Niveau non trouvé');
                return;
        }
        this.currentLevel.initialize();
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export { LevelManager };
