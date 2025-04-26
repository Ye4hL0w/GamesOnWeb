const level2 = {
    name: "Les Murs Éthérés",
    platforms: [
        // Zone de départ et principale
        { x: 100, y: window.innerHeight - 100, width: 1500, height: 20 },
        
        // Plateformes en hauteur pour tester le dash
        { x: 800, y: window.innerHeight - 250, width: 200, height: 20 },
        { x: 400, y: window.innerHeight - 350, width: 200, height: 20 },
        { x: 1000, y: window.innerHeight - 450, width: 200, height: 20 }
    ],
    fragments: [
        // Fragments derrière les murs blancs
        { x: 400, y: window.innerHeight - 160 },
        { x: 600, y: window.innerHeight - 160 },
        { x: 900, y: window.innerHeight - 310 },
        { x: 500, y: window.innerHeight - 410 },
        { x: 1100, y: window.innerHeight - 510 },
        { x: 1300, y: window.innerHeight - 160 }
    ],
    playerStart: { x: 150, y: window.innerHeight - 200 },
    nextLevel: "level3",
    message: "Niveau 2 : Les murs blancs peuvent être traversés avec le dash (double-tap flèches) !",
    requiredFragments: 6,
    obstacles: [
        // Murs blancs verticaux (traversables)
        { x: 250, y: window.innerHeight - 300, width: 30, height: 200, type: "white" },
        { x: 550, y: window.innerHeight - 300, width: 30, height: 200, type: "white" },
        { x: 850, y: window.innerHeight - 400, width: 30, height: 300, type: "white" },
        { x: 1050, y: window.innerHeight - 650, width: 30, height: 200, type: "white" }
    ]
}; 