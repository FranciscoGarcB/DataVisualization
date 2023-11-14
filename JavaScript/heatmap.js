var svg = d3.select("#heatmap");
var margin = { top: 50, right: 150, bottom: 150, left: 150 };
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define initial scales and axes
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
var y = d3.scaleBand()
    .range([height, 0]) // Invert the range so that cities are on the x-axis
    .padding(0.1);
var color = d3.scaleSequential(d3.interpolateYlGnBu); // Color scale

var xAxis = d3.axisBottom(x); // Change to xAxis for the x-axis
var yAxis = d3.axisLeft(y);

g.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")");

g.append("g")
    .attr("class", "y-axis");

// Add colorbar
var colorbar = g.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width + 20) + ",0)");

// Function to update the heatmap and axes
function updateHeatmap(data) {
    // Sort data by common_name
    data.sort(function(a, b) {
        return d3.descending(a.common_name, b.common_name);
    });

    x.domain(data.map(function(d) { return d.city; })); // Change to city
    y.domain(data.map(function(d) { return d.common_name; }));

    // Adjust the color scale domain for better visibility
    color.domain([0.01, d3.max(data, function(d) { return +d.count; }) * 0.5]);

    var xAxisGroup = g.select(".x-axis").call(xAxis);
    xAxisGroup.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    g.select(".y-axis").call(yAxis);

    var cells = g.selectAll(".cell")
        .data(data);

    cells.exit().remove();

    cells.enter()
        .append("rect")
        .attr("class", "cell")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip)
        .merge(cells)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return x(d.city); })
        .attr("y", function(d) { return y(d.common_name); })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function(d) { return color(+d.count); });

    // Update colorbar
    var legendLinear = colorbar.selectAll(".legend")
        .data(color.ticks(6).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(50," + i * 20 + ")";
        });

    legendLinear.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", color);

    legendLinear.append("text")
        .attr("x", 26)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(String);

    colorbar.exit().remove();
}

// Load the CSV file
d3.csv("../datasets/state_species_count.csv").then(function(data) {
    // Get unique values from the "state" column
    var states = Array.from(new Set(data.map(function(d) { return d.state; })));

    // Create the select element and add options
    var select = d3.select("#state-select");
    select.selectAll("option")
        .data(states)
        .enter()
        .append("option")
        .text(function(d) { return d; });

    // Handle the change event
    select.on("change", function() {
        var selectedState = this.value;
        var filteredData = data.filter(function(d) {
            return d.state === selectedState;
        });
        updateHeatmap(filteredData);
    });

    // Initially, load the data for the first state
    var initialData = data.filter(function(d) {
        return d.state === "Other";
    });

    updateHeatmap(initialData);
});

var tooltip = d3.select(".tooltip");

function showTooltip(d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    tooltip.html("Tree: " + d.common_name + "<br>" + 
                "City: " + d.city + "<br>" +
                "Count: " + d.count)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}

function hideTooltip() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}
