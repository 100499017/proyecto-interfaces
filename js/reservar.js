/* Lógica de la página de reserva */

$(function() {
    // Seleccionar elementos
    const $bookingForm = $('#booking-form');
    const $authWarning = $('#auth-warning');
    const $successMessage = $('#success-message');

    // Obtenemos el usuario de sessionStorage
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        // Si no hay usuario logueado

        // Oculta el formulario
        $bookingForm.hide();

        // Muestra un mensaje de advertencia
        $authWarning.html('Debes <a id="login-link">iniciar sesión</a> para poder reservar.');
        $authWarning.show();

        // Hacer que "iniciar sesión" abra el modal
        $('#login-link').on('click', function() {
            if (typeof openModal === 'function') {
                openModal();
            } else {
                alert('Por favor, haz click en "Iniciar Sesión" en el menú superior.');
            }
        });
    } else {
        // Si hay usuario logueado

        // Oculta el warning
        $authWarning.hide();

        // Asigna el evento al formulario
        $bookingForm.on('submit', function(e) {
            e.preventDefault(); // Evita que la página se recargue

            // Obtiene las reservas existentes de localStorage
            let allBookings = JSON.parse(localStorage.getItem('bookings')) || [];

            // Crea el nuevo objeto de reserva
            const newBooking = {
                id: Date.now(),
                userEmail: loggedInUser.email,

                origen: $('#origen').val(),
                destino: $('#destino').val(),
                fecha: $('#fecha').val(),
                pasajeros: $('#pasajeros').val()
            };

            // Añade la nueva reserva al array
            allBookings.push(newBooking);

            // Guarda el array actualizado en localStorage
            localStorage.setItem('bookings', JSON.stringify(allBookings));

            // Muestra el mensaje de éxito y resetea el formulario
            $successMessage.show();
            $(this)[0].reset(); // Resetea los campos del formulario

            // Oculta el mensaje de éxito después de 5 segundos
            setTimeout(() => {
                $successMessage.fadeOut();
            }, 5000);
        });
    }
});
