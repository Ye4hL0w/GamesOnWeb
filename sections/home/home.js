document.addEventListener('DOMContentLoaded', function() {
    initGameSections();
});

function initGameSections() {
    const gameContainer = document.querySelector('.game-sections');
    const sections = document.querySelectorAll('.game-section');
    const indicators = document.querySelectorAll('.indicator-dot');
    let isScrolling = false;
    let currentSection = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    // vérifier si les éléments existent
    if (!gameContainer || sections.length === 0 || indicators.length === 0) {
        console.error("Éléments introuvables pour l'initialisation des sections");
        return;
    }

    console.log("Initialisation des sections de jeu");

    //faire défiler vers une section
    const scrollToSection = (index) => {
        if (isScrolling) return;
        
        isScrolling = true;
        currentSection = index;

        sections.forEach((section, i) => {
            section.style.position = 'fixed';
            section.style.top = '0';
            section.style.left = '0';
            section.style.width = '100%';
            section.style.height = '100vh';
            section.style.transform = `translateY(${(i - index) * 100}vh)`;
            section.style.transition = 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1.000)';
        });

        updateIndicator(index);

        setTimeout(() => {
            isScrolling = false;
        }, 800);
    };

    const updateIndicator = (index) => {
        indicators.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };


    indicators.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            console.log(`Clic sur l'indicateur ${i}`);
            scrollToSection(i);
        });
    });

    // molette de souris
    const handleWheel = (e) => {
        e.preventDefault();
        if (isScrolling) return;

        const direction = e.deltaY > 0 ? 1 : -1;
        const nextSection = currentSection + direction;

        if (nextSection >= 0 && nextSection < sections.length) {
            scrollToSection(nextSection);
        }
    };

    // tactile
    const handleTouchStart = (e) => {
        touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentSection < sections.length - 1) {
                scrollToSection(currentSection + 1);
            } else if (diff < 0 && currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }
    };

    // clavier
    const handleKeydown = (e) => {
        if (isScrolling) return;

        if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
            e.preventDefault();
            scrollToSection(currentSection + 1);
        } else if (e.key === 'ArrowUp' && currentSection > 0) {
            e.preventDefault();
            scrollToSection(currentSection - 1);
        }
    };

    gameContainer.addEventListener('wheel', handleWheel, { passive: false });
    gameContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    gameContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKeydown);

    // initialisation des positions
    sections.forEach((section, i) => {
        section.style.position = 'fixed';
        section.style.top = '0';
        section.style.left = '0';
        section.style.transform = `translateY(${(i - currentSection) * 100}vh)`;
        section.style.width = '100%';
        section.style.height = '100vh';
    });

    // initialisation de l'indicateur
    updateIndicator(currentSection);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initGameSections();
    });
} else {
    initGameSections();
}
