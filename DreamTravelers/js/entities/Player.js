class Player {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
        this.mesh = null;
        this.position = { x: 0, y: 0, z: 0 };
        this.pathLine = null;
        this.isMoving = false;
        
        this.createPlayerMesh();
    }
    
    createPlayerMesh() {
        // Charger le modèle Samouraï depuis le fichier FBX
        BABYLON.SceneLoader.ImportMesh("", "models/characters/", "samourai-high.glb", this.scene, (meshes) => {
            // Groupe tous les mesh importés sous un parent
            this.mesh = new BABYLON.Mesh("playerContainer", this.scene);
            
            // Ajout de tous les meshes importés comme enfants du container
            meshes.forEach(mesh => {
                mesh.parent = this.mesh;
            });
            
            // Récupérer les animations disponibles dans le modèle
            this.skeleton = meshes[0].skeleton;
            
            // Charger l'animation de marche séparément
            BABYLON.SceneLoader.ImportAnimations("", "models/animations/", "sans_nom.glb", this.scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, (scene) => {
                console.log("Animation de marche chargée avec succès");
                
                // Récupérer le groupe d'animation
                this.walkAnimation = scene.animationGroups[0];
                
                // Assigner l'animation au skeleton du personnage
                if (this.walkAnimation && this.skeleton) {
                    this.walkAnimation.stop();
                    this.walkAnimation.targetedAnimations.forEach(targetAnim => {
                        // Modifier la cible pour cibler notre skeleton
                        if (targetAnim.target.constructor.name === "Skeleton") {
                            targetAnim.target = this.skeleton;
                        }
                    });
                }
            }, null, (scene, message) => {
                console.error("Erreur lors du chargement de l'animation de marche:", message);
            });
            
            // Ajustement de l'échelle si nécessaire
            
            // Positionner le modèle
            this.mesh.position = new BABYLON.Vector3(
                this.position.x,
                this.position.y + 1,
                this.position.z
            );
            
            // Ajustement de la rotation si nécessaire
            this.mesh.rotation.y = Math.PI; // Orienter le modèle dans la bonne direction
            
            console.log("Modèle Samouraï chargé avec succès");
        }, 
        // Fonction de progression
        null, 
        // Fonction d'erreur
        (scene, message) => {
            console.error("Erreur lors du chargement du modèle Samouraï:", message);
            // Créer une sphère en cas d'échec de chargement du modèle
            this.createFallbackMesh();
        });
    }
    
    // Méthode de secours si le chargement du modèle échoue
    createFallbackMesh() {
        this.mesh = BABYLON.MeshBuilder.CreateSphere("player", {
            diameter: 0.8
        }, this.scene);
        
        const material = new BABYLON.StandardMaterial("playerMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.5, 0.8); // Rose
        material.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0); // Légère lueur
        material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.mesh.material = material;

        this.mesh.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        console.log("Utilisation du mesh de secours (sphère)");
    }
    
    setPosition(x, y, z) {
        this.position = { x, y, z };
        this.mesh.position = new BABYLON.Vector3(x, y + 1, z);
        this.updateParent();
    }
    
    updateParent() {
        if (this._startTime === undefined) {
            this._startTime = performance.now();
        }
        
        const currentTime = performance.now();
        const timeSinceStart = currentTime - this._startTime;
        
        if (timeSinceStart < 500) {
            return;
        }
        
        const platforms = this.scene.meshes.filter(mesh => mesh.name === "rotatingPlatform");
        let isOnPlatform = false;
        
        for (let platform of platforms) {
            const playerWorldPos = this.mesh.getAbsolutePosition();
            
            const worldMatrix = platform.getWorldMatrix();
            const invWorldMatrix = worldMatrix.clone();
            invWorldMatrix.invert();
            
            const localPos = BABYLON.Vector3.TransformCoordinates(
                playerWorldPos,
                invWorldMatrix
            );
            
            const platformSize = platform.metadata?.size || 1.5;
            if (Math.abs(localPos.x) <= platformSize && 
                Math.abs(localPos.z) <= platformSize && 
                Math.abs(localPos.y - 0.5) <= 0.1) {
                
                if (this.mesh.parent !== platform) {
                    const worldPosition = this.mesh.getAbsolutePosition();
                    
                    this.mesh.parent = platform;
                    
                    this.mesh.position = BABYLON.Vector3.TransformCoordinates(
                        worldPosition,
                        invWorldMatrix
                    );
                    
                    console.log("Joueur attaché à la plateforme");
                }
                
                isOnPlatform = true;
                break;
            }
        }
        
        // Si le joueur n'est pas sur une plateforme mais a un parent, détacher
        if (!isOnPlatform && this.mesh.parent) {
            const worldPosition = this.mesh.getAbsolutePosition();
            this.mesh.parent = null;
            this.mesh.position = worldPosition;
            console.log("Joueur détaché de la plateforme");
        }
    }
    
    findPath(target) {
        // Vérification préliminaire - si la cible est identique à la position actuelle, retourner un chemin vide
        if (target.x === this.position.x && target.y === this.position.y && target.z === this.position.z) {
            return [];
        }
        
        // Logs de débogage
        console.log("Position actuelle:", this.position);
        console.log("Position cible:", target);
        
        // Vérification pour empêcher les chemins traversant des vides
        // Cette vérification n'est faite que si les positions sont sur le même axe Y
        if (target.y === this.position.y) {
            const dx = Math.abs(target.x - this.position.x);
            const dz = Math.abs(target.z - this.position.z);
            
            // Si les positions sont alignées sur un axe et à distance > 1
            if ((dx > 1 && dz === 0) || (dz > 1 && dx === 0)) {
                console.log("Vérification de chemin continu sur une ligne droite");
                
                // Détermine les pas entre les positions
                const stepX = dx === 0 ? 0 : (target.x - this.position.x) / dx;
                const stepZ = dz === 0 ? 0 : (target.z - this.position.z) / dz;
                
                // Vérifier chaque point intermédiaire
                let pointsValides = true;
                for (let i = 1; i < Math.max(dx, dz); i++) {
                    const intermediatePos = {
                        x: this.position.x + Math.round(stepX * i),
                        y: this.position.y,
                        z: this.position.z + Math.round(stepZ * i)
                    };
                    
                    // Vérifier si ce point est valide
                    const intermediateKey = `${intermediatePos.x},${intermediatePos.y},${intermediatePos.z}`;
                    const isValid = this.grid.grid[intermediateKey] !== undefined ||
                                    this.grid.isValidPlatformPosition(intermediatePos);
                    
                    if (!isValid) {
                        console.log("Détection d'un vide sur le chemin à la position:", intermediatePos);
                        pointsValides = false;
                        break;
                    }
                }
                
                // Si un point n'est pas valide, retourner un chemin vide
                if (!pointsValides) {
                    console.log("Chemin traversant un vide détecté - mouvement impossible");
                    return [];
                }
            }
        }
        
        // Utiliser le pathfinding normal même pour les sliders
        const gridElements = this.grid.getAllElements();
        
        // Si on monte (y augmente), on utilise la recherche inverse
        if (target.y > this.position.y) {
            console.log("Montée détectée - utilisation de la recherche de chemin inverse");
            const reversePath = this.findDescentPath(target, this.position);
            if (reversePath.length > 0) {
                // Inverser le chemin pour obtenir le chemin de montée
                const ascendingPath = reversePath.reverse();
                console.log("Chemin de montée trouvé:", ascendingPath);
                
                // Vérification supplémentaire pour s'assurer que tous les points ont des coordonnées définies
                for (let i = 0; i < ascendingPath.length; i++) {
                    if (ascendingPath[i] === undefined || 
                        ascendingPath[i].x === undefined || 
                        ascendingPath[i].y === undefined || 
                        ascendingPath[i].z === undefined) {
                        console.error("Chemin invalide détecté à l'index", i, ascendingPath);
                        return []; // Retourner un chemin vide plutôt qu'un chemin avec des points invalides
                    }
                }
                
                // S'assurer que la destination finale est incluse dans le chemin
                const lastPoint = ascendingPath[ascendingPath.length - 1];
                if (lastPoint.x !== target.x || lastPoint.y !== target.y || lastPoint.z !== target.z) {
                    console.log("Ajout explicite de la destination finale au chemin de montée");
                    ascendingPath.push({...target});
                }
                
                return ascendingPath;
            }
            return [];
        }
        
        // Pour la descente, on utilise la recherche normale
        const descendingPath = this.findDescentPath(this.position, target);
        
        // S'assurer que la destination finale est incluse dans le chemin de descente
        if (descendingPath.length > 0) {
            const lastPoint = descendingPath[descendingPath.length - 1];
            if (lastPoint.x !== target.x || lastPoint.y !== target.y || lastPoint.z !== target.z) {
                console.log("Ajout explicite de la destination finale au chemin de descente");
                descendingPath.push({...target});
            }
        }
        
        return descendingPath;
    }
    
    findDescentPath(start, target) {
        const gridElements = this.grid.getAllElements();
        const path = [];
        
        // Verification spéciale pour les escaliers
        // Si on cherche un chemin vers un escalier ou à partir d'un escalier
        const startKey = `${start.x},${start.y},${start.z}`;
        const targetKey = `${target.x},${target.y},${target.z}`;
        const startElement = gridElements[startKey];
        const targetElement = gridElements[targetKey];
        
        // Si la cible est un escalier adjacent au départ
        if (targetElement && targetElement.type === 'stair') {
            const dxToStair = Math.abs(start.x - target.x);
            const dzToStair = Math.abs(start.z - target.z);
            const isStairAdjacent = dxToStair + dzToStair <= 1;
            
            if (isStairAdjacent) {
                console.log("Escalier adjacent détecté comme destination");
                // Si l'escalier a une position suivante, inclure cette position dans le chemin
                if (targetElement.nextPosition) {
                    return [
                        { ...target }, // L'escalier lui-même
                        { ...targetElement.nextPosition } // La position après l'escalier
                    ];
                }
                // Sinon, juste retourner l'escalier comme chemin
                return [{ ...target }];
            }
        }
        
        // Si le départ est un escalier et la cible est sa nextPosition
        if (startElement && startElement.type === 'stair' && startElement.nextPosition) {
            const nextPos = startElement.nextPosition;
            if (nextPos.x === target.x && nextPos.y === target.y && nextPos.z === target.z) {
                console.log("Position après escalier détectée comme destination");
                return [{ ...target }];
            }
        }
        
        // Limiter le nombre d'itérations pour éviter les boucles infinies
        const maxIterations = 100;
        let iterations = 0;
        
        // Utiliser une version simplifiée de A* pour trouver un chemin
        const openSet = [{ ...start, g: 0, h: 0, f: 0, parent: null }];
        const closedSet = new Set();
        
        // Fonction heuristique (distance de Manhattan)
        const heuristic = (a, b) => {
            return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
        };
        
        // Fonction pour vérifier si deux positions sont égales
        const posEqual = (a, b) => {
            return a.x === b.x && a.y === b.y && a.z === b.z;
        };
        
        // Fonction pour obtenir une clé unique pour chaque position
        const posKey = (pos) => `${pos.x},${pos.y},${pos.z}`;
        
        // Fonction pour vérifier si une position est valide
        const isValidMove = (pos) => {
            // Vérification que les coordonnées sont définies
            if (pos === undefined || 
                pos.x === undefined || 
                pos.y === undefined || 
                pos.z === undefined) {
                return false;
            }
            
            // Vérifier les positions standard
            if (this.grid.isValidPosition(pos) || this.grid.isValidPlatformPosition(pos)) {
                return true;
            }
            
            // Vérifier si c'est un escalier
            const posKey = `${pos.x},${pos.y},${pos.z}`;
            const element = gridElements[posKey];
            if (element && element.type === 'stair') {
                return true;
            }
            
            // Vérifier si c'est un slider
            const sliders = this.scene.meshes.filter(mesh => mesh.name === "slider");
            for (const slider of sliders) {
                // Vérifier si la position est sur ou proche d'un slider
                const sliderPos = slider.position;
                const dx = Math.abs(pos.x - Math.round(sliderPos.x));
                const dy = Math.abs(pos.y - Math.round(sliderPos.y));
                const dz = Math.abs(pos.z - Math.round(sliderPos.z));
                
                if (dx <= 0.5 && dy <= 1 && dz <= 0.5) {
                    console.log("Position sur un slider détectée dans le pathfinding:", pos);
                    return true;
                }
            }
            
            return false;
        };
        
        // Obtenir les voisins pour la descente
        const getNeighbors = (pos) => {
            const neighbors = [];
            const currentKey = posKey(pos);
            const currentElement = gridElements[currentKey];
            
            // Directions de base (X et Z sur le même niveau Y)
            const directions = [
                { x: 1, y: 0, z: 0 },
                { x: -1, y: 0, z: 0 },
                { x: 0, y: 0, z: 1 },
                { x: 0, y: 0, z: -1 }
            ];
            
            // Ajouter les voisins de base sur le même niveau Y
            for (const dir of directions) {
                const newPos = {
                    x: pos.x + dir.x,
                    y: pos.y + dir.y,
                    z: pos.z + dir.z
                };
                if (isValidMove(newPos)) {
                    neighbors.push(newPos);
                }
            }
            
            // Si nous sommes sur un escalier, ajouter sa destination comme voisin
            if (currentElement && currentElement.type === 'stair' && currentElement.nextPosition) {
                neighbors.push(currentElement.nextPosition);
                console.log("Position suivante d'escalier ajoutée comme voisin:", currentElement.nextPosition);
            }
            
            // Vérifier si cette position est la destination d'un escalier
            for (const [key, element] of Object.entries(gridElements)) {
                if (element.type === 'stair' && element.nextPosition) {
                    const next = element.nextPosition;
                    if (next.x === pos.x && next.y === pos.y && next.z === pos.z) {
                        const [x, y, z] = key.split(',').map(Number);
                        const stairPos = { x, y, z };
                        neighbors.push(stairPos);
                        console.log("Escalier trouvé comme voisin:", stairPos);
                    }
                }
            }
            
            // Permettre la descente directe si possible
            if (pos.y > target.y) {
                const directionsDescente = [
                    { x: 0, y: -1, z: 0 },   // Descente directe
                    { x: 1, y: -1, z: 0 },   // Descente en diagonale
                    { x: -1, y: -1, z: 0 },  // Descente en diagonale
                    { x: 0, y: -1, z: 1 },   // Descente en diagonale
                    { x: 0, y: -1, z: -1 }   // Descente en diagonale
                ];
                
                for (const dir of directionsDescente) {
                    const posDescente = {
                        x: pos.x + dir.x,
                        y: pos.y + dir.y,
                        z: pos.z + dir.z
                    };
                    
                    if (isValidMove(posDescente)) {
                        neighbors.push(posDescente);
                    }
                }
            }
            
            return neighbors;
        };
        
        // Trouver un chemin en utilisant l'algorithme A*
        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;
            
            // Trier l'ensemble ouvert par coût f
            openSet.sort((a, b) => a.f - b.f);
            
            // Prendre le nœud avec le coût f le plus bas
            const current = openSet.shift();
            
            // Si nous avons atteint la destination
            if (posEqual(current, target)) {
                // Reconstruire le chemin
                let currentNode = current;
                while (currentNode.parent) {
                    path.unshift({
                        x: currentNode.x,
                        y: currentNode.y,
                        z: currentNode.z
                    });
                    currentNode = currentNode.parent;
                }
                
                // S'assurer que la destination finale est incluse dans le chemin reconstruit
                if (path.length === 0 || !posEqual(path[path.length - 1], target)) {
                    path.push({...target});
                }
                
                return path;
            }
            
            // Ajouter le nœud actuel à l'ensemble fermé
            closedSet.add(posKey(current));
            
            // Obtenir les voisins du nœud actuel
            const neighbors = getNeighbors(current);
            
            for (const neighbor of neighbors) {
                // Ignorer les voisins déjà explorés
                if (closedSet.has(posKey(neighbor))) {
                    continue;
                }
                
                // Calculer le coût du mouvement
                const isStairNeighbor = gridElements[posKey(neighbor)]?.type === 'stair';
                const isLevelChange = current.y !== neighbor.y;
                let moveCost = 1;
                
                // Favoriser les escaliers pour les changements de niveau
                if (isLevelChange && isStairNeighbor) {
                    moveCost = 0.5;
                } else if (isLevelChange && !isStairNeighbor) {
                    moveCost = 1.2;
                }
                
                const tentativeG = current.g + moveCost;
                
                // Vérifier si ce voisin est déjà dans l'ensemble ouvert
                const existingNeighbor = openSet.find(n => posEqual(n, neighbor));
                
                if (!existingNeighbor || tentativeG < existingNeighbor.g) {
                    // Ce chemin est meilleur, mettre à jour ou ajouter le voisin
                    const h = heuristic(neighbor, target);
                    
                    if (!existingNeighbor) {
                        openSet.push({
                            ...neighbor,
                            g: tentativeG,
                            h: h,
                            f: tentativeG + h,
                            parent: current
                        });
                    } else {
                        existingNeighbor.g = tentativeG;
                        existingNeighbor.f = tentativeG + h;
                        existingNeighbor.parent = current;
                    }
                }
            }
        }
        
        // Si aucun chemin n'est trouvé, vérifier si on peut atteindre directement la cible
        const distance = Math.abs(start.x - target.x) + Math.abs(start.z - target.z) + Math.abs(start.y - target.y);
        if (distance <= 2 && isValidMove(target)) {
            console.log("Chemin direct utilisé vers la cible à proximité");
            return [{ ...target }];
        }
        
        return [];
    }
    
    moveAlongPath(path) {
        // Vérification plus robuste
        if (!path || path.length === 0) {
            console.log("Tentative de déplacement avec un chemin vide");
            return;
        }
        
        // Vérification supplémentaire pour s'assurer que tous les points ont des coordonnées définies
        for (let i = 0; i < path.length; i++) {
            if (path[i] === undefined || 
                path[i].x === undefined || 
                path[i].y === undefined || 
                path[i].z === undefined) {
                console.error("Point de chemin invalide détecté à l'index", i, path);
                return; // Arrêter le mouvement si un point invalide est détecté
            }
        }
        
        try {
            this.isMoving = true;
            
            // Démarrer l'animation de marche si disponible
            if (this.walkAnimation) {
                this.walkAnimation.start(true, 1.0);
                console.log("Animation de marche démarrée");
            }
            
            // Sauvegarder la position mondiale actuelle
            const worldPos = this.mesh.getAbsolutePosition();
            this.mesh.parent = null;
            this.mesh.position = worldPos;
            
            // Nettoyer la ligne de chemin précédente
            if (this.pathLine) {
                this.pathLine.dispose();
            }
            
            // Préparer les points pour le chemin
            const pathPoints = [this.mesh.position.clone(), ...path.map(pos => new BABYLON.Vector3(
                pos.x,
                pos.y + 1, //------------
                pos.z
            ))];
            
            // Afficher le chemin (optionnel)
            this.pathLine = BABYLON.MeshBuilder.CreateLines("pathLine", {
                points: pathPoints,
                updatable: true
            }, this.scene);
            this.pathLine.color = new BABYLON.Color3(0, 1, 0);
            
            // Si le chemin ne contient qu'un seul point après la position actuelle,
            // utiliser une animation simplifiée sans spline qui pourrait causer des problèmes
            if (path.length === 1) {
                console.log("Utilisation d'une animation simplifiée pour un chemin court");
                const animation = new BABYLON.Animation(
                    "playerMove",
                    "position",
                    60,
                    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                );
                
                const keyframes = [
                    { frame: 0, value: pathPoints[0] },
                    { frame: 60, value: pathPoints[1] }
                ];
                
                animation.setKeys(keyframes);
                
                // Fonction d'easing pour un démarrage et un arrêt en douceur
                const easingFunction = new BABYLON.CircleEase();
                easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                animation.setEasingFunction(easingFunction);
                
                // Appliquer l'animation
                this.mesh.animations = [animation];
                
                // Lancer l'animation
                this.scene.beginAnimation(
                    this.mesh,
                    0,
                    60,
                    false,
                    1.0,
                    () => {
                        // Arrêter l'animation de marche
                        if (this.walkAnimation) {
                            this.walkAnimation.stop();
                        }
                        
                        // Nettoyer après l'animation
                        if (this.pathLine) {
                            this.pathLine.dispose();
                            this.pathLine = null;
                        }
                        
                        // Mettre à jour la position interne
                        this.position = path[path.length - 1];
                        
                        // Mettre à jour le parent (pour les plateformes rotatives)
                        this.updateParent();
                        
                        // Terminer le mouvement
                        this.isMoving = false;
                    }
                );
                
                // Animation de rotation séparée et simplifiée
                this.animateRotationAlongPath(path);
                return;
            }
            
            // Sinon, pour des chemins plus longs, utiliser l'animation avec spline
            // Simplification: un seul mouvement fluide à vitesse constante
            const animationSpeed = 4; // Vitesse de déplacement en unités par seconde
            
            // Calculer la distance totale du chemin
            let totalDistance = 0;
            for (let i = 1; i < pathPoints.length; i++) {
                totalDistance += BABYLON.Vector3.Distance(pathPoints[i-1], pathPoints[i]);
            }
            
            // Calculer la durée totale en fonction de la distance et de la vitesse
            const totalDuration = totalDistance / animationSpeed;
            const totalFrames = Math.ceil(totalDuration * 60); // À 60 FPS
            
            // Créer une animation simplifiée et fluide
            const animation = new BABYLON.Animation(
                "playerMove",
                "position",
                60, // 60 FPS pour plus de fluidité
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            
            // Vérifier à nouveau que tous les points sont valides
            const points = [];
            for (let i = 0; i < pathPoints.length; i++) {
                if (pathPoints[i] && 
                    pathPoints[i].x !== undefined && 
                    pathPoints[i].y !== undefined && 
                    pathPoints[i].z !== undefined) {
                    points.push(new BABYLON.Vector3(
                        pathPoints[i].x,
                        pathPoints[i].y,
                        pathPoints[i].z
                    ));
                } else {
                    console.error("Point de chemin invalide détecté lors de la création de la spline:", i, pathPoints[i]);
                    // Utiliser une approche de secours - aller directement au dernier point valide
                    this.useDirectMovement(path[path.length - 1]);
                    return;
                }
            }
            
            // S'assurer que nous avons suffisamment de points pour créer une spline
            if (points.length < 2) {
                console.error("Pas assez de points valides pour créer une spline");
                // Utiliser une approche de secours
                if (path.length > 0) {
                    this.useDirectMovement(path[path.length - 1]);
                }
                return;
            }
            
            try {
                // Créer une courbe Catmull-Rom pour un mouvement lisse entre les points
                const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 5, false);
                const curvePoints = catmullRom.getPoints();
                
                // Créer les keyframes en répartissant uniformément les points de la courbe
                const keyframes = [];
                const step = curvePoints.length / totalFrames;
                
                for (let i = 0; i <= totalFrames; i++) {
                    const index = Math.min(Math.floor(i * step), curvePoints.length - 1);
                    keyframes.push({
                        frame: i,
                        value: curvePoints[index]
                    });
                }
                
                animation.setKeys(keyframes);
                
                // Fonction d'easing pour un démarrage et un arrêt en douceur
                const easingFunction = new BABYLON.CircleEase();
                easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                animation.setEasingFunction(easingFunction);
                
                // Appliquer l'animation
                this.mesh.animations = [animation];
                
                // Lancer l'animation
                this.scene.beginAnimation(
                    this.mesh,
                    0,
                    totalFrames,
                    false,
                    1.0,
                    () => {
                        // Arrêter l'animation de marche
                        if (this.walkAnimation) {
                            this.walkAnimation.stop();
                            console.log("Animation de marche arrêtée");
                        }
                        
                        // Nettoyer après l'animation
                        if (this.pathLine) {
                            this.pathLine.dispose();
                            this.pathLine = null;
                        }
                        
                        // Mettre à jour la position interne
                        this.position = path[path.length - 1];
                        
                        // Mettre à jour le parent (pour les plateformes rotatives)
                        this.updateParent();
                        
                        // Terminer le mouvement
                        this.isMoving = false;
                    }
                );
                
                // Animation de rotation séparée et simplifiée
                this.animateRotationAlongPath(path);
            } catch (error) {
                console.error("Erreur lors de la création de l'animation spline:", error);
                // Utiliser une approche de secours en cas d'erreur avec la spline
                if (path.length > 0) {
                    this.useDirectMovement(path[path.length - 1]);
                } else {
                    this.isMoving = false;
                }
            }
        } catch (error) {
            // En cas d'erreur, annuler le mouvement et rétablir l'état
            console.error("Erreur lors du déplacement:", error);
            
            // Arrêter l'animation de marche en cas d'erreur
            if (this.walkAnimation) {
                this.walkAnimation.stop();
            }
            
            this.isMoving = false;
            if (this.pathLine) {
                this.pathLine.dispose();
                this.pathLine = null;
            }
        }
    }
    
    // Nouvelle méthode pour un mouvement direct en cas d'erreur
    useDirectMovement(targetPos) {
        console.log("Utilisation d'un mouvement direct vers la cible", targetPos);
        
        const animation = new BABYLON.Animation(
            "playerDirectMove",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keyframes = [
            { frame: 0, value: this.mesh.position.clone() },
            { frame: 60, value: new BABYLON.Vector3(targetPos.x, targetPos.y + 1, targetPos.z) }
        ];
        
        animation.setKeys(keyframes);
        
        // Fonction d'easing pour un démarrage et un arrêt en douceur
        const easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(easingFunction);
        
        // Appliquer l'animation
        this.mesh.animations = [animation];
        
        // Lancer l'animation
        this.scene.beginAnimation(
            this.mesh,
            0,
            60,
            false,
            1.0,
            () => {
                // Arrêter l'animation de marche
                if (this.walkAnimation) {
                    this.walkAnimation.stop();
                }
                
                // Nettoyer après l'animation
                if (this.pathLine) {
                    this.pathLine.dispose();
                    this.pathLine = null;
                }
                
                // Mettre à jour la position interne
                this.position = targetPos;
                
                // Mettre à jour le parent (pour les plateformes rotatives)
                this.updateParent();
                
                // Terminer le mouvement
                this.isMoving = false;
            }
        );
    }
    
    // Nouvelle méthode pour animer la rotation séparément
    animateRotationAlongPath(path) {
        if (!path || path.length < 2) return;
        
        // Points du chemin convertis en Vector3 avec vérification des valeurs undefined
        const points = [];
        for (let i = 0; i < path.length; i++) {
            if (path[i] && path[i].x !== undefined && path[i].y !== undefined && path[i].z !== undefined) {
                points.push(new BABYLON.Vector3(path[i].x, path[i].y, path[i].z));
            }
        }
        
        // S'assurer que nous avons suffisamment de points pour l'animation de rotation
        if (points.length < 2) {
            console.log("Pas assez de points valides pour l'animation de rotation");
            return;
        }
        
        // Position actuelle du joueur
        const startPos = this.mesh.position.clone();
        
        // Rotation actuelle
        let currentRotation = this.mesh.rotation.y;
        
        // Observer la position du joueur pour ajuster la rotation en temps réel
        const observer = this.scene.onBeforeRenderObservable.add(() => {
            if (!this.isMoving) {
                this.scene.onBeforeRenderObservable.remove(observer);
                return;
            }
            
            try {
                // Trouver le segment du chemin le plus proche
                const currentPos = this.mesh.position.clone();
                let closestDistanceSq = Infinity;
                let targetDirection = null;
                
                // Chercher le segment le plus proche
                for (let i = 0; i < points.length - 1; i++) {
                    const segmentStart = new BABYLON.Vector3(points[i].x, 0, points[i].z);
                    const segmentEnd = new BABYLON.Vector3(points[i + 1].x, 0, points[i + 1].z);
                    
                    // Calculer la distance au carré du joueur à ce segment
                    const v = segmentEnd.subtract(segmentStart);
                    const w = currentPos.subtract(segmentStart);
                    
                    const c1 = BABYLON.Vector3.Dot(w, v);
                    if (c1 <= 0) {
                        // Point le plus proche est le début du segment
                        const distSq = BABYLON.Vector3.DistanceSquared(currentPos, segmentStart);
                        if (distSq < closestDistanceSq) {
                            closestDistanceSq = distSq;
                            targetDirection = v;
                        }
                        continue;
                    }
                    
                    const c2 = BABYLON.Vector3.Dot(v, v);
                    if (c2 <= c1) {
                        // Point le plus proche est la fin du segment
                        const distSq = BABYLON.Vector3.DistanceSquared(currentPos, segmentEnd);
                        if (distSq < closestDistanceSq) {
                            closestDistanceSq = distSq;
                            targetDirection = v;
                        }
                        continue;
                    }
                    
                    // Le point le plus proche est sur le segment
                    const b = c1 / c2;
                    const pb = segmentStart.add(v.scale(b));
                    const distSq = BABYLON.Vector3.DistanceSquared(currentPos, pb);
                    
                    if (distSq < closestDistanceSq) {
                        closestDistanceSq = distSq;
                        targetDirection = v;
                    }
                }
                
                // Si nous avons trouvé une direction, tourner progressivement vers elle
                if (targetDirection) {
                    // Normaliser la direction
                    targetDirection.normalize();
                    
                    // Calculer l'angle cible
                    const targetAngle = Math.atan2(targetDirection.x, targetDirection.z);
                    
                    // Tourner progressivement (interpolation)
                    const rotationSpeed = 0.15; // Vitesse de rotation (plus élevée = plus rapide)
                    currentRotation = BABYLON.Scalar.Lerp(currentRotation, targetAngle, rotationSpeed);
                    
                    // Appliquer la rotation
                    this.mesh.rotation.y = currentRotation;
                }
            } catch (error) {
                console.error("Erreur dans l'animation de rotation:", error);
                this.scene.onBeforeRenderObservable.remove(observer);
            }
        });
    }
}
