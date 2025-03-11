class Level1 extends BaseLevel {
    constructor() {
        super();
        this.grid = new Grid(this.scene);
        this.player = null;
        this.rotatingPlatforms = [];
        this.isRotating = false;
        this.playerPosition = { x: 0, y: 0, z: 0 };
        this.pathLine = null;
        
        // Initialiser le niveau
        this.createGridLines(this.grid.gridSize);
        this.clouds = new Clouds(this.scene);
        this.player = new Player(this.scene, this.grid);
        
        // Créer le niveau spécifique
        this.createLevel();
        
        // Nous n'avons plus besoin de définir onPointerDown ici car il est défini dans BaseLevel
        window.addEventListener("keydown", (evt) => this.handleKeyboard(evt));
    }

    startLevel(levelId) {
        this.currentLevel = levelId;
        const levelManager = new LevelManager();
        levelManager.startLevel(levelId, this.scene);
    }

    handleKeyboard(evt) {
        // À implémenter si nécessaire
    }


    async loadIslandModel() {
        // À implémenter si nécessaire
    }

    createLevel() {
        // Base principale
        const base = BABYLON.MeshBuilder.CreateBox(
            "base",
            { width: this.grid.gridSize, height: 1, depth: this.grid.gridSize },
            this.scene
        );
        base.position.y = -0.5;
        const baseMaterial = new BABYLON.StandardMaterial("baseMat", this.scene);
        baseMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        baseMaterial.alpha = 0.5; // Semi-transparent pour voir la grille en dessous
        base.material = baseMaterial;

        // Ajout de cubes à différentes positions sur le même axe y
        this.grid.addGridElement(2, 0, 0);
        this.grid.addGridElement(1, 0, 0);
        this.grid.addGridElement(0, 0, 0);
        this.grid.addGridElement(-1, 0, 0);
        this.grid.addGridElement(-2, 0, 0);
        this.grid.addGridElement(0, 1, 3);
        this.grid.addGridElement(1, 1, 3);
        this.grid.addGridElement(-1, 1, 3);
        this.grid.addGridElement(-2, 1, 3);
        this.grid.addGridElement(2, 0, 3);
        this.grid.addGridElement(2, 1, 3);
        this.grid.addGridElement(2, 2, 3);
        this.grid.addGridElement(0, 0, -4);
        this.grid.addGridElement(-4, 0, -4);
        this.grid.addGridElement(0, 1, 2);
        this.grid.addGridElement(-2, 0, -2);
        
        // Création d'un escalier pour monter de (0,0,0) à (0,1,2)
        const stairs = new Stairs(this.scene, this.grid);
        stairs.create(0, 1, 1, 0);
        stairs.create(1, 2, 3, 1);

        // Création d'une plateforme rotative
        const platform1 = new RotatingPlatform(this.scene, new BABYLON.Vector3(0, 0, -2), 3);
        this.rotatingPlatforms.push(platform1);
        
        // Autre plateforme rotative
        const platform2 = new RotatingPlatform(this.scene, new BABYLON.Vector3(-2, 0, -4), 2);
        this.rotatingPlatforms.push(platform2);

        // Placer le joueur à la position initiale
        this.player.setPosition(0, 0, 0);

        this.exit = new Exit(this.scene, this.grid, {x: -4, y: 0, z: -4}, 2);
    }
}