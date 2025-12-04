// /js/detalle-post.js

$(function() {

    // --- 1. LEER ID DE LA URL ---
    // Si la URL es detalle-post.html?id=1731234567890
    // postId será "1731234567890"
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert('Error: No se especificó ninguna publicación.');
        window.location.href = 'comunidad.html';
        return;
    }

    // --- 2. BUSCAR EL POST EN LOCALSTORAGE ---
    let allPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];
    
    // Usamos '==' en lugar de '===' porque el ID en URL es string y en JSON es number
    let currentPost = allPosts.find(p => p.id == postId);

    if (!currentPost) {
        alert('Esta publicación ya no existe.');
        window.location.href = 'comunidad.html';
        return;
    }

    // Rutas dinámicas
    const pathPrefix = '..'; 
    const DEFAULT_AVATAR = `${pathPrefix}/assets/images/default-avatar.png`;


    // --- 3. RENDERIZAR EL POST ORIGINAL ---
    const avatarSrc = currentPost.userAvatar || DEFAULT_AVATAR;
    
    // Badge de tipo (Consejo vs Pregunta)
    const postType = currentPost.type || 'consejo';
    const badgeClass = postType === 'pregunta' ? 'badge-pregunta' : 'badge-consejo';
    const badgeText = postType === 'pregunta' ? '❓ Pregunta' : '💡 Consejo';

    const postHtml = `
        <div class="post-card" style="border: 2px solid #e0e0e0;">
            <span class="post-badge ${badgeClass}">${badgeText}</span>
            <div class="post-header">
                <img src="${avatarSrc}" alt="${currentPost.userName}" class="post-avatar">
                <div class="post-info">
                    <h4>${currentPost.userName}</h4>
                    <p class="post-date">${currentPost.date}</p>
                </div>
            </div>
            <div class="post-body" style="font-size: 1.1rem;">
                ${currentPost.content}
            </div>
        </div>
    `;
    $('#original-post-container').html(postHtml);


    // --- 4. GESTIÓN DE COMENTARIOS ---
    
    // A. Renderizar lista
    const $commentsList = $('#comments-list');

    function renderComments() {
        $commentsList.empty();
        
        // Si no existe el array de comentarios, usa uno vacío
        const comments = currentPost.comments || [];

        if (comments.length === 0) {
            $commentsList.html('<p style="color:#777; font-style:italic;">No hay comentarios. Sé el primero en responder.</p>');
            return;
        }

        comments.forEach(comment => {
            const html = `
                <div class="comment-card">
                    <div class="comment-header">
                        <span class="comment-author">${comment.userName}</span>
                        <span class="comment-date">${comment.date}</span>
                    </div>
                    <div class="comment-body">
                        ${comment.text}
                    </div>
                </div>
            `;
            $commentsList.append(html);
        });
    }

    // Ejecutar al inicio
    renderComments();


    // B. Formulario de Comentarios
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const $commentFormBox = $('#comment-form-box');
    const $authWarning = $('#comment-auth-warning');

    // Mostrar form solo si logueado
    if (loggedInUser) {
        $commentFormBox.show();
        $authWarning.hide();
    } else {
        $commentFormBox.hide();
        $authWarning.show();
        
        $('#login-link-detail').on('click', function() {
             if(typeof openModal === 'function') openModal();
        });
    }

    // C. Enviar Comentario
    $('#comment-form').on('submit', function(e) {
        e.preventDefault();
        
        const text = $('#comment-content').val().trim();
        if (!text) return;

        // Crear objeto comentario
        const newComment = {
            id: Date.now(),
            userName: loggedInUser.name,
            userEmail: loggedInUser.email,
            date: new Date().toLocaleDateString(),
            text: text
        };

        // Asegurar que el array existe en el post actual
        if (!currentPost.comments) {
            currentPost.comments = [];
        }

        // Añadir comentario al post en memoria
        currentPost.comments.push(newComment);

        // --- PASO CRÍTICO: ACTUALIZAR LOCALSTORAGE ---
        // 1. Encontrar el índice del post en el array gigante
        const postIndex = allPosts.findIndex(p => p.id == postId);
        
        // 2. Actualizar ese post en el array gigante
        allPosts[postIndex] = currentPost;
        
        // 3. Guardar el array gigante de nuevo
        localStorage.setItem('communityPosts', JSON.stringify(allPosts));

        // Limpiar y repintar
        $('#comment-content').val('');
        renderComments();
    });

});
