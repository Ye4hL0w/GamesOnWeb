class Exit {
    constructor(scene, grid, position, nextLevelId, requiredFragments = 0) {
        this.scene = scene;
        this.grid = grid;
        this.position = position;
        this.nextLevelId = nextLevelId;
        this.mesh = null;
        this.requiredFragments = requiredFragments;
        this.collectedFragments = 0;
        this.isActive = (requiredFragments === 0); // Actif par défaut si aucun fragment requis
        
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
            
            // Créer un rectangle blanc simple (design original)
            this.mesh = BABYLON.MeshBuilder.CreateBox(`exit_mesh_${key}`, {
                width: 0.25,
                height: 0.5,
                depth: 0.25
            }, this.scene);
            
            // Positionner le rectangle pour qu'il ne bloque pas le mouvement
            this.mesh.position.y = 0.75; // Moitié de la hauteur au-dessus du sol
            this.mesh.parent = this.meshParent;
            
            // Matériau blanc mat (sans brillance)
            this.material = new BABYLON.StandardMaterial(`exit_mat_${key}`, this.scene);
            this.material.diffuseColor = new BABYLON.Color3(1, 1, 1); // Blanc
            this.material.emissiveColor = new BABYLON.Color3(0, 0, 0); // Pas de lueur
            this.material.specularColor = new BABYLON.Color3(0, 0, 0); // Pas de reflet brillant
            this.material.alpha = 0.8; // Légèrement transparent
            
            this.mesh.material = this.material;
            
            // Lumière très légère (faible intensité)
            this.light = new BABYLON.PointLight(`exit_light_${key}`, new BABYLON.Vector3(0, 0.75, 0), this.scene);
            this.light.parent = this.mesh;
            this.light.intensity = 0.2; // Intensité réduite
            this.light.diffuse = new BABYLON.Color3(1, 1, 1);
            
            // Animation de légère rotation
            this.scene.registerBeforeRender(() => {
                if (this.mesh) {
                    this.mesh.rotation.y += 0.005;
                }
            });
            
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
            
            // Si le joueur est assez proche et l'exit est actif, téléporter
            if (distance < 0.5 && this.isActive) {
                this.teleportToNextLevel();
            } else if (distance < 0.5 && !this.isActive) {
                // Feedback visuel si pas assez de fragments
                this.showInactiveMessage();
            }
        });
        
        // Stocker l'observer pour pouvoir le supprimer plus tard si nécessaire
        this.observer = observer;
    }
    
    updateFragmentCount(count) {
        this.collectedFragments = count;
        this.isActive = (this.collectedFragments >= this.requiredFragments);
        
        // Aucun changement visuel - par contre on peut faire un petit effet quand activé
        if (this.isActive && !this._pulseAnimation) {
            this._pulseAnimation = true;
            this._startPulseAnimation();
        } else if (!this.isActive && this._pulseAnimation) {
            this._pulseAnimation = false;
        }
    }
    
    _startPulseAnimation() {
        let time = 0;
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            if (!this._pulseAnimation) {
                this.scene.onBeforeRenderObservable.remove(observer);
                return;
            }
            
            time += this.scene.getEngine().getDeltaTime() / 1000;
            const pulse = Math.sin(time * 2) * 0.2 + 0.8;
            
            // Faire pulser légèrement la taille seulement
            if (this.mesh) {
                const pulseFactor = 0.9 + (pulse * 0.2);
                this.mesh.scaling.set(pulseFactor, pulseFactor, pulseFactor);
            }
        });
    }
    
    showInactiveMessage() {
        // Créer un message flottant "Fragments requis: X/Y"
        if (this._messageTimeout) {
            return; // Éviter d'afficher le message trop souvent
        }
        
        const container = document.createElement('div');
        container.className = 'floating-message';
        container.innerHTML = `Fragments requis: ${this.collectedFragments}/${this.requiredFragments}`;
        document.body.appendChild(container);
        
        // Positionner le message au-dessus de la sortie dans l'écran
        const engine = this.scene.getEngine();
        const camera = this.scene.activeCamera;
        
        if (camera) {
            const projectedPosition = BABYLON.Vector3.Project(
                new BABYLON.Vector3(this.position.x, this.position.y + 1.5, this.position.z),
                BABYLON.Matrix.Identity(),
                this.scene.getTransformMatrix(),
                camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
            );
            
            container.style.left = projectedPosition.x + 'px';
            container.style.top = projectedPosition.y + 'px';
        }
        
        // Ajouter animation et supprimer après quelques secondes
        setTimeout(() => {
            container.classList.add('fadeOut');
            setTimeout(() => {
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
            }, 1000);
            this._messageTimeout = null;
        }, 2000);
        
        this._messageTimeout = true;
    }
    
    teleportToNextLevel() {
        // Supprimer l'observer pour éviter des appels multiples
        if (this.observer) {
            this.scene.onBeforeRenderObservable.remove(this.observer);
            this.observer = null;
        }
        
        // Sauvegarder la progression du niveau
        if (window.GameProgress && typeof window.GameProgress.saveGameProgress === 'function') {
            // Utiliser GAME_IDS.DREAM_TRAVELERS qui est 2
            const gameId = window.GameProgress.GAME_IDS.DREAM_TRAVELERS;
            const currentLevel = parseInt(window.location.pathname.split('level')[1]?.split('.')[0] || '1');
            
            // Sauvegarder la progression
            window.GameProgress.saveGameProgress(gameId, currentLevel);
            console.log(`Progression sauvegardée pour Dream Travelers: Niveau ${currentLevel} terminé`);
        } else {
            console.warn("GameProgress n'est pas disponible, la progression ne sera pas sauvegardée");
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
            // Si nextLevelId est 0, rediriger vers index.html
            if (this.nextLevelId === 0) {
                window.location.href = "index.html";
            } else {
                // Sinon, rediriger vers le niveau suivant
                window.location.href = `level${this.nextLevelId}.html`;
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
 