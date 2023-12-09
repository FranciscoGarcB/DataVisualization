const svg = d3.select("#map")
    .append("svg")
    .attr("width", 800)
    .attr("height", 800);

const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([400, 300]);

const path = d3.geoPath().projection(projection);

// Definir una escala de colores ordinal
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Load US map data
d3.json("../datasets/us-states.json", function (us) {
    // Dibujar los estados
    svg.selectAll("path")
        .data(us.features)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("fill", "white");

    // Load GeoJSON data
    d3.json("../datasets/dot-density2.geojson", function (geojson) {
        // Dibujar puntos con colores según 'common_name'
        svg.selectAll("circle")
            .data(geojson.features)
            .enter().append("circle")
            .attr("cx", function (d) {
                const coordinates = d.geometry.coordinates;
                return projection([coordinates[0], coordinates[1]])[0];
            })
            .attr("cy", function (d) {
                const coordinates = d.geometry.coordinates;
                return projection([coordinates[0], coordinates[1]])[1];
            })
            .attr("r", 0.1)
            .attr("fill", function (d) {
                // Asignar color según 'common_name'
                return colorScale(d.properties.name);
            })
            .attr("opacity", 0.7);
    });
});
