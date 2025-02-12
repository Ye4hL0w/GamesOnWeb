function initConnexion() {
    const btnLogIn = document.getElementById('btn-log-in');
    const btnSignIn = document.getElementById('btn-sign-in');
    const logInSection = document.getElementById('log-in');
    const signInSection = document.getElementById('sign-in');

    if (!btnLogIn || !btnSignIn || !logInSection || !signInSection) {
        console.error('Éléments de connexion non trouvés');
        return;
    }

    logInSection.classList.add('active');
    btnLogIn.classList.add('active');

    btnLogIn.addEventListener('click', () => {
        logInSection.classList.add('active');
        signInSection.classList.remove('active');
        btnLogIn.classList.add('active');
        btnSignIn.classList.remove('active');
    });

    btnSignIn.addEventListener('click', () => {
        signInSection.classList.add('active');
        logInSection.classList.remove('active');


        btnSignIn.classList.add('active');
        btnLogIn.classList.remove('active');
    });

    const logInForm = logInSection.querySelector('form');
    const signInForm = signInSection.querySelector('form');
    const errorBoxSignIn = document.getElementById('error-box-signin');
    const errorBoxLogin = document.getElementById('error-box-login');
    const passwordInput = document.getElementById('password-sign-in');
    const passwordInputLog = document.getElementById('password-log-in');

    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name-sign-in').value;
        const email = document.getElementById('email-sign-in').value;
        const password = document.getElementById('password-sign-in').value;
        
        errorBoxSignIn.textContent = '';
        errorBoxSignIn.classList.remove('active');

        const userExist = localStorage.getItem(email);
        if (userExist) {
            errorBoxSignIn.textContent = 'Cette adresse email est déjà utilisée';
            errorBoxSignIn.classList.add('active');
            return;
        }

        if (password.length < 8) {
            errorBoxSignIn.textContent = 'Le mot de passe doit contenir au moins 8 caractères';
            errorBoxSignIn.classList.add('active');
            return;
        }

        const caracSpeciaux = /[!@#$%^&*_(),.?":{}|<>]/g;
        const nbCaracSpeciaux = (password.match(caracSpeciaux) || []).length;

        if (nbCaracSpeciaux < 2) {
            errorBoxSignIn.textContent = 'Le mot de passe doit contenir au moins 2 caractères spéciaux';
            errorBoxSignIn.classList.add('active');
            return;
        }

        const user = { name, email, password };
        localStorage.setItem(email, JSON.stringify(user));

        signInForm.reset();
        alert('Inscription réussie');
    });

    logInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-log-in').value;
        const password = document.getElementById('password-log-in').value;

        errorBoxLogin.textContent = '';
        errorBoxLogin.classList.remove('active');

        const user = JSON.parse(localStorage.getItem(email));
        
        if (user && user.password === password) {
            logInForm.reset();
            alert('Connexion réussie');
        } else {
            errorBoxLogin.textContent = 'Email ou mot de passe incorrect';
            errorBoxLogin.classList.add('active');
        }
    });

    passwordInput.addEventListener('focus', () => {
        errorBoxSignIn.textContent = '';
        errorBoxSignIn.classList.remove('active');
    });

    passwordInputLog.addEventListener('focus', () => {
        errorBoxLogin.textContent = '';
        errorBoxLogin.classList.remove('active');
    });

    const togglePasswordLogin = document.querySelector("#togglePassword-login");
    const togglePasswordSignin = document.querySelector("#togglePassword-signin");
    const passwordLogin = document.querySelector("#password-log-in");
    const passwordSignin = document.querySelector("#password-sign-in");

    togglePasswordLogin.addEventListener("click", function () {
        const type = passwordLogin.getAttribute("type") === "password" ? "text" : "password";
        passwordLogin.setAttribute("type", type);
        this.classList.toggle("fa-eye-slash");
    });

    togglePasswordSignin.addEventListener("click", function () {
        const type = passwordSignin.getAttribute("type") === "password" ? "text" : "password";
        passwordSignin.setAttribute("type", type);
        this.classList.toggle("fa-eye-slash");
    });
}

initConnexion();

