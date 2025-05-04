/**
 * progress.js
 * Affichage de la progression des jeux
 */

(function() {
    // mapping des jeux
    const GAMES_MAPPING = [
        { id: 'game1', dataIndex: '3', name: 'The Awakening' },  // The Awakening → données gameProgress[3]
        { id: 'game2', dataIndex: '1', name: 'Shadow Travelers' }, // Shadow Travelers → données gameProgress[2]
        { id: 'game3', dataIndex: '2', name: 'Dream Travelers' }   // Dream Travelers → données gameProgress[1]
    ];
    
    const TOTAL_LEVELS = 3;
    
    function initializeProgress() {
        checkElementsExist(function() {
            loadUserProgressData();
        });
    }
    
    function checkElementsExist(callback, attempts = 0) {
        const elements = [
            'game1-progress', 'game1-text', 'game1-levels',
            'game2-progress', 'game2-text', 'game2-levels',
            'game3-progress', 'game3-text', 'game3-levels'
        ];
        
        // vérifier si tous les éléments existent
        const allExist = elements.every(id => document.getElementById(id) !== null);
        
        if (allExist) {
            callback();
            return;
        }
        
        if (attempts >= 20) {
            console.error("Impossible de trouver tous les éléments");
            return;
        }
        
        setTimeout(() => checkElementsExist(callback, attempts + 1), 100);
    }
    
    // maj barre de progression
    function updateProgressBar(gameId, level) {
        const percent = Math.floor((level / TOTAL_LEVELS) * 100);
        
        // obtenir les éléments
        const progressBar = document.getElementById(`${gameId}-progress`);
        const progressText = document.getElementById(`${gameId}-text`);
        const levelsText = document.getElementById(`${gameId}-levels`);
        
        // vérifier que tous les éléments existent
        if (!progressBar || !progressText || !levelsText) {
            return;
        }
        
        // appliquer les styles
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        levelsText.textContent = `${level}/${TOTAL_LEVELS}`;
        
        progressBar.className = 'progress-fill';
        if (percent >= 100) {
            progressBar.classList.add('complete');
        } else if (percent > 0) {
            progressBar.classList.add('in-progress');
        }
    }
    
    // données de progression
    function loadUserProgressData() {
        GAMES_MAPPING.forEach(game => {
            updateProgressBar(game.id, 0);
        });
        
        // récupérer l'utilisateur actuel
        const userEmail = localStorage.getItem('currentUser');
        if (!userEmail) {
            return;
        }

        // récupérer les données
        try {
    const userData = localStorage.getItem(userEmail);
    if (!userData) {
        return;
    }

        // parser les données
        const user = JSON.parse(userData);
        
        if (!user.gameProgress) {
            return;
        }

            // mettre à jour chaque jeu
            GAMES_MAPPING.forEach(game => {
                if (user.gameProgress[game.dataIndex]) {
                    updateProgressBar(game.id, user.gameProgress[game.dataIndex].highestLevel);
                }
            });
            
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProgress);
    } else {
        initializeProgress();
    }
})();
