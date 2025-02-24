export class BaseLevel {
    constructor(context, canvas) {
        this.context = context;
        this.canvas = canvas;
        this.floorHeight = 50;
        
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
        // À implémenter dans les classes filles
    }

    draw() {
        // À implémenter dans les classes filles
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