import { LevelManager } from './levelManager.js';
import { Level1 } from './levels/level1.js';
import { Level2 } from './levels/level2.js';
import { Level3 } from './levels/level3.js';

let currentLevel = null;
let gameLoopId = null;
let isInitializing = false;

function startGame(levelId) {
    localStorage.setItem('selectedLevel', levelId);
    window.location.href = `level${levelId}.html`;
    
    // redimensionner le canvas
    resizeCanvas();
    
    // attendre un instant pour s'assurer que le redimensionnement est effectué
    setTimeout(() => {
        // créer le niveau avec le canvas
        const canvas = document.getElementById('myCanvas');
        const context = canvas.getContext('2d');
                
        // créer le niveau approprié
        let level;
        switch(levelId) {
            case 1:
                level = new Level1(context, canvas);
                break;
            case 2:
                level = new Level2(context, canvas);
                break;
            case 3:
                level = new Level3(context, canvas);
                break;
        }
        
        // stocker le niveau actuel
        window.currentLevel = level;
        
        // init et démarrer le niveau
        level.initialize();
        level.gameLoop();
    }, 100);
}

if (document.getElementById('myCanvas')) {
    const levelManager = new LevelManager();
    const selectedLevel = parseInt(localStorage.getItem('selectedLevel')) || 1;
    levelManager.startLevel(selectedLevel);
}

window.startGame = startGame;

// fonction pour redimensionner le canvas
function resizeCanvas() {
    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        return canvas;
    }
    return null;
}

// simplifier l'initialisation, éviter les doubles instances
function initializeLevel() {
    // éviter les initialisations simultanées
    if (isInitializing) return;
    isInitializing = true;

    // nettoyer toutes les instances précédentes
    if (currentLevel) {
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        currentLevel = null;
    }

    // redimensionner d'abord le canvas
    const canvas = resizeCanvas();
    if (!canvas) {
        isInitializing = false;
        return;
    }

    // attendre que le redimensionnement soit appliqué
    setTimeout(() => {
        const context = canvas.getContext('2d');
        
        // vérifier que le canvas a bien les bonnes dimensions
        if (canvas.width <= 300 || canvas.height <= 150) {
            setTimeout(initializeLevel, 100);
            isInitializing = false;
            return;
        }
                
        // créer le niveau approprié
        const url = window.location.href;
        if (url.includes('level1')) {
            currentLevel = new Level1(context, canvas);
        } else if (url.includes('level2')) {
            currentLevel = new Level2(context, canvas);
        } else if (url.includes('level3')) {
            currentLevel = new Level3(context, canvas);
        }
        
        if (currentLevel) {
            // init le niveau
            currentLevel.initialize();
            
            // démarrer une nouvelle boucle de jeu
            currentLevel.isRunning = true;
            gameLoopId = requestAnimationFrame(gameLoop);
            
            // config l'écouteur de redimensionnement
            window.removeEventListener('resize', handleResize);
            window.addEventListener('resize', handleResize);
        }
        
        isInitializing = false;
    }, 100);
}

// modif de la fonction gameLoop pour limiter à 60 FPS
function gameLoop() {
    if (!currentLevel || !currentLevel.isRunning) {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }
    
    const now = performance.now();
    const deltaTime = now - currentLevel.lastTime;
    
    // limiter à 60 FPS
    if (deltaTime >= 1000 / 60) {
        currentLevel.lastTime = now;
        
        // convertir le delta en secondes
        currentLevel.update(deltaTime / 1000);
        currentLevel.draw();
    }
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    
    // mettre en pause pendant le redimensionnement
    if (currentLevel) {
        currentLevel.isRunning = false;
    }
    
    // redimensionner avec un délai
    resizeTimeout = setTimeout(() => {
        const canvas = resizeCanvas();
        
        if (currentLevel && canvas) {
            // mettre à jour la ref au canvas
            currentLevel.canvas = canvas;
            
            // recalcul des positions sans réinitialiser
            currentLevel.handleResize();
            
            // redémarre le jeu
            currentLevel.isRunning = true;
        }
    }, 200);
}

// nettoyer les écouteurs et initialiser
window.addEventListener('load', () => {
    // verifier que le navigateur a fini de calculer les dimensions
    setTimeout(initializeLevel, 100);
});