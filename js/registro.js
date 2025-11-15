// Lógica para registro

// Espera a que el documento esté listo
$(function() {
    // Lógica para el enlace "Inciar sesión"
    const $loginModal = $('#login-modal');

    $('#open-login-modal-link').on('click', function(e) {
        e.preventDefault(); // Evita que el enlace recargue la página
        $loginModal.addClass('visible'); // Muestra el modal de inicio de sesión
    });

    // Función para convertir archivo a Base64
    function getBase64(file) {
        return new Promise((resolver, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolver(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    // Lógica de validación del formulario

    // Elementos que validaremos
    const $form = $('#register-form');
    const $name = $('#register-name');
    const $avatar = $('#register-avatar');
    const $email = $('#register-email');
    const $password = $('#register-password');
    const $confirmPassword = $('#register-password-confirm');
    
    // Spans de error
    const $nameError = $('#name-error');
    const $avatarError = $('#avatar-error');
    const $emailError = $('#email-error');
    const $passwordError = $('#password-error');
    const $confirmPasswordError = $('#confirm-password-error');

    // Definiciones para la contraseña
    const allowedSpecialChars = '!@#$%*';
    // Regex para caracteres NO permitidos (cualquier cosa que NO sea letra, número o de tu lista)
    const invalidCharRegex = new RegExp('[^A-Za-z0-9' + allowedSpecialChars.replace(/./g, '\\$&') + ']');
    // Regex para REQUERIR al menos uno de tu lista
    const requiredSpecialCharRegex = new RegExp('[' + allowedSpecialChars.replace(/./g, '\\$&') + ']');

    // Añadimos 'async' para poder usar 'await' dentro
    $form.on('submit', async function(e) {
        // Evitar el envío del formulario
        e.preventDefault();
        
        let isValid = true;

        // Resetear todos los mensajes de error
        $('.error-text').text('').hide()

        //Validación de nombre
        const nameVal = $name.val().trim();
        if (nameVal.length < 3) {
            $nameError.text('El nombre debe tener al menos 3 caracteres.').show();
            isValid = false;
        } else if (nameVal.length > 30) {
            $nameError.text('El nombre no debe exceder los 20 caracteres.').show();
            isValid = false;
        }

        // Validación de imagen
        if ($avatar[0].files.length > 0) {
            const fileName = $avatar[0].files[0].name;
            // Comprobamos la extensión con un Regex
            if (!/\.(jpe?g|png)$/i.test(fileName)) {
                $avatarError.text('Formato no válido. Solo se permite JPG, JPEG o PNG.').show();
                isValid = false;
            } else {
                // Intentamos leer el archivo
                try {
                    // 'await' pausa la ejecución hasta que la Promise se resuelva
                    avatarBase64 = await getBase64(file);

                    // localStorage tiene un límite de 5MB
                    // Base64 es 33% más grande que el archivo original
                    if (avatarBase64.length > 5 * 1024 * 1024) {
                        $avatarError.text('La imagen es demasiado grande (Máx ~5MB).').show();
                        isValid = false;
                        avatarBase64 = null; // No lo guarda
                    }
                } catch (error) {
                    $avatarError.text('Error al leer la imagen.').show();
                    isValid = false;
                }
            }
        }

        // Validación de email
        if (!$email[0].checkValidity()) {
            $emailError.text('Por favor, introduce un email válido.').show();
            isValid = false;
        }

        // Validación de contraseña
        const passVal = $password.val();
        let passwordErrors = []; // Array para acumular errores
        if (passVal.length < 7) {
            passwordErrors.push('Debe tener al menos 7 caracteres.');
        }
        if (!/[A-Z]/.test(passVal)) {
                passwordErrors.push('Debe contener al menos una mayúscula.');
        }
        if (!/[0-9]/.test(passVal)) {
            passwordErrors.push('Debe contener al menos un número.');
        }
        if (!requiredSpecialCharRegex.test(passVal)) {
            passwordErrors.push(`Debe contener un carácter especial (ej: ${allowedSpecialChars}).`);
        }
        if (invalidCharRegex.test(passVal)) {
            passwordErrors.push('Contiene caracteres especiales no permitidos.');
        }

        // Si hay errores de contraseña, los mostramos
        if (passwordErrors.length > 0) {
            $passwordError.html(passwordErrors.join('<br>')).show();
            isValid = false;
        }

        // Validación de confirmar contraseña
        if ($confirmPassword.val() !== passVal) {
            $confirmPasswordError.text('Las contraseñas no coinciden.').show();
            isValid = false;
        }

        // Envío final
        if (isValid) {
            const email = $email.val();

            // Obtener la lista actual de usuarios de localStorage
            // || [] asegura que tengamos un array vacío si es el primer usuario
            let users = JSON.parse(localStorage.getItem('users')) || [];

            // Comprobar si el email ya existe
            const existingUser = users.find(user => user.email === email);

            if (existingUser) {
                // Si el usuario existe, muestra un error
                $emailError.text('Este email ya está registrado.').show();
            } else {
                // Si no existe, crear el nuevo objeto de usuario
                const newUser = {
                    name: nameVal,
                    email: email,
                    password: passVal,
                    avatar: avatarBase64
                }

                // Añadir el nuevo usuario al array
                users.push(newUser);

                // Guardar el array actualizado en localStorage
                localStorage.setItem('users', JSON.stringify(users));

                // Mostrar mensaje de éxito y redirigir
                alert('¡Registro completado con éxito! Ahora puedes iniciar sesión.');

                window.location.href = "../index.html";
            }
        }
    })
})
