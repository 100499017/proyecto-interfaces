/* Lógica para exploración */

$(function() {

    // --- LÓGICA DE TRADUCCIÓN ---
    const lang = localStorage.getItem('lang') || 'es'; // 'es' por defecto
    const t = translations[lang]; // Cargar el diccionario correcto

    // Función para aplicar textos al HTML estático
    function applyTranslations() {
        $('[data-i18n]').each(function() {
            const key = $(this).data('i18n');
            if (t[key]) {
                if ($(this).is('input')) {
                    $(this).attr('placeholder', t[key]);
                } else {
                    $(this).text(t[key]);
                }
            }
        });
    }
    
    // Ejecutar traducción nada más empezar
    applyTranslations();

    // Seleccionar elementos
    const $searchBox = $('#search-box');
    const $container = $('#results-container');

    // Variable global para guardar los datos del JSON
    let allDestinations = [];

    // DEFINIR RUTAS DE ICONOS
    const ICON_EMPTY = '../images/white-heart.svg';
    const ICON_FILLED = '../images/red-heart.svg';

    // FUNCIÓN PARA OBTENER LUGARES FAVORITOS DEL USUARIO ---
    function getUserFavorites() {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) return []; // Si no hay usuario, no hay favoritos

        const allFavs = JSON.parse(localStorage.getItem('favorites')) || [];
        // Devolvemos solo los de este usuario
        return allFavs.filter(f => f.userEmail === loggedInUser.email);
    }

    // Función para mostrar los destinos
    // Esta función recibe un array de continentes y lo convierte en HTML
    function renderDestinations(continents) {
        $container.empty(); // Limpia el contenedor

        if (continents.length === 0) {
            $container.html(`<p class="no-results">${t['no_results']}</p>`);
            return;
        }

        const userFavs = getUserFavorites(); // Obtenemos la lista actual de favs

        // Bucle por cada continente
        continents.forEach(continent => {
            // Añade el título del continente
            $container.append(`<h2 class="continent-heading">${continent.name}</h2>`);
            
            // Bucle por cada país en el continente
            continent.countries.forEach(country => {
                // Añade el título del país
                $container.append(`<h3 class="country-heading">${country.name}</h3>`);

                // Crea un 'div' para la cuadrícula de ciudades de este país
                const $cityGrid = $('<div class="city-grid"></div>');
                
                // Bucle por cada ciudad en el país
                country.cities.forEach(city => {
                    const isFav = userFavs.some(f => f.cityName === city.name);

                    // ELEGIR QUÉ IMAGEN MOSTRAR
                    const iconSrc = isFav ? ICON_FILLED : ICON_EMPTY;

                    // Traducción de titulo de botones para añadir/quitar favoritos
                    const titleText = isFav 
                        ? (lang === 'en' ? 'Remove from favorites' : 'Quitar de favoritos')
                        : (lang === 'en' ? 'Add to favorites' : 'Añadir a favoritos');

                    // Crea la tarjeta de la ciudad
                    const $cityCard = $(`
                        <div class="city-card">
                            <button class="fav-btn" 
                                    data-name="${city.name}"
                                    data-country="${country.name}"
                                    data-img="${city.image.url}"
                                    data-desc="${city.description}"
                                    title="${titleText}">
                                <img src="${iconSrc}" alt="Favorito">
                            </button>
                            <img src="${city.image.url}" alt="${city.image.alt}" class="city-card-image">
                            <div class="city-card-content">
                                <h4>${city.name}</h4>
                                <p>${city.description}</p>
                            </div>
                        </div>
                    `);
                    // Añade la tarjeta a la cuadrícula del país
                    $cityGrid.append($cityCard);
                });

                // Añade la cuadrícula del país al contenedor principal
                $container.append($cityGrid);
            });
        });
    }

    // --- EVENTO CLIC EN CORAZÓN ---
    $(document).on('click', '.fav-btn', function(e) {
        e.preventDefault();
        
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) {
            const msg = lang === 'en' ? 'Please login to save favorites.' : 'Inicia sesión para guardar favoritos.';
            alert(msg);
            return;
        }

        const $btn = $(this);
        const $icon = $btn.find('img'); // Seleccionamos la imagen dentro del botón
        const cityName = $btn.data('name');
        
        const cityData = {
            cityName: cityName,
            countryName: $btn.data('country'),
            image: $btn.data('img'),
            description: $btn.data('desc'),
            userEmail: loggedInUser.email
        };

        let allFavs = JSON.parse(localStorage.getItem('favorites')) || [];
        const existingIndex = allFavs.findIndex(f => f.cityName === cityName && f.userEmail === loggedInUser.email);

        if (existingIndex > -1) {
            // YA EXISTE -> BORRAR -> PONER CORAZÓN BLANCO
            allFavs.splice(existingIndex, 1);
            $icon.attr('src', ICON_EMPTY); // Cambiamos el SRC
            $btn.attr('title', 'Añadir a favoritos');
        } else {
            // NO EXISTE -> AÑADIR -> PONER CORAZÓN ROJO
            allFavs.push(cityData);
            $icon.attr('src', ICON_FILLED); // Cambiamos el SRC
            $btn.attr('title', 'Quitar de favoritos');
            
            // Efecto visual
            $btn.css('transform', 'scale(1.3)');
            setTimeout(() => $btn.css('transform', 'scale(1)'), 200);
        }

        localStorage.setItem('favorites', JSON.stringify(allFavs));
    });

    // Función de búsqueda/filtrado
    function filterDestinations(searchTerm) {
        // Si no pasamos argumento, lo leemos del input
        if (typeof searchTerm !== 'string') {
            searchTerm = $searchBox.val().toLowerCase();
        } else {
            searchTerm = searchTerm.toLowerCase();
        }

        if (searchTerm.length === 0) {
            renderDestinations(allDestinations);
            return;
        }
        
        // Lógica de filtrado
        // .map() y .filter() para crear un *nuevo* array con solo los resultados
        const filteredContinents = allDestinations.map(continent => {

            // Revisa si el nombre del continente coincide
            const continentMatch = continent.name.toLowerCase().includes(searchTerm);

            // Filtra los países
            const filteredCountries = continent.countries.map(country => {

                // Revisa si el nombre del país coincide
                const countryMatch = country.name.toLowerCase().includes(searchTerm);

                // Filtra las ciudades
                const filteredCities = country.cities.filter(city => {
                    const cityMatch = city.name.toLowerCase().includes(searchTerm);
                    // Muestra la ciudad si "La ciudad coincide" o "Su país coincide" o "Su continente coincide"
                    return cityMatch || countryMatch || continentMatch;
                });

                // Si este país tiene ciudades que coinciden, devuélvelo
                if (filteredCities.length > 0) {
                    return { ...country, cities: filteredCities };
                }
                return null; // Si no, descarta este país

            }).filter(country => country !== null); // Limpia los países nulos

            // Si este continente tiene países que coinciden, devuélvelo
            if (filteredCountries.length > 0) {
                return { ...continent, countries: filteredCountries };
            }
            return null; // Si no, descarta este continente

        }).filter(continent => continent !== null); // Limpia los continentes nulos

        // Renderiza solo los resultados filtrados
        renderDestinations(filteredContinents);
    }

    // Asigna la función de filtrado al evento 'input' del buscador
    $searchBox.on('input', filterDestinations);

    // --- CARGA DE JSON Y LÓGICA DE URL ---
    // Determinamos qué JSON cargar según idioma
    let destinations_path = '../data/ciudades-del-mundo-es.json'; 
    if (localStorage.getItem('lang') === 'en') {
        destinations_path = '../data/ciudades-del-mundo-en.json';
    }

    // Carga inicial de datos
    $.getJSON(destinations_path)
        .done(function(data) {
            allDestinations = data.continents; // Guarda los datos en la variable global
            
            // Miramos si hay algo en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const rawSearch = urlParams.get('search'); // Luego hay que formatearlo

            if (rawSearch) {
                // decodeURIComponent para manejar espacios y caracteres especiales
                // .replace(/-/g, ' ') para reemplazar guiones por espacios
                const cleanSearch = decodeURIComponent(rawSearch).replace(/-/g, ' ');

                // Rellenamos el input
                $searchBox.val(cleanSearch);
                // Filtramos inmediatamente
                filterDestinations(cleanSearch);
            } else {
                // Si no hay búsqueda, mostramos todo
                renderDestinations(allDestinations);
            }
        })
        .fail(function() {
            $container.html(`<p class="no-results">${t['error_loading']}</p>`);
        });
});
