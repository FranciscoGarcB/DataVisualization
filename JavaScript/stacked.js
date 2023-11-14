// Set the dimensions and margins of the graph
var margin = { top: 10, right: 180, bottom: 90, left: 50 },
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#stacked")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Create a tooltip
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")

// Parse the Data
d3.csv("../datasets/stacked_other.csv", function (data) {

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = data.columns.slice(1);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.city) }).keys();

    // Add X axis with rotated labels
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 650000])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var colorScheme = ['#557153', '#7D8F69', '#A9AF7E', '#D0E7D2', '#E6E5A3', '#CCC8AA'];

    // stack the data? --> stack per subgroup
    var stackedData = d3.stack()
        .keys(subgroups)
        (data);

    // Show the bars with animation
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function (d, i) { return colorScheme[i]; })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("x", function (d) { return x(d.data.city); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .attr("stroke", "grey")
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip) // Move tooltip with mouse
        .on("mouseout", hideTooltip)
        .transition()  // Add transition for a smooth animation
        .duration(1000)  // Duration of the animation in milliseconds
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); }); // Set the final height

    // Create a legend
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width + 10) + ", 0)");

    var legendRectSize = 18;
    var legendSpacing = 4;

    var legendItems = legend.selectAll('.legend-item')
        .data(subgroups)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', function (d, i) {
            var height = legendRectSize + legendSpacing;
            var vert = i * height;
            return 'translate(0,' + vert + ')';
        });

    legendItems.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', function (d, i) {
            return colorScheme[i];
        });

    legendItems.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function (d, i) {
            return subgroups[i];
        });
});

// Tooltip functions
function showTooltip(d) {
    var subgroupName = d3.select(this.parentNode).datum().key;
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    tooltip.html("City: " + d.data.city + "<br>" +
        "Type: " + subgroupName + "<br>" +
        "Value: " + (d[1] - d[0]))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}

function moveTooltip(d) {
    tooltip.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}

function hideTooltip() {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}
