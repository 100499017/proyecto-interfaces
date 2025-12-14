// Lógica principal

// Espera a que todo el HTML esté cargado
$(function() {

    let pathPrefix = window.location.pathname.includes('/pages/') ? '..' : '.';

    // --- LÓGICA DE INICIO DE SESIÓN ---

    // Seleccionamos los elementos del modal
    const $loginModal = $('#login-modal');
    const $closeModalBtn = $('#close-modal-btn');

    // Función para abrir el modal de login
    function openModal() {
        // Añade la clase 'visible' para mostrar el modal
        $loginModal.addClass('visible');
    }

    // Función para cerrar el modal de login
    function closeModal() {
        // Quita la clase 'visible' para ocultar del modal
        $loginModal.removeClass('visible');
    }

    // Al hacer click en la "X" para cerrar
    $closeModalBtn.on('click', closeModal);
    // Cerrar el modal al hacer click fuera del formulario
    $loginModal.on('click', function(event) {
        // 'this' es el elemento $loginModal
        // event.target es donde se hizo click
        if (event.target === this) {
            closeModal();
        }
    })

    // --- LISTENER GLOBAL PARA ABRIR LOGIN ---
    // Esto hace que cualquier elemento con la clase 'auth-trigger' abra el modal
    $(document).on('click', '.auth-trigger', function(e) {
        e.preventDefault(); // Evita saltos de página
        openModal();
    });

    const DEFAULT_AVATAR_PATH = `${pathPrefix}/images/default-avatar.jpg`;
    const PROFILE_PAGE_URL = `${pathPrefix}/pages/perfil.html`;

    // Actualiza el header
    function updateHeader() {
        const $authContainer = $('.auth-container');
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

        if (loggedInUser) {
            // Determina qué imagen usar
            const avatarSrc = (loggedInUser.avatar) ? loggedInUser.avatar : DEFAULT_AVATAR_PATH;

            // Creamos un link <a> para "Mi Perfil"
            const $profileLink = $('<a></a>')
                .attr('href', PROFILE_PAGE_URL)
                .addClass('profile-link-container');

            // La imagen <img>
            const $avatarImg = $('<img>')
                .attr('src', avatarSrc)
                .attr('alt', 'Avatar')
                .addClass('profile-avatar-img');
            
            const $profileText = $('<span></span>')
                .text('Mi Perfil');
            
            // Introducimos la imagen y el texto dentro de profileLink
            $profileLink.append($avatarImg, $profileText);
            
            // Reemplazamos el contenido del contenedor
            $authContainer.html($profileLink);
        } else {
            // Creamos el botón de "Iniciar Sesión"
            const $loginButton = $('<button></button>')
                .addClass('login-btn')
                .text('Iniciar Sesión');
            
            // Reemplazamos el contenido
            $authContainer.html($loginButton);

            // Volvemos a asignar el evento de click al nuevo botón
            $('.login-btn').on('click', openModal);
        }
    }

    // Lógica de validación de inputs
    $('#login-form').on('submit', function(e) {
        e.preventDefault();

        const email = $('#login-email').val();
        const password = $('#login-password').val();

        // Cargar la lista de usuarios
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Buscar un usuario que coincida
        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            alert('¡Bienvenido, ' + foundUser.name + '!');

            // Usamos sessionStorage para mantener la sesión iniciada
            sessionStorage.setItem('loggedInUser', JSON.stringify(foundUser));

            // Recarga la página
            window.location.reload();
        } else {
            alert('Email o contraseña incorrectos.');
        }
    });

    // Actualiza el header en cuanto carga la página
    updateHeader();

    // --- FIN DE LÓGICA DE INICIO DE SESIÓN ---

    // --- LÓGICA DEL SELECTOR DE IDIOMA PERSONALIzADO ---
    
    const $selector = $('.lang-selector');
    const $trigger = $('.lang-trigger-btn');
    const $menu = $('.lang-menu');

    // Abrir y cerrar el menú al hacer click en el botón
    $trigger.on('click', function(e) {
        e.stopPropagation();
        $menu.toggleClass('visible');
        $trigger.attr('aria-expanded', $menu.hasClass('visible'));
    });

    // Seleccionar una opción
    $menu.on('click', 'li[data-lang]', function(e) {
        const $selectedOption = $(this);

        // Obtener los datos
        const lang = $selectedOption.data('lang');
        const text = $selectedOption.find('.lang-text').text();

        // Actualizar el botón
        $('#current-lang-text').text(text);

        // Cerrar el menú
        $menu.removeClass('visible');
        $trigger.attr('aria-expanded', false);

        // Guardar la elección
        localStorage.setItem('lang', lang);

        location.reload();
    });

    // Cerrar el menú si se hace click fuera
    $(document).on('click', function(e) {
        if ($menu.hasClass('visible') && !$selector.is(e.target) && $selector.has(e.target).length === 0) {
            $menu.removeClass('visible');
            $trigger.attr('aria-expanded', false);
        }
    });

    // Inicializar el botón con el idioma guardado
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        const $initialOption = $menu.find(`li[data-lang="${savedLang}"]`);
        if ($initialOption.length > 0) {
            $('#current-lang-text').text($initialOption.find('.lang-text').text());
        }
    }

    // --- MODO OSCURO / CLARO ---

    // Nombres de archivos SVG de sol y luna
    const ICON_SUN = `${pathPrefix}/images/sun.svg`;
    const ICON_MOON = `${pathPrefix}/images/moon.svg`;

    const $themeToggleBtn = $('#theme-toggle-btn');
    const body = document.body;

    // Función para cambiar el icono
    function updateTheme(isDark) {
        // Si es oscuro, mostramos el sol
        // Si es claro, mostramos la luna
        const iconSrc = isDark ? ICON_SUN : ICON_MOON;
        const altText = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

        // Cambiar variable 'theme' en localStorage
        localStorage.setItem('theme', isDark ? 'dark' : 'light')

        $themeToggleBtn.html(`<img src="${iconSrc}" alt="${altText}">`);
    }

    // Aplicar tema guardado al inicio
    const savedTheme = localStorage.getItem('theme');

    let isDarkMode = false;
    if (savedTheme == 'dark') {
        $(body).addClass('dark-mode');
        isDarkMode = true;
    } else {
        isDarkMode = false;
    }

    // Actualizamos el icono inicial
    updateTheme(isDarkMode);

    // Evento Click para cambiar tema
    $themeToggleBtn.on('click', function() {
        // Alternar clase
        $(body).toggleClass('dark-mode');
        const isDarkNow = $(body).hasClass('dark-mode');

        // Actualizar icono
        updateTheme(isDarkNow);

        // Guardar preferencia
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

})
