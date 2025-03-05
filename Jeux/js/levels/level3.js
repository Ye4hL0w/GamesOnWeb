const level3 = {
    name: "L'Ascension",
    platforms: [
        { x: 200, y: 500, width: 100, height: 20 },
        { x: 400, y: 450, width: 100, height: 20 },
        { x: 600, y: 400, width: 100, height: 20 },
        { x: 800, y: 350, width: 100, height: 20 },
        { x: 1000, y: 300, width: 100, height: 20 },
        { x: 1200, y: 250, width: 100, height: 20 },
        { x: 1000, y: 200, width: 100, height: 20 },
        { x: 800, y: 150, width: 100, height: 20 }
    ],
    fragments: [
        { x: 250, y: 450 },
        { x: 650, y: 350 },
        { x: 1050, y: 250 },
        { x: 850, y: 100 },
        { x: 1250, y: 200 }
    ],
    playerStart: { x: 100, y: 500 },
    nextLevel: null,
    message: "Niveau 3 : L'ascension finale",
    requiredFragments: 5,
    obstacles: [
        { x: 300, y: 200, width: 50, height: 300, type: "shadow" },
        { x: 700, y: 100, width: 50, height: 400, type: "shadow" },
        { x: 1100, y: 150, width: 50, height: 350, type: "shadow" }
    ],
    movingPlatforms: [
        {
            x: 500, y: 300, width: 100, height: 20,
            movement: { axis: 'y', min: 200, max: 400, speed: 2 }
        }
    ]
}; 