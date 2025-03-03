import { BaseLevel } from './BaseLevel.js';
import { Player } from '../entities/Player.js';
import { Exit } from '../elements/Exit.js';

export class Level3 extends BaseLevel {
    constructor(context, canvas) {
        super(context, canvas);
        this.player = new Player(canvas);
        
        this.levelTitle = "Niveau 3 - Le dernier voyage";
    }

    initialize() {
        super.initialize();

        // Créer la sortie à la fin du niveau
        const floorY = this.canvas.height - this.floorHeight;
        this.exit = new Exit(
            this.levelWidth - 200,
            floorY - 120,
            80,
            80
        );
        
        // Ajouter des obstacles ou autres éléments spécifiques au niveau 3
        this.obstacles.push(
            { x: 1000, y: floorY - 130, width: 90, height: 130 },
            { x: 2000, y: floorY - 160, width: 110, height: 160 },
            { x: 3000, y: floorY - 140, width: 95, height: 140 }
        );
    }

    update() {
        super.update(); // Utilise la méthode de BaseLevel qui gère déjà la collision avec la sortie
    }

    draw() {
        // Appeler la méthode draw de la classe parente qui inclut maintenant l'affichage du titre
        super.draw();
        
        // Ajouter tout rendu spécifique au niveau 3 ici si nécessaire
    }
    
    onLevelComplete() {
        console.log('Niveau 3 terminé ! Félicitations, vous avez terminé le jeu !');
        
        // Ajouter un effet visuel de "fondu" avant la transition
        const canvas = this.canvas;
        const context = this.context;
        
        // Créer un effet de fondu en noir
        let opacity = 0;
        const fadeEffect = setInterval(() => {
            opacity += 0.05;
            context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // Ajouter un message de félicitations
            if (opacity >= 0.7) {
                context.fillStyle = "white";
                context.font = "bold 32px Arial";
                context.textAlign = "center";
                context.fillText("Félicitations !", canvas.width/2, canvas.height/2 - 30);
                context.font = "24px Arial";
                context.fillText("Vous avez terminé Shadow Travelers", canvas.width/2, canvas.height/2 + 20);
            }
            
            if (opacity >= 1) {
                clearInterval(fadeEffect);
                
                // Réinitialiser le niveau sélectionné
                localStorage.setItem('selectedLevel', 1);
                
                // Rediriger vers l'écran d'accueil après un délai
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000); // Attendre 3 secondes pour que le joueur puisse lire le message
            }
        }, 50);
    }
} 