import { Level1 } from './levels/level1.js';
import { Level2 } from './levels/level2.js';
import { Level3 } from './levels/level3.js';

class LevelManager {
    constructor() {
        // init du gestionnaire de niveau
        this.canvas = document.getElementById('myCanvas');
        if (this.canvas) {
            this.context = this.canvas.getContext('2d');
            this.currentLevel = null;
            this.gameLoopId = null;
            this.isInitializing = false;
            this.lastTime = 0;
            
            // Configurer l'écouteur de redimensionnement
            this.handleResize = this.handleResize.bind(this);
            window.addEventListener('resize', this.handleResize);
            
            // Redimensionner le canvas au démarrage
            this.resizeCanvas();
        }
    }

    startLevel(levelId) {
        if (document.getElementById('myCanvas')) {
            // Si on est sur une page de niveau, initialiser le niveau
            this.initializeLevel();
        } else {
            // Si on est sur la page d'accueil, rediriger vers le niveau approprié
            localStorage.setItem('selectedLevel', levelId);
            window.location.href = `level${levelId}.html`;
        }
    }

    startGame(levelId) {
        localStorage.setItem('selectedLevel', levelId);
        window.location.href = `level${levelId}.html`;
    }

    initializeLevel() {
        // Éviter les initialisations simultanées
        if (this.isInitializing) return;
        this.isInitializing = true;

        // Nettoyer toutes les instances précédentes
        if (this.currentLevel) {
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
                this.gameLoopId = null;
            }
            this.currentLevel = null;
        }

        // Redimensionner d'abord le canvas
        this.resizeCanvas();
        
        // Attendre que le redimensionnement soit appliqué
        setTimeout(() => {
            // Vérifier que le canvas a bien les bonnes dimensions
            if (this.canvas.width <= 300 || this.canvas.height <= 150) {
                setTimeout(() => this.initializeLevel(), 100);
                this.isInitializing = false;
                return;
            }
                    
            // Créer le niveau approprié
            const url = window.location.href;
            if (url.includes('level1')) {
                this.currentLevel = new Level1(this.context, this.canvas);
            } else if (url.includes('level2')) {
                this.currentLevel = new Level2(this.context, this.canvas);
            } else if (url.includes('level3')) {
                this.currentLevel = new Level3(this.context, this.canvas);
            } else {
                // Si on ne trouve pas le niveau dans l'URL, utiliser celui du localStorage
                const selectedLevel = parseInt(localStorage.getItem('selectedLevel')) || 1;
                switch(selectedLevel) {
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
                        this.isInitializing = false;
                        return;
                }
            }
            
            if (this.currentLevel) {
                // Init le niveau
                this.currentLevel.initialize();
                
                // Démarrer une nouvelle boucle de jeu
                this.currentLevel.isRunning = true;
                this.gameLoop();
            }
            
            this.isInitializing = false;
        }, 100);
    }

    gameLoop() {
        if (!this.currentLevel || !this.currentLevel.isRunning) {
            this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        const now = performance.now();
        const deltaTime = now - this.lastTime;
        
        // Limiter à 60 FPS
        if (deltaTime >= 1000 / 60) {
            this.lastTime = now;
            
            // Convertir le delta en secondes
            this.currentLevel.update(deltaTime / 1000);
            this.currentLevel.draw();
        }
        
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    handleResize() {
        if (this._resizeTimeout) {
            clearTimeout(this._resizeTimeout);
        }
        
        // Mettre en pause pendant le redimensionnement
        if (this.currentLevel) {
            this.currentLevel.isRunning = false;
        }
        
        // Redimensionner avec un délai
        this._resizeTimeout = setTimeout(() => {
            this.resizeCanvas();
            
            if (this.currentLevel) {
                // Recalcul des positions sans réinitialiser
                this.currentLevel.handleResize();
                
                // Redémarre le jeu
                this.currentLevel.isRunning = true;
            }
        }, 200);
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    clearCanvas() {
        if (this.context && this.canvas) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// Créer et exporter une instance du LevelManager
const levelManager = new LevelManager();

// Nettoyer les écouteurs et initialiser au chargement de la page
window.addEventListener('load', () => {
    // Vérifier que le navigateur a fini de calculer les dimensions
    setTimeout(() => {
        if (document.getElementById('myCanvas')) {
            const selectedLevel = parseInt(localStorage.getItem('selectedLevel')) || 1;
            levelManager.startLevel(selectedLevel);
        }
    }, 100);
});

// Exposer la fonction startGame au niveau global pour les boutons
window.startGame = (levelId) => levelManager.startGame(levelId);

export { LevelManager, levelManager };
