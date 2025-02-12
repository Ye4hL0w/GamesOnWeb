gsap.registerPlugin(ScrollTrigger);

function initCardParallax() {
    const cards = document.querySelectorAll('.level-card');
    
    cards.forEach((card, index) => {
        gsap.from(card, {
            opacity: 0,
            y: 100,
            rotation: 8,
            duration: 1.2,
            delay: index * 0.3,
            ease: "power4.out"
        });

        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.05,
                boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
                duration: 0.4,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });

    gsap.from('.title-container', {
        y: -100,
        opacity: 0,
        duration: 2,
        ease: "elastic.out(1, 0.5)"
    });
}

function initParticles() {
    particlesJS("particles-js", {
        particles: {
            number: { value: 100 },
            color: { value: ["#ffffff", "#7ee7f7", "#7ef7c4"] },
            shape: { type: "circle" },
            opacity: {
                value: 0.6,
                random: true,
                anim: { enable: true, speed: 0.5 }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: true, speed: 1 }
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                out_mode: "out",
                bounce: false
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });
}

function startGame(levelId) {
    const container = document.querySelector('.game-container');
    
    gsap.to(container, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            window.location.href = `level${levelId}.html`;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCardParallax();
    initParticles();
}); 