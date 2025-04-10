class Slider {
    constructor(scene, position, axis, minValue, maxValue) {
        this.scene = scene;
        this.position = position;
        this.axis = axis.toLowerCase(); // 'x', 'y' ou 'z'
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.isDragging = false;
        this.playerOnSlider = null;
        
        // Création du mesh
        this.createMesh();
        
        // Ajout des événements
        this.setupEvents();
    }
    
    createMesh() {
        // Créer la plateforme slider
        this.mesh = BABYLON.MeshBuilder.CreateBox(
            "slider", 
            { width: 2, height: 0.5, depth: 2 }, 
            this.scene
        );
        
        // Positionnement initial
        this.mesh.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        console.log(`Slider créé à la position (${this.position.x}, ${this.position.y}, ${this.position.z})`);
        
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
        
        // Ajouter une flèche directionnelle
        this.addDirectionArrow();
        
        // Ajouter une légère animation pour attirer l'attention
        let animationTime = 0;
        this.scene.registerBeforeRender(() => {
            animationTime += 0.01;
            this.mesh.position.y = this.position.y + Math.sin(animationTime) * 0.05;
        });
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
        
        // Remplacer les gestionnaires d'événements de la scène
        this.scene.onPointerDown = (evt, pickResult) => {
            // Vérifier d'abord si c'est le slider qui est cliqué
            if (pickResult.hit && pickResult.pickedMesh === this.mesh) {
                console.log("Slider cliqué");
                this.startDragging();
                return; // Ne pas continuer
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
        
        // Vérifier régulièrement si le joueur est sur le slider
        this.scene.registerBeforeRender(() => {
            this.checkPlayerOnSlider();
        });
    }
    
    startDragging() {
        this.isDragging = true;
        // Changer l'apparence du slider pour indiquer qu'il est sélectionné
        this.mesh.material = this.highlightMaterial;
    }
    
    stopDragging() {
        this.isDragging = false;
        // Revenir à l'apparence normale
        const material = new BABYLON.StandardMaterial("sliderMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.1, 0.4, 1.0);
        material.emissiveColor = new BABYLON.Color3(0.0, 0.2, 0.5);
        material.specularColor = new BABYLON.Color3(1, 1, 1);
        this.mesh.material = material;
    }
    
    updateSliderPosition(evt) {
        if (!this.isDragging) return;
        
        // Récupérer la direction du mouvement de la souris
        const movementX = evt.movementX || 0;
        const movementY = evt.movementY || 0;
        
        // Facteur de sensibilité
        const sensitivity = 0.01;
        
        // Position actuelle du slider
        const oldPosition = this.mesh.position.clone();
        let newPosition = oldPosition.clone();
        
        // Calculer la nouvelle position selon l'axe
        if (this.axis === 'x') {
            newPosition.x += movementX * sensitivity;
            newPosition.x = Math.max(this.minValue, Math.min(this.maxValue, newPosition.x));
        } else if (this.axis === 'y') {
            newPosition.y -= movementY * sensitivity; // Inverser Y car l'écran est inversé
            newPosition.y = Math.max(this.minValue, Math.min(this.maxValue, newPosition.y));
        } else if (this.axis === 'z') {
            newPosition.z += movementX * sensitivity; // Utiliser X pour déplacer Z
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
        
        // Récupérer les dimensions
        const sliderBounds = {
            minX: this.mesh.position.x - 1, // width/2
            maxX: this.mesh.position.x + 1,
            minY: this.mesh.position.y,
            maxY: this.mesh.position.y + 0.5,
            minZ: this.mesh.position.z - 1, // depth/2
            maxZ: this.mesh.position.z + 1
        };
        
        // Vérifier si le joueur est sur le slider
        const playerFeet = playerMesh.position.y - 0.5; // Approximation des pieds du joueur
        
        if (playerMesh.position.x >= sliderBounds.minX && 
            playerMesh.position.x <= sliderBounds.maxX &&
            playerMesh.position.z >= sliderBounds.minZ && 
            playerMesh.position.z <= sliderBounds.maxZ &&
            Math.abs(playerFeet - sliderBounds.maxY) < 0.1) {
            
            // Le joueur est sur le slider
            this.playerOnSlider = player;
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
} 