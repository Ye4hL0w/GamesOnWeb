/**
 * progress.js
 * Affichage de la progression des jeux
 */

(function() {
    // Mapping des jeux avec leur structure dans le HTML et leur index dans les données
    const GAMES_MAPPING = [
        { id: 'game1', dataIndex: '3', name: 'The Awakening' },  // The Awakening (jeu visuel 1) → données gameProgress[3]
        { id: 'game2', dataIndex: '1', name: 'Shadow Travelers' }, // Shadow Travelers (jeu visuel 2) → données gameProgress[2]
        { id: 'game3', dataIndex: '2', name: 'Dream Travelers' }   // Dream Travelers (jeu visuel 3) → données gameProgress[1]
    ];
    
    const TOTAL_LEVELS = 3;
    
    // Initialisation principale
    function initializeProgress() {
        // Attendre que les éléments existent dans le DOM
        checkElementsExist(function() {
            loadUserProgressData();
        });
    }
    
    // Vérifier que tous les éléments nécessaires existent
    function checkElementsExist(callback, attempts = 0) {
        // Éléments à vérifier
        const elements = [
            'game1-progress', 'game1-text', 'game1-levels',
            'game2-progress', 'game2-text', 'game2-levels',
            'game3-progress', 'game3-text', 'game3-levels'
        ];
        
        // Vérifier si tous les éléments existent
        const allExist = elements.every(id => document.getElementById(id) !== null);
        
        if (allExist) {
            callback();
            return;
        }
        
        // Si les éléments n'existent pas après 20 tentatives (2 secondes), abandonner
        if (attempts >= 20) {
            console.error("Impossible de trouver tous les éléments");
            return;
        }
        
        // Essayer à nouveau après 100ms
        setTimeout(() => checkElementsExist(callback, attempts + 1), 100);
    }
    
    // Mettre à jour une barre de progression
    function updateProgressBar(gameId, level) {
        const percent = Math.floor((level / TOTAL_LEVELS) * 100);
        
        // Obtenir les éléments
        const progressBar = document.getElementById(`${gameId}-progress`);
        const progressText = document.getElementById(`${gameId}-text`);
        const levelsText = document.getElementById(`${gameId}-levels`);
        
        // Vérifier que tous les éléments existent
        if (!progressBar || !progressText || !levelsText) {
            return;
        }
        
        // Appliquer les styles
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        levelsText.textContent = `${level}/${TOTAL_LEVELS}`;
        
        // Ajouter des classes pour les styles
        progressBar.className = 'progress-fill';
        if (percent >= 100) {
            progressBar.classList.add('complete');
        } else if (percent > 0) {
            progressBar.classList.add('in-progress');
        }
    }
    
    // Charger les données de progression de l'utilisateur
    function loadUserProgressData() {
        // Initialiser les barres avec des valeurs par défaut
        GAMES_MAPPING.forEach(game => {
            updateProgressBar(game.id, 0);
        });
        
        // Récupérer l'utilisateur actuel
    const userEmail = localStorage.getItem('currentUser');
    if (!userEmail) {
        return;
    }

        // Récupérer les données utilisateur
        try {
    const userData = localStorage.getItem(userEmail);
    if (!userData) {
        return;
    }

            // Parser les données
        const user = JSON.parse(userData);
        
        if (!user.gameProgress) {
            return;
        }

            // Mettre à jour chaque jeu selon le mapping
            GAMES_MAPPING.forEach(game => {
                if (user.gameProgress[game.dataIndex]) {
                    updateProgressBar(game.id, user.gameProgress[game.dataIndex].highestLevel);
                }
            });
            
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
        }
    }
    
    // S'assurer que le DOM est chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProgress);
    } else {
        // DOM déjà chargé
        initializeProgress();
    }
})();
