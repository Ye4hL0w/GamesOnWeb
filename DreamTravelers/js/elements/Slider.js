class Slider {
    constructor(scene, position, axis, minValue, maxValue) {
        this.scene = scene;
        this.position = position;
        this.axis = axis.toLowerCase();
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.isDragging = false;
        this.playerOnSlider = null;
        this.cameraState = null;
        this.pendingGridRegistration = true;
        
        // Création du mesh
        this.createMesh();
        
        // Ajout des événements
        this.setupEvents();
        
        // Attendre que la scène soit prête avant d'essayer d'accéder au niveau et à la grille
        this.scene.onReadyObservable.addOnce(() => {
            // Vérifier si le niveau et la grille sont disponibles
            if (this.scene.level && this.scene.level.grid) {
                this.registerInGrid();
            } else {
                // Vérifier régulièrement si le niveau et la grille sont disponibles
                const checkInterval = setInterval(() => {
                    if (this.scene.level && this.scene.level.grid) {
                        this.registerInGrid();
                        clearInterval(checkInterval);
                    }
                }, 500); // Vérifier toutes les 500ms
            }
        });
    }
    
    // Nouvelle méthode pour enregistrer le slider dans la grille
    registerInGrid() {
        if (!this.pendingGridRegistration) return; // Éviter l'enregistrement multiple
        
        if (this.scene.level && this.scene.level.grid) {
            const x = Math.round(this.mesh.position.x);
            const y = Math.round(this.mesh.position.y);
            const z = Math.round(this.mesh.position.z);
            
            this.pendingGridRegistration = false; // Marquer comme enregistré
        }
    }
    
    createMesh() {
        // Créer la plateforme slider
        this.mesh = BABYLON.MeshBuilder.CreateBox(
            "slider", 
            { width: 1, height: 1, depth: 1 }, 
            this.scene
        );
        
        // Positionnement initial - arrondir pour un meilleur alignement avec la grille
        this.mesh.position = new BABYLON.Vector3(
            Math.round(this.position.x),
            Math.round(this.position.y),
            Math.round(this.position.z)
        );
        
        // Activer les collisions pour que le joueur puisse marcher dessus
        this.mesh.checkCollisions = true;
        
        // Définir le mesh comme "walkable"
        this.mesh.isWalkable = true;
        
        // Marquer comme slider pour la détection
        this.mesh.isSlider = true;
        
        // Matériau bleu vif pour plus de visibilité
        const material = new BABYLON.StandardMaterial("sliderMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.1, 0.4, 1.0); // Bleu plus vif
        material.emissiveColor = new BABYLON.Color3(0.0, 0.2, 0.5); // Plus lumineux
        material.specularColor = new BABYLON.Color3(1, 1, 1); // Plus brillant
        this.mesh.material = material;
        
        // Matériau pour l'état de surbrillance
        this.highlightMaterial = new BABYLON.StandardMaterial("sliderHighlightMaterial", this.scene);
        this.highlightMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.8, 1.0);
        this.highlightMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.5, 0.8);
        
        // Ajouter des poignées sur les côtés pour le glissement
        this.addHandles();
        
        // Ajouter une flèche directionnelle
        this.addDirectionArrow();
        
        // Stocker la position originale pour référence
        this.originalY = this.position.y;
    }
    
    addHandles() {
        // Créer un matériau jaune pour les poignées
        const handleMaterial = new BABYLON.StandardMaterial("handleMaterial", this.scene);
        handleMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.0); // Jaune
        handleMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.4, 0.0); // Brillant
        
        // Déterminer l'orientation des poignées selon l'axe de déplacement
        if (this.axis === 'x') {
            // Poignées sur les faces X (gauche et droite)
            this.leftHandle = BABYLON.MeshBuilder.CreateCylinder(
                "leftSliderHandle",
                { height: 0.3, diameter: 0.2 },
                this.scene
            );
            this.leftHandle.rotation.z = Math.PI / 2; // Tourner pour qu'il soit horizontal
            this.leftHandle.position = new BABYLON.Vector3(-0.6, 0, 0);
            this.leftHandle.parent = this.mesh;
            this.leftHandle.material = handleMaterial;
            
            this.rightHandle = BABYLON.MeshBuilder.CreateCylinder(
                "rightSliderHandle",
                { height: 0.3, diameter: 0.2 },
                this.scene
            );
            this.rightHandle.rotation.z = Math.PI / 2;
            this.rightHandle.position = new BABYLON.Vector3(0.6, 0, 0);
            this.rightHandle.parent = this.mesh;
            this.rightHandle.material = handleMaterial;
        } else if (this.axis === 'y') {
            // Poignées sur les faces Y (haut et bas)
            this.topHandle = BABYLON.MeshBuilder.CreateCylinder(
                "topSliderHandle",
                { height: 0.3, diameter: 0.2 },
                this.scene
            );
            this.topHandle.position = new BABYLON.Vector3(0, 0.6, 0);
            this.topHandle.parent = this.mesh;
            this.topHandle.material = handleMaterial;
            
            this.bottomHandle = BABYLON.MeshBuilder.CreateCylinder(
                "bottomSliderHandle",
                { height: 0.3, diameter: 0.2 },
                this.scene
            );
            this.bottomHandle.position = new BABYLON.Vector3(0, -0.6, 0);
            this.bottomHandle.parent = this.mesh;
            this.bottomHandle.material = handleMaterial;
        } else if (this.axis === 'z') {
            // Poignées sur les faces Z (avant et arrière)
            this.frontHandle = BABYLON.MeshBuilder.CreateCylinder(
                "frontSliderHandle",
                { height: 0.3, diameter: 0.2 },
                this.scene
            );
            this.frontHandle.rotation.x = Math.PI / 2; // Tourner pour qu'il soit horizontal
            this.frontHandle.position = new BABYLON.Vector3(0, 0, 0.6);
            this.frontHandle.parent = this.mesh;
            this.frontHandle.material = handleMaterial;
            
            this.backHandle = BABYLON.MeshBuilder.CreateCylinder(
                "backSliderHandle",
                { height: 0.3, diameter: 0.2 },
                this.scene
            );
            this.backHandle.rotation.x = Math.PI / 2;
            this.backHandle.position = new BABYLON.Vector3(0, 0, -0.6);
            this.backHandle.parent = this.mesh;
            this.backHandle.material = handleMaterial;
        }
    }
    
    addDirectionArrow() {
        // Points pour la ligne directionnelle
        let points = [];
        
        if (this.axis === 'x') {
            points = [
                new BABYLON.Vector3(-0.8, 0.3, 0),
                new BABYLON.Vector3(0.8, 0.3, 0)
            ];
        } else if (this.axis === 'y') {
            points = [
                new BABYLON.Vector3(0, -0.8, 0),
                new BABYLON.Vector3(0, 0.8, 0)
            ];
        } else { // 'z'
            points = [
                new BABYLON.Vector3(0, 0.3, -0.8),
                new BABYLON.Vector3(0, 0.3, 0.8)
            ];
        }
        
        // Créer la ligne de direction
        const line = BABYLON.MeshBuilder.CreateLines(
            "sliderArrow", 
            { points: points }, 
            this.scene
        );
        
        // Couleur jaune pour la ligne
        line.color = new BABYLON.Color3(1, 1, 0);
        
        // Rattacher au slider
        line.parent = this.mesh;
    }
    
    setupEvents() {
        // Stocker les gestionnaires d'événements d'origine
        const originalPointerDown = this.scene.onPointerDown;
        const originalPointerMove = this.scene.onPointerMove;
        const originalPointerUp = this.scene.onPointerUp;
        
        // Crée une liste des poignées pour la détection
        this.handles = [];
        if (this.axis === 'x') {
            this.handles = [this.leftHandle, this.rightHandle];
        } else if (this.axis === 'y') {
            this.handles = [this.topHandle, this.bottomHandle];
        } else if (this.axis === 'z') {
            this.handles = [this.frontHandle, this.backHandle];
        }
        
        // Remplacer les gestionnaires d'événements de la scène
        this.scene.onPointerDown = (evt, pickResult) => {
            // Si on clique sur le corps du slider ou ses poignées
            if (pickResult.hit && 
                (pickResult.pickedMesh === this.mesh || 
                this.handles.includes(pickResult.pickedMesh))) {
                
                // Si c'est une poignée, activer le mode glissement
                if (this.handles.includes(pickResult.pickedMesh)) {
                    this.startDragging();
                    return;
                }
                
                // Si c'est le corps du slider lui-même, utiliser le pathfinding normal
                if (pickResult.pickedMesh === this.mesh) {
                    if (this.scene.level && this.scene.level.player) {
                        const player = this.scene.level.player;
                        // Calculer la position cible sur le slider
                        const targetPosition = {
                            x: Math.round(this.mesh.position.x),
                            y: Math.round(this.mesh.position.y),
                            z: Math.round(this.mesh.position.z)
                        };
                        
                        // Utiliser le pathfinding normal
                        const path = player.findPath(targetPosition);
                        if (path && path.length > 0) {
                            player.moveAlongPath(path);
                        }
                    }
                    return;
                }
            }
            
            // Sinon, utiliser le gestionnaire d'origine
            if (originalPointerDown) {
                originalPointerDown(evt, pickResult);
            }
            
            // Si on était en train de faire glisser, arrêter
            if (this.isDragging) {
                this.stopDragging();
            }
        };
        
        // Remplacer le gestionnaire de mouvement
        this.scene.onPointerMove = (evt) => {
            // Si on est en train de faire glisser, traiter le mouvement
            if (this.isDragging) {
                this.updateSliderPosition(evt);
                return; // Ne pas continuer
            }
            
            // Sinon, utiliser le gestionnaire d'origine
            if (originalPointerMove) {
                originalPointerMove(evt);
            }
        };
        
        // Remplacer le gestionnaire de relâchement
        this.scene.onPointerUp = (evt) => {
            // Si on est en train de faire glisser, arrêter
            if (this.isDragging) {
                this.stopDragging();
                return; // Ne pas continuer
            }
            
            // Sinon, utiliser le gestionnaire d'origine
            if (originalPointerUp) {
                originalPointerUp(evt);
            }
        };
        
        // Ajouter un gestionnaire pour les touches du clavier
        window.addEventListener("keydown", (evt) => {
            // Si la touche Maj est enfoncée, activer un mode de déplacement précis du slider
            if (evt.key === "Shift" && this.isDragging) {
                this.precisionMode = true;
            }
            
            // Utiliser les touches fléchées pour déplacer le slider avec précision
            if (this.isDragging) {
                if (evt.key === "ArrowLeft" && this.axis === 'x') {
                    this.mesh.position.x -= 0.1;
                    this.mesh.position.x = Math.max(this.minValue, this.mesh.position.x);
                } else if (evt.key === "ArrowRight" && this.axis === 'x') {
                    this.mesh.position.x += 0.1;
                    this.mesh.position.x = Math.min(this.maxValue, this.mesh.position.x);
                } else if (evt.key === "ArrowUp" && this.axis === 'y') {
                    this.mesh.position.y += 0.1;
                    this.mesh.position.y = Math.min(this.maxValue, this.mesh.position.y);
                } else if (evt.key === "ArrowDown" && this.axis === 'y') {
                    this.mesh.position.y -= 0.1;
                    this.mesh.position.y = Math.max(this.minValue, this.mesh.position.y);
                } else if (evt.key === "ArrowRight" && this.axis === 'z') {
                    this.mesh.position.z += 0.1;
                    this.mesh.position.z = Math.min(this.maxValue, this.mesh.position.z);
                } else if (evt.key === "ArrowLeft" && this.axis === 'z') {
                    this.mesh.position.z -= 0.1;
                    this.mesh.position.z = Math.max(this.minValue, this.mesh.position.z);
                }
            }
        });
        
        window.addEventListener("keyup", (evt) => {
            if (evt.key === "Shift") {
                this.precisionMode = false;
            }
        });
        
        // Vérifier régulièrement si le joueur est sur le slider
        this.scene.registerBeforeRender(() => {
            this.checkPlayerOnSlider();
            this.updateHandlePositions();
        });
        
        // Ajouter un texte d'aide pour informer le joueur
        this.addHelpText();
    }
    
    updateHandlePositions() {
        // S'assurer que les poignées restent attachées au slider même en cas d'animation
        if (this.handles && this.handles.length > 0) {
            this.handles.forEach(handle => {
                if (handle && handle.parent !== this.mesh) {
                    handle.parent = this.mesh;
                }
            });
        }
    }
    
    startDragging() {
        this.isDragging = true;
        // Changer l'apparence du slider pour indiquer qu'il est sélectionné
        this.mesh.material = this.highlightMaterial;
        
        // Mettre en surbrillance les poignées également
        this.handles.forEach(handle => {
            const highlightHandleMaterial = new BABYLON.StandardMaterial("handleHighlightMaterial", this.scene);
            highlightHandleMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 0.0); // Jaune vif
            highlightHandleMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.0); // Très brillant
            handle.material = highlightHandleMaterial;
        });
        
        // Verrouiller la caméra
        if (this.scene.activeCamera) {
            // Sauvegarder l'état actuel des contrôles de la caméra
            this.cameraState = {
                detached: false
            };
            
            // Détacher les contrôles de la caméra
            this.scene.activeCamera.detachControl();
            this.cameraState.detached = true;
        }
    }
    
    stopDragging() {
        this.isDragging = false;
        
        // Recalibrer le slider vers la position de grille la plus proche
        this.snapToGrid();
        
        // Revenir à l'apparence normale
        const material = new BABYLON.StandardMaterial("sliderMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.1, 0.4, 1.0);
        material.emissiveColor = new BABYLON.Color3(0.0, 0.2, 0.5);
        material.specularColor = new BABYLON.Color3(1, 1, 1);
        this.mesh.material = material;
        
        // Restaurer l'apparence normale des poignées
        this.handles.forEach(handle => {
            const handleMaterial = new BABYLON.StandardMaterial("handleMaterial", this.scene);
            handleMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.8, 0.0); // Jaune
            handleMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.4, 0.0); // Brillant
            handle.material = handleMaterial;
        });
        
        // Restaurer les contrôles de la caméra
        if (this.cameraState && this.cameraState.detached && this.scene.activeCamera) {
            // Réattacher les contrôles
            const canvas = this.scene.getEngine().getRenderingCanvas();
            if (canvas) {
                this.scene.activeCamera.attachControl(canvas);
            }
            this.cameraState.detached = false;
        }
    }
    
    // Nouvelle méthode pour recalibrer le slider sur la grille
    snapToGrid() {
        // Obtenir la position actuelle
        const currentPos = this.mesh.position.clone();
        
        // Récupérer l'ancienne position arrondie pour la grille
        const oldX = Math.round(currentPos.x);
        const oldY = Math.round(currentPos.y);
        const oldZ = Math.round(currentPos.z);
        
        // Créer une nouvelle position avec les valeurs arrondies
        let newPos = currentPos.clone();
        
        // Arrondir à la position de grille la plus proche selon l'axe de déplacement
        if (this.axis === 'x') {
            newPos.x = Math.round(currentPos.x);
            
            // Vérifier que la nouvelle position est dans les limites
            newPos.x = Math.max(this.minValue, Math.min(this.maxValue, newPos.x));
            
            // Animation de recalibrage si la position a changé
            if (newPos.x !== currentPos.x) {
                this.animateSnap(newPos);
            }
        } else if (this.axis === 'y') {
            newPos.y = Math.round(currentPos.y);
            
            // Vérifier que la nouvelle position est dans les limites
            newPos.y = Math.max(this.minValue, Math.min(this.maxValue, newPos.y));
            
            // Animation de recalibrage si la position a changé
            if (newPos.y !== currentPos.y) {
                this.animateSnap(newPos);
            }
        } else if (this.axis === 'z') {
            newPos.z = Math.round(currentPos.z);
            
            // Vérifier que la nouvelle position est dans les limites
            newPos.z = Math.max(this.minValue, Math.min(this.maxValue, newPos.z));
            
            // Animation de recalibrage si la position a changé
            if (newPos.z !== currentPos.z) {
                this.animateSnap(newPos);
            }
        }
        
        // Mise à jour position seulement, pas de modification de la grille
        const newX = Math.round(newPos.x);
        const newY = Math.round(newPos.y);
        const newZ = Math.round(newPos.z);
    }
    
    // Méthode pour animer le recalibrage du slider
    animateSnap(targetPosition) {
        // Créer une animation
        const animation = new BABYLON.Animation(
            "sliderSnap",
            "position",
            30, // 30 FPS
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        // Déplacer le joueur avec le slider pendant l'animation
        const startPosition = this.mesh.position.clone();
        const playerOnSliderAtStart = this.playerOnSlider;
        
        // Créer les keyframes de l'animation
        const keyFrames = [
            { frame: 0, value: startPosition },
            { frame: 15, value: targetPosition }
        ];
        
        animation.setKeys(keyFrames);
        
        // Fonction d'easing pour un effet plus naturel
        const easingFunction = new BABYLON.QuarticEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        animation.setEasingFunction(easingFunction);
        
        // Appliquer l'animation
        this.mesh.animations = [animation];
        
        // Observer l'animation pour déplacer le joueur si nécessaire
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            if (playerOnSliderAtStart) {
                // Calculer le déplacement depuis la dernière frame
                const deltaPosition = {
                    x: this.mesh.position.x - startPosition.x,
                    y: this.mesh.position.y - startPosition.y,
                    z: this.mesh.position.z - startPosition.z
                };
                
                // Mettre à jour la position du joueur
                if (playerOnSliderAtStart.mesh) {
                    playerOnSliderAtStart.mesh.position.x = playerOnSliderAtStart.mesh.position.x + deltaPosition.x;
                    playerOnSliderAtStart.mesh.position.y = playerOnSliderAtStart.mesh.position.y + deltaPosition.y;
                    playerOnSliderAtStart.mesh.position.z = playerOnSliderAtStart.mesh.position.z + deltaPosition.z;
                    
                    // Mettre à jour startPosition pour le prochain calcul de delta
                    startPosition.copyFrom(this.mesh.position);
                }
            }
        });
        
        // Lancer l'animation
        this.scene.beginAnimation(this.mesh, 0, 15, false, 1.0, () => {
            // Nettoyer l'observer une fois l'animation terminée
            this.scene.onBeforeRenderObservable.remove(observer);
            
            // Mettre à jour les poignées
            this.updateHandlePositions();
        });
    }
    
    updateSliderPosition(evt) {
        if (!this.isDragging) return;
        
        // Récupérer la direction du mouvement de la souris
        const movementX = evt.movementX || 0;
        const movementY = evt.movementY || 0;
        
        // Facteur de sensibilité AMÉLIORÉ - plus précis et plus rapide
        const sensitivity = 0.03; // Augmenté de 0.01 à 0.03 pour un mouvement plus rapide
        
        // Position actuelle du slider
        const oldPosition = this.mesh.position.clone();
        let newPosition = oldPosition.clone();
        
        // Calculer la nouvelle position selon l'axe
        if (this.axis === 'x') {
            newPosition.x += movementX * sensitivity;
            // Arrondir à 2 décimales pour plus de précision
            newPosition.x = Math.round(newPosition.x * 100) / 100;
            newPosition.x = Math.max(this.minValue, Math.min(this.maxValue, newPosition.x));
        } else if (this.axis === 'y') {
            newPosition.y -= movementY * sensitivity; // Inverser Y car l'écran est inversé
            // Arrondir à 2 décimales pour plus de précision
            newPosition.y = Math.round(newPosition.y * 100) / 100;
            newPosition.y = Math.max(this.minValue, Math.min(this.maxValue, newPosition.y));
        } else if (this.axis === 'z') {
            newPosition.z += movementX * sensitivity; // Utiliser X pour déplacer Z
            // Arrondir à 2 décimales pour plus de précision
            newPosition.z = Math.round(newPosition.z * 100) / 100;
            newPosition.z = Math.max(this.minValue, Math.min(this.maxValue, newPosition.z));
        }
        
        // Mettre à jour la position du slider
        this.mesh.position = newPosition;
        
        // Calculer le vecteur de déplacement
        const deltaPosition = {
            x: newPosition.x - oldPosition.x,
            y: newPosition.y - oldPosition.y,
            z: newPosition.z - oldPosition.z
        };
        
        // Déplacer le joueur avec le slider
        this.movePlayerWithSlider(deltaPosition);
    }
    
    checkPlayerOnSlider() {
        // Vérifier si le niveau et le joueur sont définis
        if (!this.scene.level || !this.scene.level.player || !this.scene.level.player.mesh) {
            return;
        }
        
        const player = this.scene.level.player;
        const playerMesh = player.mesh;
        
        // Vérification selon l'axe du slider
        let isOnSlider = false;
        
        if (this.axis === 'z') {
            // Pour le slider Z, on vérifie uniquement la position X
            isOnSlider = Math.abs(playerMesh.position.x - this.mesh.position.x) < 0.5;
        } else if (this.axis === 'y') {
            // Pour le slider Y, vérifier X et Z
            isOnSlider = Math.abs(playerMesh.position.x - this.mesh.position.x) < 0.5 && 
                        Math.abs(playerMesh.position.z - this.mesh.position.z) < 0.5;
            
        } else { // axe X
            // Pour le slider X, vérifier Y et Z
            isOnSlider = Math.abs(playerMesh.position.z - this.mesh.position.z) < 0.5;
        }
        
        if (isOnSlider) { 
            // Le joueur est sur le slider
            this.playerOnSlider = player;
            
            // Activer les collisions pour permettre au joueur de rester sur le slider
            if (!this.mesh.checkCollisions) {
                this.mesh.checkCollisions = true;
            }
            
            // Pour le slider Z, forcer la position X
            if (this.axis === 'z') {
                playerMesh.position.x = this.mesh.position.x;
            }
        } else {
            // Le joueur n'est plus sur le slider
            this.playerOnSlider = null;
        }
    }
    
    movePlayerWithSlider(deltaPosition) {
        // Déplacer le joueur s'il est sur le slider
        if (this.playerOnSlider && this.playerOnSlider.mesh) {
            const playerMesh = this.playerOnSlider.mesh;
            
            // Appliquer le déplacement du slider au joueur
            playerMesh.position.x += deltaPosition.x;
            playerMesh.position.y += deltaPosition.y;
            playerMesh.position.z += deltaPosition.z;
            
            // Mettre à jour la position interne du joueur
            if (this.playerOnSlider.position) {
                this.playerOnSlider.position.x = Math.round(playerMesh.position.x);
                this.playerOnSlider.position.y = Math.round(playerMesh.position.y);
                this.playerOnSlider.position.z = Math.round(playerMesh.position.z);
            }
        }
    }
    
    addHelpText() {
        // Vérifier d'abord si BABYLON.GUI est disponible
        if (!BABYLON.GUI || !BABYLON.GUI.AdvancedDynamicTexture) {
            return;
        }
        
        try {
            // Créer un gestionnaire dynamique pour le texte d'aide
            this.scene.onBeforeRenderObservable.add(() => {
                // Vérifier si le joueur est proche du slider
                if (this.scene.level && this.scene.level.player && this.scene.level.player.mesh) {
                    const player = this.scene.level.player;
                    const distance = BABYLON.Vector3.Distance(
                        player.mesh.position,
                        this.mesh.position
                    );
                    
                    // Si le joueur est suffisamment proche (dans un rayon de 5 unités)
                    if (distance < 5) {
                        // Ajouter une aide textuelle au joueur (si elle n'existe pas déjà)
                        if (!this.helpText) {
                            const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                            
                            this.helpText = new BABYLON.GUI.TextBlock();
                            this.helpText.text = "Cliquer sur le slider pour y monter";
                            this.helpText.color = "white";
                            this.helpText.fontSize = 14;
                            this.helpText.fontFamily = "Arial";
                            this.helpText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                            this.helpText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                            this.helpText.paddingBottom = "30px";
                            
                            advancedTexture.addControl(this.helpText);
                        }
                    } else if (this.helpText) {
                        // Supprimer l'aide si le joueur s'éloigne
                        this.helpText.dispose();
                        this.helpText = null;
                    }
                }
            });
        } catch (error) {
            // Gestion silencieuse des erreurs
        }
    }
    
    // Méthode pour forcer le joueur à monter sur le slider
    forcePlayerOntoSlider() {
        if (!this.scene.level || !this.scene.level.player) {
            return;
        }
        
        const player = this.scene.level.player;
        
        // Calculer la position exacte où le joueur devrait être
        const targetPosition = {
            x: Math.round(this.mesh.position.x),
            y: Math.round(this.mesh.position.y),
            z: Math.round(this.mesh.position.z)
        };
        
        // SOLUTION DIRECTE: Utiliser la méthode setPosition
        player.setPosition(targetPosition.x, targetPosition.y, targetPosition.z);
        
        // SOLUTION DIRECTE 2: Modifier directement le mesh
        if (player.mesh) {
            player.mesh.position.x = targetPosition.x;
            player.mesh.position.y = targetPosition.y;
            player.mesh.position.z = targetPosition.z;
        }
    }
} 