class RotatingPlatform {
    constructor(scene, position, size) {
        this.scene = scene;
        this.position = position;
        this.size = size;
        this.isRotating = false;
        this.mesh = this.createPlatform();
        
        // État de rotation (0 = initial, 1 = 90°, 2 = 180°, 3 = 270°)
        this.rotationState = 0;
        
        // Positions valides sur la plateforme, selon l'état de rotation
        // Format: {worldX, worldY, worldZ}
        this.validPositions = [];
        
        // Initialisation des positions valides
        this.updateValidPositions();
        
        // Enregistrer cette plateforme dans la scène
        if (!scene.rotatingPlatforms) {
            scene.rotatingPlatforms = [];
        }
        scene.rotatingPlatforms.push(this);
    }
    
    createPlatform() {
        // Créer la plateforme rotative
        const platform = BABYLON.MeshBuilder.CreateBox("rotatingPlatform", {
            width: 3,
            height: 1,
            depth: 1
        }, this.scene);
        
        platform.position = new BABYLON.Vector3(this.position.x, this.position.y, this.position.z);
        
        // Stocker une référence à cette instance dans le mesh
        platform.platformInstance = this;
        
        // Matériau
        const platformMaterial = new BABYLON.StandardMaterial("platformMat", this.scene);
        platformMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.1);
        platform.material = platformMaterial;
        
        // Bouton de rotation
        const rotateButton = BABYLON.MeshBuilder.CreateCylinder("rotateButton", {
            height: 0.6,
            diameter: 0.3
        }, this.scene);
        
        rotateButton.position = new BABYLON.Vector3(0, 0.35, 0);
        rotateButton.parent = platform;
        
        // Matériau du bouton
        const buttonMaterial = new BABYLON.StandardMaterial("buttonMat", this.scene);
        buttonMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        buttonMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        rotateButton.material = buttonMaterial;
        
        return platform;
    }
    
    // Mettre à jour les positions valides en fonction de l'état de rotation actuel
    updateValidPositions() {
        this.validPositions = [];
        
        // Position centrale (toujours valide)
        this.validPositions.push({
            x: this.position.x, 
            y: this.position.y, 
            z: this.position.z
        });
        
        // Positions des extrémités selon l'état de rotation
        if (this.rotationState % 2 === 0) {
            // État 0 ou 2 (horizontal sur l'axe X)
            this.validPositions.push({
                x: this.position.x - 1, 
                y: this.position.y, 
                z: this.position.z
            });
            this.validPositions.push({
                x: this.position.x + 1, 
                y: this.position.y, 
                z: this.position.z
            });
        } else {
            // État 1 ou 3 (horizontal sur l'axe Z)
            this.validPositions.push({
                x: this.position.x, 
                y: this.position.y, 
                z: this.position.z - 1
            });
            this.validPositions.push({
                x: this.position.x, 
                y: this.position.y, 
                z: this.position.z + 1
            });
        }
        
        console.log(`Plateforme à [${this.position.x}, ${this.position.y}, ${this.position.z}] - État ${this.rotationState}`);
        console.log("Positions valides:", this.validPositions);
    }
    
    // Vérifier si une position est valide sur cette plateforme
    isPositionValid(position) {
        for (const validPos of this.validPositions) {
            // Utiliser un seuil de tolérance pour la comparaison
            if (Math.abs(position.x - validPos.x) < 0.1 && 
                Math.abs(position.y - validPos.y) < 0.1 && 
                Math.abs(position.z - validPos.z) < 0.1) {
                return true;
            }
        }
        return false;
    }
    
    // Obtenir la position valide la plus proche d'une position donnée
    getNearestValidPosition(position) {
        let closestPos = null;
        let minDistance = Infinity;
        
        for (const validPos of this.validPositions) {
            const distance = Math.sqrt(
                Math.pow(position.x - validPos.x, 2) +
                Math.pow(position.y - validPos.y, 2) +
                Math.pow(position.z - validPos.z, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPos = validPos;
            }
        }
        
        return {
            position: closestPos,
            distance: minDistance
        };
    }
    
    // Faire tourner la plateforme
    rotate() {
        if (this.isRotating) return;
        
        this.isRotating = true;
        
        const currentRotation = this.mesh.rotation.y;
        const targetRotation = currentRotation + Math.PI/2;
        
        const animation = new BABYLON.Animation(
            "rotateAnimation",
            "rotation.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keyFrames = [
            { frame: 0, value: currentRotation },
            { frame: 60, value: targetRotation }
        ];
        
        animation.setKeys(keyFrames);
        
        this.mesh.animations = [];
        this.mesh.animations.push(animation);
        
        this.scene.beginAnimation(this.mesh, 0, 60, false, 1, () => {
            this.isRotating = false;
            
            // Mettre à jour l'état de rotation
            this.rotationState = (this.rotationState + 1) % 4;
            
            // Mettre à jour les positions valides
            this.updateValidPositions();
            
            // Mise à jour de la grille pour le pathfinding
            if (this.scene.level && this.scene.level.grid) {
                console.log("Mise à jour de la grille après rotation");
            }
            
            // Notifier les joueurs sur la plateforme
            const playersOnPlatform = [];
            
            // Trouver tous les joueurs qui ont cette plateforme comme parent
            for (const node of this.scene.meshes) {
                if (node.name === "playerContainer" && node.parent === this.mesh) {
                    const player = node.playerInstance;
                    if (player) {
                        playersOnPlatform.push(player);
                        
                        // Mettre à jour la position interne du joueur
                        const worldPos = player.mesh.getAbsolutePosition();
                        player.position.x = Math.round(worldPos.x);
                        player.position.y = Math.round(worldPos.y);
                        player.position.z = Math.round(worldPos.z);
                        
                        console.log("Position du joueur mise à jour après rotation:", player.position);
                    }
                }
            }
            
            console.log(`${playersOnPlatform.length} joueur(s) sur la plateforme après rotation`);
        });
    }
}
