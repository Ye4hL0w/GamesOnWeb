import { BaseLevel } from './BaseLevel.js';
import { Player } from '../entities/Player.js';
import { Exit } from '../elements/Exit.js';

export class Level2 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.player = new Player(canvas);
        
        this.levelTitle = "Niveau 2 - Le passage obscur";
    }

    initialize() {
        super.initialize();

        // Créer la sortie à la fin du niveau
        const floorY = this.canvas.height - this.floorHeight;
        this.exit = new Exit(this.levelWidth - 200, floorY - 100, 80, 80);

        
        // Ajouter des obstacles ou autres éléments spécifiques au niveau 2
        this.obstacles.push(
            { x: 1200, y: floorY - 120, width: 80, height: 120 },
            { x: 2500, y: floorY - 150, width: 100, height: 150 }
        );
    }

    update() {
        super.update(); // Utilise la méthode de BaseLevel qui gère déjà la collision avec la sortie
    }

    draw() {
        // Appeler la méthode draw de la classe parente qui inclut maintenant l'affichage du titre
        super.draw();
        
        // Ajouter tout rendu spécifique au niveau 2 ici si nécessaire
    }
    
    onLevelComplete() {
        console.log('Niveau 2 terminé ! Passage au niveau suivant...');
        
        // Ajouter un effet visuel de "fondu" avant la transition
        const canvas = this.canvas;
        const context = this.context;
        
        // Créer un effet de fondu en noir
        let opacity = 0;
        const fadeEffect = setInterval(() => {
            opacity += 0.05;
            context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            if (opacity >= 1) {
                clearInterval(fadeEffect);
                
                // Stocker le niveau suivant dans localStorage
                localStorage.setItem('selectedLevel', 3);
                
                // Rediriger vers le niveau 3
                setTimeout(() => {
                    window.location.href = 'level3.html';
                }, 500);
            }
        }, 50);
    }
} 