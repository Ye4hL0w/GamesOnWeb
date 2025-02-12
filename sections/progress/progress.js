// Fonction pour mettre à jour la progression d'un jeu
function updateGameProgress(gameNumber, progress, levels, score) {
    const progressBar = document.getElementById(`game${gameNumber}-progress`);
    const progressText = document.getElementById(`game${gameNumber}-text`);
    const levelsElement = document.getElementById(`game${gameNumber}-levels`);
    const scoreElement = document.getElementById(`game${gameNumber}-score`);

    // Mise à jour de la barre de progression
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
    
    // Mise à jour des statistiques
    levelsElement.textContent = `${levels}/3`;
    scoreElement.textContent = score;
}

// Fonction pour charger les données de progression depuis le localStorage
function loadProgress() {
    for (let i = 1; i <= 3; i++) {
        const gameData = JSON.parse(localStorage.getItem(`game${i}Progress`) || '{"progress": 0, "levels": 0, "score": 0}');
        updateGameProgress(i, gameData.progress, gameData.levels, gameData.score);
    }
}

// Exemple de données de test (à remplacer par les vraies données des jeux)
function setTestData() {
    const testData = [
        { progress: 75, levels: 2, score: 1500 },
        { progress: 33, levels: 1, score: 800 },
        { progress: 100, levels: 3, score: 2000 }
    ];

    testData.forEach((data, index) => {
        localStorage.setItem(`game${index + 1}Progress`, JSON.stringify({
            progress: data.progress,
            levels: data.levels,
            score: data.score
        }));
    });
}

// Charger les données au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Décommenter la ligne suivante pour tester avec des données d'exemple
    // setTestData();
    loadProgress();
});
