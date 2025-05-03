class Level3 extends BaseLevel {
    constructor() {
        super();
        this.grid = new Grid(this.scene);
        this.player = null;
        this.rotatingPlatforms = [];
        this.isRotating = false;
        this.playerPosition = { x: 0, y: 0, z: 0 };
        this.pathLine = null;
        
        this.scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);
        
        // fragments
        this.fragments = [];
        this.requiredFragments = 4;
        this.collectedFragments = 0;
        
        this.createGridLines(this.grid.gridSize);
        
        this.player = new Player(this.scene, this.grid);
        
        this.scene.level = this;
        
        // ajouter les étoiles
        this.createDistantStars();
        
        this.scene.onReadyObservable.addOnce(() => {
            console.log("Scène prête, création du niveau...");
            this.createLevel();

            this.player.setPosition(0, 0, 0);
        });

    }

    startLevel(levelId) {
        this.currentLevel = levelId;
        const levelManager = new LevelManager();
        levelManager.startLevel(levelId, this.scene);
    }

    createLevel() {
        // base principale
        const base = BABYLON.MeshBuilder.CreateBox(
            "base",
            { width: this.grid.gridSize, height: 1, depth: this.grid.gridSize },
            this.scene
        );
        base.position.y = -0.5;
        const baseMaterial = new BABYLON.StandardMaterial("baseMat", this.scene);
        baseMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        baseMaterial.alpha = 0.5;
        base.material = baseMaterial;

        // base circulaire
        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                // cercle (distance au centre ≤ 3)
                if (Math.sqrt(i*i + j*j) <= 3) {
                    this.grid.addGridElement(i, 0, j);
                }
            }
        }

        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                if (Math.sqrt(i*i + j*j) <= 3) {
                    this.grid.addGridElement(i, 4, j);
                }
            }
        }

        this.grid.addGridElement(-5, 0, -5);
        this.grid.addGridElement(5, 0, -5);
        this.grid.addGridElement(-5, 0, 5);
        this.grid.addGridElement(5, 0, 5);



        
        // escalier
        const stairs = new Stairs(this.scene, this.grid);
        //stairs.create(1, 1, 1, 1);
        
        // plateforme rotative
        // const platform1 = new RotatingPlatform(this.scene, new BABYLON.Vector3(2, 0, 0), 2);
        // this.rotatingPlatforms.push(platform1);
        
        this.fragments.push(new Fragment(this.scene, this.grid, {x: -5, y: 0, z: -5}));
        this.fragments.push(new Fragment(this.scene, this.grid, {x: 5, y: 0, z: -5}));
        this.fragments.push(new Fragment(this.scene, this.grid, {x: -5, y: 0, z: 5}));
        this.fragments.push(new Fragment(this.scene, this.grid, {x: 5, y: 0, z: 5}));
        
        this.exit = new Exit(this.scene, this.grid, {x: 0, y: 0, z: 1}, 0, this.requiredFragments);
    }

    createDistantStars() {
        // nombre d'étoiles
        const numStars = 1500;
        
        // rayon
        const radius = 150;
        
        // matériaux
        const starMaterial = new BABYLON.StandardMaterial("starMaterial", this.scene);
        starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        starMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        
        // ajouter une lueur pour augmenter l'intensité lumineuse
        const glowLayer = new BABYLON.GlowLayer("starGlow", this.scene);
        glowLayer.intensity = 1.0;
        
        // créer des étoiles à des positions aléatoires
        for (let i = 0; i < numStars; i++) {
            // créer une petite sphère pour chaque étoile, légèrement plus grande
            const star = BABYLON.MeshBuilder.CreateSphere(
                "star" + i, 
                { diameter: 0.3 }, 
                this.scene
            );
            
            // positionner l'étoile sur une sphère de rayon 'radius'
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            star.position.x = radius * Math.sin(phi) * Math.cos(theta);
            star.position.y = radius * Math.cos(phi);
            star.position.z = radius * Math.sin(phi) * Math.sin(theta);
            
            // appliquer matériau
            star.material = starMaterial;
        }
    }
} 