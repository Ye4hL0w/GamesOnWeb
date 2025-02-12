// Partie responsive du canvas
function resizeCanvas() {
    const canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialisation
window.addEventListener('load', () => {
    resizeCanvas();
});

// Redimensionnement
window.addEventListener('resize', () => {
    resizeCanvas();
}); 