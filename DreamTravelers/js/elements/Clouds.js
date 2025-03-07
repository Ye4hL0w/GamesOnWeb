class Clouds {
    constructor(scene) {
        this.scene = scene;
        this.cloudsParent = null;
        this.create();
    }
    
    create() {
        // Créer un parent vide pour faire tourner tous les nuages
        this.cloudsParent = new BABYLON.TransformNode("cloudsParent", this.scene);
        this.cloudsParent.position.y = 8;

        // Créer 4 nuages
        for (let i = 0; i < 4; i++) {
            // Créer un conteneur pour chaque nuage
            const cloudContainer = new BABYLON.TransformNode("cloudContainer", this.scene);
            cloudContainer.parent = this.cloudsParent;
            
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
            this.cloudsParent.rotation.y += 0.002; // Vitesse de rotation
        });
    }
}