const tutorial = {
    name: "Introduction",
    fragments: 5,
    messages: [
        "Je me souviens d'une douce lumière...",
        "Des voix familières résonnent dans ma mémoire...",
        "Un jardin paisible où je me sentais chez moi...",
        "Le son d'une mélodie qui m'était chère...",
        "Je commence à me souvenir... Je suis un esprit gardien..."
    ],
    endMessage: "Mes pouvoirs s'éveillent... Ce n'est que le début, je dois retrouver plus de fragments de mémoire pour restaurer toute ma puissance.",
    createFragment: function(gameContainer, fragments) {
        const fragment = document.createElement('div');
        fragment.className = 'memory-fragment';
        
        const x = Math.random() * (gameContainer.offsetWidth - 30);
        const y = Math.random() * (gameContainer.offsetHeight - 30);
        
        fragment.style.left = `${x}px`;
        fragment.style.top = `${y}px`;
        
        //Ajoute la classe background-tutorial
        gameContainer.classList.add('background-tutorial');
        gameContainer.appendChild(fragment);
        fragments.push(fragment);
    }
}; 