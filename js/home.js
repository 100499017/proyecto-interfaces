// Script para cargar el JSON y generar el HTML de destinos

// Espera a que el documento esté listo
$(function() {

    // --- LÓGICA DEL CARRUSEL DE IMÁGENES ---
    
    const $track = $('.carousel-track');
    const $slides = $('.carousel-slide');
    const $navContainer = $('.carousel-nav');

    const totalSlides = $slides.length;
    let currentSlide = 0;
    let autoplayInterval;

    // Función para ir a un slide
    function goToSlide(slideIndex) {
        // El track se moverá un 20% por cada slide
        const percentage = -(slideIndex * (100 / totalSlides));

        // Mueve el .carousel-track
        $track.css('transform', `translateX(${percentage}%)`);

        // Actualiza el círculo activo
        $navContainer.find('.carousel-dot').removeClass('active');
        $navContainer.find(`.carousel-dot[data-index="${slideIndex}"]`).addClass('active');

        // Actualiza el slide actual
        currentSlide = slideIndex;
    }

    // Crear los círculos
    for (let i = 0; i < totalSlides; i++) {
        const $dot = $('<div></div>')
            .addClass('carousel-dot')
            .attr('data-index', i); // Guarda el índice (0, 1, 2, 3, 4)

        $navContainer.append($dot);
    }

    // Asignar clicks a los círculos
    $navContainer.on('click', '.carousel-dot', function() {
        const index = $(this).data('index');
        goToSlide(index);

        // Resetea el autoplay para que no cambie justo después del click
        stopAutoplay();
        startAutoplay();
    });

    // Autoplay (cambio periódico)
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            // Si estamos en el último slide, vuelve al primero
            const nextSlide = (currentSlide + 1) % totalSlides;
            goToSlide(nextSlide);
        }, 5000); // Cambia cada 5 segundos
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Pone el carrusel en el slide 0 y activa el primer círculo
    goToSlide(currentSlide);

    // Inicia el autoplay
    startAutoplay();

    // --- LÓGICA DE CARGA DE PUBLICACIONES RECIENTES ---
    const $communityList = $('#home-community-list');
    
    // Carga de iconos svg
    const ICON_PREGUNTA = 'images/red-question-mark.svg';
    const ICON_CONSEJO = 'images/lightbulb.svg';

    function loadHomeCommunity() {
        const posts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        
        $communityList.empty();

        if (posts.length === 0) {
            $communityList.html('<p style="color:var(--text-secondary);">Aún no hay actividad reciente.</p>');
            return;
        }

        // Tomamos solo los 3 últimos
        const latestPosts = posts.slice(0, 3);

        latestPosts.forEach(post => {
            const isQuestion = post.type === 'pregunta';
            const iconSrc = isQuestion ? ICON_PREGUNTA : ICON_CONSEJO;
            const typeText = isQuestion ? 'Pregunta' : 'Consejo';

            const html = `
                <div class="home-post-card">
                    <div class="home-post-header">
                        <img src="${iconSrc}" alt="${typeText}">
                        <span>${typeText} de ${post.userName}</span>
                    </div>
                    <div class="home-post-content">
                        "${post.content}"
                    </div>
                    <a href="pages/detalle-post.html?id=${post.id}" class="home-post-footer">
                        Leer conversación &rarr;
                    </a>
                </div>
            `;
            $communityList.append(html);
        });
    }

    // Ejecutar carga de publicaciones recientes
    loadHomeCommunity();

    // BANNER DE REGISTRO
    if (localStorage.getItem('loggedInUser')) {
        $('.btn-register').on('click', function(e) {
            e.preventDefault();
            alert("Cierra sesión antes de crear una nueva cuenta.")
        });
    }
})
