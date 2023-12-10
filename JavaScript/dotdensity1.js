mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbmNpc2NvZ2FyY2IiLCJhIjoiY2xweDN5ZXMwMGxoNDJxbzl4ZTg4Mjg4aiJ9.zmi1_1GQonBXdbnESnCy6g';

// Initialize map on USA
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/navigation-day-v1',
  center: [-98.5795, 39.8283],
  zoom: 3
});

// Load CSV data using d3 library
d3.csv('../datasets/dot-density1.csv', function (error, data) {
  if (error) throw error;

  // Add clustering
  map.on('load', function () {
    map.addSource('clusters', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: data.map(function (d) {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [parseFloat(d.longitude_coordinate), parseFloat(d.latitude_coordinate)]
            }
          };
        })
      },
      cluster: true,
      clusterMaxZoom: 10,
      clusterRadius: 50
    });

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clusters',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#C2BCBC',
          100,
          '#867843',
          750,
          '#4C8643'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clusters',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'clusters',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#04AA6D',
        'circle-radius': 3,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });
  });
});
