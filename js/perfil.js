// Lógica de la página de perfil

// /js/perfil.js

$(function() {

    // Comprueba si has iniciado sesión
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        alert('Debes iniciar sesión para ver tu perfil.');
        window.location.href = '../index.html'; // Te echa de la página
        return; 
    }

    // RUTAS DE IMÁGENES 
    const DEFAULT_AVATAR = `../images/default-avatar.jpg`;

    // CARGAR INFO DEL USUARIO (Sidebar y Pestaña de Información Personal)
    const avatarSrc = loggedInUser.avatar || DEFAULT_AVATAR;
    
    // Sidebar
    $('#sidebar-avatar').attr('src', avatarSrc);
    $('#sidebar-name').text(loggedInUser.name);

    // Pestaña de Información Personal
    $('#profile-name').val(loggedInUser.name);
    $('#profile-email').val(loggedInUser.email);


    // LÓGICA DE PESTAÑAS
    $('.menu-btn').not('.logout-btn').on('click', function() {
        // Cambiar estilos botones
        $('.menu-btn').removeClass('active');
        $(this).addClass('active');

        // Mostrar contenido correspondiente
        const tabId = $(this).data('tab'); // "info", "bookings", o "posts"
        
        $('.tab-pane').removeClass('active'); // Ocultar todos
        $('#tab-' + tabId).addClass('active'); // Mostrar el elegido

        // Si es bookings o posts, recargar los datos (por si hubo cambios)
        if (tabId === 'bookings') renderBookings();
        if (tabId === 'posts') renderMyPosts();
        if (tabId === 'favorites') renderFavorites();
    });


    // CARGAR BILLETES (Historial de Compra)
    function renderBookings() {
        const $list = $('#bookings-list');
        const allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
        
        // Filtrar solo los míos
        const myBookings = allBookings.filter(b => b.userEmail === loggedInUser.email);
        
        $list.empty();

        if (myBookings.length === 0) {
            $list.html('<div class="empty-state">No has realizado ninguna compra todavía.</div>');
            return;
        }

        // Ordenar: más recientes primero (usando el ID que es un timestamp)
        myBookings.reverse(); 

        myBookings.forEach(b => {
            const mascotasInfo = b.mascotas && b.mascotas.length > 0 
                ? `${b.mascotas.length} mascota(s)` 
                : 'Sin mascotas';

            const html = `
                <div class="item-card">
                    <div class="item-header">
                        <span>${b.origen} ➝ ${b.destino}</span>
                        <span class="item-status">${b.estado || 'Confirmado'}</span>
                    </div>
                    <div class="item-details">
                        <p><strong>Fecha:</strong> ${b.fecha}</p>
                        <p><strong>Pasajeros:</strong> ${b.pasajeros}</p>
                        <p><strong>Extras:</strong> ${mascotasInfo}</p>
                        <p style="margin-top:10px; font-weight:bold;">Total: ${b.totalPagado || '---'}</p>
                    </div>
                </div>
            `;
            $list.append(html);
        });
    }


    // CARGAR MIS PUBLICACIONES
    function renderMyPosts() {
        const $list = $('#posts-list');
        const allPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        
        // Filtrar las mías
        const myPosts = allPosts.filter(p => p.userEmail === loggedInUser.email);

        $list.empty();

        if (myPosts.length === 0) {
            $list.html('<div class="empty-state">No has publicado nada en la comunidad aún.</div>');
            return;
        }

        // ICONOS
        const ICON_PREGUNTA = `../images/red-question-mark.svg`;
        const ICON_CONSEJO = `../images/lightbulb.svg`;

        myPosts.forEach(p => {
            const iconSrc = p.type === 'pregunta' ? ICON_PREGUNTA : ICON_CONSEJO;
            const iconLabel = p.type === 'pregunta' ? 'Pregunta' : 'Consejo';
            const labelText = p.type === 'pregunta' ? 'Pregunta' : 'Consejo';
            
            const html = `
                <div class="item-card">
                    <button class="delete-post-btn" data-id="${p.id}" title="Eliminar publicación">Eliminar</button>
                    <div class="item-header">
                        <span style="display:flex; align-items:center;">
                            <img src="${iconSrc}" alt="${iconLabel}" style="width:16px; height:16px; margin-right:5px;"> 
                            ${labelText}
                        </span>
                        <span style="color:var(--text-secondary); font-weight:normal; font-size:0.8rem;">${p.date}</span>
                    </div>
                    <div class="item-details">
                        <p style="font-style:italic;">"${p.content}"</p>
                        <p style="margin-top:10px; font-size:0.8rem;">
                            Comentarios recibidos: ${p.comments ? p.comments.length : 0}
                        </p>
                    </div>
                </div>
            `;
            $list.append(html);
        });
    }


    // BORRAR PUBLICACIÓN
    $(document).on('click', '.delete-post-btn', function() {
        if(!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;

        const idToDelete = $(this).data('id');
        let allPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];

        // Filtramos para quitar el post con ese ID
        const updatedPosts = allPosts.filter(p => p.id != idToDelete);

        // Guardar y refrescar
        localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
        renderMyPosts();
    });

    // DEFINIR RUTA
    const ICON_BROKEN = '../images/broken-heart.svg';

    // RENDERIZAR FAVORITOS
    function renderFavorites() {
        const $list = $('#favorites-list');
        const allFavs = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Filtrar los míos
        const myFavs = allFavs.filter(f => f.userEmail === loggedInUser.email);

        $list.empty();

        if (myFavs.length === 0) {
            $list.html('<div class="empty-state">No has añadido ningún destino a favoritos.</div>');
            return;
        }

        myFavs.forEach(city => {
            // Reusamos el estilo de tarjeta de explorar.css
            // Nota: Quitamos el botón de corazón aquí, o ponemos uno de "eliminar"
            const html = `
                <div class="city-card">
                    <img src="${city.image}" alt="${city.cityName}" class="city-card-image">
                    <div class="city-card-content">
                        <h3>${city.cityName}</h3>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.5rem;">${city.countryName}</p>
                        <p>${city.description}</p>
                        
                        <button class="btn-remove-fav" data-name="${city.cityName}" title="Eliminar de favoritos">
                            <img src="${ICON_BROKEN}" alt="Eliminar" style="width:20px; height:20px; vertical-align:middle; margin-right:5px;">
                            Quitar
                        </button>
                    </div>
                </div>
            `;
            $list.append(html);
        });
    }

    // LÓGICA PARA QUITAR FAVORITO DESDE EL PERFIL
    $(document).on('click', '.btn-remove-fav', function() {
        const cityName = $(this).data('name');
        let allFavs = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Filtrar para quitar el elemento
        const updatedFavs = allFavs.filter(f => !(f.cityName === cityName && f.userEmail === loggedInUser.email));
        
        localStorage.setItem('favorites', JSON.stringify(updatedFavs));
        renderFavorites(); // Recargar la lista
    });

    // CERRAR SESIÓN
    $('#logout-btn').on('click', function() {
        if(confirm('¿Cerrar sesión?')) {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = '../index.html';
        }
    });

    // ELIMINAR CUENTA
    $('#delete-account-btn').on('click', function() {
        if(confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            // Eliminar sitios favoritos
            let allFavs = JSON.parse(localStorage.getItem('favorites')) || [];
            const updatedFavs = allFavs.filter(f => f.userEmail !== loggedInUser.email);
            localStorage.setItem('favorites', JSON.stringify(updatedFavs));

            // Poner los posts como "Usuario Eliminado"
            let allPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
            const anonymizedPosts = allPosts.map(p => {
                if (p.userEmail === loggedInUser.email) {
                    return {
                        ...p,
                        userAvatar: DEFAULT_AVATAR,
                        userEmail: null,
                        userName: 'Usuario Eliminado',
                    };
                }
                return p;
            });
            localStorage.setItem('communityPosts', JSON.stringify(anonymizedPosts));

            // Eliminar billetes
            let allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
            const updatedBookings = allBookings.filter(b => b.userEmail !== loggedInUser.email);
            localStorage.setItem('bookings', JSON.stringify(updatedBookings));
   
            // Eliminar usuario
            let allUsers = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = allUsers.filter(u => u.email !== loggedInUser.email);
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            // Cerrar sesión y redirigir
            sessionStorage.removeItem('loggedInUser');
            alert('Tu cuenta ha sido eliminada.');
            window.location.href = '../index.html';
            }
        });

});
