// Dynamically populate initialYear and lastYear options
var initialYearSelect = document.getElementById("initialYear");
var lastYearSelect = document.getElementById("lastYear");

// Generate options for years from 1923 to 2023
for (var year = 1923; year <= 2023; year++) {
  var option = document.createElement("option");
  option.value = year;
  option.text = year;
  initialYearSelect.add(option);
  lastYearSelect.add(option.cloneNode(true));
}

// Update lastYear options based on initialYear selection
function updateLastYearOptions() {
  var selectedInitialYear = initialYearSelect.value;
  // Clear previous options
  lastYearSelect.innerHTML = "";
  
  // Generate options for years within a 10-year range, with a maximum of 2023
  for (var year = parseInt(selectedInitialYear); year <= Math.min(parseInt(selectedInitialYear) + 9, 2023); year++) {
    var option = document.createElement("option");
    option.value = year;
    option.text = year;
    lastYearSelect.add(option);
  }
}

// Read the CSV file
d3.csv("../datasets/temps.csv", function (data) {
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
      .text(function(d) {
        return d;
      })
      .attr("value", function(d) {
        return d;
      });
  });
  
  
  