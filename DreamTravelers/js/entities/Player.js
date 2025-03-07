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
        // Créer le mesh du joueur
        this.mesh = BABYLON.MeshBuilder.CreateSphere("player", {
            diameter: 0.8
        }, this.scene);
        
        // Matériau rose pour le joueur (couleurs d'origine)
        const material = new BABYLON.StandardMaterial("playerMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.5, 0.8); // Rose
        material.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0); // Légère lueur
        material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.mesh.material = material;
        
        // Positionner le joueur
        this.mesh.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y + 0.5, // Le joueur est légèrement au-dessus du sol
            this.position.z
        );
    }
    
    setPosition(x, y, z) {
        this.position = { x, y, z };
        this.mesh.position = new BABYLON.Vector3(x, y + 0.5, z);
        this.updateParent();
    }
    
    updateParent() {
        // Recherche de plateformes rotatives
        const platforms = this.scene.meshes.filter(mesh => mesh.name === "rotatingPlatform");
        let isOnPlatform = false;
        
        for (let platform of platforms) {
            // Obtenir la position du joueur dans l'espace monde
            const playerWorldPos = this.mesh.getAbsolutePosition();
            
            // Convertir en coordonnées locales de la plateforme
            const worldMatrix = platform.getWorldMatrix();
            const invWorldMatrix = worldMatrix.clone();
            invWorldMatrix.invert();
            
            const localPos = BABYLON.Vector3.TransformCoordinates(
                playerWorldPos,
                invWorldMatrix
            );
            
            // Vérifier si le joueur est sur la plateforme avec une marge plus précise
            // Utiliser la taille réelle de la plateforme si disponible
            const platformSize = platform.metadata?.size || 1.5;
            if (Math.abs(localPos.x) <= platformSize && 
                Math.abs(localPos.z) <= platformSize && 
                Math.abs(localPos.y - 0.5) <= 0.1) {
                
                // Si le joueur n'est pas déjà sur cette plateforme
                if (this.mesh.parent !== platform) {
                    // Sauvegarder la position mondiale actuelle
                    const worldPosition = this.mesh.getAbsolutePosition();
                    
                    // Définir la plateforme comme parent
                    this.mesh.parent = platform;
                    
                    // Ajuster la position pour qu'elle reste visuellement au même endroit
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
        
        // Vérification rapide si la destination est accessible
        const targetKey = `${target.x},${target.y},${target.z}`;
        
        // Si la cible n'est pas une position valide ou une position de plateforme valide, retourner un chemin vide
        if (!this.grid.isValidPosition(target) && !this.grid.isValidPlatformPosition(target)) {
            console.log("Destination inaccessible: position non valide");
            return [];
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
        
        // Fonction pour vérifier si une position est valide et peut être atteinte
        const isValidMove = (pos) => {
            return this.grid.isValidPosition(pos) || this.grid.isValidPlatformPosition(pos);
        };
        
        // Fonction pour obtenir les voisins valides d'une position
        const getNeighbors = (pos) => {
            const neighbors = [];
            const directions = [
                { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
                { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
                { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 }
            ];
            
            // Vérifier s'il s'agit d'un escalier
            const posKey = `${pos.x},${pos.y},${pos.z}`;
            const gridElement = this.grid.getAllElements()[posKey];
            
            if (gridElement && gridElement.type === 'stair' && gridElement.nextPosition) {
                // Ajouter la position suivante de l'escalier comme voisin prioritaire
                neighbors.push({
                    x: gridElement.nextPosition.x,
                    y: gridElement.nextPosition.y,
                    z: gridElement.nextPosition.z
                });
            } else {
                // Ajouter tous les voisins standards
                for (const dir of directions) {
                    const neighbor = {
                        x: pos.x + dir.x,
                        y: pos.y + dir.y,
                        z: pos.z + dir.z
                    };
                    
                    if (isValidMove(neighbor)) {
                        neighbors.push(neighbor);
                    }
                }
            }
            
            return neighbors;
        };
        
        // Ajouter une vérification du nombre d'itérations pour éviter les boucles infinies
        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;
            
            // Trouver le nœud avec le coût f le plus bas
            let current = openSet.reduce((min, item) => 
                item.f < min.f ? item : min, openSet[0]);
            
            // Si nous avons atteint la cible
            if (posEqual(current, target)) {
                // Reconstruire le chemin
                let temp = current;
                while (temp.parent) {
                    path.unshift(temp);
                    temp = temp.parent;
                }
                return path;
            }
            
            // Retirer current de openSet et l'ajouter à closedSet
            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(posKey(current));
            
            // Vérifier tous les voisins
            for (const neighbor of getNeighbors(current)) {
                // Si déjà évalué, ignorer
                if (closedSet.has(posKey(neighbor))) continue;
                
                // Calculer le coût g
                const gScore = current.g + 1;
                
                // Vérifier si ce voisin est dans openSet
                const openNeighbor = openSet.find(n => posEqual(n, neighbor));
                
                if (!openNeighbor || gScore < openNeighbor.g) {
                    // Ce chemin est meilleur, ajouter ou mettre à jour
                    const h = heuristic(neighbor, target);
                    const f = gScore + h;
                    
                    if (!openNeighbor) {
                        openSet.push({
                            ...neighbor,
                            g: gScore,
                            h: h,
                            f: f,
                            parent: current
                        });
                    } else {
                        openNeighbor.g = gScore;
                        openNeighbor.f = f;
                        openNeighbor.parent = current;
                    }
                }
            }
        }
        
        // Si on a atteint le nombre maximum d'itérations sans trouver de chemin
        if (iterations >= maxIterations) {
            console.log("Recherche de chemin abandonnée: trop d'itérations");
            return [];
        }
        
        // Si aucun chemin n'est trouvé
        console.log("Aucun chemin trouvé vers la destination");
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
                pos.y + 0.5, // Élever au-dessus du sol
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
