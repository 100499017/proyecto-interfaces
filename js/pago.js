$(function() {
    // Recuperar datos del borrador
    const draft = JSON.parse(sessionStorage.getItem('draftBooking'));
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (!draft || !loggedInUser) {
        alert('No hay ninguna compra pendiente.');
        window.location.href = 'reservar.html';
        return;
    }

    // Mostrar resumen
    const $details = $('#summary-details');
    $details.html(`
        <div class="summary-item"><span>Origen:</span> <strong>${draft.origen}</strong></div>
        <div class="summary-item"><span>Destino:</span> <strong>${draft.destino}</strong></div>
        <div class="summary-item"><span>Fecha:</span> <strong>${draft.fecha}</strong></div>
        <div class="summary-item"><span>Pasajeros:</span> <strong>${draft.pasajeros}</strong></div>
        <div class="summary-item"><span>Mascotas:</span> <strong>${draft.mascotas.length}</strong></div>
    `);

    // Gestión de divisas (API)
    const totalEuros = draft.totalEuros;
    let exchangeRate = 1.0; // Por defecto 1 a 1 por si falla la API
    
    // Selecciona elementos del DOM
    const $finalAmount = $('#final-amount');
    const $currencySymbol = $('#currency-symbol');
    const $rateInfo = $('#rate-info');
    const $currencySelect = $('#currency-select');

    // Inicializar en Euros
    $finalAmount.text(totalEuros.toFixed(2));

    // Llamada a la API (Frankfurter) para obtener cotización EUR/USD
    $.ajax({
        url: 'https://api.frankfurter.app/latest?from=EUR&to=USD',
        method: 'GET',
        success: function(data) {
            exchangeRate = data.rates.USD;
            // Guardamos el ratio en el select para usarlo luego
            $currencySelect.data('rate', exchangeRate);
            console.log("Cotización actual EUR/USD:", exchangeRate);
        },
        error: function() {
            console.log("Error al cargar la API de divisas. Usando valor por defecto.");
            $rateInfo.text("Error de conexión con API de divisas.");
        }
    });

    // Cambio de Divisa
    $currencySelect.on('change', function() {
        const currency = $(this).val();
        
        if (currency === 'EUR') {
            $finalAmount.text(totalEuros.toFixed(2));
            $currencySymbol.text('€');
            $rateInfo.text('');
        } else if (currency === 'USD') {
            const totalDollars = totalEuros * exchangeRate;
            $finalAmount.text(totalDollars.toFixed(2));
            $currencySymbol.text('$');
            $rateInfo.text(`Cotización aplicada: 1 EUR = ${exchangeRate} USD`);
        }
    });

    function validateCard(number, expir, cvv) {
        const cardRegex = /^\d{4}( \d{4}){3}$/;
        const expirRegex = /^(0?[1-9]|1[0-2])\/\d{2}$/;     // MM/AA o M/AA
        const cvvRegex = /^\d{3}$/;

        if (!cardRegex.test(number)) {
            return "Error. Número de tarjeta no válido, verifique que sean únicamente números y tenga una longitud entre 16 y 19 dígitos.";
        }
        if (!expirRegex.test(expir)) {
            return "Error. Fecha de expiración no válida, debe tener formato MM/AA.";
        }
        // Validar si la tarjeta ha caducado
        // Obtener la fecha ingresada
        const [monthStr, yearStr] = expir.split('/');
        const expirMonth = parseInt(monthStr, 10); // Pasar a entero

        // Convertir el año de 2 dígitos (AA) a 4 dígitos (AAAA)
        const expirYear = 2000 + parseInt(yearStr, 10); 
        
        // Obtener la fecha actual
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        // getMonth() devuelve 0 (Enero) a 11 (Diciembre), por eso sumamos 1
        const currentMonth = currentDate.getMonth() + 1; 

        // El año de caducidad debe ser mayor que el año actual
        if (expirYear < currentYear) {
            return "Error. Fecha de expiración no válida, la tarjeta ha caducado.";
        }

        // Si el año es el actual, el mes de caducidad debe ser igual o posterior al mes actual.
        if (expirYear === currentYear && expirMonth < currentMonth) {
            return "Error. Fecha de expiración no válida, la tarjeta ha caducado.";
        }
        if (!cvvRegex.test(cvv)) {
            return "Error. CVV no válido, verifique que sean únicamente 3 números.";
        }

        return true;
    }

    function clearErrors() {
        $('.error-message').text('').hide(); 
}

    // Procesar pago
    $('#payment-form').on('submit', function(e) {
        clearErrors();      // Ocultar errores una vez se han arreglado

        e.preventDefault();

        // Obtener datos de la tarjeta
        const cardNumber = $('#card-number').val();
        const expirDate = $('#expir-date').val();
        const cvv = $('#cvv').val();

        // Validar datos de la tarjeta
        const validationResult = validateCard(cardNumber, expirDate, cvv);
        if (validationResult !== true) {
            let errorElementId;
            let inputToFocus;
            
            if (validationResult.includes("Número de tarjeta")) {
                errorElementId = '#card-number-error';
                inputToFocus = '#card-number';
            } else if (validationResult.includes("Fecha de expiración")) {
                errorElementId = '#expir-date-error';
                inputToFocus = '#expir-date';
            } else if (validationResult.includes("CVV")) {
                errorElementId = '#cvv-error';
                inputToFocus = '#cvv';
            }
            
            // Mostrar el error en el campo correspondiente
            $(errorElementId).text(validationResult).show();
            $(inputToFocus).focus();
            return;
        }

        if (confirm('¿Estás seguro de que deseas realizar el pago?')) {

            // Simulación de procesamiento de pago
            const $btn = $(this).find('button');
            $btn.text('Procesando...').prop('disabled', true);

            setTimeout(() => {
                // Crear el objeto final de reserva
                let allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
                
                const confirmedBooking = {
                    id: Date.now(),
                    userEmail: loggedInUser.email,
                    origen: draft.origen,
                    destino: draft.destino,
                    fecha: draft.fecha,
                    pasajeros: draft.pasajeros,
                    mascotas: draft.mascotas, // Array con tamaños
                    totalPagado: $finalAmount.text() + ' ' + $currencySelect.val(), // Guardamos cuánto pagó y en qué moneda
                    estado: 'Pagado'
                };

                // Guardar en Historial de Pagos en localStorage
                allBookings.push(confirmedBooking);
                localStorage.setItem('bookings', JSON.stringify(allBookings));

                // Limpiar borrador
                sessionStorage.removeItem('draftBooking');

                // Éxito
                alert('¡Pago realizado con éxito! Tu viaje ha sido confirmado.');
                window.location.href = 'perfil.html'; // Ir al perfil a ver los billetes

            }, 2000); // Simular 2 segundos de espera
        }
    });

    // Cancelar pago
    $('.btn-cancel-pay').on('click', function(e) {
        e.preventDefault();
        if (confirm('¿Estás seguro de que deseas cancelar el pago? Se perderán los datos ingresados.')) {
            // Limpiar borrador
            sessionStorage.removeItem('draftBooking');
            window.location.href = 'reservar.html';
        }
    });
});
