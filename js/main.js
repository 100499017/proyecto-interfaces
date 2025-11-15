// Lógica principal

// Espera a que todo el HTML esté cargado
$(function() {
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

    // Actualiza el header
    function updateHeader() {
        const $authContainer = $('.auth-container');
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

        if (loggedInUser) {
            // Creamos un link <a> para "Mi Perfil"
            const $profileLink = $('<a></a>')
                .attr('href', '/pages/perfil.html')
                .addClass('profile-btn')
                .text('Mi Perfil');
            
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

            // Cierra el modal y actualiza la interfaz
            closeModal();
            
            // Actualiza el header
            updateHeader();
        } else {
            alert('Email o contraseña incorrectos.');
        }
    });

    // Actualiza el header en cuanto carga la página
    updateHeader();
})
