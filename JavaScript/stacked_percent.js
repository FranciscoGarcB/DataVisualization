// set the dimensions and margins of the graph
var margin = { top: 10, right: 180, bottom: 90, left: 50 },
    width = 1150 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#stacked")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

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
        .domain([0, 1]) // Rango de 0 a 1 para porcentaje
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(10, "%")); // Añadir porcentaje al eje Y

    // color palette = one color per subgroup
    var colorScheme = ['#D2DE32', '#B0D9B1', '#D83F31', '#D0E7D2', '#016A70', '#618264'];

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
        .keys(subgroups)
        .offset(d3.stackOffsetExpand) // Offset para calcular porcentaje
        (data);

    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#stacked")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // Three functions that change the tooltip when the user hovers/moves/leaves a cell
    var mouseover = function (d) {
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        var total = d3.sum(subgroups.map(function(subgroup) {
            return d.data[subgroup];
        }));
        var percentage = subgroupValue / total;
        tooltip
            .html("Tree type: " + subgroupName + "<br>" + "Percentage: " + d3.format(".0%")(percentage))
            .style("opacity", 1);
    }
    var mousemove = function (d) {
        tooltip
            .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: otherwise, the tooltip is exactly where the point is, and it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + "px");
    }
    var mouseleave = function (d) {
        tooltip
            .style("opacity", 0);
    }

    // Show the bars
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
    .attr("y", function (d) { return y(0); })  // Start from the top for the animation
    .attr("height", 0)  // Initial height set to 0
    .attr("width", x.bandwidth())
    .attr("stroke", "grey")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .transition()  // Add transition for a smooth animation
    .duration(1000)  // Duration of the animation in milliseconds
    .attr("y", function (d) { return y(d[1]); }) 
    .attr("height", function (d) { return y(d[0]) - y(d[1]); }); // Set the final height
        ;

    // Create a legend on the right side of the chart
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