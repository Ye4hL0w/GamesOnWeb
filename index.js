document.addEventListener('DOMContentLoaded', function() {
    loadSection('home');

    // gestion des clics
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

    // initialisation
    initUserInterface();
});

async function loadSection(section) {
    const content = document.getElementById('content');

    // chargement du HTML
    const response = await fetch(`./sections/${section}/${section}.html`);
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const html = await response.text();
    content.innerHTML = html;

    // chargement du CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./sections/${section}/${section}.css`;
    link.id = `style-${section}`;
    document.head.appendChild(link);

    if (section === 'connexion') {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        faLink.id = 'font-awesome';
        document.head.appendChild(faLink);
    }

    // ajout du JS
    const script = document.createElement('script');
    script.src = `./sections/${section}/${section}.js?v=${Date.now()}`;
    script.id = `script-${section}`;
    script.type = 'module';
    
    const oldScript = document.querySelector(`#script-${section}`);
    if (oldScript) {
        oldScript.remove();
    }
    
    document.body.appendChild(script);

    const burgerMenu = document.querySelector('.burger-menu');
    const liens = document.querySelector('.liens');
    
    if (burgerMenu && liens) {
        burgerMenu.replaceWith(burgerMenu.cloneNode(true));
        const newBurgerMenu = document.querySelector('.burger-menu');
        
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

    document.querySelectorAll('.li').forEach(nav => {
        if (nav.getAttribute('data-section') === section) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
}

// gestion utilisateur et déconnexion
function initUserInterface() {
    const currentUserEmail = localStorage.getItem('currentUser');
    if (currentUserEmail) {
        // récupération des données
        const userData = JSON.parse(localStorage.getItem(currentUserEmail));
        if (userData) {
            // affichage
            document.getElementById('user-greeting').textContent = `Bonjour ${userData.name}`;
            document.getElementById('user-info').style.display = 'flex';
            document.getElementById('connexion-li').style.display = 'none';
        }
    }
    
    // configuration de la déconnexion
    document.getElementById('deconnexion').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('connexion-li').style.display = 'block';
        alert('Vous avez été déconnecté');
        window.location.reload();
    });
}
