$(function() {
    const $bookingForm = $('#booking-form');
    const $authWarning = $('#auth-warning');
    const $origenSelect = $('#origen');
    const $destinoSelect = $('#destino');
    const $petsList = $('#pets-list');
    const $addPetBtn = $('#add-pet-btn');
    const $priceDisplay = $('#price-preview');
    const $totalPriceSpan = $('#total-price');

    // Variables globales
    let rutasData = [];
    let currentPricePerPerson = 0;

    // Obtenemos el usuario de sessionStorage
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        $bookingForm.hide();
        $authWarning.html('Debes <a id="login-link">iniciar sesión</a> para comprar billetes.').show();
        $('#login-link').on('click', () => { if (typeof openModal === 'function') openModal(); });
        return; 
    } else {
        $authWarning.hide();
        $bookingForm.show();
    }

    // Cargar rutas del json
    $.getJSON('../data/rutas.json', function(data) {
        rutasData = data;
        // Rellenar origen
        rutasData.forEach(ruta => {
            $origenSelect.append(`<option value="${ruta.origen}">${ruta.origen}</option>`);
        });
    });

    // Cambio de origen -> Actualizar destinos
    $origenSelect.on('change', function() {
        const selectedOrigen = $(this).val();
        $destinoSelect.empty().append('<option value="">Selecciona destino...</option>');
        $destinoSelect.prop('disabled', true);
        currentPricePerPerson = 0;
        updateTotal();

        if (selectedOrigen) {
            const ruta = rutasData.find(r => r.origen === selectedOrigen);
            if (ruta) {
                ruta.destinos.forEach(dest => {
                    // Guardamos el precio en un atributo data-price
                    $destinoSelect.append(`<option value="${dest.ciudad}" data-price="${dest.precio}">${dest.ciudad} (${dest.precio}€)</option>`);
                });
                $destinoSelect.prop('disabled', false);
            }
        }
    });

    // Cambio de destino -> Actualizar precio
    $destinoSelect.on('change', function() {
        const $selectedOption = $(this).find(':selected');
        currentPricePerPerson = $selectedOption.data('price') || 0;
        updateTotal();
    });

    $('#pasajeros').on('input', updateTotal);

    // Gestión de mascotas
    // Precios: Pequeño (20€), Mediano (50€), Grande (100€)
    $addPetBtn.on('click', function() {
        const petId = Date.now(); // ID único para borrar luego
        const html = `
            <div class="pet-row" id="pet-${petId}">
                <select class="pet-size" name="pet-size" required>
                    <option value="" disabled selected>Tamaño de mascota...</option>
                    <option value="pequeno" data-fee="20">Pequeño (+20€)</option>
                    <option value="mediano" data-fee="50">Mediano (+50€)</option>
                    <option value="grande" data-fee="100">Grande (+100€)</option>
                </select>
                <button type="button" class="btn-remove-pet" data-id="${petId}" aria-label="Eliminar mascota">X</button>
            </div>
        `;
        $petsList.append(html);
    });

    // Borrar mascota
    $(document).on('click', '.btn-remove-pet', function() {
        const id = $(this).data('id');
        $(`#pet-${id}`).remove();
        updateTotal();
    });

    // Cambio en tamaño de mascota -> Actualizar precio
    $(document).on('change', '.pet-size', updateTotal);

    // Calcular precio total
    function updateTotal() {
        if (currentPricePerPerson === 0) {
            $priceDisplay.hide();
            return;
        }

        const numPasajeros = parseInt($('#pasajeros').val()) || 1;
        let total = currentPricePerPerson * numPasajeros;

        // Sumar mascotas
        $('.pet-size').each(function() {
            const fee = $(this).find(':selected').data('fee') || 0;
            total += fee;
        });

        $totalPriceSpan.text(total);
        $priceDisplay.show();
    }

    // Envío -> Ir a pagar (Guardar borrador en sessionStorage)
    $bookingForm.on('submit', function(e) {
        e.preventDefault();

        // Recopilar datos de mascotas
        const mascotas = [];
        $('.pet-size').each(function() {
            mascotas.push({
                tamano: $(this).val(),
                precio: $(this).find(':selected').data('fee')
            });
        });

        const draftBooking = {
            origen: $origenSelect.val(),
            destino: $destinoSelect.val(),
            fecha: $('#fecha').val(),
            pasajeros: $('#pasajeros').val(),
            mascotas: mascotas,
            precioBaseUnitario: currentPricePerPerson,
            totalEuros: parseFloat($totalPriceSpan.text())
        };

        // Guardar en sessionStorage para pasarlo a la página de pago
        sessionStorage.setItem('draftBooking', JSON.stringify(draftBooking));

        // Redirigir a la página de pago
        window.location.href = 'pago.html';
    });
});
