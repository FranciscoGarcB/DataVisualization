// Reemplaza 'TU_TOKEN_MAPBOX' con tu token de Mapbox
  mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbmNpc2NvZ2FyY2IiLCJhIjoiY2xweDN5ZXMwMGxoNDJxbzl4ZTg4Mjg4aiJ9.zmi1_1GQonBXdbnESnCy6g';

// Inicializamos el mapa en una ubicación específica (coordenadas del centro de Estados Unidos)
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/navigation-day-v1',
  center: [-98.5795, 39.8283],
  zoom: 3
});

  // Cargamos los datos desde el archivo CSV
  fetch('../datasets/dot-density.csv')
    .then(response => response.text())
    .then(csvData => {
      // Parseamos el CSV
      var points = Papa.parse(csvData, { header: true }).data;

      // Convertimos los puntos a GeoJSON
      var geojson = {
        type: 'FeatureCollection',
        features: points.map(point => {
          var latitude = parseFloat(point.latitude_coordinate);
          var longitude = parseFloat(point.longitude_coordinate);

          if (!isNaN(latitude) && !isNaN(longitude)) {
            return {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              }
            };
          }
        }).filter(Boolean) // Eliminamos elementos nulos
      };

<<<<<<< HEAD
    // Añadimos los datos al mapa
    map.on('load', function() {
      map.addLayer({
        id: 'points',
        type: 'circle',
        source: {
          type: 'geojson',
          data: geojson
        },
        paint: {
          'circle-radius': 3,
          'circle-color': '#04AA6D'
        }
=======
      // Añadimos los datos al mapa
      map.on('load', function() {
        map.addLayer({
          id: 'points',
          type: 'circle',
          source: {
            type: 'geojson',
            data: geojson
          },
          paint: {
            'circle-radius': 3,
            'circle-color': '#FF0000'
          }
        });
>>>>>>> parent of ab86a1f (Added gitignore)
      });
    });