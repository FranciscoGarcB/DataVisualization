RadarChart.defaultConfig.radius = 4;
RadarChart.defaultConfig.factor = 0.9;
RadarChart.defaultConfig.h = 500;
RadarChart.defaultConfig.w = 500;
RadarChart.defaultConfig.levels = 6;
document.addEventListener('DOMContentLoaded', function() {
  // Assume you have the options filled in the select tag
  var regionSelect = document.getElementById('RegionSelect');

  // Set the default selected option to "National"
  var defaultOption = document.createElement('option');
  defaultOption.value = 'National';
  defaultOption.text = 'National';
  defaultOption.selected = true;
  regionSelect.add(defaultOption);

  // Function to load CSV and process data
  function loadData(selectedRegion) {
    d3.csv("../datasets/temps_radarchart.csv", function(error, rawData) {
      if (error) throw error;

      // Crear escala de colores
      var colorScale = d3.scale.category10();

      // Obtener valores únicos de la columna Year
      var uniqueYears = Array.from(new Set(rawData.map(function(d) { return d.Year; })));

      // Eliminar cualquier legend existente
      d3.select(".legend").remove();

      // Añadir legend
      var legend = d3.select("body").append("svg")
        .attr("class", "legend")
        .attr("width", 100)
        .attr("height", uniqueYears.length * 20)
        .style("position", "absolute")
        .style("top", "300px")
        .style("right", "10px")
        .selectAll("g")
        .data(uniqueYears)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return colorScale(d); });

      legend.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

      // Filter data based on selected RegionName and remove the RegionName and Year columns
      var filteredData = rawData.filter(function(d) {
        return d.RegionName === selectedRegion;
      }).map(function(d) {
        delete d.RegionName; // Remove the RegionName column
        delete d.Year; // Remove the Year column
        return d;
      });

      // Format data into the desired structure
      var data = filteredData.map(function(d) {
        var className = d.Year; // Set className as the value of the "Year" column
        var axes = Object.keys(d).map(function(axis, index) {
          return {
            axis: axis,
            value: +d[axis],
            xOffset: index === 0 ? 10 : undefined,
            yOffset: index === 0 ? 10 : undefined
          };
        });

        return { className: className, axes: axes };
      });

      // Draw radar chart using the formatted data
      RadarChart.draw(".chart-container", data);
    });
  }

  // Event listener for select change
  regionSelect.addEventListener('change', function() {
    var selectedRegion = this.value;
    loadData(selectedRegion);
  });

  // Load data for the default selected region on page load
  loadData(defaultOption.value);
});
