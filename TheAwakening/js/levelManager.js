class LevelManager {
    constructor(gameContainer) {
        this.gameContainer = gameContainer;
        this.currentLevel = null;
        this.platforms = [];
        this.fragments = [];
        this.obstacles = [];
        this.movingPlatforms = [];
    }

    loadLevel(levelData) {
        // Clear previous level
        this.clearLevel();
        
        // Load new level data
        this.currentLevel = levelData;
        
        // Create platforms
        levelData.platforms.forEach(platform => {
            this.createPlatform(platform);
        });
        
        // Create fragments
        levelData.fragments.forEach(fragment => {
            this.createFragment(fragment);
        });
        
        // Create obstacles if they exist
        if (levelData.obstacles) {
            levelData.obstacles.forEach(obstacle => {
                this.createObstacle(obstacle);
            });
        }
        
        // Create moving platforms if they exist
        if (levelData.movingPlatforms) {
            levelData.movingPlatforms.forEach(platform => {
                this.createMovingPlatform(platform);
            });
        }
        
        return levelData.playerStart;
    }

    createPlatform({ x, y, width, height }) {
        const platform = document.createElement('div');
        platform.className = 'platform';
        platform.style.left = `${x}px`;
        platform.style.top = `${y}px`;
        platform.style.width = `${width}px`;
        platform.style.height = `${height}px`;
        this.gameContainer.appendChild(platform);
        this.platforms.push(platform);
    }

    createFragment({ x, y }) {
        const fragment = document.createElement('div');
        fragment.className = 'memory-fragment';
        fragment.style.left = `${x}px`;
        fragment.style.top = `${y}px`;
        this.gameContainer.appendChild(fragment);
        this.fragments.push(fragment);
    }

    createObstacle({ x, y, width, height, type }) {
        const obstacle = document.createElement('div');
        obstacle.className = `obstacle ${type}`;
        obstacle.style.left = `${x}px`;
        obstacle.style.top = `${y}px`;
        obstacle.style.width = `${width}px`;
        obstacle.style.height = `${height}px`;
        this.gameContainer.appendChild(obstacle);
        this.obstacles.push(obstacle);
    }

    createMovingPlatform({ x, y, width, height, movement }) {
        const platform = document.createElement('div');
        platform.className = 'platform moving';
        platform.style.left = `${x}px`;
        platform.style.top = `${y}px`;
        platform.style.width = `${width}px`;
        platform.style.height = `${height}px`;
        this.gameContainer.appendChild(platform);
        
        const movingPlatform = {
            element: platform,
            movement: movement,
            currentPos: movement.axis === 'y' ? y : x
        };
        
        this.movingPlatforms.push(movingPlatform);
    }

    updateMovingPlatforms() {
        this.movingPlatforms.forEach(platform => {
            const { element, movement, currentPos } = platform;
            const { axis, min, max, speed } = movement;
            
            if (axis === 'y') {
                platform.currentPos += speed;
                if (platform.currentPos > max || platform.currentPos < min) {
                    movement.speed *= -1;
                }
                element.style.top = `${platform.currentPos}px`;
            } else {
                platform.currentPos += speed;
                if (platform.currentPos > max || platform.currentPos < min) {
                    movement.speed *= -1;
                }
                element.style.left = `${platform.currentPos}px`;
            }
        });
    }

    clearLevel() {
        // Remove all platforms
        this.gameContainer.classList.remove('background-tutorial');

        this.platforms.forEach(platform => platform.remove());
        this.platforms = [];
        
        // Remove all fragments
        this.fragments.forEach(fragment => fragment.remove());
        this.fragments = [];
        
        // Remove all obstacles
        this.obstacles.forEach(obstacle => obstacle.remove());
        this.obstacles = [];
        
        // Remove all moving platforms
        this.movingPlatforms.forEach(platform => platform.element.remove());
        this.movingPlatforms = [];
    }

    getAllCollisions(playerRect) {
        const collisions = [];

        // Vérifier les collisions avec les plateformes
        for (const platform of this.platforms) {
            const platformRect = platform.getBoundingClientRect();
            if (this.isColliding(playerRect, platformRect)) {
                collisions.push({ type: 'platform', element: platform, rect: platformRect });
            }
        }
        
        // Vérifier les collisions avec les fragments
        for (const fragment of this.fragments) {
            if (fragment.style.display !== 'none') {
                const fragmentRect = fragment.getBoundingClientRect();
                if (this.isColliding(playerRect, fragmentRect)) {
                    collisions.push({ type: 'fragment', element: fragment, rect: fragmentRect });
                }
            }
        }
        
        // Vérifier les collisions avec les obstacles
        for (const obstacle of this.obstacles) {
            const obstacleRect = obstacle.getBoundingClientRect();
            if (this.isColliding(playerRect, obstacleRect)) {
                collisions.push({ type: 'obstacle', element: obstacle, rect: obstacleRect });
            }
        }
        
        return collisions;
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
}