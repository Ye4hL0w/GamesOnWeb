class Level2 {
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.levelManager = new LevelManager();
        this.isRotating = false;
        this.characterManager = null;
        this.obstacles = [];
        this.createScene();
        
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    async createScene() {
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
        
        // Sol
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 20, height: 20 },
            this.scene
        );
        
        // Initialisation des personnages
        await this.initializeCharacters();
        this.createObstacles();
    }

    startLevel(levelId) {
        this.scene.dispose();
        this.createScene();
        this.levelManager.startLevel(levelId, this.scene);
        this.setupClickHandling();
    }

    setupClickHandling() {
        this.scene.onPointerDown = (evt) => {
            if (this.isRotating) return;

            const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
            if (pickResult.hit && pickResult.pickedMesh.rotatable) {
                this.rotatePlatform(pickResult.pickedMesh);
            }
        };
    }

    rotatePlatform(platform) {
        this.isRotating = true;
        const currentRotation = platform.rotation.y;
        const targetRotation = currentRotation + Math.PI/2;

        const rotateAnimation = new BABYLON.Animation(
            "rotateAnimation",
            "rotation.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyFrames = [
            { frame: 0, value: currentRotation },
            { frame: 30, value: targetRotation }
        ];

        rotateAnimation.setKeys(keyFrames);
        platform.animations = [rotateAnimation];

        this.scene.beginAnimation(platform, 0, 30, false, 1, () => {
            this.isRotating = false;
        });
    }

    async initializeCharacters() {
        this.characterManager = new CharacterManager(this.scene);

        // Chargement du personnage principal
        await this.characterManager.loadCharacter(
            "player",
            "models/characters/player.fbx",
            {
                "idle": "models/animations/idle.fbx"
            }
        );

        // Positionnement du personnage
        const player = this.characterManager.characters.get("player");
        player.position = new BABYLON.Vector3(0, 1, 0);

        // Lancement de l'animation idle
        this.characterManager.playAnimation("player", "idle", true);
    }

    createObstacles() {
        // Création d'obstacles décoratifs
        const createObstacle = (position) => {
            const obstacle = BABYLON.MeshBuilder.CreateBox(
                "obstacle",
                { height: 2, width: 1, depth: 1 },
                this.scene
            );
            obstacle.position = position;
            
            const material = new BABYLON.StandardMaterial("obstacleMat", this.scene);
            material.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.3);
            obstacle.material = material;
            
            this.obstacles.push(obstacle);
        };

        // Ajout d'obstacles à différentes positions
        createObstacle(new BABYLON.Vector3(3, 1, 0));
        createObstacle(new BABYLON.Vector3(-3, 1, 2));
        createObstacle(new BABYLON.Vector3(0, 1, -3));
    }
}