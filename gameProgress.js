/**
 * Gestionnaire de progression des jeux
 * Gère la sauvegarde et le chargement de la progression à travers tous les jeux
 */

// Identifiants des jeux
const GAME_IDS = {
    SHADOW_TRAVELERS: 1,
    DREAM_TRAVELERS: 2,
    THE_AWAKENING: 3
};

// convertir au nouveau format
function cleanupStorageData() {
    localStorage.removeItem('game1Progress');
    localStorage.removeItem('game2Progress');
    localStorage.removeItem('game3Progress');
    
    const currentUserEmail = localStorage.getItem('currentUser');
    if (currentUserEmail) {
        const userData = JSON.parse(localStorage.getItem(currentUserEmail) || '{}');
        
        if (userData && userData.gameProgress) {
            const newGameProgress = {};
            
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
            
            // mettre à jour les données
            userData.gameProgress = newGameProgress;
            localStorage.setItem(currentUserEmail, JSON.stringify(userData));
            
            console.log("Données de progression nettoyées et uniformisées");
        }
    }
}

    // utilisateur actuellement connecté
function getCurrentUser() {
    const currentUserEmail = localStorage.getItem('currentUser');
    if (!currentUserEmail) {
        console.warn('Aucun utilisateur connecté');
        return null;
    }
    
    const userData = localStorage.getItem(currentUserEmail);
    if (!userData) {
        console.warn('Données utilisateur non trouvées');
        return null;
    }
    
    return JSON.parse(userData);
}

// sauvegarder la progression
function saveGameProgress(gameId, levelCompleted) {
    const user = getCurrentUser();
    if (!user) {
        console.error('Aucun utilisateur connecté, la progression ne sera pas sauvegardée');
        return false;
    }
    
    if (!user.gameProgress) {
        user.gameProgress = {};
    }
    
    if (!user.gameProgress[gameId]) {
        user.gameProgress[gameId] = {
            highestLevel: 0,
            progress: 0
        };
    }
    
    const gameProgress = user.gameProgress[gameId];
    
    if (levelCompleted > gameProgress.highestLevel) {
        gameProgress.highestLevel = levelCompleted;
        console.log(`Niveau atteint mis à jour pour jeu ${gameId}: niveau ${levelCompleted}`);
    } else {
        console.log(`Niveau ${levelCompleted} déjà atteint pour jeu ${gameId} (niveau max: ${gameProgress.highestLevel})`);
    }
    
    // pourcentage de progression
    gameProgress.progress = Math.min(100, Math.round((gameProgress.highestLevel / 3) * 100));
    
    // sauvegarder les données
    localStorage.setItem(user.email, JSON.stringify(user));
    console.log(`Progression sauvegardée pour jeu ${gameId}: Niveau ${levelCompleted} terminé, progression totale ${gameProgress.progress}%`);
    
    return true;
}

// charger la progression
function loadGameProgress() {
    const user = getCurrentUser();
    if (!user || !user.gameProgress) {
        console.warn('Aucune donnée de progression trouvée');
        return {
            [GAME_IDS.SHADOW_TRAVELERS]: { progress: 0, levels: 0 },
            [GAME_IDS.DREAM_TRAVELERS]: { progress: 0, levels: 0 },
            [GAME_IDS.THE_AWAKENING]: { progress: 0, levels: 0 }
        };
    }
    
    // convertir les données stockées au format attendu
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

cleanupStorageData();

window.GameProgress = {
    GAME_IDS,
    saveGameProgress,
    loadGameProgress
};