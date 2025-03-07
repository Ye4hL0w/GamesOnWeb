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
    
    addStairBlock(x, y, z, rotation = 0) {
        const key = `${x},${y},${z}`;
        
        // Création du bloc principal
        const stairParent = this.grid.addGridElement(x, y, z, 'stair');
        
        // Création du bloc de base
        const stairBase = BABYLON.MeshBuilder.CreateBox(
            `stairBase_${key}`,
            { width: 1, height: 0.5, depth: 1 },
            this.scene
        );
        stairBase.position = new BABYLON.Vector3(0, 0.25, 0);
        stairBase.parent = stairParent;
        
        // Création de la rampe avec une meilleure géométrie
        const ramp = BABYLON.MeshBuilder.CreateBox(
            `ramp_${key}`,
            { width: 1, height: 0.1, depth: 1.2 },
            this.scene
        );
        
        // Ajustement de la position et rotation de la rampe
        ramp.position = new BABYLON.Vector3(0, 0.3, 0.1);
        ramp.rotation.x = Math.PI / 6; // 30 degrés pour une pente plus douce
        ramp.parent = stairParent;
        
        // Application de la rotation au parent
        stairParent.rotation.y = rotation * Math.PI / 2;
        
        // Application du matériau avec un style plus Monument Valley
        const material = new BABYLON.StandardMaterial(`stairMat_${key}`, this.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.4); // Couleur plus chaude
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Moins brillant
        material.emissiveColor = new BABYLON.Color3(0.1, 0.08, 0.06); // Légère lueur
        stairBase.material = material;
        ramp.material = material;
        
        // Stocker plus d'informations pour le pathfinding
        this.grid.grid[key].rotation = rotation;
        this.grid.grid[key].nextPosition = this.getNextStairPosition(x, y, z, rotation);
        
        return stairParent;
    }
    
    getNextStairPosition(x, y, z, rotation) {
        // Calculer la position du bloc suivant en fonction de la rotation
        switch (rotation) {
            case 0: // Nord
                return { x: x, y: y + 1, z: z - 1 };
            case 1: // Est
                return { x: x + 1, y: y + 1, z: z };
            case 2: // Sud
                return { x: x, y: y + 1, z: z + 1 };
            case 3: // Ouest
                return { x: x - 1, y: y + 1, z: z };
            default:
                return { x: x, y: y + 1, z: z - 1 };
        }
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
        
        // Chemin en arc-de-cercle
        this.grid.addGridElement(2, 0, 1);
        this.grid.addGridElement(2, 0, 2);
        this.grid.addGridElement(1, 0, 3);
        this.grid.addGridElement(0, 0, 3);
        this.grid.addGridElement(-1, 0, 3);
        this.grid.addGridElement(-2, 0, 2);
        this.grid.addGridElement(-2, 0, 1);
        
        // Plateforme centrale
        this.grid.addGridElement(0, 0, 2);
        
        // Escaliers en spirale
        this.addStairBlock(0, 0, 1, 2);
        this.grid.addGridElement(0, 1, 2);
        this.addStairBlock(1, 1, 2, 3);
        this.grid.addGridElement(0, 2, 2);
        this.addStairBlock(0, 2, 1, 0);
        this.grid.addGridElement(0, 3, 0);

        // Création de plateformes rotatives
        const platform1 = new RotatingPlatform(this.scene, new BABYLON.Vector3(-1, 0, 2), 2);
        this.rotatingPlatforms.push(platform1);
        
        const platform2 = new RotatingPlatform(this.scene, new BABYLON.Vector3(1, 0, 1), 2);
        this.rotatingPlatforms.push(platform2);

        // Placer le joueur à la position initiale
        this.player.setPosition(0, 0, 0);
    }
}