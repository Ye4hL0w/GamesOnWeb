document.addEventListener('DOMContentLoaded', function() {
    loadSection('home');

    // Gestion de la navigation
    document.querySelectorAll('.li').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if (section) {
                loadSection(section);
            }
        });
    });

    const nav = document.querySelector('nav');    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            nav.style.transform = "translateY(-100%)";
        } else {
            nav.style.transform = "translateY(0)";
        }
    });
});

async function loadSection(section) {
    const content = document.getElementById('content');

    // Charger le HTML
    const response = await fetch(`./sections/${section}/${section}.html`);
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const html = await response.text();
    content.innerHTML = html;

    // Charger le CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./sections/${section}/${section}.css`;
    link.id = `style-${section}`;
    document.head.appendChild(link);

    // Charger Font Awesome si connexion
    if (section === 'connexion') {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        faLink.id = 'font-awesome';
        document.head.appendChild(faLink);
    }

    // Charger le JS avec un timestamp pour éviter la mise en cache
    const script = document.createElement('script');
    script.src = `./sections/${section}/${section}.js?v=${Date.now()}`;
    script.id = `script-${section}`;
    script.type = 'module';
    
    // Supprimer l'ancien script s'il existe
    const oldScript = document.querySelector(`#script-${section}`);
    if (oldScript) {
        oldScript.remove();
    }
    
    document.body.appendChild(script);

    // Réinitialiser le menu burger après chaque changement de section
    const burgerMenu = document.querySelector('.burger-menu');
    const liens = document.querySelector('.liens');
    
    if (burgerMenu && liens) {
        // Nettoyer les anciens événements
        burgerMenu.replaceWith(burgerMenu.cloneNode(true));
        const newBurgerMenu = document.querySelector('.burger-menu');
        
        // Réattacher les événements
        newBurgerMenu?.addEventListener('click', () => {
            newBurgerMenu.classList.toggle('active');
            liens.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        window.addEventListener('scroll', () => {
            if (liens.classList.contains('active')) {
                newBurgerMenu.classList.remove('active');
                liens.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Mettre à jour l'élément actif dans la navigation
    document.querySelectorAll('.li').forEach(nav => {
        if (nav.getAttribute('data-section') === section) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
}
