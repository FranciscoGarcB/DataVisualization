const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", 800)
    .attr("height", 600);

// Define a projection (e.g., Albers USA)
const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([400, 300]);

// Create a path generator
const path = d3.geoPath().projection(projection);

// Load US map data (you need to have a GeoJSON file)
d3.json("../datasets/us-states.json", function (us) {
    // Draw the states
    svg.selectAll("path")
        .data(us.features)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("fill", "white");

    // Load data from the CSV file
    d3.csv("../datasets/dot-density.csv", function (data) {
        // Agregar puntos al mapa
        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function (d) {
                return projection([+d.longitude_coordinate, +d.latitude_coordinate])[0];
            })
            .attr("cy", function (d) {
                return projection([+d.longitude_coordinate, +d.latitude_coordinate])[1];
            })
            .attr("r", 1)
            .attr("fill", "#04AA6D")


    });
});
