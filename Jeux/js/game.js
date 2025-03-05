class Game {
    constructor() {
        this.spirit = document.getElementById('spirit');
        this.ui = new UI();
        this.controls = new Controls();
        this.physics = new Physics();
        this.levelManager = new LevelManager(this.ui.gameContainer);
        
        this.lives = 3;
        this.fragments = [];
        this.collectedFragments = 0;
        this.currentLevel = null;
        this.isGameLoopRunning = false;

        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('tutorial-btn').addEventListener('click', () => {
            this.ui.showGame();
            this.startTutorial();
        });

        document.getElementById('level1-btn').addEventListener('click', () => {
            this.ui.showGame();
            this.startDirectLevel1();
        });

        document.getElementById('level2-btn').addEventListener('click', () => {
            this.ui.showGame();
            this.startDirectLevel2();
        });
    }

    resetGameState() {
        this.levelManager.clearLevel();
        this.collectedFragments = 0;
        this.fragments = [];
        this.lives = 3;
        this.ui.updateLives(this.lives);
        this.isGameLoopRunning = false;
        
        // Réinitialisation de la physique et des contrôles
        this.physics = new Physics();
        this.controls = new Controls();
        
        // Réinitialisation du spirit
        this.spirit.style.left = '50%';
        this.spirit.style.top = '50%';
    }

    startTutorial() {
        this.resetGameState();
        this.controls.isEvolved = false;
        this.spirit.classList.remove('evolved');
        
        this.ui.showLives(false);
        this.ui.gameContainer.addEventListener('mousemove', this.moveSpirit.bind(this));
        
        for (let i = 0; i < tutorial.fragments; i++) {
            tutorial.createFragment(this.ui.gameContainer, this.fragments);
        }
        
        this.ui.updateFragments(0, tutorial.fragments);
        this.ui.showMessage("Qui suis-je ? Je dois retrouver mes souvenirs...", 2000);
    }

    startDirectLevel1() {
        this.resetGameState();
        this.controls.isEvolved = true;
        this.spirit.classList.add('evolved');
        this.controls.canDash = false;
        this.ui.showLives(true);
        
        this.loadLevel(level1);
        this.initializeControls();
    }

    startDirectLevel2() {
        this.resetGameState();
        this.controls.isEvolved = true;
        this.spirit.classList.add('evolved');
        this.controls.canDash = true;
        this.ui.showLives(true);
        
        this.loadLevel(level2);
        this.initializeControls();
    }

    initializeControls() {
        this.controls.init(this.spirit, this.physics.jumpForce, (force) => {
            this.physics.velocityY = force;
        });
        this.isGameLoopRunning = true;
        this.gameLoop();
    }

    moveSpirit(e) {
        if (this.controls.isEvolved) return;
        
        const rect = this.ui.gameContainer.getBoundingClientRect();
        const x = e.clientX - rect.left - 25;
        const y = e.clientY - rect.top - 25;
        
        this.spirit.style.left = `${x}px`;
        this.spirit.style.top = `${y}px`;
        
        this.checkTutorialCollisions();
    }

    checkTutorialCollisions() {
        const spiritRect = this.spirit.getBoundingClientRect();
        
        this.fragments.forEach((fragment, index) => {
            if (fragment.style.display !== 'none') {
                const fragmentRect = fragment.getBoundingClientRect();
                if (this.isColliding(spiritRect, fragmentRect)) {
                    this.collectTutorialFragment(fragment, index);
                }
            }
        });
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    collectTutorialFragment(fragment, index) {
        if (fragment.style.display === 'none') return;
        
        fragment.style.display = 'none';
        this.collectedFragments++;
        this.ui.updateFragments(this.collectedFragments);
        
        this.ui.showMessage(tutorial.messages[index], 1500);
        
        if (this.collectedFragments === tutorial.fragments) {
            setTimeout(() => {
                this.ui.showMessage(tutorial.endMessage, 3000);
                setTimeout(() => {
                    this.ui.showLives(true);
                    this.controls.isEvolved = true;
                    this.spirit.classList.add('evolved');
                    this.startLevel1();
                }, 3000);
            }, 1500);
        }
    }

    startLevel1() {
        this.loadLevel(level1);
        this.controls.init(this.spirit, this.physics.jumpForce, (force) => {
            this.physics.velocityY = force;
        });
        this.isGameLoopRunning = true;
        this.gameLoop();
    }

    loadLevel(levelData) {
        this.collectedFragments = 0;
        this.ui.updateFragments(0, levelData.requiredFragments);
        
        const startPos = this.levelManager.loadLevel(levelData);
        this.physics.setPosition(startPos.x, startPos.y);
        
        this.spirit.style.left = `${this.physics.playerX}px`;
        this.spirit.style.top = `${this.physics.playerY}px`;
        
        this.controls.isJumping = false;
        this.controls.canJump = true;
        
        this.ui.showMessage(levelData.message, 2000);
        this.currentLevel = levelData;
    }

    playerDeath() {
        this.lives--;
        this.ui.updateLives(this.lives);
        
        if (this.lives <= 0) {
            this.ui.showMessage("Game Over!", 2000);
            setTimeout(() => {
                this.levelManager.clearLevel();
                this.ui.showMenu();
                this.lives = 3;
                this.ui.updateLives(this.lives);
                this.collectedFragments = 0;
                this.ui.updateFragments(0);
                this.currentLevel = null;
                this.controls.isEvolved = false;
                this.controls.canDash = false;
                this.spirit.classList.remove('evolved');
                
                this.spirit.style.left = '50%';
                this.spirit.style.top = '50%';
                
                this.ui.gameContainer.removeEventListener('mousemove', this.moveSpirit.bind(this));
            }, 2000);
        } else {
            this.physics.setPosition(
                this.currentLevel.playerStart.x,
                this.currentLevel.playerStart.y - 100
            );
            this.ui.showMessage("Vous avez perdu une vie!", 1500);
        }
    }

    transitionToNextLevel() {
        this.isGameLoopRunning = false;
        setTimeout(() => {
            if (this.currentLevel === level1) {
                this.controls.canDash = true;
                this.ui.showMessage("Nouveau pouvoir débloqué : Dash ! Appuyez rapidement deux fois sur ←/→ pour traverser les murs blancs !", 2000);
                setTimeout(() => this.startDirectLevel2(), 2000);
            } else {
                this.ui.showMessage("Félicitations ! Vous avez terminé le jeu !", 3000);
                setTimeout(() => {
                    this.resetGameState();
                    this.ui.showMenu();
                }, 3000);
            }
        }, 1500);
    }

    gameLoop() {
        if (!this.controls.isEvolved || !this.isGameLoopRunning) return;
        
        const collision = this.physics.update(
            this.controls,
            this.spirit,
            this.levelManager,
            () => this.playerDeath()
        );
        
        if (collision && collision.type === 'fragment') {
            this.collectedFragments++;
            this.ui.updateFragments(this.collectedFragments);
            
            if (this.currentLevel && this.collectedFragments === this.currentLevel.requiredFragments) {
                this.ui.showMessage("Niveau terminé !", 1000);
                this.transitionToNextLevel();
            }
        }
        
        if (this.isGameLoopRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Start the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});