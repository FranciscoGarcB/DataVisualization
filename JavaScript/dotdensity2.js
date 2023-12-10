mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbmNpc2NvZ2FyY2IiLCJhIjoiY2xweDN5ZXMwMGxoNDJxbzl4ZTg4Mjg4aiJ9.zmi1_1GQonBXdbnESnCy6g';

// Initialize map on USA
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/navigation-day-v1',
  center: [-98.5795, 39.8283],
  zoom: 3
});

// Load CSV data using d3 library
d3.csv('../datasets/dot-density2.csv', function (error, data) {
  if (error) throw error;

  // Define a color scale for "common_name"
  var colorScale = d3.scaleOrdinal()
    .domain(data.map(function (d) { return d.common_name; }))
    .range(d3.schemeCategory10); // You can choose a different color scheme

  // Add points to the map
  map.on('load', function () {
    map.addSource('points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: data.map(function (d) {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [parseFloat(d.longitude_coordinate), parseFloat(d.latitude_coordinate)]
            },
            properties: {
              common_name: d.common_name
            }
          };
        })
      }
    });

    // Add a layer for each unique value in "common_name"
    data.forEach(function (d) {
      var layerId = 'point-' + d.common_name;
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: 'points',
        filter: ['==', 'common_name', d.common_name],
        paint: {
          'circle-color': colorScale(d.common_name),
          'circle-radius': 5,
          'circle-opacity': 0.7
        }
      });
    });
  });
});
