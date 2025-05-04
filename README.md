# GamesOnWeb - Édition Dream Land (Concours 2025)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

Bienvenue sur le dépôt du projet **GamesOnWeb - Dream Land**. Ce projet consiste en un portail web hébergeant une trilogie de mini-jeux interconnectés sur le thème de "Dream Land". Le jeu **Dream Travelers** est spécifiquement développé pour le concours Games On Web édition 2025.

## 🎮 Jeux Inclus

Le portail héberge une trilogie de jeux qui suivent un ordre chronologique au niveau de leur lore (histoire) :

1.  **The Awakening** : L'introduction à l'univers, faisant le pont entre le monde des rêves et la réalité. (Situé dans `/TheAwakening/`).
    *   *Technologie :* Manipulation directe du DOM.
2.  **Shadow Travelers** : Une exploration des royaumes plus sombres des rêves. (Situé dans `/ShadowTravelers/`).
    *   *Technologie :* Rendu graphique via l'API Canvas.
3.  **Dream Travelers** : Le voyage final à travers des paysages oniriques vibrants et fantasques. **(Jeu pour le concours)** (Situé dans `/DreamTravelers/`).
    *   *Technologie :* Rendu 3D avec BabylonJS

## ✨ Fonctionnalités

*   **Portail Multi-Jeux** : Une interface unique pour accéder à plusieurs jeux web.
*   **Chargement Dynamique du Contenu** : Les sections (Accueil, Progression, Jeux, Connexion) sont chargées dynamiquement sans rechargement complet de la page, en utilisant l'API `fetch`.
*   **Authentification Utilisateur (Basique)** : Fonctionnalité simple de connexion/déconnexion utilisateur, stockant l'utilisateur actuel dans le `localStorage`.
*   **Suivi de Progression Inter-Jeux** : Sauvegarde et chargement de la progression du joueur (plus haut niveau atteint et pourcentage de complétion) pour chaque jeu via `localStorage`, lié à l'utilisateur connecté.
*   **Design Réactif (Responsive)** : L'interface s'adapte aux différentes tailles d'écran, incluant un menu "burger" pour les petits appareils.
*   **Interface Stylisée** : Utilisation de variables CSS pour la thématisation, incluant des animations et transitions pour une meilleure expérience utilisateur.

## 💻 Technologies Utilisées

*   **Frontend** : HTML5, CSS3, JavaScript Vanilla (ES6+)
*   **Stockage** : `localStorage` du navigateur pour les sessions utilisateur et la progression dans les jeux.

## 📁 Structure du Projet

```
.
├── .git/               # Fichiers du dépôt Git
├── .vscode/            # Paramètres VSCode (optionnel)
├── DreamTravelers/     # Jeu 3 : Ressources et logique
├── ShadowTravelers/    # Jeu 2 : Ressources et logique
├── TheAwakening/       # Jeu 1 : Ressources et logique
├── js/                 # Utilitaires JavaScript partagés (si applicable)
├── sections/           # Contient HTML, CSS, JS pour chaque section du portail
│   ├── connexion/      # Section Connexion/Inscription
│   ├── home/           # Section Accueil
│   └── progress/       # Section affichage de la progression utilisateur
├── gameProgress.js     # Gère la sauvegarde/chargement de la progression inter-jeux
├── icon.png            # Favicon du site
├── index.css           # Styles globaux, thèmes, mise en page, design réactif
├── index.html          # Point d'entrée HTML principal, structure de la page, navigation
├── index.js            # Logique principale du portail : chargement des sections, routage, MàJ UI
└── README.md           # Ce fichier
```

## 🚀 Démarrage Rapide
1. **Accéder au site via le lien** :
   [https://games-on-web.vercel.app/](https://games-on-web.vercel.app/)
1.  **Cloner le dépôt** :
    ```bash
    git clone <url-du-depot>
    cd GamesOnWeb
    ```
2.  **Ouvrir `index.html`** :
    Ouvrez simplement le fichier `index.html` dans votre navigateur web. Pour une fonctionnalité complète (comme le chargement dynamique via `fetch`), il est recommandé de servir les fichiers via un serveur web local simple.

## 🔧 Explication des Scripts Clés par Jeu

Chaque jeu possède sa propre logique encapsulée dans son répertoire. Voici les scripts principaux pour chaque partie de la trilogie :

*   **The Awakening (`TheAwakening/js/game.js`)** :
    *   Orchestre le jeu basé sur la manipulation du DOM.
    *   Initialise et coordonne les modules : `UI`, `Controls`, `Physics`, `LevelManager`.
    *   Gère l'état global du jeu (vies, fragments, niveau courant).
    *   Contient la boucle de jeu principale (`gameLoop`), la détection de collisions basique, la gestion de la mort et de la progression entre les niveaux (tutoriel + 3 niveaux).
    *   Interagit avec `../../gameProgress.js` pour la sauvegarde.

*   **Shadow Travelers (`ShadowTravelers/js/script.js`)** :
    *   Point d'entrée pour le jeu Canvas.
    *   Gère l'initialisation des niveaux (`Level1`, `Level2`, `Level3`) via `LevelManager` en fonction de l'URL ou de la sélection.
    *   Met en place et contrôle la boucle de rendu/jeu (`gameLoop`) via `requestAnimationFrame`, optimisée pour 60 FPS.
    *   Gère le redimensionnement dynamique du canvas et la mise à jour des éléments du jeu en conséquence.

*   **Dream Travelers (Jeu pour le concours)** :
    *   **Menu (`DreamTravelers/js/index.js`)** : Gère l'écran de sélection des niveaux avec des animations (GSAP) et des effets visuels (`particles.js`). Redirige vers les pages des niveaux.
    *   **Logique Principale (`DreamTravelers/js/entities/Player.js`)** :
        *   La classe `Player` gère le personnage joueur, son modèle 3D (chargé depuis `samourai_floating.glb` avec une sphère de secours), sa position et ses déplacements.
        *   La méthode clé est `findPath(target)` qui implémente le système de pathfinding :
            *   Décide de la stratégie : recherche normale (`findDescentPath`) pour descendre ou recherche inversée pour monter.
            *   Valide les chemins pour empêcher les déplacements à travers le vide ou la montée verticale hors escaliers.
            *   Gère les contraintes spécifiques (ex: montée uniquement via escaliers pour le niveau 3).
            *   Utilise `findDescentPath` (basé sur A*) qui évalue les voisins, favorise les escaliers et prend en compte les plateformes mobiles/rotatives.
        *   La méthode `moveAlongPath(path)` anime ensuite le déplacement du joueur le long du chemin trouvé, incluant la rotation.
    *   **Autres scripts (`levels/`, `elements/`, etc.)** : Gèrent la structure des niveaux, les éléments interactifs (plateformes, etc.) et l'environnement 3D (via BabylonJS).

*   **Portail (`index.js` & `gameProgress.js` à la racine)** :
    *   Voir descriptions précédentes si besoin (chargement dynamique des sections, gestion globale de la progression et de l'utilisateur).

## 📄 Licence

Tous les contenus (images, modèles 3D et sons) utilisés dans ce projet sont libres de droits ou créés spécifiquement pour le projet. Aucune restriction d'utilisation n'est appliquée sur ces ressources.

## 📄 Documentation

Un rapport de conception détaillé est disponible dans le fichier `Rapport de conception.pdf` à la racine du projet, fournissant des informations sur l'architecture, les choix techniques et les fonctionnalités.
