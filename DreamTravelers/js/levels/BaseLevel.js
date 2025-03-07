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
} 