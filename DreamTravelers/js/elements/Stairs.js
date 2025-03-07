class Stairs {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
    }

    create(x, y, z, rotation = 0) {
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
        this.grid.grid[key].nextPosition = this.getNextPosition(x, y, z, rotation);
        
        return stairParent;
    }
    
    getNextPosition(x, y, z, rotation) {
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
} 