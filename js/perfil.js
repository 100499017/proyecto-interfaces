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
    const pathPrefix = '..'; 
    const DEFAULT_AVATAR = `${pathPrefix}/assets/images/default-avatar.png`;

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

        myPosts.forEach(p => {
            const typeLabel = p.type === 'pregunta' ? '❓ Pregunta' : '💡 Consejo';
            
            const html = `
                <div class="item-card">
                    <button class="delete-post-btn" data-id="${p.id}" title="Eliminar publicación">🗑️ Eliminar</button>
                    <div class="item-header">
                        <span>${typeLabel}</span>
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


    // CERRAR SESIÓN
    $('#logout-btn').on('click', function() {
        if(confirm('¿Cerrar sesión?')) {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = '../index.html';
        }
    });

});
