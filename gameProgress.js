/**
 * Game Progress Manager
 * Handles saving and loading game progress across all games
 */

// Game identifiers
const GAME_IDS = {
    SHADOW_TRAVELERS: 1,
    DREAM_TRAVELERS: 2,
    THE_AWAKENING: 3
};

// Clean up old progress data and convert to new format
function cleanupStorageData() {
    // Supprimer les anciennes entrées séparées
    localStorage.removeItem('game1Progress');
    localStorage.removeItem('game2Progress');
    localStorage.removeItem('game3Progress');
    
    // Nettoyer et uniformiser les données utilisateur
    const currentUserEmail = localStorage.getItem('currentUser');
    if (currentUserEmail) {
        const userData = JSON.parse(localStorage.getItem(currentUserEmail) || '{}');
        
        if (userData && userData.gameProgress) {
            const newGameProgress = {};
            
            // Convertir les données au format unifié
            // Format: { gameId: { highestLevel: X, progress: Y } }
            
            // Jeu 1: Shadow Travelers
            const shadowData = userData.gameProgress[1] || userData.gameProgress.shadowTravelers || {};
            newGameProgress[1] = {
                highestLevel: shadowData.highestLevel || shadowData.totalCompleted || 0,
                progress: shadowData.progress || (shadowData.totalCompleted ? Math.round((shadowData.totalCompleted / 3) * 100) : 0)
            };
            
            // Jeu 2: Dream Travelers
            const dreamData = userData.gameProgress[2] || userData.gameProgress.dreamTravelers || {};
            newGameProgress[2] = {
                highestLevel: dreamData.highestLevel || dreamData.totalCompleted || 0,
                progress: dreamData.progress || (dreamData.totalCompleted ? Math.round((dreamData.totalCompleted / 3) * 100) : 0)
            };
            
            // Jeu 3: The Awakening
            const awakeningData = userData.gameProgress[3] || userData.gameProgress.theAwakening || {};
            newGameProgress[3] = {
                highestLevel: awakeningData.highestLevel || awakeningData.totalCompleted || 0,
                progress: awakeningData.progress || (awakeningData.totalCompleted ? Math.round((awakeningData.totalCompleted / 3) * 100) : 0)
            };
            
            // Mettre à jour les données utilisateur
            userData.gameProgress = newGameProgress;
            localStorage.setItem(currentUserEmail, JSON.stringify(userData));
            
            console.log("Données de progression nettoyées et uniformisées");
        }
    }
}

// Get the current logged in user
function getCurrentUser() {
    const currentUserEmail = localStorage.getItem('currentUser');
    if (!currentUserEmail) {
        console.warn('No user logged in');
        return null;
    }
    
    const userData = localStorage.getItem(currentUserEmail);
    if (!userData) {
        console.warn('User data not found');
        return null;
    }
    
    return JSON.parse(userData);
}

// Save progress for a specific game
function saveGameProgress(gameId, levelCompleted) {
    const user = getCurrentUser();
    if (!user) {
        console.error('No user logged in, progress will not be saved');
        return false;
    }
    
    // Initialize progress data if not exists
    if (!user.gameProgress) {
        user.gameProgress = {};
    }
    
    // Initialize specific game progress if not exists
    if (!user.gameProgress[gameId]) {
        user.gameProgress[gameId] = {
            highestLevel: 0,
            progress: 0
        };
    }
    
    const gameProgress = user.gameProgress[gameId];
    
    // Update highest level if new level is higher
    if (levelCompleted > gameProgress.highestLevel) {
        gameProgress.highestLevel = levelCompleted;
        console.log(`Niveau atteint mis à jour pour jeu ${gameId}: niveau ${levelCompleted}`);
    } else {
        console.log(`Niveau ${levelCompleted} déjà atteint pour jeu ${gameId} (niveau max: ${gameProgress.highestLevel})`);
    }
    
    // Calculate progress percentage (assuming 3 levels per game)
    gameProgress.progress = Math.min(100, Math.round((gameProgress.highestLevel / 3) * 100));
    
    // Save updated user data
    localStorage.setItem(user.email, JSON.stringify(user));
    console.log(`Progression sauvegardée pour jeu ${gameId}: Niveau ${levelCompleted} terminé, progression totale ${gameProgress.progress}%`);
    
    return true;
}

// Load progress for all games
function loadGameProgress() {
    const user = getCurrentUser();
    if (!user || !user.gameProgress) {
        console.warn('No progress data found');
        return {
            [GAME_IDS.SHADOW_TRAVELERS]: { progress: 0, levels: 0 },
            [GAME_IDS.DREAM_TRAVELERS]: { progress: 0, levels: 0 },
            [GAME_IDS.THE_AWAKENING]: { progress: 0, levels: 0 }
        };
    }
    
    // Convert the stored data to the format expected by the progress display
    const result = {};
    
    for (const gameId in GAME_IDS) {
        const id = GAME_IDS[gameId];
        const gameData = user.gameProgress[id] || { highestLevel: 0, progress: 0 };
        
        result[id] = {
            progress: gameData.progress,
            levels: gameData.highestLevel
        };
    }
    
    console.log("Données de progression chargées:", result);
    return result;
}

// Exécuter le nettoyage au chargement du script
cleanupStorageData();

// Export functions for use in other files
window.GameProgress = {
    GAME_IDS,
    saveGameProgress,
    loadGameProgress
};