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
        
        // Vérification rapide si la destination est accessible
        const targetKey = `${target.x},${target.y},${target.z}`;
        const gridElements = this.grid.getAllElements();
        const targetElement = gridElements[targetKey];
        
        // CORRECTION: Vérifier si la destination est un escalier
        const isStair = targetElement && targetElement.type === 'stair';
        
        if (target.y > this.position.y) {
            console.log("Tentative de monter à un niveau supérieur (y = " + target.y + ")");
            
            // Rechercher des positions "accessibles par proximité" au niveau cible
            // Ces positions peuvent être atteintes directement depuis le niveau actuel
            const positionsCibles = [];
            
            // Parcourir toutes les positions valides au niveau cible (y=target.y)
            for (const [key, element] of Object.entries(gridElements)) {
                const [x, y, z] = key.split(',').map(Number);
                
                // Si cette position est au niveau cible
                if (y === target.y) {
                    // Vérifier si cette position est atteignable directement par proximité
                    // (c'est-à-dire située juste au-dessus d'une position du niveau actuel)
                    for (const [baseKey, baseElement] of Object.entries(gridElements)) {
                        const [baseX, baseY, baseZ] = baseKey.split(',').map(Number);
                        
                        if (baseY === this.position.y) {
                            const horizontalDistance = Math.abs(baseX - x) + Math.abs(baseZ - z);
                            
                            // Si cette position du niveau supérieur est proche horizontalement
                            // d'une position du niveau actuel, elle est potentiellement accessible
                            if (horizontalDistance <= 2) {
                                positionsCibles.push({
                                    position: {x, y, z},
                                    basePosition: {x: baseX, y: baseY, z: baseZ},
                                    distance: Math.abs(this.position.x - baseX) + Math.abs(this.position.z - baseZ) + horizontalDistance
                                });
                                console.log("Position atteignable au niveau supérieur:", {x, y, z}, "depuis", {x: baseX, y: baseY, z: baseZ});
                            }
                        }
                    }
                }
            }
            
            console.log("Nombre de positions atteignables au niveau supérieur:", positionsCibles.length);
            
            // Si on a trouvé des positions potentiellement accessibles au niveau supérieur
            if (positionsCibles.length > 0) {
                // Trier par distance totale (distance jusqu'à la base + proximité à la cible)
                positionsCibles.sort((a, b) => {
                    // Calculer aussi la distance à la cible finale
                    const distanceACible = Math.abs(a.position.x - target.x) + Math.abs(a.position.z - target.z);
                    const distanceBCible = Math.abs(b.position.x - target.x) + Math.abs(b.position.z - target.z);
                    
                    return (a.distance + distanceACible) - (b.distance + distanceBCible);
                });
                
                // Utiliser la position la plus pertinente
                const meilleurPoint = positionsCibles[0];
                console.log("Meilleur point d'accès au niveau supérieur:", meilleurPoint.position, "via", meilleurPoint.basePosition);
                
                // 1. Trouver un chemin vers la position de base au niveau actuel
                const cheminVersBase = [];
                
                // Utiliser l'algorithme A* existant mais limité au niveau actuel
                const path = [];
                const start = this.position;
                const baseTarget = meilleurPoint.basePosition;
                
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
                
                // Fonction pour vérifier si une position est valide (au niveau actuel uniquement)
                const isValidMove = (pos) => {
                    // Vérifier que la position est au même niveau Y
                    if (pos.y !== this.position.y) return false;
                    
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
                    
                    return false;
                };
                
                // Obtenir les voisins sur le même niveau Y uniquement
                const getNeighborsOnSameLevel = (pos) => {
                    const neighbors = [];
                    
                    // Directions de base (X et Z sur le même niveau Y)
                    const directions = [
                        { x: 1, y: 0, z: 0 },
                        { x: -1, y: 0, z: 0 },
                        { x: 0, y: 0, z: 1 },
                        { x: 0, y: 0, z: -1 }
                    ];
                    
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
                    
                    return neighbors;
                };
                
                // Trouver un chemin en utilisant l'algorithme A*
                while (openSet.length > 0 && iterations < maxIterations) {
                    iterations++;
                    
                    // Trier l'ensemble ouvert par coût f
                    openSet.sort((a, b) => a.f - b.f);
                    
                    // Prendre le nœud avec le coût f le plus bas
                    const current = openSet.shift();
                    
                    // Si nous avons atteint la position de base
                    if (posEqual(current, baseTarget)) {
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
                        
                        console.log("Chemin trouvé vers la position de base:", path);
                        
                        // 2. Créer le chemin complet: chemin vers base + monter + aller à la cible
                        const cheminComplet = [
                            ...path,  // Aller à la position de base au niveau actuel
                            meilleurPoint.position,  // Monter au niveau supérieur
                            target  // Aller à la cible finale
                        ];
                        
                        return cheminComplet;
                    }
                    
                    // Ajouter le nœud actuel à l'ensemble fermé
                    closedSet.add(posKey(current));
                    
                    // Obtenir les voisins du nœud actuel
                    const neighbors = getNeighborsOnSameLevel(current);
                    
                    for (const neighbor of neighbors) {
                        // Ignorer les voisins déjà explorés
                        if (closedSet.has(posKey(neighbor))) {
                            continue;
                        }
                        
                        const tentativeG = current.g + 1;
                        
                        // Vérifier si ce voisin est déjà dans l'ensemble ouvert
                        const existingNeighbor = openSet.find(n => posEqual(n, neighbor));
                        
                        if (!existingNeighbor || tentativeG < existingNeighbor.g) {
                            // Ce chemin est meilleur, mettre à jour ou ajouter le voisin
                            const h = heuristic(neighbor, baseTarget);
                            
                            if (!existingNeighbor) {
                                // Ajouter à l'ensemble ouvert
                                openSet.push({
                                    ...neighbor,
                                    g: tentativeG,
                                    h: h,
                                    f: tentativeG + h,
                                    parent: current
                                });
                            } else {
                                // Mettre à jour le voisin existant
                                existingNeighbor.g = tentativeG;
                                existingNeighbor.f = tentativeG + h;
                                existingNeighbor.parent = current;
                            }
                        }
                    }
                }
                
                console.log("Aucun chemin trouvé vers la position de base");
            }
        }
        
        // On conserve le cas spécial existant pour monter directement si c'est à proximité
        if (this.position.y === 0 && target.y === 1) {
            console.log("Tentative de monter directement au niveau supérieur");
            
            // Vérifier si la cible est adjacente horizontalement à la position actuelle
            const dx = Math.abs(this.position.x - target.x);
            const dz = Math.abs(this.position.z - target.z);
            
            // Si la distance horizontale est raisonnable, permettre la montée
            if (dx + dz <= 2) {
                console.log("Montée directe au niveau supérieur autorisée");
                return [target];
            }
        }
        
        // NOUVEAU: Cas spécial pour permettre de descendre au niveau du sol (y = 0)
        if (this.position.y === 1 && target.y === 0) {
            console.log("Tentative de descendre au niveau du sol");
            
            // Vérifier si la cible est adjacente horizontalement à la position actuelle
            const dx = Math.abs(this.position.x - target.x);
            const dz = Math.abs(this.position.z - target.z);
            
            // Si la distance horizontale est raisonnable, permettre la descente
            if (dx + dz <= 2) {
                console.log("Descente directe au niveau du sol autorisée");
                return [target];
            }
        }
        
        // CORRECTION: Cas spécial pour un clic direct sur un escalier
        if (isStair) {
            // Vérifier si l'escalier est adjacent au joueur (horizontalement)
            const dx = Math.abs(this.position.x - target.x);
            const dz = Math.abs(this.position.z - target.z);
            const isAdjacent = (dx + dz) <= 1;
            
            if (isAdjacent) {
                console.log("Déplacement direct vers l'escalier adjacent");
                return [target];
            }
            
            // Vérifier si le joueur est à la position suivante de l'escalier (pour la descente)
            if (targetElement.nextPosition) {
                const nextPos = targetElement.nextPosition;
                if (this.position.x === nextPos.x && 
                    this.position.y === nextPos.y && 
                    this.position.z === nextPos.z) {
                    console.log("Descente directe de l'escalier");
                    return [target];
                }
            }
        }
        
        // Si la cible n'est pas une position valide, une position de plateforme valide, ou un escalier, retourner un chemin vide
        if (!isStair && !this.grid.isValidPosition(target) && !this.grid.isValidPlatformPosition(target)) {
            console.log("Destination inaccessible: position non valide");
            return [];
        }
        
        // CORRECTION: Vérifier s'il s'agit d'un cas spécial d'adjacence d'escalier
        for (const [key, element] of Object.entries(gridElements)) {
            if (element.type === 'stair' && element.nextPosition) {
                // Si la cible est la position suivante d'un escalier adjacent au joueur
                const [stairX, stairY, stairZ] = key.split(',').map(Number);
                const isStairAdjacent = Math.abs(this.position.x - stairX) + 
                                        Math.abs(this.position.z - stairZ) <= 1;
                
                if (isStairAdjacent && 
                    target.x === element.nextPosition.x && 
                    target.y === element.nextPosition.y && 
                    target.z === element.nextPosition.z) {
                    console.log("Utilisation d'un escalier pour atteindre la cible");
                    return [
                        { x: stairX, y: stairY, z: stairZ },
                        target
                    ];
                }
            }
        }
        
        const path = [];
        const start = this.position;
        
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
        
        // CORRECTION: Fonction pour vérifier si une position est valide
        const isValidMove = (pos) => {
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
            
            return false;
        };
        
        // CORRECTION: Obtenir les voisins
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
            
            // Vérifier si cette position est la destination d'un escalier (pour descendre)
            for (const [key, element] of Object.entries(gridElements)) {
                if (element.type === 'stair' && element.nextPosition) {
                    const next = element.nextPosition;
                    if (next.x === pos.x && next.y === pos.y && next.z === pos.z) {
                        // Extraire les coordonnées de l'escalier
                        const [x, y, z] = key.split(',').map(Number);
                        
                        // Ajouter l'escalier comme voisin pour permettre la descente
                        const descensoEscalier = { x, y, z };
                        neighbors.push(descensoEscalier);
                        console.log("Escalier descendant trouvé: de", pos, "vers", descensoEscalier);
                    }
                }
            }
            
            // NOUVEAU: Trouver tous les escaliers adjacents
            // Si le niveau de destination est différent (ex: y=1 alors que nous sommes à y=0)
            // chercher activement des escaliers qui pourraient nous y mener
            if (target.y !== pos.y) {
                console.log("Recherche d'escaliers pour changer de niveau y:", pos.y, "->", target.y);
                
                // Recherche d'escaliers proches
                for (const [key, element] of Object.entries(gridElements)) {
                    if (element.type === 'stair') {
                        // Extraire les coordonnées de l'escalier
                        const [x, y, z] = key.split(',').map(Number);
                        
                        // Distance horizontale à l'escalier
                        const distanceHorizontale = Math.abs(pos.x - x) + Math.abs(pos.z - z);
                        
                        // Si l'escalier est sur le même niveau y et peut nous amener au niveau cible
                        if (y === pos.y && element.nextPosition && element.nextPosition.y === target.y) {
                            // Ajouter directement l'escalier comme voisin
                            const stairPos = { x, y, z };
                            // Vérifier que la position existe dans la grille avant d'ajouter
                            if (isValidMove(stairPos)) {
                                neighbors.push(stairPos);
                                console.log("Escalier montant trouvé pour changer de niveau:", stairPos);
                            }
                        }
                        
                        // Si l'escalier est aussi sur le niveau de destination et peut nous ramener à notre niveau
                        if (y === target.y && element.nextPosition && element.nextPosition.y === pos.y) {
                            // Pour les escaliers sur le niveau cible, on les considère comme accessibles via leur nextPosition
                            console.log("Escalier pour descendre repéré au niveau cible");
                        }
                    }
                }
            }
            
            // CORRECTION: Nous gardons les mouvements directs entre niveaux mais avec moins de cas
            // Permettre de descendre depuis n'importe quel niveau (pas seulement depuis y = 1)
            if (pos.y > 0) {  // Modifier cette condition pour inclure tous les niveaux > 0
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
                    
                    // Vérifier si la position en bas est accessible
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
                
                // NOUVEAU: Vérifier si ce voisin est un escalier qui nous fait changer de niveau
                const isStairNeighbor = gridElements[posKey(neighbor)]?.type === 'stair';
                
                // Coût g (coût pour atteindre ce voisin depuis le départ)
                // AMÉLIORATION: Favoriser les escaliers si on doit changer de niveau
                const isLevelChange = current.y !== neighbor.y;
                let moveCost = 1; // Coût normal de déplacement
                
                // Si nous devons changer de niveau et que c'est un escalier, donnons-lui la priorité
                if (isLevelChange && isStairNeighbor && target.y !== current.y) {
                    // Favoriser les escaliers quand on veut changer de niveau
                    moveCost = 0.5; // Coût réduit pour favoriser l'escalier
                    console.log("Favorisant l'escalier pour changer de niveau");
                } else if (isLevelChange && !isStairNeighbor) {
                    // Pénaliser légèrement les changements de niveau qui ne sont pas des escaliers
                    moveCost = 1.2;
                }
                
                const tentativeG = current.g + moveCost;
                
                // Vérifier si ce voisin est déjà dans l'ensemble ouvert
                const existingNeighbor = openSet.find(n => posEqual(n, neighbor));
                
                if (!existingNeighbor || tentativeG < existingNeighbor.g) {
                    // Ce chemin est meilleur, mettre à jour ou ajouter le voisin
                    const h = heuristic(neighbor, target);
                    
                    if (!existingNeighbor) {
                        // Ajouter à l'ensemble ouvert
                        openSet.push({
                            ...neighbor,
                            g: tentativeG,
                            h: h,
                            f: tentativeG + h,
                            parent: current
                        });
                    } else {
                        // Mettre à jour le voisin existant
                        existingNeighbor.g = tentativeG;
                        existingNeighbor.f = tentativeG + h;
                        existingNeighbor.parent = current;
                    }
                }
            }
        }
        
        return [];
    }
    
    moveAlongPath(path) {
        // Vérification plus robuste
        if (!path || path.length === 0) {
            console.log("Tentative de déplacement avec un chemin vide");
            return;
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
            
            // Créer une courbe spline pour un mouvement fluide
            const points = [];
            for (let i = 0; i < pathPoints.length; i++) {
                points.push(new BABYLON.Vector3(
                    pathPoints[i].x,
                    pathPoints[i].y,
                    pathPoints[i].z
                ));
            }
            
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
    
    // Nouvelle méthode pour animer la rotation séparément
    animateRotationAlongPath(path) {
        if (!path || path.length < 2) return;
        
        // Points du chemin convertis en Vector3
        const points = path.map(p => new BABYLON.Vector3(p.x, p.y, p.z));
        
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
        });
    }
}
