class Exit {
    constructor(scene, grid, position, nextLevelId) {
        this.scene = scene;
        this.grid = grid;
        this.position = position;
        this.nextLevelId = nextLevelId;
        this.mesh = null;
        
        this.createExit();
        this.setupInteraction();
    }
    
    createExit() {
        try {
            // Créer une référence dans la grille pour que le joueur puisse s'y déplacer
            const key = `${this.position.x},${this.position.y},${this.position.z}`;
            
            // S'assurer que cette position est considérée comme valide pour le pathfinding
            if (this.grid && typeof this.grid.addGridElement === 'function') {
                this.meshParent = this.grid.addGridElement(
                    this.position.x, 
                    this.position.y, 
                    this.position.z, 
                    'exit'
                );
            } else {
                // Fallback si addGridElement n'est pas disponible
                this.meshParent = new BABYLON.Mesh(`exit_parent_${key}`, this.scene);
                this.meshParent.position = new BABYLON.Vector3(
                    this.position.x,
                    this.position.y,
                    this.position.z
                );
            }
            
            // Créer un rectangle blanc simple
            this.mesh = BABYLON.MeshBuilder.CreateBox(`exit_mesh_${key}`, {
                width: 0.25,
                height: 0.5,
                depth: 0.25
            }, this.scene);
            
            // Positionner le rectangle pour qu'il ne bloque pas le mouvement
            this.mesh.position.y = 0.75; // Moitié de la hauteur au-dessus du sol
            this.mesh.parent = this.meshParent;
            
            // Matériau blanc simple
            const material = new BABYLON.StandardMaterial(`exit_mat_${key}`, this.scene);
            material.diffuseColor = new BABYLON.Color3(1, 1, 1); // Blanc
            material.emissiveColor = new BABYLON.Color3(0.6, 0.6, 0.6); // Légère lueur
            material.alpha = 0.8; // Légèrement transparent
            
            this.mesh.material = material;
            
            // Légère lumière pour le rendre visible
            this.light = new BABYLON.PointLight(`exit_light_${key}`, new BABYLON.Vector3(0, 0.75, 0), this.scene);
            this.light.parent = this.mesh;
            this.light.intensity = 0.5;
            this.light.diffuse = new BABYLON.Color3(1, 1, 1);
            
            console.log("Exit créée avec succès à la position:", this.position);
        } catch (error) {
            console.error("Erreur lors de la création de la sortie:", error);
        }
    }
    
    setupInteraction() {
        // Vérifier la proximité du joueur à chaque frame
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            // S'assurer que le joueur existe
            if (!this.scene.level || !this.scene.level.player || !this.scene.level.player.mesh) {
                return;
            }
            
            const player = this.scene.level.player;
            
            // Si le joueur est en mouvement, ne pas vérifier
            if (player.isMoving) {
                return;
            }
            
            // Obtenir les positions pour vérifier la proximité
            const playerPos = player.mesh.position.clone();
            const exitPos = this.meshParent.position.clone();
            
            // Vérifier seulement les coordonnées x et z (ignorer y)
            const distance = Math.sqrt(
                Math.pow(playerPos.x - exitPos.x, 2) + 
                Math.pow(playerPos.z - exitPos.z, 2)
            );
            
            // Si le joueur est assez proche, téléporter
            // Utiliser un rayon plus petit pour que le joueur doive vraiment être sur la sortie
            if (distance < 0.5) {
                this.teleportToNextLevel();
            }
        });
        
        // Stocker l'observer pour pouvoir le supprimer plus tard si nécessaire
        this.observer = observer;
    }
    
    teleportToNextLevel() {
        // Supprimer l'observer pour éviter des appels multiples
        if (this.observer) {
            this.scene.onBeforeRenderObservable.remove(this.observer);
            this.observer = null;
        }
        
        // Effet de fondu avant de changer de niveau
        const fadeAnimation = new BABYLON.Animation(
            "fadeOut", 
            "alpha", 
            60, 
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        // Créer un écran de transition
        const fadePanel = BABYLON.MeshBuilder.CreatePlane("fadePanel", { width: 100, height: 100 }, this.scene);
        fadePanel.position = new BABYLON.Vector3(0, 0, 1);
        fadePanel.parent = this.scene.activeCamera;
        
        const fadeMaterial = new BABYLON.StandardMaterial("fadeMaterial", this.scene);
        fadeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        fadeMaterial.alpha = 0;
        fadeMaterial.backFaceCulling = false;
        fadeMaterial.disableLighting = true;
        fadePanel.material = fadeMaterial;
        
        // Animation de fondu
        const fadeKeys = [
            { frame: 0, value: 0 },
            { frame: 30, value: 1 }
        ];
        
        fadeAnimation.setKeys(fadeKeys);
        fadeMaterial.animations = [fadeAnimation];
        
        // Lancer l'animation de fondu
        this.scene.beginAnimation(fadeMaterial, 0, 30, false, 1, () => {
            // Une fois le fondu terminé, charger le niveau suivant
            if (this.scene.level && this.scene.level.startLevel) {
                this.scene.level.startLevel(this.nextLevelId);
            } else {
                // Fallback si la fonction startLevel n'est pas disponible
                const levelManager = new LevelManager();
                levelManager.startLevel(this.nextLevelId, this.scene);
            }
        });
    }
    
    dispose() {
        // Nettoyer les ressources lors de la suppression
        if (this.observer) {
            this.scene.onBeforeRenderObservable.remove(this.observer);
        }
        
        if (this.light) {
            this.light.dispose();
        }
        
        if (this.mesh) {
            this.mesh.dispose();
        }
    }
} 
 