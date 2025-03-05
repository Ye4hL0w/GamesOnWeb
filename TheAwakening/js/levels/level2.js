const level2 = {
    name: "Les Murs Éthérés",
    platforms: [
        // Zone de départ
        { x: 100, y: window.innerHeight - 100, width: 200, height: 20 },
        
        // Première section
        { x: 400, y: window.innerHeight - 200, width: 100, height: 20 },
        { x: 600, y: window.innerHeight - 300, width: 100, height: 20 },
        
        // Section avec murs blancs
        { x: 300, y: window.innerHeight - 400, width: 100, height: 20 },
        { x: 800, y: window.innerHeight - 400, width: 100, height: 20 },
        
        // Plateformes en hauteur
        { x: 500, y: window.innerHeight - 500, width: 100, height: 20 },
        { x: 900, y: window.innerHeight - 500, width: 100, height: 20 },
        
        // Section finale
        { x: 1100, y: window.innerHeight - 450, width: 200, height: 20 }
    ],
    fragments: [
        // Fragments du début
        { x: 450, y: window.innerHeight - 260 },
        { x: 650, y: window.innerHeight - 360 },
        
        // Fragments derrière les murs blancs
        { x: 350, y: window.innerHeight - 460 },
        { x: 850, y: window.innerHeight - 460 },
        
        // Fragments en hauteur
        { x: 550, y: window.innerHeight - 560 },
        { x: 950, y: window.innerHeight - 560 },
        { x: 1200, y: window.innerHeight - 510 }
    ],
    playerStart: { x: 150, y: window.innerHeight - 200 },
    nextLevel: "level3",
    message: "Niveau 2 : Les murs noirs sont infranchissables, mais vous pouvez traverser les murs blancs en utilisant le dash (double-tap flèches) !",
    requiredFragments: 7,
    obstacles: [
        // Murs blancs verticaux (traversables)
        { x: 450, y: window.innerHeight - 600, width: 30, height: 300, type: "white" },
        { x: 750, y: window.innerHeight - 800, width: 30, height: 300, type: "white" },
        
        // Mur noir (intraversable) placé sous le deuxième mur blanc
        { x: 750, y: window.innerHeight - 500, width: 30, height: 400, type: "shadow" }
    ]
}; 