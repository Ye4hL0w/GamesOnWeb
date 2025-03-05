class UI {
    constructor() {
        this.menuContainer = document.getElementById('menu-container');
        this.gameContainer = document.getElementById('game-container');
        this.messageBox = document.getElementById('message-box');
        this.fragmentsCounter = document.getElementById('fragments-collected');
        this.livesCounter = document.getElementById('lives-counter');
        this.totalFragmentsDisplay = document.getElementById('total-fragments');
    }

    showMessage(text, duration = 1500) {
        this.messageBox.textContent = text;
        this.messageBox.style.opacity = '1';
        
        setTimeout(() => {
            this.messageBox.style.opacity = '0';
        }, duration);
    }

    updateLives(lives) {
        this.livesCounter.textContent = '❤️'.repeat(lives);
    }

    updateFragments(collected, total) {
        this.fragmentsCounter.textContent = collected.toString();
        if (total !== undefined) {
            this.totalFragmentsDisplay.textContent = total.toString();
        }
    }

    showGame() {
        this.menuContainer.style.display = 'none';
        this.gameContainer.style.display = 'block';
    }

    showMenu() {
        this.menuContainer.style.display = 'flex';
        this.menuContainer.style.position = 'fixed';
        this.menuContainer.style.top = '0';
        this.menuContainer.style.left = '0';
        this.menuContainer.style.width = '100vw';
        this.menuContainer.style.height = '100vh';
        this.gameContainer.style.display = 'none';
    }

    showLives(show) {
        this.livesCounter.style.display = show ? 'block' : 'none';
    }
} 