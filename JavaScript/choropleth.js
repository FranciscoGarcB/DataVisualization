var margin = { top: 20, right: 120, bottom: 20, left: 20 };
var width = 800 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// Set up the SVG canvas con margen
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Add a tooltip element
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden");

// Load GeoJSON data and CSV data
Promise.all([d3.json("../datasets/us-states.json"), d3.csv("../datasets/abundance_states.csv")]).then(function (data) {
    var geojson = data[0];
    var csvData = data[1];

    // Create a map to store abundance values for each state
    var abundanceMap = new Map();
    csvData.forEach(d => {
        abundanceMap.set(d.state, +d.abundance);
    });

    // Define a color scale (green and white)
    var colorScale = d3.scaleSequential(d3.interpolateGreens)
        .domain([0, d3.max(csvData, d => +d.abundance)]);

    // Define a projection
    var projection = d3.geoAlbersUsa().fitSize([width, height], geojson);

    // Create a path generator
    var path = d3.geoPath().projection(projection);

    // Draw the choropvarh map without transition initially
    svg.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#333")
        .attr("fill", d => {
            var value = abundanceMap.get(d.properties.NAME) || 0;
            return value === 0 ? "white" : colorScale(value);
        })
        .on("mouseover", function (d) {
            // Show tooltip on mouseover
            tooltip.transition()
                .duration(200)
                .style("visibility", "visible");
            var formattedValue = d3.format(",")(abundanceMap.get(d.properties.NAME) || 0);
            var treeDensityMiles = (abundanceMap.get(d.properties.NAME) || 0) / d.properties.CENSUSAREA;
            var treeDensityMeters = treeDensityMiles * 2.58998811; // Conversion from square miles to square meters
            var formattedTreeDensity = d3.format(".3f")(treeDensityMeters);
            tooltip.html(`State: ${d.properties.NAME} <br>
                Abundance: ${formattedValue} trees <br>
                Tree Density: ${formattedTreeDensity} trees/m<sup>2</sup>`)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mousemove", function () {
            // Move tooltip with the mouse
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            // Hide tooltip on mouseout
            tooltip.transition()
                .duration(500)
                .style("visibility", "hidden");
        })
        .attr("fill", d => {
            var value = abundanceMap.get(d.properties.NAME) || 0;
            return value === 0 ? "white" : colorScale(value);
        });

    // Add a legend
    var legend = svg.append("g")
        .attr("transform", `translate(${width + 30},${margin.top})`);

    var legendScale = d3.scaleLinear()
        .domain([0, d3.max(csvData, d => +d.abundance)])
        .range([0, height]);

    var legendAxis = d3.axisRight(legendScale);

    var gradientHeight = height;

    // Add a colored rectangle to represent the color scale
    legend.append("rect")
        .attr("width", 20)
        .attr("height", gradientHeight)
        .style("fill", "url(#legendGradient)");

    // Add a gradient definition for the legend
    var defs = svg.append("defs");
    var gradient = defs.append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    gradient.selectAll("stop")
        .data(colorScale.ticks(6).map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Add values to the color legend
    svg.append("g")
        .attr("class", "legendValues")
        .attr("transform", `translate(${width + 50},${margin.top})`)
        .call(legendAxis);

});