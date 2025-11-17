/* Lógica para exploración */

$(function() {
    // Seleccionar elementos
    const $searchBox = $('#search-box');
    const $container = $('#results-container');

    // Variable global para guardar los datos del JSON
    let allDestinations = [];

    // Función para mostrar los destinos
    // Esta función recibe un array de continentes y lo convierte en HTML
    function renderDestinations(continents) {
        $container.empty(); // Limpia el contenedor

        if (continents.length === 0) {
            $container.html('<p class="no-results">No se encontraron destinos que coincidan con tu búsqueda.</p>');
            return;
        }

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
                    // Crea la tarjeta de la ciudad
                    const $cityCard = $(`
                        <div class="city-card">
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

    // Función de búsqueda/filtrado
    function filterDestinations() {
        const searchTerm = $searchBox.val().toLowerCase();

        // Si la búsqueda está vacía, muestra todo
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

    let destinations_path = '../data/ciudades-del-mundo-es.json';
    if (localStorage.getItem('lang') === 'en') {
        destinations_path = '../data/ciudades-del-mundo-en.json';
    }

    // Carga inicial de datos
    $.getJSON(destinations_path)
        .done(function(data) {
            allDestinations = data.continents; // Guarda los datos en la variable global

            // Muestra las ciudades por primera vez
            renderDestinations(allDestinations);
        })
        .fail(function() {
            $container.html('<p class="no-results">Error al cargar los destinos. Inténtalo de nuevo más tarde.</p>');
        });
});
