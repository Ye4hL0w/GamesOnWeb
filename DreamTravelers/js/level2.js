class Level2 {
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.player = null;
        this.playerPosition = { x: 0, y: 0, z: 0 };
        
        // Éléments spécifiques au niveau 2
        this.keys = new Set();
        this.switches = new Map();
        this.doors = new Map();
        this.pressurePlates = new Map();
        this.collectibles = new Map();
        this.sequence = [];
        this.requiredSequence = ['switch1', 'switch2', 'switch3'];

        this.createScene();
        
        // Boucle de rendu
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // Gestion du redimensionnement
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
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
        
        // Sol
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 20, height: 20 },
            this.scene
        );
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        ground.material = groundMaterial;

        // Création du joueur
        this.createPlayer();
    }

    createPlayer() {
        this.player = BABYLON.MeshBuilder.CreateSphere("player", {
            diameter: 0.8
        }, this.scene);
        
        this.player.position = new BABYLON.Vector3(0, 0.5, 0);
        
        const playerMaterial = new BABYLON.StandardMaterial("playerMat", this.scene);
        playerMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0.8);
        playerMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0);
        this.player.material = playerMaterial;
    }

    startLevel(levelId) {
        this.createLevel();
    }

    createLevel() {
        this.createDoors();
        this.createSwitches();
        this.createPressurePlates();
        this.createKeys();
        this.createCollectibles();
    }

    // ... Le reste du code reste identique (createDoors, createSwitches, etc.) ...
}