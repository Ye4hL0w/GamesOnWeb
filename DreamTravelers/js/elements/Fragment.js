class Fragment {
    constructor(scene, grid, position) {
        this.scene = scene;
        this.grid = grid;
        this.position = position;
        this.mesh = null;
        this.isCollected = false;
        
        this.createFragment();
        this.setupInteraction();
    }
    
    createFragment() {
        // Créer un conteneur pour le fragment
        const key = `${this.position.x},${this.position.y},${this.position.z}`;
        this.meshParent = new BABYLON.TransformNode(`fragment_parent_${key}`, this.scene);
        this.meshParent.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        // Créer un triangle (forme pyramidale)
        this.mesh = BABYLON.MeshBuilder.CreateCylinder(
            `fragment_mesh_${key}`,
            { 
                height: 0.5,  // Plus grand
                diameterTop: 0,  // Pointe vers le haut
                diameterBottom: 0.4,  // Base plus large
                tessellation: 3  // Triangle
            },
            this.scene
        );
        
        // Ajouter une animation de flottement
        this.mesh.position.y = 0.75;
        this.mesh.parent = this.meshParent;
        
        // Matériau jaune mat (sans brillance)
        const material = new BABYLON.StandardMaterial(`fragment_mat_${key}`, this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.8, 0.2); // Jaune doré
        material.emissiveColor = new BABYLON.Color3(0, 0, 0); // Pas de lueur
        material.specularColor = new BABYLON.Color3(0, 0, 0); // Pas de reflet
        
        this.mesh.material = material;
        
        // Animation de flottement et rotation (sans lumière)
        this.scene.registerBeforeRender(() => {
            if (!this.isCollected) {
                this.mesh.rotation.y += 0.01;
                this.mesh.position.y = 0.75 + Math.sin(performance.now() * 0.002) * 0.1;
            }
        });
    }
    
    setupInteraction() {
        // Vérifier la proximité du joueur à chaque frame
        this.observer = this.scene.onBeforeRenderObservable.add(() => {
            // S'assurer que le joueur existe
            if (!this.scene.level || !this.scene.level.player || !this.scene.level.player.mesh || this.isCollected) {
                return;
            }
            
            const player = this.scene.level.player;
            
            // Obtenir les positions pour vérifier la proximité
            const playerPos = player.mesh.position.clone();
            const fragmentPos = this.meshParent.position.clone();
            
            // Vérifier la distance
            const distance = Math.sqrt(
                Math.pow(playerPos.x - fragmentPos.x, 2) + 
                Math.pow(playerPos.z - fragmentPos.z, 2)
            );
            
            // Si le joueur est assez proche, collecter le fragment
            if (distance < 0.8) {
                this.collect();
            }
        });
    }
    
    collect() {
        if (this.isCollected) return;
        
        this.isCollected = true;
        
        // Animation de collecte
        const collectAnimation = new BABYLON.Animation(
            "collectAnim",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keyFrames = [
            { frame: 0, value: this.mesh.scaling.clone() },
            { frame: 15, value: new BABYLON.Vector3(1.5, 1.5, 1.5) },
            { frame: 30, value: new BABYLON.Vector3(0, 0, 0) }
        ];
        
        collectAnimation.setKeys(keyFrames);
        this.mesh.animations = [collectAnimation];
        
        // Lancer l'animation
        this.scene.beginAnimation(this.mesh, 0, 30, false, 1, () => {
            // Informer le niveau que le fragment a été collecté
            if (this.scene.level) {
                this.scene.level.fragmentCollected();
            }
            
            // Supprimer le mesh après l'animation
            this.dispose();
        });
    }
    
    dispose() {
        if (this.observer) {
            this.scene.onBeforeRenderObservable.remove(this.observer);
        }
        
        if (this.mesh) {
            this.mesh.dispose();
        }
    }
} 