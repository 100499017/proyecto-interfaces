// Lógica principal

// Espera a que todo el HTML esté cargado
$(function() {
    // Seleccionamos los elementos del DOM
    const $loginBtn = $('.login-btn');
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

    // Asignamos los eventos
    $loginBtn.on('click', openModal);
    $closeModalBtn.on('click', closeModal);
    // Cerrar el modal al hacer click fuera del formulario
    $loginModal.on('click', function(event) {
        // 'this' es el elemento $loginModal
        // event.target es donde se hizo click
        if (event.target === this) {
            closeModal();
        }
    })
})
