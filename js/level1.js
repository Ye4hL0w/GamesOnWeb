class Level1 {
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.currentLevel = 0;
        this.rotatingPlatforms = [];
        this.isRotating = false;
        this.grid = {}; // Structure de données pour stocker les éléments de la grille
        this.gridSize = 10; // Taille de la grille
        this.player = null; // Référence à la sphère du joueur
        this.playerPosition = { x: 0, y: 0, z: 0 }; // Position actuelle du joueur
        this.pathLine = null; // Ligne pour visualiser le chemin
        
        this.createScene();
        
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.scene.onPointerDown = (evt) => this.handleClick(evt);
        
        // Ajout des contrôles clavier pour le joueur
        window.addEventListener("keydown", (evt) => this.handleKeyboard(evt));
    }

    startLevel(levelId) {
        this.currentLevel = levelId;
        const levelManager = new LevelManager();
        levelManager.startLevel(levelId, this.scene);
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        
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
        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        
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

        this.createLevel();
        this.createClouds();
    }

    // Méthode pour ajouter un élément à la grille
    addGridElement(x, y, z, type = 'cube', parent = null) {
        const key = `${x},${y},${z}`;
        let mesh;

        if (type === 'cube') {
            mesh = BABYLON.MeshBuilder.CreateBox(
                `cube_${key}`,
                { size: 1 },
                this.scene
            );
        } else if (type === 'sphere') {
            mesh = BABYLON.MeshBuilder.CreateSphere(
                `sphere_${key}`,
                { diameter: 1 },
                this.scene
            );
        }

        mesh.position = new BABYLON.Vector3(x, y, z);
        if (parent) {
            mesh.parent = parent;
        }
        
        const material = new BABYLON.StandardMaterial(`mat_${key}`, this.scene);
        // Choisir aléatoirement entre vert clair et vert foncé
        const isLightGreen = Math.random() < 0.5;
        if (isLightGreen) {
            material.diffuseColor = new BABYLON.Color3(0.5, 0.8, 0.5); // Vert clair
        } else {
            material.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2); // Vert foncé
        }
        mesh.material = material;

        this.grid[key] = {
            mesh: mesh,
            type: type
        };
    }

    // Méthode pour supprimer un élément de la grille
    removeGridElement(x, y, z) {
        const key = `${x},${y},${z}`;
        if (this.grid[key]) {
            this.grid[key].mesh.dispose();
            delete this.grid[key];
        }
    }

    handleClick(evt) {
        const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        if (pickResult.hit) {
            if (pickResult.pickedMesh.name === "rotateButton") {
                const platform = pickResult.pickedMesh.parent;
                this.rotatePlatform(platform);
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

                const path = this.findPath(
                    this.playerPosition,
                    {x: targetPosition.x, y: targetPosition.y, z: targetPosition.z}
                );
                
                if (path.length > 0) {
                    if (this.pathLine) {
                        this.pathLine.dispose();
                    }
                    
                    const pathPoints = path.map(pos => new BABYLON.Vector3(
                        pos.x,
                        pos.y + 0.5,
                        pos.z
                    ));
                    
                    this.pathLine = BABYLON.MeshBuilder.CreateLines("path", {
                        points: pathPoints,
                        updatable: true
                    }, this.scene);
                    this.pathLine.color = new BABYLON.Color3(0, 1, 0);
                    
                    this.movePlayerAlongPath(path);
                }
            }
        }
    }

    findPath(start, target) {
        const path = [];
        let current = {...start};
        
        // Vérifier si la cible est atteignable
        const targetKey = `${target.x},${target.y},${target.z}`;
        if (!this.grid[targetKey] && !this.isValidPlatformPosition(target)) {
            return path;
        }
        
        while (current.x !== target.x || current.z !== target.z) {
            let nextPos = {...current};
            
            if (current.x < target.x) {
                nextPos.x++;
            } else if (current.x > target.x) {
                nextPos.x--;
            }
            else if (current.z < target.z) {
                nextPos.z++;
            } else if (current.z > target.z) {
                nextPos.z--;
            }
            
            // Vérifier si la prochaine position est valide
            if (!this.isValidPosition(nextPos)) {
                break;
            }
            
            path.push(nextPos);
            current = nextPos;
        }
        
        return path;
    }

    isValidPosition(pos) {
        const key = `${pos.x},${pos.y},${pos.z}`;
        return this.grid[key] || this.isValidPlatformPosition(pos);
    }

    isValidPlatformPosition(pos) {
        const platforms = this.scene.meshes.filter(mesh => mesh.name === "rotatingPlatform");
        for (let platform of platforms) {
            const worldMatrix = platform.getWorldMatrix();
            const invWorldMatrix = worldMatrix.clone();
            invWorldMatrix.invert();
            
            const localPos = BABYLON.Vector3.TransformCoordinates(
                new BABYLON.Vector3(pos.x, pos.y, pos.z),
                invWorldMatrix
            );
            
            if (Math.abs(localPos.x) <= 1.5 && Math.abs(localPos.z) <= 0.5) {
                return true;
            }
        }
        return false;
    }

    movePlayerAlongPath(path) {
        if (path.length === 0) return;
        
        // Sauvegarder la position mondiale avant de détacher
        const worldPos = this.player.getAbsolutePosition();
        this.player.parent = null;
        this.player.position = worldPos;
        
        const frameRate = 10;
        const animation = new BABYLON.Animation(
            "playerMove",
            "position",
            frameRate,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keyframes = [];
        path.forEach((pos, index) => {
            keyframes.push({
                frame: index * frameRate,
                value: new BABYLON.Vector3(pos.x, pos.y + 0.5, pos.z)
            });
        });
        
        animation.setKeys(keyframes);
        
        this.player.animations = [];
        this.player.animations.push(animation);
        
        this.scene.beginAnimation(
            this.player,
            0,
            (path.length - 1) * frameRate,
            false,
            1,
            () => {
                this.playerPosition = path[path.length - 1];
                this.updatePlayerParent();
            }
        );
    }

    handleKeyboard(evt) {
        // Désactivé car on utilise maintenant le clic pour déplacer
    }

    rotatePlatform(platform) {
        if (this.isRotating) return;
        
        this.isRotating = true;
        
        const currentRotation = platform.rotation.y;
        const targetRotation = currentRotation + Math.PI/2;
        
        const animation = new BABYLON.Animation(
            "rotateAnimation",
            "rotation.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keyFrames = [];
        keyFrames.push({
            frame: 0,
            value: currentRotation
        });
        keyFrames.push({
            frame: 60,
            value: targetRotation
        });
        
        animation.setKeys(keyFrames);
        
        platform.animations = [];
        platform.animations.push(animation);
        
        this.scene.beginAnimation(platform, 0, 60, false, 1, () => {
            this.isRotating = false;
        });
    }

    createLevel() {
        // Base principale
        const base = BABYLON.MeshBuilder.CreateBox(
            "base",
            { width: this.gridSize, height: 1, depth: this.gridSize },
            this.scene
        );
        base.position.y = -0.5;
        const baseMaterial = new BABYLON.StandardMaterial("baseMat", this.scene);
        baseMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        baseMaterial.alpha = 0.5; // Semi-transparent pour voir la grille en dessous
        base.material = baseMaterial;

        // Création des lignes de la grille pour visualisation
        this.createGridLines();

        // Ajout de cubes à différentes positions sur le même axe y
        this.addGridElement(2, 0, 0);
        this.addGridElement(1, 0, 0);
        this.addGridElement(0, 0, 0);
        this.addGridElement(-1, 0, 0);
        this.addGridElement(-2, 0, 0);
        this.addGridElement(-0, 0, 3);

        // Création de la plateforme rotative
        const rotatingPlatform = BABYLON.MeshBuilder.CreateBox(
            "rotatingPlatform",
            { width: 3, height: 1, depth: 1 },
            this.scene
        );
        rotatingPlatform.position = new BABYLON.Vector3(0, 0, -2);
        const platformMaterial = new BABYLON.StandardMaterial("platformMat", this.scene);
        platformMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.9);
        rotatingPlatform.material = platformMaterial;

        // Création du bouton de rotation
        const rotateButton = BABYLON.MeshBuilder.CreateCylinder(
            "rotateButton",
            { height: 0.6, diameter: 0.3 },
            this.scene
        );
        rotateButton.parent = rotatingPlatform;
        rotateButton.position.y = 0.35;
        const buttonMaterial = new BABYLON.StandardMaterial("buttonMat", this.scene);
        buttonMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        buttonMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        rotateButton.material = buttonMaterial;

        // Création de la sphère du joueur
        this.player = BABYLON.MeshBuilder.CreateSphere("player", {
            diameter: 0.8
        }, this.scene);
        
        // Position initiale du joueur
        this.playerPosition = { x: 0, y: 0, z: 0 };
        this.player.position = new BABYLON.Vector3(0, 0.5, 0); // Légèrement au-dessus du cube initial
        
        // Matériau pour la sphère du joueur
        const playerMaterial = new BABYLON.StandardMaterial("playerMat", this.scene);
        playerMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0.8); // Rose
        playerMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0); // Légère lueur
        this.player.material = playerMaterial;
    }

    createGridLines() {
        const size = this.gridSize;
        const lines = [];
        
        // Création des lignes horizontales et verticales avec des couleurs différentes
        for (let i = -size/2; i <= size/2; i++) {
            const xLine = BABYLON.MeshBuilder.CreateLines("xLine", {
                points: [
                    new BABYLON.Vector3(i, 0, -size/2),
                    new BABYLON.Vector3(i, 0, size/2)
                ]
            }, this.scene);
            xLine.color = new BABYLON.Color3(0.5, 0.5, 0.5); // Gris clair
            
            const zLine = BABYLON.MeshBuilder.CreateLines("zLine", {
                points: [
                    new BABYLON.Vector3(-size/2, 0, i),
                    new BABYLON.Vector3(size/2, 0, i)
                ]
            }, this.scene);
            zLine.color = new BABYLON.Color3(0.5, 0.5, 0.5); // Gris clair
            
            // Ajout de lignes verticales pour la grille 3D
            const yLine = BABYLON.MeshBuilder.CreateLines("yLine", {
                points: [
                    new BABYLON.Vector3(i, -size/2, i),
                    new BABYLON.Vector3(i, size/2, i)
                ]
            }, this.scene);
            yLine.color = new BABYLON.Color3(0.3, 0.3, 0.3); // Gris plus foncé
            
            lines.push(xLine, zLine, yLine);
        }
    }

    updatePlayerParent() {
        const platforms = this.scene.meshes.filter(mesh => mesh.name === "rotatingPlatform");
        let isOnPlatform = false;
        
        for (let platform of platforms) {
            const worldMatrix = platform.getWorldMatrix();
            const invWorldMatrix = worldMatrix.clone();
            invWorldMatrix.invert();
            
            const localPos = BABYLON.Vector3.TransformCoordinates(
                this.player.position,
                invWorldMatrix
            );
            
            if (Math.abs(localPos.x) <= 1.5 && Math.abs(localPos.z) <= 0.5) {
                this.player.parent = platform;
                isOnPlatform = true;
                break;
            }
        }
        
        if (!isOnPlatform) {
            this.player.parent = null;
        }
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
    }
}