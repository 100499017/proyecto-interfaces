// Lógica de la página de perfil

$(function() {
    $('.logout-btn').on('click', function() {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = '../index.html';
    })
})
