class Grid {
    constructor(scene) {
        this.scene = scene;
        this.grid = {}; // Structure de données pour stocker les éléments de la grille
        this.gridSize = 10; // Taille de la grille
    }

    // Méthode pour ajouter un élément à la grille
    addGridElement(x, y, z, type = 'cube', parent = null) {
        const key = `${x},${y},${z}`;
        
        // Vérifier si un élément existe déjà à cette position
        if (this.grid[key]) {
            console.warn(`Un élément existe déjà à la position (${x}, ${y}, ${z})`);
            return this.grid[key].mesh;
        }
        
        let mesh;
        const position = new BABYLON.Vector3(x, y, z);
        
        if (type === 'cube') {
            // Créer un cube
            mesh = BABYLON.MeshBuilder.CreateBox(
                `cube_${key}`,
                { size: 1 },
                this.scene
            );
            
            // Matériau du cube avec les couleurs originales
            const material = new BABYLON.StandardMaterial(`mat_${key}`, this.scene);
            // Choisir aléatoirement entre vert clair et vert foncé
            const isLightGreen = Math.random() < 0.5;
            if (isLightGreen) {
                material.diffuseColor = new BABYLON.Color3(0.5, 0.8, 0.5); // Vert clair
            } else {
                material.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2); // Vert foncé
            }
            mesh.material = material;
        } else if (type === 'sphere') {
            mesh = BABYLON.MeshBuilder.CreateSphere(
                `sphere_${key}`,
                { diameter: 1 },
                this.scene
            );
            
            const material = new BABYLON.StandardMaterial(`mat_${key}`, this.scene);
            material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.2); // Jaune
            mesh.material = material;
        } else if (type === 'stair') {
            // Création du noeud parent pour les escaliers
            mesh = new BABYLON.TransformNode(`stair_${key}`, this.scene);
            mesh.position = position;
            
            // Ce noeud parent sera renvoyé et la méthode addStairBlock
            // s'occupera d'ajouter les éléments visuels et de gérer la rotation
        }
        
        mesh.position = position;
        
        // Si un parent est spécifié, associer le mesh au parent
        if (parent) {
            mesh.parent = parent;
        }
        
        // Stocker l'élément dans la grille
        this.grid[key] = {
            mesh: mesh,
            type: type
        };
        
        return mesh;
    }
    
    // Méthode pour supprimer un élément de la grille
    removeGridElement(x, y, z) {
        const key = `${x},${y},${z}`;
        if (this.grid[key]) {
            this.grid[key].mesh.dispose();
            delete this.grid[key];
        }
    }
    
    // Vérifier si une position est valide (utilisé pour la pathfinding)
    isValidPosition(pos) {
        // Vérifier si la position est dans les limites de la grille
        if (pos.x < -this.gridSize || pos.x > this.gridSize || 
            pos.z < -this.gridSize || pos.z > this.gridSize) {
            return false;
        }
        
        // Vérifier s'il y a un bloc à cette position
        const key = `${pos.x},${pos.y},${pos.z}`;
        const gridElement = this.grid[key];
        
        if (gridElement) {
            if (gridElement.type === 'stair') {
                // Vérifier si le mouvement suit la direction de l'escalier
                const nextPos = gridElement.nextPosition;
                return nextPos && (
                    this.grid[`${nextPos.x},${nextPos.y},${nextPos.z}`] ||
                    this.isValidPlatformPosition(nextPos)
                );
            }
            return true;
        }
        
        return this.isValidPlatformPosition(pos);
    }
    
    // Vérifier si une position est valide pour une plateforme (utilisé pour la pathfinding)
    isValidPlatformPosition(pos) {
        // Utiliser les plateformes rotatives configurées avec notre nouveau système
        if (this.scene.rotatingPlatforms) {
            for (const platform of this.scene.rotatingPlatforms) {
                if (platform.isPositionValid(pos)) {
                    return true;
                }
            }
        }
        
        // Méthode de secours si les plateformes ne sont pas configurées avec le nouveau système
        const platforms = this.scene.meshes.filter(mesh => mesh.name === "rotatingPlatform");
        for (let platform of platforms) {
            // Si la plateforme a une instance associée, on l'a déjà vérifiée ci-dessus
            if (platform.platformInstance) continue;
            
            const worldMatrix = platform.getWorldMatrix();
            const invWorldMatrix = worldMatrix.clone();
            invWorldMatrix.invert();
            
            const localPos = BABYLON.Vector3.TransformCoordinates(
                new BABYLON.Vector3(pos.x, pos.y, pos.z),
                invWorldMatrix
            );
            
            // Utiliser une tolérance pour les positions valides
            // Pour une plateforme de taille 3x1, les positions valides sont
            // le centre et les extrémités (-1,0,1 sur l'axe principal)
            const tolerance = 0.2;
            
            // Vérifier en fonction de la rotation (déterminée par l'angle Y)
            const rotY = platform.rotation.y % (Math.PI * 2);
            if (Math.abs(rotY) < tolerance || Math.abs(rotY - Math.PI) < tolerance) {
                // Horizontal sur l'axe X (état 0 ou 2)
                if (Math.abs(localPos.z) < tolerance && 
                    (Math.abs(localPos.x) < tolerance || Math.abs(localPos.x - 1) < tolerance || Math.abs(localPos.x + 1) < tolerance) &&
                    Math.abs(localPos.y) < 0.6) {
                    return true;
                }
            } else {
                // Horizontal sur l'axe Z (état 1 ou 3)
                if (Math.abs(localPos.x) < tolerance && 
                    (Math.abs(localPos.z) < tolerance || Math.abs(localPos.z - 1) < tolerance || Math.abs(localPos.z + 1) < tolerance) &&
                    Math.abs(localPos.y) < 0.6) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Obtenir tous les éléments de la grille
    getAllElements() {
        return this.grid;
    }
} 