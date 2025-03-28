class Level2 extends BaseLevel {
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
        
        // Ajouter les événements
        this.scene.onPointerDown = (evt) => this.handleClick(evt);
        window.addEventListener("keydown", (evt) => this.handleKeyboard(evt));
    }

    startLevel(levelId) {
        this.currentLevel = levelId;
        const levelManager = new LevelManager();
        levelManager.startLevel(levelId, this.scene);
    }

    handleClick(evt) {
        if (this.player.isMoving) return;
        
        const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        if (pickResult.hit) {
            if (pickResult.pickedMesh.name === "rotateButton") {
                // Trouver la plateforme correspondante
                for (const platform of this.rotatingPlatforms) {
                    if (platform.mesh === pickResult.pickedMesh.parent) {
                        platform.rotate();
                        return;
                    }
                }
                return;
            }
            
            if (pickResult.pickedMesh.name.startsWith('cube') || pickResult.pickedMesh.name === "rotatingPlatform") {
                const targetPosition = pickResult.pickedMesh.position.clone();
                
                // Si c'est une plateforme rotative, ajuster la position cible en fonction de sa rotation
                if (pickResult.pickedMesh.name === "rotatingPlatform") {
                    const localHitPoint = pickResult.pickedPoint.subtract(pickResult.pickedMesh.position);
                    const rotationMatrix = BABYLON.Matrix.RotationY(-pickResult.pickedMesh.rotation.y);
                    const rotatedPoint = BABYLON.Vector3.TransformCoordinates(localHitPoint, rotationMatrix);
                    targetPosition.x = Math.round(targetPosition.x + rotatedPoint.x);
                    targetPosition.z = Math.round(targetPosition.z + rotatedPoint.z);
                }
                
                const path = this.player.findPath(
                    {x: targetPosition.x, y: targetPosition.y, z: targetPosition.z}
                );
                
                if (path) {
                    this.player.moveAlongPath(path);
                }
            }
        }
    }

    handleKeyboard(evt) {
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

        // Niveau 2 : Géométrie différente
        this.grid.addGridElement(-2, 0, 0);
        this.grid.addGridElement(-1, 0, 0);
        this.grid.addGridElement(0, 0, 0);
        this.grid.addGridElement(1, 0, 0);
        this.grid.addGridElement(2, 0, 0);
        
        this.grid.addGridElement(2, 0, 1);
        this.grid.addGridElement(-2, 0, 1);

        this.grid.addGridElement(2, 0, 2);
        this.grid.addGridElement(-2, 0, 2);

        this.grid.addGridElement(-2, 0, 3);
        this.grid.addGridElement(2, 0, 3);

        this.grid.addGridElement(-2, 0, 4);
        this.grid.addGridElement(2, 0, 4);
        this.grid.addGridElement(-1, 0, 4);
        this.grid.addGridElement(0, 0, 4)
        this.grid.addGridElement(1, 0, 4);

        this.grid.addGridElement(0, 0, -1);
        this.grid.addGridElement(0, 0, -2);
        this.grid.addGridElement(0, 0, -3);
        this.grid.addGridElement(0, 0, -4);

        
        const stairs = new Stairs(this.scene, this.grid);
        stairs.create(-1, 1, 3, 1);

        this.grid.addGridElement(0, 1, 3);
        this.grid.addGridElement(1, 1, 3);

        stairs.create(1, 2, 2, 2);

        this.grid.addGridElement(1, 2, 1);

        stairs.create(0, 3, 1, 3);

        this.grid.addGridElement(-1, 3, 1);

        stairs.create(-1, 4, 2, 4);

        this.grid.addGridElement(-1, 4, 3);

        stairs.create(0, 5, 3, 1);

        this.grid.addGridElement(1, 5, 3);

        stairs.create(1, 6, 2, 2);
        
        this.grid.addGridElement(0, 6, 2);


        // Placer le joueur à la position initiale
        this.player.setPosition(0, 0, -4);
        
        // Créer la sortie du niveau - NextLevelId = 3 (niveau suivant)
        this.exit = new Exit(this.scene, this.grid, {x: 0, y: 6, z: 2}, 3);
    }
}