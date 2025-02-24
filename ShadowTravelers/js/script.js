import { LevelManager } from './levelManager.js';

function startGame(levelId) {
    localStorage.setItem('selectedLevel', levelId);
    window.location.href = `level${levelId}.html`;
}

if (document.getElementById('myCanvas')) {
    const levelManager = new LevelManager();
    const selectedLevel = parseInt(localStorage.getItem('selectedLevel')) || 1;
    levelManager.startLevel(selectedLevel);
}

window.startGame = startGame;

// Partie responsive du canvas
function resizeCanvas() {
    const canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Dessiner un carré noir au milieu du canvas
    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    const size = 50; // Taille du carré
    context.fillRect((canvas.width - size) / 2, (canvas.height - size) / 2, size, size);
}

// Initialisation
window.addEventListener('load', () => {
    resizeCanvas();
});

// Redimensionnement
window.addEventListener('resize', () => {
    resizeCanvas();
});