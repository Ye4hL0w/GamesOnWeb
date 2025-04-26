class RotatingPlatform {
    constructor(scene, position, size) {
        this.scene = scene;
        this.position = position;
        this.size = size;
        this.isRotating = false;
        this.mesh = this.createPlatform();
    }
    
    createPlatform() {
        // Créer une plateforme rotative
        const platform = BABYLON.MeshBuilder.CreateBox("rotatingPlatform", {
            width: 3,
            height: 1,
            depth: 1
        }, this.scene);
        
        platform.position = new BABYLON.Vector3(this.position.x, this.position.y, this.position.z);
        
        // Matériau marron pour la plateforme (couleurs d'origine)
        const platformMaterial = new BABYLON.StandardMaterial("platformMat", this.scene);
        platformMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.1); // Marron
        platform.material = platformMaterial;
        
        // Ajouter un bouton de rotation
        const rotateButton = BABYLON.MeshBuilder.CreateCylinder("rotateButton", {
            height: 0.6,
            diameter: 0.3
        }, this.scene);
        
        rotateButton.position = new BABYLON.Vector3(0, 0.35, 0);
        rotateButton.parent = platform;
        
        // Matériau rouge pour le bouton (couleurs d'origine)
        const buttonMaterial = new BABYLON.StandardMaterial("buttonMat", this.scene);
        buttonMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        buttonMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0); // Ajouter l'émissivité
        rotateButton.material = buttonMaterial;
        
        return platform;
    }
    
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
        
        this.mesh.animations = [];
        this.mesh.animations.push(animation);
        
        this.scene.beginAnimation(this.mesh, 0, 60, false, 1, () => {
            this.isRotating = false;
        });
    }
}
