class BaseLevel {
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.currentLevel = 0;
        
        this.createScene();
        
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        // Ajouter un gestionnaire d'événements générique
        this.scene.onPointerDown = (evt) => this.handleClick(evt);
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(51/255, 176/255, 255/255, 1); // Couleur #33b0ff
        
        // Caméra isométrique
        this.camera = new BABYLON.ArcRotateCamera(
            "camera",
            BABYLON.Tools.ToRadians(45),
            BABYLON.Tools.ToRadians(60),
            20,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperRadiusLimit = 30;
        this.camera.attachControl(this.canvas, true);
        
        // Lumière
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.8;
        
        // Lumière directionnelle pour les ombres
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight", 
            new BABYLON.Vector3(-1, -2, -1), 
            this.scene
        );
        dirLight.intensity = 0.5;
        
        // Affichage des axes
        const axisX = BABYLON.MeshBuilder.CreateLines("axisX", {
            points: [
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(5, 0, 0)
            ]
        }, this.scene);
        axisX.color = new BABYLON.Color3(1, 0, 0); // Rouge pour X

        const axisY = BABYLON.MeshBuilder.CreateLines("axisY", {
            points: [
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 5, 0)
            ]
        }, this.scene);
        axisY.color = new BABYLON.Color3(0, 1, 0); // Vert pour Y

        const axisZ = BABYLON.MeshBuilder.CreateLines("axisZ", {
            points: [
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 0, 5)
            ]
        }, this.scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1); // Bleu pour Z
    }

    createGridLines(gridSize = 10) {
        const linesMaterial = new BABYLON.StandardMaterial("linesMaterial", this.scene);
        linesMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        linesMaterial.alpha = 0.3;

        // Créer le conteneur parent pour les lignes
        const gridLinesParent = new BABYLON.TransformNode("gridLines", this.scene);

        // Créer les lignes horizontales (X)
        for (let i = -gridSize; i <= gridSize; i++) {
            const line = BABYLON.MeshBuilder.CreateLines(
                "gridLine",
                {
                    points: [
                        new BABYLON.Vector3(-gridSize, 0, i),
                        new BABYLON.Vector3(gridSize, 0, i)
                    ]
                },
                this.scene
            );
            line.material = linesMaterial;
            line.parent = gridLinesParent;
        }

        // Créer les lignes verticales (Z)
        for (let i = -gridSize; i <= gridSize; i++) {
            const line = BABYLON.MeshBuilder.CreateLines(
                "gridLine",
                {
                    points: [
                        new BABYLON.Vector3(i, 0, -gridSize),
                        new BABYLON.Vector3(i, 0, gridSize)
                    ]
                },
                this.scene
            );
            line.material = linesMaterial;
            line.parent = gridLinesParent;
        }
        
        // Ajouter des lignes verticales pour la grille 3D
        for (let i = -gridSize/2; i <= gridSize/2; i += gridSize/2) {
            const yLine = BABYLON.MeshBuilder.CreateLines("yLine", {
                points: [
                    new BABYLON.Vector3(i, -gridSize/2, i),
                    new BABYLON.Vector3(i, gridSize/2, i)
                ]
            }, this.scene);
            yLine.color = new BABYLON.Color3(0.3, 0.3, 0.3); // Gris plus foncé
            yLine.parent = gridLinesParent;
        }

        return gridLinesParent;
    }

    createClouds() {
        // Créer un parent vide pour faire tourner tous les nuages
        const cloudsParent = new BABYLON.TransformNode("cloudsParent", this.scene);
        cloudsParent.position.y = 8;

        // Créer 4 nuages
        for (let i = 0; i < 4; i++) {
            // Créer un conteneur pour chaque nuage
            const cloudContainer = new BABYLON.TransformNode("cloudContainer", this.scene);
            cloudContainer.parent = cloudsParent;
            
            // Positionner le conteneur en cercle
            const angle = (i * Math.PI * 2) / 4;
            cloudContainer.position = new BABYLON.Vector3(
                Math.cos(angle) * 8, // Rayon de 8 unités
                0,
                Math.sin(angle) * 8
            );

            // Créer les parties du nuage (style low-poly)
            const parts = Math.random() * 2 + 3; // 3-5 parties par nuage
            for (let j = 0; j < parts; j++) {
                const cloudPart = BABYLON.MeshBuilder.CreatePolyhedron(
                    "cloudPart",
                    { type: 1, size: 0.5 + Math.random() }, // Type 1 est un octaèdre
                    this.scene
                );
                cloudPart.parent = cloudContainer;
                
                // Position aléatoire autour du centre du conteneur
                cloudPart.position = new BABYLON.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5),
                    (Math.random() - 0.5) * 2
                );
                
                // Rotation aléatoire
                cloudPart.rotation = new BABYLON.Vector3(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );

                // Matériau blanc semi-transparent
                const cloudMaterial = new BABYLON.StandardMaterial("whiteCloud", this.scene);
                cloudMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
                cloudMaterial.alpha = 0.8;
                cloudMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                cloudPart.material = cloudMaterial;
            }
        }

        // Animation de rotation
        this.scene.registerBeforeRender(() => {
            cloudsParent.rotation.y += 0.002; // Vitesse de rotation
        });
        
        return cloudsParent;
    }

    handleClick(evt) {
        if (!this.player || this.player.isMoving) return;
        
        try {
            const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
            if (pickResult.hit) {
                // Gestion des boutons de rotation
                if (pickResult.pickedMesh.name === "rotateButton") {
                    // Trouver la plateforme correspondante
                    for (const platform of this.rotatingPlatforms || []) {
                        if (platform.mesh === pickResult.pickedMesh.parent) {
                            platform.rotate();
                            return;
                        }
                    }
                    return;
                }
                
                // Gestion du déplacement vers les cubes et plateformes
                if (pickResult.pickedMesh.name.startsWith('cube') || 
                    pickResult.pickedMesh.name === "rotatingPlatform" ||
                    pickResult.pickedMesh.name.startsWith('stair')) {
                    
                    const targetPosition = pickResult.pickedMesh.position.clone();
                    
                    // Si c'est une plateforme rotative, calculer la position précise sur la grille
                    if (pickResult.pickedMesh.name === "rotatingPlatform") {
                        // Obtenir le point précis où l'utilisateur a cliqué
                        const hitPoint = pickResult.pickedPoint;
                        
                        // Trouver la plateforme rotative concernée
                        let platformHit = null;
                        for (const platform of this.rotatingPlatforms || []) {
                            if (platform.mesh === pickResult.pickedMesh) {
                                platformHit = platform;
                                break;
                            }
                        }
                        
                        if (platformHit) {
                            // Convertir le point en coordonnées locales de la plateforme
                            const localHitPoint = hitPoint.subtract(platformHit.mesh.position);
                            
                            // Appliquer la rotation inverse pour obtenir les coordonnées non-pivotées
                            const rotationMatrix = BABYLON.Matrix.RotationY(-platformHit.mesh.rotation.y);
                            const rotatedPoint = BABYLON.Vector3.TransformCoordinates(localHitPoint, rotationMatrix);
                            
                            // Calculer la position de la cellule de la grille la plus proche
                            const gridX = Math.round(platformHit.mesh.position.x + rotatedPoint.x);
                            const gridZ = Math.round(platformHit.mesh.position.z + rotatedPoint.z);
                            
                            // Mettre à jour la position cible
                            targetPosition.x = gridX;
                            targetPosition.z = gridZ;
                            targetPosition.y = platformHit.mesh.position.y;
                        }
                    }
                    
                    // Calcul du chemin
                    const path = this.player.findPath({
                        x: targetPosition.x, 
                        y: targetPosition.y, 
                        z: targetPosition.z
                    });
                    
                    // Vérifier explicitement si le chemin est valide et non vide
                    if (path && path.length > 0) {
                        this.player.moveAlongPath(path);
                    } else {
                        console.log("Destination inaccessible, aucun déplacement");
                        // Optionnel: Ajouter un feedback visuel pour indiquer que la destination est inaccessible
                        this.showInaccessibleFeedback(targetPosition);
                    }
                }
            }
        } catch (error) {
            console.error("Erreur lors du traitement du clic:", error);
            // S'assurer que le joueur n'est pas bloqué en état de mouvement
            if (this.player) {
                this.player.isMoving = false;
            }
        }
    }

    // Méthode optionnelle pour montrer un feedback visuel quand une destination est inaccessible
    showInaccessibleFeedback(position) {
        // Créer un effet visuel temporaire (par exemple, un X rouge)
        const feedbackMarker = BABYLON.MeshBuilder.CreatePlane("inaccessibleMarker", {size: 0.5}, this.scene);
        feedbackMarker.position = new BABYLON.Vector3(position.x, position.y + 1, position.z);
        feedbackMarker.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        
        // Appliquer un matériau rouge semi-transparent
        const material = new BABYLON.StandardMaterial("feedbackMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        material.alpha = 0.7;
        feedbackMarker.material = material;
        
        // Animer l'opacité pour faire disparaître progressivement
        const animation = new BABYLON.Animation(
            "fadeOut", 
            "visibility", 
            30, 
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = [
            { frame: 0, value: 1 },
            { frame: 30, value: 0 }
        ];
        animation.setKeys(keys);
        
        feedbackMarker.animations = [animation];
        
        // Lancer l'animation et supprimer le marqueur après
        this.scene.beginAnimation(feedbackMarker, 0, 30, false, 1, () => {
            feedbackMarker.dispose();
        });
    }
    
    // Méthode par défaut à surcharger dans les classes filles
    createLevel() {
        console.warn("La méthode createLevel doit être implémentée dans la classe fille");
    }
} 