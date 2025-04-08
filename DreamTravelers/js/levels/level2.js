class Level2 extends BaseLevel {
    constructor() {
        super();
        console.log("Initialisation du niveau 2...");
        
        this.grid = new Grid(this.scene);
        this.player = null;
        this.rotatingPlatforms = [];
        this.isRotating = false;
        this.playerPosition = { x: 0, y: 0, z: 0 };
        this.pathLine = null;
        
        // Assombrir le ciel
        this.scene.clearColor = new BABYLON.Color4(0.3, 0.4, 0.6, 1);
        
        // Initialiser le niveau
        this.createGridLines(this.grid.gridSize);
        // Créer les étoiles qui tournent autour
        this.spinningStars = this.createSpinningStars();
        
        // Créer le joueur et attendre qu'il soit initialisé
        this.player = new Player(this.scene, this.grid);
        this.scene.onReadyObservable.addOnce(() => {
            console.log("Scène prête, création du niveau...");
            this.createLevel();
            this.createSkyEnvironment();
        });
        
        // Ajouter les événements
        this.scene.onPointerDown = (evt) => this.handleClick(evt);
        window.addEventListener("keydown", (evt) => this.handleKeyboard(evt));
    }

    startLevel(levelId) {
        this.currentLevel = levelId;
        const levelManager = new LevelManager();
        levelManager.startLevel(levelId, this.scene);
    }

    handleClick(evt) {
        if (this.player.isMoving) return;
        
        const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        if (pickResult.hit) {
            if (pickResult.pickedMesh.name === "rotateButton") {
                // Trouver la plateforme correspondante
                for (const platform of this.rotatingPlatforms) {
                    if (platform.mesh === pickResult.pickedMesh.parent) {
                        platform.rotate();
                        return;
                    }
                }
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
                
                const path = this.player.findPath(
                    {x: targetPosition.x, y: targetPosition.y, z: targetPosition.z}
                );
                
                if (path) {
                    this.player.moveAlongPath(path);
                }
            }
        }
    }

    handleKeyboard(evt) {
        // À implémenter si nécessaire
    }
    

    createLevel() {
        // Base principale
        const base = BABYLON.MeshBuilder.CreateBox(
            "base",
            { width: this.grid.gridSize, height: 1, depth: this.grid.gridSize },
            this.scene
        );
        base.position.y = -0.5;
        const baseMaterial = new BABYLON.StandardMaterial("baseMat", this.scene);
        baseMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9); // Blanc cassé
        baseMaterial.alpha = 0.9; // Presque opaque
        base.material = baseMaterial;

        // Niveau 2 : Géométrie différente
        this.grid.addGridElement(-2, 0, 0);
        this.grid.addGridElement(-1, 0, 0);
        this.grid.addGridElement(0, 0, 0);
        this.grid.addGridElement(1, 0, 0);
        this.grid.addGridElement(2, 0, 0);
        
        this.grid.addGridElement(2, 0, 1);
        this.grid.addGridElement(-2, 0, 1);

        this.grid.addGridElement(2, 0, 2);
        this.grid.addGridElement(-2, 0, 2);

        this.grid.addGridElement(-2, 0, 3);
        this.grid.addGridElement(2, 0, 3);

        this.grid.addGridElement(-2, 0, 4);
        this.grid.addGridElement(2, 0, 4);
        this.grid.addGridElement(-1, 0, 4);
        this.grid.addGridElement(0, 0, 4)
        this.grid.addGridElement(1, 0, 4);

        this.grid.addGridElement(0, 0, -1);
        this.grid.addGridElement(0, 0, -2);
        this.grid.addGridElement(0, 0, -3);
        this.grid.addGridElement(0, 0, -4);

        
        const stairs = new Stairs(this.scene, this.grid);
        stairs.create(-1, 1, 3, 1);

        this.grid.addGridElement(0, 1, 3);
        this.grid.addGridElement(1, 1, 3);

        stairs.create(1, 2, 2, 2);

        this.grid.addGridElement(1, 2, 1);

        stairs.create(0, 3, 1, 3);

        this.grid.addGridElement(-1, 3, 1);

        stairs.create(-1, 4, 2, 4);

        this.grid.addGridElement(-1, 4, 3);

        stairs.create(0, 5, 3, 1);

        this.grid.addGridElement(1, 5, 3);

        stairs.create(1, 6, 2, 2);
        
        this.grid.addGridElement(0, 6, 2);


        // Placer le joueur à la position initiale
        this.player.setPosition(0, 0, -4);
        
        // Créer la sortie du niveau - NextLevelId = 3 (niveau suivant)
        this.exit = new Exit(this.scene, this.grid, {x: 0, y: 6, z: 2}, 3);
    }

    createSkyEnvironment() {
        console.log("Création de l'environnement céleste...");
        
        // Configurer le ciel pour un aspect plus lumineux
        this.scene.clearColor = new BABYLON.Color4(0.6, 0.8, 0.9, 1); // Bleu ciel clair
        
        // Créer plus de nuages autour de la plateforme
        this.createSurroundingClouds();
        
        // Créer un effet de brume légère
        const fogLayer = new BABYLON.FogLayer("fogLayer", this.scene);
        fogLayer.color = new BABYLON.Color3(0.9, 0.9, 1.0);
        fogLayer.density = 0.01;
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.01;
        this.scene.fogColor = new BABYLON.Color3(0.9, 0.9, 1.0);
        
        // Lumière directionnelle pour simuler le soleil
        const sunLight = new BABYLON.DirectionalLight("sunLight", new BABYLON.Vector3(-1, -2, 1), this.scene);
        sunLight.intensity = 1.2;
        sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8); // Lumière légèrement dorée
        
        console.log("Création de l'environnement céleste terminée.");
    }
    
    createSurroundingClouds() {
        // Positions pour les nuages entourant la plateforme
        const cloudPositions = [
            { x: -15, y: -5, z: -15, scale: 3.0 },
            { x: -20, y: -7, z: 0, scale: 4.2 },
            { x: -15, y: -6, z: 15, scale: 3.5 },
            { x: 0, y: -8, z: 20, scale: 5.0 },
            { x: 15, y: -6, z: 15, scale: 3.7 },
            { x: 20, y: -7, z: 0, scale: 4.0 },
            { x: 15, y: -5, z: -15, scale: 3.2 },
            { x: 0, y: -6, z: -20, scale: 4.5 },
            { x: -10, y: -10, z: -10, scale: 6.0 },
            { x: 10, y: -9, z: 10, scale: 5.5 }
        ];
        
        // Matériau pour les nuages
        const cloudMaterial = new BABYLON.StandardMaterial("cloudMat", this.scene);
        cloudMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // Blanc
        cloudMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Légèrement lumineux
        cloudMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // Pas de spéculaire
        cloudMaterial.alpha = 0.85; // Semi-transparent
        
        // Créer des nuages volumétriques
        cloudPositions.forEach((pos, index) => {
            // Créer un groupe pour ce nuage
            const cloudGroup = new BABYLON.TransformNode("largeCloudGroup" + index, this.scene);
            
            // Nombre aléatoire de parties pour chaque nuage
            const parts = Math.floor(Math.random() * 5) + 8; // 8-12 parties par nuage
            
            for (let i = 0; i < parts; i++) {
                // Créer une forme pour chaque partie du nuage
                const cloudPart = BABYLON.MeshBuilder.CreateSphere(
                    "cloudPart" + index + "_" + i,
                    {
                        diameter: (0.8 + Math.random() * 1.5) * pos.scale,
                        segments: 8
                    },
                    this.scene
                );
                
                // Position aléatoire autour du centre
                const offset = 1.5 * pos.scale;
                cloudPart.position = new BABYLON.Vector3(
                    pos.x + (Math.random() - 0.5) * offset,
                    pos.y + (Math.random() - 0.5) * (offset * 0.3),
                    pos.z + (Math.random() - 0.5) * offset
                );
                
                cloudPart.material = cloudMaterial.clone("cloudMat" + index + "_" + i);
                cloudPart.material.alpha = 0.7 + Math.random() * 0.2; // Variété dans la transparence
                
                // Rattacher au groupe
                cloudPart.parent = cloudGroup;
            }
            
            // Animation lente pour les nuages (mouvement léger de haut en bas)
            const amplitude = 0.2 * pos.scale;
            const speed = 0.001 + Math.random() * 0.002;
            let time = Math.random() * 100; // Décalage aléatoire pour que tous ne bougent pas en synchronisation
            
            this.scene.registerBeforeRender(() => {
                time += speed;
                cloudGroup.position.y = Math.sin(time) * amplitude;
            });
        });
    }

    createSpinningStars() {
        // Créer un parent vide pour faire tourner toutes les étoiles
        const starsParent = new BABYLON.TransformNode("starsParent", this.scene);
        starsParent.position.y = 8;
        
        // Créer 4 étoiles
        for (let i = 0; i < 4; i++) {
            // Créer un conteneur pour chaque étoile
            const starContainer = new BABYLON.TransformNode("starContainer", this.scene);
            starContainer.parent = starsParent;
            
            // Positionner le conteneur en cercle
            const angle = (i * Math.PI * 2) / 4;
            starContainer.position = new BABYLON.Vector3(
                Math.cos(angle) * 12, // Rayon plus grand que les nuages
                0,
                Math.sin(angle) * 12
            );
            
            // Créer une étoile (utiliser un polyèdre)
            const starMesh = BABYLON.MeshBuilder.CreatePolyhedron(
                "starMesh",
                { type: 2, size: 0.5 + Math.random() * 0.5 }, // Type 2 est un dodécaèdre
                this.scene
            );
            starMesh.parent = starContainer;
            
            // Matériau lumineux pour l'étoile
            const starMaterial = new BABYLON.StandardMaterial("starMaterial", this.scene);
            starMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0.8); // Jaune clair
            starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.6); // Lumineux
            starMaterial.specularColor = new BABYLON.Color3(1, 1, 1); // Brillant
            starMaterial.alpha = 0.9;
            
            // Ajouter un effet de brillance
            const glowLayer = new BABYLON.GlowLayer("starGlow", this.scene);
            glowLayer.intensity = 0.5;
            glowLayer.addIncludedOnlyMesh(starMesh);
            
            starMesh.material = starMaterial;
            
            // Ajouter une animation de rotation locale pour l'étoile
            this.scene.registerBeforeRender(() => {
                starMesh.rotation.y += 0.01;
                starMesh.rotation.x += 0.005;
            });
            
            // Ajouter quelques petites étoiles autour de l'étoile principale
            for (let j = 0; j < 3; j++) {
                const smallStar = BABYLON.MeshBuilder.CreatePolyhedron(
                    "smallStar",
                    { type: 2, size: 0.15 + Math.random() * 0.1 },
                    this.scene
                );
                smallStar.parent = starContainer;
                
                // Position aléatoire autour de l'étoile principale
                smallStar.position = new BABYLON.Vector3(
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 1.5
                );
                
                // Matériau pour les petites étoiles
                const smallStarMat = new BABYLON.StandardMaterial("smallStarMat", this.scene);
                smallStarMat.diffuseColor = new BABYLON.Color3(1, 1, 0.9);
                smallStarMat.emissiveColor = new BABYLON.Color3(1, 1, 0.7);
                smallStarMat.alpha = 0.8;
                smallStar.material = smallStarMat;
                
                // Animation de pulsation pour les petites étoiles
                let pulse = 0;
                this.scene.registerBeforeRender(() => {
                    pulse += 0.03;
                    smallStar.scaling.x = smallStar.scaling.y = smallStar.scaling.z = 
                        0.9 + Math.sin(pulse) * 0.2;
                });
            }
        }
        
        // Animation de rotation pour l'ensemble des étoiles
        this.scene.registerBeforeRender(() => {
            starsParent.rotation.y += 0.001; // Rotation plus lente que les nuages
        });
        
        return starsParent;
    }
}