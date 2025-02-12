class CharacterManager {
    constructor(scene) {
        this.scene = scene;
        this.characters = new Map();
        this.animations = new Map();
    }

    async loadCharacter(name, modelUrl, animationUrls = {}) {
        // Chargement du personnage
        const result = await BABYLON.SceneLoader.ImportMeshAsync(
            "", modelUrl, "", this.scene
        );

        const character = result.meshes[0];
        character.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        this.characters.set(name, character);

        // Chargement des animations
        for (const [animName, url] of Object.entries(animationUrls)) {
            await this.loadAnimation(name, animName, url);
        }

        return character;
    }

    async loadAnimation(characterName, animationName, animationUrl) {
        const result = await BABYLON.SceneLoader.ImportAnimationAsync(
            "", animationUrl, "", this.scene
        );
        
        if (!this.animations.has(characterName)) {
            this.animations.set(characterName, new Map());
        }
        
        this.animations.get(characterName).set(animationName, result);
    }

    playAnimation(characterName, animationName, loop = true) {
        const character = this.characters.get(characterName);
        const animation = this.animations.get(characterName).get(animationName);
        
        if (character && animation) {
            this.scene.beginAnimation(character, 0, 100, loop);
        }
    }
} 