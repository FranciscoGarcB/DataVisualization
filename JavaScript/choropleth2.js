var margin = { top: 20, right: 120, bottom: 50, left: 20 };
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

    // Create a map to store tree density values for each state
    var treeDensityMap = new Map();
    csvData.forEach(d => {
        // Use the 'NAME' property from GeoJSON to match with the CSV data
        var geoJsonState = geojson.features.find(feature => feature.properties.NAME === d.state);

        if (geoJsonState && geoJsonState.properties.CENSUSAREA !== undefined) {
            treeDensityMap.set(d.state, ((d.abundance || 0) / geoJsonState.properties.CENSUSAREA)* 2.58998811);
        } else {
            console.warn(`'CENSUSAREA' is undefined for state: ${d.state}. Using default value.`);
            // Use a default value (1) if 'CENSUSAREA' is undefined
            treeDensityMap.set(d.state, d.abundance || 0);
        }
    });

    // Calculate the maximum tree density value
    var maxTreeDensity = 46.672;

    // Define a new color scale (blue and white for tree density)
    var colorScavarreeDensity = d3.scaleSequential(d3.interpolateGreens)
        .domain([0, maxTreeDensity]);

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
            var value = treeDensityMap.get(d.properties.NAME) || 0;
            return value === 0 ? "white" : colorScavarreeDensity(value);
        })
        .on("mouseover", function (d) {
            // Show tooltip on mouseover
            tooltip.transition()
                .duration(200)
                .style("visibility", "visible");
            var formattedTreeDensity = d3.format(".3f")(treeDensityMap.get(d.properties.NAME) || 0);
            tooltip.html(`State: ${d.properties.NAME} <br>
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
        });

    // Add a legend
    var legend = svg.append("g")
        .attr("transform", `translate(${width + 30},${margin.top})`);

    var legendScavarreeDensity = d3.scaleLinear()
        .domain([0, maxTreeDensity])
        .range([0, height]);

    var legendAxisTreeDensity = d3.axisRight(legendScavarreeDensity);

    var gradientHeight = height;

    // Add a colored rectangle to represent the color scale
    legend.append("rect")
        .attr("width", 20)
        .attr("height", gradientHeight)
        .style("fill", "url(#legendGradientTreeDensity)");

    // Add a gradient definition for the legend
    var defs = svg.append("defs");
    var gradientTreeDensity = defs.append("linearGradient")
        .attr("id", "legendGradientTreeDensity")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    gradientTreeDensity.selectAll("stop")
        .data(colorScavarreeDensity.ticks(6).map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScavarreeDensity(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Add values to the color legend
    svg.append("g")
        .attr("class", "legendValues")
        .attr("transform", `translate(${width + 50},${margin.top})`)
        .call(legendAxisTreeDensity);
});
