// Read the CSV file
d3.csv("../datasets/temps_fallback.csv", function (data) {
    // Extract unique values from the "RegionName" column
    var uniqueRegions = [...new Set(data.map(d => d.RegionName))];

    // Default value
    var defaultRegion = "National";

    // Remove the default value from the uniqueRegions array if present
    var index = uniqueRegions.indexOf(defaultRegion);
    if (index !== -1) {
        uniqueRegions.splice(index, 1);
    }

    // Populate the select element with options
    var select = d3.select("#RegionSelect");

    // Add a default option with the desired value
    select.append("option")
        .text(defaultRegion)
        .attr("value", defaultRegion);

    // Append other options
    select
        .selectAll("option.region")
        .data(uniqueRegions)
        .enter()
        .append("option")
        .classed("region", true)
        .text(function (d) {
            return d;
        })
        .attr("value", function (d) {
            return d;
        });

});
