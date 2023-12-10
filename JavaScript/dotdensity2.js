// Set up the SVG container
var width = 800;
var height = 600;

var svg = d3.select('#map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Load the US states GeoJSON
d3.json('../datasets/us-states.json').then(function(us) {
  // Load the CSV data
  
    // Create a color scale for common_name values
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create projection and path for the map
    var projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(1000);

    var path = d3.geoPath().projection(projection);

    // Bind data to the map and draw state boundaries
    svg.selectAll('path')
      .data(us.features)
      .enter().append('path')
      .attr('d', path)
      .style('fill', 'white')
      .style('stroke', 'lightgray');

  d3.csv('../datasets/dot-density2.csv').then(function(data) {
    // Add dots for each row in the CSV
    svg.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('cx', function(d) {
        return projection([+d.longitude_coordinate, +d.latitude_coordinate])[0];
      })
      .attr('cy', function(d) {
        return projection([+d.longitude_coordinate, +d.latitude_coordinate])[1];
      })
      .attr('r', 1.5) // Adjust the radius as needed
      .style('fill', function(d) {
        return colorScale(d.common_name);
      });

    // Add legend
    var legend = svg.selectAll('.legend')
      .data(colorScale.domain())
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        return 'translate(0,' + i * 20 + ')';
      });

    legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', colorScale);

    legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(function(d) {
        return d;
      }); 
  });
});