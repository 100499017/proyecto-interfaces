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

    // Procesar pago
    $('#payment-form').on('submit', function(e) {
        e.preventDefault();
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
    $('.btn-not-pay').on('click', function(e) {
        e.preventDefault();
        if (confirm('¿Estás seguro de que deseas cancelar el pago? Se perderán los datos ingresados.')) {
            // Limpiar borrador
            sessionStorage.removeItem('draftBooking');
            window.location.href = 'reservar.html';
        }
    });
});
