class LevelManager {
    constructor() {
    }

    startLevel(levelId, scene) {
        switch(levelId) {
            case 1:
                this.setupLevel1(scene);
                break;
            case 2:
                this.setupLevel2(scene);
                break;
            case 3:
                this.setupLevel3(scene);
                break;
        }
    }

    setupLevel1(scene) {
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        ground.material = groundMaterial;
    }

    setupLevel2(scene) {
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        ground.material = groundMaterial;
    }

    setupLevel3(scene) {
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        ground.material = groundMaterial;
    }
}
