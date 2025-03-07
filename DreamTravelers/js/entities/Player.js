class Player {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
        this.mesh = null;
        this.position = { x: 0, y: 0, z: 0 };
        this.pathLine = null;
        this.isMoving = false;
        
        this.createPlayerMesh();
    }
    
    createPlayerMesh() {
        // Créer le mesh du joueur
        this.mesh = BABYLON.MeshBuilder.CreateSphere("player", {
            diameter: 0.8
        }, this.scene);
        
        // Matériau rose pour le joueur (couleurs d'origine)
        const material = new BABYLON.StandardMaterial("playerMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.5, 0.8); // Rose
        material.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0); // Légère lueur
        material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.mesh.material = material;
        
        // Positionner le joueur
        this.mesh.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y + 0.5, // Le joueur est légèrement au-dessus du sol
            this.position.z
        );
    }
    
    setPosition(x, y, z) {
        this.position = { x, y, z };
        this.mesh.position = new BABYLON.Vector3(x, y + 0.5, z);
        this.updateParent();
    }
    
    updateParent() {
        const platforms = this.scene.meshes.filter(mesh => mesh.name === "rotatingPlatform");
        let isOnPlatform = false;
        
        for (let platform of platforms) {
            const worldMatrix = platform.getWorldMatrix();
            const invWorldMatrix = worldMatrix.clone();
            invWorldMatrix.invert();
            
            const localPos = BABYLON.Vector3.TransformCoordinates(
                this.mesh.position,
                invWorldMatrix
            );
            
            if (Math.abs(localPos.x) <= 1.5 && Math.abs(localPos.z) <= 0.5) {
                this.mesh.parent = platform;
                isOnPlatform = true;
                break;
            }
        }
        
        if (!isOnPlatform) {
            this.mesh.parent = null;
        }
    }
    
    findPath(target) {
        const path = [];
        const start = this.position;
        
        // Vérifier si la cible est atteignable
        const targetKey = `${target.x},${target.y},${target.z}`;
        if (!this.grid.getAllElements()[targetKey] && !this.grid.isValidPlatformPosition(target)) {
            return path;
        }
        
        let current = {...start};
        
        while (current.x !== target.x || current.z !== target.z || current.y !== target.y) {
            let nextPos = {...current};
            
            // Vérifier si nous sommes sur un escalier
            const currentKey = `${current.x},${current.y},${current.z}`;
            const gridElement = this.grid.getAllElements()[currentKey];
            
            if (gridElement && gridElement.type === 'stair') {
                // On doit utiliser l'information de rotation stockée sur l'escalier
                const stairRotation = gridElement.rotation || 0;
                
                switch(stairRotation) {
                    case 0: nextPos.z++; nextPos.y++; break;
                    case 1: nextPos.x++; nextPos.y++; break;
                    case 2: nextPos.z--; nextPos.y++; break;
                    case 3: nextPos.x--; nextPos.y++; break;
                }
            } else {
                // Mouvement normal
                if (current.x < target.x) nextPos.x++;
                else if (current.x > target.x) nextPos.x--;
                else if (current.z < target.z) nextPos.z++;
                else if (current.z > target.z) nextPos.z--;
                else if (current.y < target.y) nextPos.y++;
                else if (current.y > target.y) nextPos.y--;
            }
            
            if (!this.grid.isValidPosition(nextPos)) {
                break;
            }
            
            path.push(nextPos);
            current = nextPos;
        }
        
        return path;
    }
    
    moveAlongPath(path) {
        if (path.length === 0) return;
        
        this.isMoving = true;
        
        const worldPos = this.mesh.getAbsolutePosition();
        this.mesh.parent = null;
        this.mesh.position = worldPos;
        
        // Créer une ligne pour visualiser le chemin
        if (this.pathLine) {
            this.pathLine.dispose();
        }
        
        const pathPoints = path.map(pos => new BABYLON.Vector3(
            pos.x,
            pos.y + 0.5,
            pos.z
        ));
        
        this.pathLine = BABYLON.MeshBuilder.CreateLines("pathLine", {
            points: pathPoints,
            updatable: true
        }, this.scene);
        this.pathLine.color = new BABYLON.Color3(0, 1, 0);
        
        // Animation avec les paramètres d'origine
        const frameRate = 30;
        const animation = new BABYLON.Animation(
            "playerMove",
            "position",
            frameRate,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keyframes = [];
        path.forEach((pos, index) => {
            // Calculer la hauteur en fonction du type de bloc
            const key = `${pos.x},${pos.y},${pos.z}`;
            const gridElement = this.grid.getAllElements()[key];
            let height = pos.y + 0.5;
            
            if (gridElement && gridElement.type === 'stair') {
                // Ajuster la hauteur pour les escaliers
                const progress = index / (path.length - 1);
                height += Math.sin(progress * Math.PI) * 0.2; // Effet d'arc
            }
            
            keyframes.push({
                frame: index * frameRate,
                value: new BABYLON.Vector3(pos.x, height, pos.z),
                outTangent: new BABYLON.Vector3(0, 0.1, 0) // Tangente pour une courbe plus douce
            });
        });
        
        animation.setKeys(keyframes);
        
        // Ajouter une fonction d'ease pour un mouvement plus fluide
        const easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(easingFunction);
        
        this.mesh.animations = [];
        this.mesh.animations.push(animation);
        
        this.scene.beginAnimation(
            this.mesh,
            0,
            (path.length - 1) * frameRate,
            false,
            1,
            () => {
                if (this.pathLine) {
                    this.pathLine.dispose();
                    this.pathLine = null;
                }
                
                this.position = path[path.length - 1];
                this.updateParent();
                this.isMoving = false;
            }
        );
    }
}
