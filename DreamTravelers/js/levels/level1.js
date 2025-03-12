class Level1 extends BaseLevel {
    constructor() {
        super();
        this.grid = new Grid(this.scene);
        this.player = null;
        this.rotatingPlatforms = [];
        this.isRotating = false;
        this.playerPosition = { x: 0, y: 0, z: 0 };
        this.pathLine = null;
        
        // Système de fragments
        this.fragments = [];
        this.requiredFragments = 3; // Nombre de fragments requis pour ce niveau
        this.collectedFragments = 0;
        
        this.createGridLines(this.grid.gridSize);
        this.clouds = new Clouds(this.scene);
        this.player = new Player(this.scene, this.grid);
        
        this.createLevel();
        
        window.addEventListener("keydown", (evt) => this.handleKeyboard(evt));
        
        // Référencer le niveau dans la scène
        this.scene.level = this;
    }

    startLevel(levelId) {
        this.currentLevel = levelId;
        const levelManager = new LevelManager();
        levelManager.startLevel(levelId, this.scene);
    }

    // Méthode appelée quand un fragment est collecté
    fragmentCollected() {
        this.collectedFragments++;
        console.log(`Fragment collecté! ${this.collectedFragments}/${this.requiredFragments}`);
        
        // Mettre à jour la sortie
        if (this.exit) {
            this.exit.updateFragmentCount(this.collectedFragments);
        }
        
        // Afficher un message
        this.showFragmentMessage();
    }
    
    // Afficher un message de fragment collecté
    showFragmentMessage() {
        const message = document.createElement('div');
        message.className = 'fragment-message';
        message.textContent = `Fragment collecté: ${this.collectedFragments}/${this.requiredFragments}`;
        
        // Styles
        message.style.position = 'fixed';
        message.style.top = '100px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.backgroundColor = 'rgba(0,0,0,0.7)';
        message.style.color = '#FFD700';
        message.style.padding = '10px 20px';
        message.style.borderRadius = '5px';
        message.style.fontFamily = '"Poppins", sans-serif';
        message.style.zIndex = '1000';
        
        document.body.appendChild(message);
        
        // Animation avec GSAP
        if (window.gsap) {
            gsap.fromTo(message, 
                { opacity: 0, y: -20 }, 
                { opacity: 1, y: 0, duration: 0.5 }
            );
            
            gsap.to(message, {
                opacity: 0, 
                y: -20, 
                delay: 2,
                duration: 0.5,
                onComplete: () => {
                    document.body.removeChild(message);
                }
            });
        } else {
            // Fallback sans GSAP
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 500);
            }, 2000);
        }
    }

    handleKeyboard(evt) {
        // Peut-être implémenter des raccourcis clavier ici
    }

    async loadIslandModel() {
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
        baseMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        baseMaterial.alpha = 0.5; // Semi-transparent pour voir la grille en dessous
        base.material = baseMaterial;

        // Ajout de cubes à différentes positions sur le même axe y
        this.grid.addGridElement(2, 0, 0);
        this.grid.addGridElement(1, 0, 0);
        this.grid.addGridElement(0, 0, 0);
        this.grid.addGridElement(-1, 0, 0);
        this.grid.addGridElement(-2, 0, 0);
        this.grid.addGridElement(0, 1, 3);
        this.grid.addGridElement(1, 1, 3);
        this.grid.addGridElement(-1, 1, 3);
        this.grid.addGridElement(-2, 1, 3);
        this.grid.addGridElement(2, 0, 3);
        this.grid.addGridElement(2, 1, 3);
        this.grid.addGridElement(2, 2, 3);
        this.grid.addGridElement(0, 0, -4);
        this.grid.addGridElement(-4, 0, -4);
        this.grid.addGridElement(0, 1, 2);
        this.grid.addGridElement(-2, 0, -2);
        
        // Création d'un escalier pour monter de (0,0,0) à (0,1,2)
        const stairs = new Stairs(this.scene, this.grid);
        stairs.create(0, 1, 1, 0);
        stairs.create(1, 2, 3, 1);

        // Création d'une plateforme rotative
        const platform1 = new RotatingPlatform(this.scene, new BABYLON.Vector3(0, 0, -2), 3);
        this.rotatingPlatforms.push(platform1);
        
        // Autre plateforme rotative
        const platform2 = new RotatingPlatform(this.scene, new BABYLON.Vector3(-2, 0, -4), 2);
        this.rotatingPlatforms.push(platform2);

        // Placer le joueur à la position initiale
        // Forcer une position spécifique en désactivant temporairement le parent
        if (this.player && this.player.mesh) {
            // S'assurer que le joueur n'est pas attaché à une plateforme au démarrage
            this.player.mesh.parent = null;
            this.player.setPosition(0, 0, 0);
            
            // Forcer un delay pour permettre au joueur de s'initialiser correctement
            setTimeout(() => {
                // Double vérification de la position
                if (this.player.mesh && this.player.mesh.parent) {
                    const worldPos = this.player.mesh.getAbsolutePosition();
                    this.player.mesh.parent = null;
                    this.player.mesh.position = worldPos;
                    this.player.mesh.position.x = 0;
                    this.player.mesh.position.z = 0;
                    this.player.position = { x: 0, y: 0, z: 0 };
                    console.log("Position du joueur corrigée:", this.player.mesh.position);
                }
            }, 100);
        }
        
        // Ajouter des fragments à collecter
        this.fragments.push(new Fragment(this.scene, this.grid, {x: -2, y: 0, z: 0}));
        this.fragments.push(new Fragment(this.scene, this.grid, {x: 0, y: 1, z: 3}));
        this.fragments.push(new Fragment(this.scene, this.grid, {x: 0, y: 0, z: -4}));
        
        // Créer la sortie, en spécifiant le nombre de fragments requis
        this.exit = new Exit(this.scene, this.grid, {x: -4, y: 0, z: -4}, 2, this.requiredFragments);
    }
}