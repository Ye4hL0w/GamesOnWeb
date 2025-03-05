const level1 = {
    name: "Le Réveil",
    platforms: [
        // Plateforme de départ
        { x: 100, y: window.innerHeight - 100, width: 200, height: 20 },
        
        // Parcours vertical et horizontal
        { x: 350, y: window.innerHeight - 220, width: 120, height: 20 },
        { x: 150, y: window.innerHeight - 340, width: 120, height: 20 },
        { x: 400, y: window.innerHeight - 460, width: 120, height: 20 },
        { x: 200, y: window.innerHeight - 580, width: 120, height: 20 },
        
        // Nouvelles plateformes vers la droite
        { x: 600, y: window.innerHeight - 580, width: 120, height: 20 },
        { x: 800, y: window.innerHeight - 580, width: 120, height: 20 },
        { x: 1000, y: window.innerHeight - 520, width: 120, height: 20 },
        { x: 1200, y: window.innerHeight - 460, width: 120, height: 20 },
        
        // Plateforme finale
        { x: 1400, y: window.innerHeight - 400, width: 200, height: 20 }
    ],
    fragments: [
        // Fragments placés stratégiquement sur le parcours
        { x: 380, y: window.innerHeight - 280 },
        { x: 180, y: window.innerHeight - 400 },
        { x: 430, y: window.innerHeight - 520 },
        { x: 230, y: window.innerHeight - 640 },
        { x: 650, y: window.innerHeight - 640 },
        { x: 850, y: window.innerHeight - 640 },
        { x: 1450, y: window.innerHeight - 460 }
    ],
    playerStart: { x: 150, y: window.innerHeight - 200 },
    nextLevel: "level2",
    message: "Niveau 1 : L'Ascension commence !",
    requiredFragments: 7
}; 