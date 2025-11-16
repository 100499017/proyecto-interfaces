// Lógica de la página de perfil

$(function() {
    // Redirigir a los usuarios que no tengan una sesión iniciada
    if (!sessionStorage.getItem('loggedInUser')) {
        window.location.href = '../index.html';
    }

    $('.logout-btn').on('click', function() {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = '../index.html';
    })
})
