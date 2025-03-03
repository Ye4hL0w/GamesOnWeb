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
    
    // Redimensionner d'abord le canvas
    resizeCanvas();
    
    // Attendre un court instant pour s'assurer que le redimensionnement est effectué
    setTimeout(() => {
        // Créer le niveau avec le canvas correctement dimensionné
        const canvas = document.getElementById('myCanvas');
        const context = canvas.getContext('2d');
                
        // Créer le niveau approprié
        let level;
        switch(levelId) {
            case 1:
                level = new Level1(context, canvas);
                break;
            // ... autres cas ...
        }
        
        // Stocker le niveau actuel pour le resize
        window.currentLevel = level;
        
        // Initialiser et démarrer le niveau
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

// Fonction pour redimensionner le canvas
function resizeCanvas() {
    const canvas = document.getElementById('myCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        return canvas;
    }
    return null;
}

// Simplifier l'initialisation pour éviter les doubles instances
function initializeLevel() {
    // Éviter les initialisations simultanées
    if (isInitializing) return;
    isInitializing = true;

    // Nettoyer toute instance précédente
    if (currentLevel) {
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        currentLevel = null;
    }

    // Redimensionner d'abord le canvas
    const canvas = resizeCanvas();
    if (!canvas) {
        isInitializing = false;
        return;
    }

    // Attendre que le redimensionnement soit appliqué
    setTimeout(() => {
        const context = canvas.getContext('2d');
        
        // Vérifier que le canvas a bien les bonnes dimensions
        if (canvas.width <= 300 || canvas.height <= 150) {
            setTimeout(initializeLevel, 100);
            isInitializing = false;
            return;
        }
                
        // Créer le niveau approprié
        const url = window.location.href;
        if (url.includes('level1')) {
            currentLevel = new Level1(context, canvas);
        } else if (url.includes('level2')) {
            currentLevel = new Level2(context, canvas);
        } else if (url.includes('level3')) {
            currentLevel = new Level3(context, canvas);
        }
        
        if (currentLevel) {
            // Initialiser le niveau
            currentLevel.initialize();
            
            // Démarrer une NOUVELLE boucle de jeu
            currentLevel.isRunning = true;
            gameLoopId = requestAnimationFrame(gameLoop);
            
            // Configurer l'écouteur de redimensionnement
            window.removeEventListener('resize', handleResize);
            window.addEventListener('resize', handleResize);
        }
        
        isInitializing = false;
    }, 100);
}

// Modification de la fonction gameLoop pour limiter à 60 FPS
function gameLoop() {
    if (!currentLevel || !currentLevel.isRunning) {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }
    
    const now = performance.now();
    const deltaTime = now - currentLevel.lastTime;
    
    // Limiter à 60 FPS (environ 16.67ms par frame)
    if (deltaTime >= 1000 / 60) {
        currentLevel.lastTime = now;
        
        // Convertir le delta en secondes pour des calculs de vitesse cohérents
        currentLevel.update(deltaTime / 1000);
        currentLevel.draw();
    }
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Gestionnaire de redimensionnement simplifié
let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    
    // Mettre en pause le jeu pendant le redimensionnement
    if (currentLevel) {
        currentLevel.isRunning = false;
    }
    
    // Redimensionner avec un délai
    resizeTimeout = setTimeout(() => {
        const canvas = resizeCanvas();
        
        if (currentLevel && canvas) {
            // Mettre à jour la référence au canvas
            currentLevel.canvas = canvas;
            
            // Recalculer les positions sans réinitialiser
            currentLevel.handleResize();
            
            // Redémarrer le jeu
            currentLevel.isRunning = true;
        }
    }, 200);
}

// Nettoyer les écouteurs et initialiser
window.addEventListener('load', () => {
    // S'assurer que le navigateur a fini de calculer les dimensions
    setTimeout(initializeLevel, 100);
});