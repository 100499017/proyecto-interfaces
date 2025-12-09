/* Lógica para página de comunidad */

// /js/comunidad.js

$(function() {

    // --- ELEMENTOS DEL DOM ---
    const $postBox = $('#post-box');
    const $postForm = $('#post-form');
    const $postContent = $('#post-content');
    const $postType = $('#post-type'); // El selector de tipo
    const $authWarning = $('#post-auth-warning');
    const $feed = $('#posts-feed'); // Donde van los posts
    const $userList = $('#user-list');

    // Variable para controlar el filtro activo
    let currentFilter = 'all'; 

    // Rutas dinámicas para imágenes
    let pathPrefix = window.location.pathname.includes('/pages/') ? '..' : '.';
    const DEFAULT_AVATAR_PATH = `${pathPrefix}/images/default-avatar.jpg`;

    // --- COMPROBAR SESIÓN ---
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        $postBox.show();
        $authWarning.hide();
    } else {
        $postBox.hide();
        $authWarning.show();
    }

    // --- LÓGICA DE PUBLICAR ---
    $postForm.on('submit', function(e) {
        e.preventDefault();
        
        // Volvemos a leer el usuario por seguridad
        const currentUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (!currentUser) return;

        const text = $postContent.val().trim();
        const type = $postType.val(); // Leemos si es consejo o pregunta

        if (!text) return;

        // Leer posts actuales
        const posts = JSON.parse(localStorage.getItem('communityPosts')) || [];

        // Crear nuevo post
        const newPost = {
            id: Date.now(),
            userEmail: currentUser.email,
            userName: currentUser.name,
            // Guardamos avatar o el por defecto
            userAvatar: currentUser.avatar || DEFAULT_AVATAR_PATH,
            date: new Date().toLocaleDateString(),
            content: text,
            type: type, // Guardamos el tipo
            comments: []
        };

        // Añadir al principio
        posts.unshift(newPost);
        localStorage.setItem('communityPosts', JSON.stringify(posts));

        // Limpiar formulario y recargar lista
        $postContent.val('');
        renderPosts();
    });

    // --- LÓGICA DE FILTROS ---
    $('.filter-btn').on('click', function() {
        // Cambiar estilo visual de los botones
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        // Actualizar la variable de filtro
        currentFilter = $(this).data('filter'); // 'all', 'consejo' o 'pregunta'

        // Volver a pintar la lista con el filtro aplicado
        renderPosts();
    });

    // --- 5. RENDERIZAR POSTS (FUNCIÓN PRINCIPAL) ---
    function renderPosts() {
        $feed.empty(); // Limpia el mensaje de "Cargando..."

        let posts = JSON.parse(localStorage.getItem('communityPosts')) || [];

        // APLICAR FILTRO
        if (currentFilter !== 'all') {
            posts = posts.filter(post => post.type === currentFilter);
        }

        // Si no hay posts (después de filtrar)
        if (posts.length === 0) {
            const emptyMsg = currentFilter === 'all' 
                ? 'Aún no hay publicaciones. ¡Sé el primero!' 
                : `No hay ${currentFilter}s publicadas todavía.`;
            
            $feed.html(`<p class="no-posts">${emptyMsg}</p>`);
            return;
        }

        // DEFINIR ICONOS (Usamos pathPrefix definido al inicio del archivo)
        const ICON_PREGUNTA = `${pathPrefix}/images/red-question-mark.svg`;
        const ICON_CONSEJO = `${pathPrefix}/images/lightbulb.svg`;

        // Generar HTML para cada post
        posts.forEach(post => {
            const avatarSrc = post.userAvatar || DEFAULT_AVATAR_PATH;
            
            // Determinar etiqueta (badge) y estilo
            const postType = post.type || 'consejo'; // Por defecto consejo si es antiguo
            const badgeClass = postType === 'pregunta' ? 'badge-pregunta' : 'badge-consejo';
            
            // Elegimos el svg y el texto
            const iconSrc = postType === 'pregunta' ? ICON_PREGUNTA : ICON_CONSEJO;
            const labelText = postType === 'pregunta' ? 'Pregunta' : 'Consejo';

            const html = `
                <div class="post-card">
                    <span class="post-badge ${badgeClass}">
                        <img src="${iconSrc}" alt="Icono"> ${labelText}
                    </span>

                    <div class="post-header">
                        <img src="${avatarSrc}" alt="${post.userName}" class="post-avatar">
                        <div class="post-info">
                            <h4>${post.userName}</h4>
                            <p class="post-date">${post.date}</p>
                        </div>
                    </div>
                    <div class="post-body">
                        ${post.content}
                    </div>
                    <div class="post-footer">
                        <a href="detalle-post.html?id=${post.id}" class="btn-comment" style="text-decoration:none; color:var(--color-primario); font-weight:600;">
                            💬 Ver comentarios (${post.comments ? post.comments.length : 0})
                        </a>
                    </div>
                </div>
            `;
            $feed.append(html);
        });
    }

    // --- 6. BARRA LATERAL (OTROS USUARIOS) ---
    function renderSidebarUsers() {
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        $userList.empty();

        const otherUsers = allUsers.filter(u => !loggedInUser || u.email !== loggedInUser.email);
        const usersToShow = otherUsers.slice(0, 5);

        if (usersToShow.length === 0) {
            $userList.html('<p>No hay otros viajeros registrados.</p>');
            return;
        }

        usersToShow.forEach(user => {
            const avatarSrc = user.avatar || DEFAULT_AVATAR_PATH;
            const html = `
                <div class="sidebar-user">
                    <img src="${avatarSrc}" alt="${user.name}">
                    <span>${user.name}</span>
                </div>
            `;
            $userList.append(html);
        });
    }

    // --- INICIALIZACIÓN ---
    // Llamamos a las funciones para que se ejecuten nada más abrir la página
    renderPosts();
    renderSidebarUsers();

});
