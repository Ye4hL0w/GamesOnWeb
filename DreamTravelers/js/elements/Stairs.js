class Stairs {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
    }

    create(x, y, z, rotation = 0) {
        const key = `${x},${y},${z}`;
        
        // Création du bloc principal
        const stairParent = this.grid.addGridElement(x, y, z, 'stair');
        
        // Suppression de la base plate et création de marches solides
        const nombreMarches = 3;
        
        // Créer le bloc d'escalier complet
        for (let i = 0; i < nombreMarches; i++) {
            // Calculer la hauteur et profondeur de chaque bloc
            const hauteurMarche = 1.0 / nombreMarches;
            const profondeurMarche = 1.0 / nombreMarches;
            
            // Créer un bloc pour chaque marche
            const marche = BABYLON.MeshBuilder.CreateBox(
                `marche_${i}_${key}`,
                { 
                    width: 1, 
                    height: (i + 1) * hauteurMarche,  // Hauteur progressive
                    depth: profondeurMarche 
                },
                this.scene
            );
            
            // CORRECTION: Position des marches abaissée de 0.5 unités pour être au même niveau que les blocs
            marche.position = new BABYLON.Vector3(
                0, 
                ((i + 1) * hauteurMarche) / 2 - 0.5,  // -0.5 pour descendre au niveau des autres blocs
                (profondeurMarche / 2) - 0.5 + (i * profondeurMarche)  // Position en Z progressive
            );
            
            marche.parent = stairParent;
            
            // Appliquer le matériau
            const marcheMaterial = new BABYLON.StandardMaterial(`marcheMat_${i}_${key}`, this.scene);
            marcheMaterial.diffuseColor = new BABYLON.Color3(0.85, 0.65, 0.45);
            marcheMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            marcheMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.08, 0.06);
            marche.material = marcheMaterial;
        }
        
        // S'assurer que la grille est correctement initialisée
        if (!this.grid.grid[key]) {
            this.grid.grid[key] = {};
        }
        
        // Stocker les informations pour le pathfinding
        this.grid.grid[key].rotation = rotation;
        this.grid.grid[key].nextPosition = this.getNextPosition(x, y, z, rotation);
        this.grid.grid[key].type = 'stair';
        
        // Application de la rotation au parent
        stairParent.rotation.y = rotation * Math.PI / 2;
        
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