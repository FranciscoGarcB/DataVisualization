// Tooltip
tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')

// Modify the margins and dimensions for a horizontal bar chart
var margin = { top: 50, right: 50, bottom: 70, left: 150 },
    width = 950 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// Initialize the x and y scales for a horizontal bar chart
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleBand().range([height, 0]).padding(0.4);

// Add the x and y Axes initially
var xAxis = svg.append("g")
  .attr("transform", "translate(0," + height + ")");
var yAxis = svg.append("g").attr("class", "myYaxis");

// Load your data from a CSV file, assuming "datasets/species_city.csv" exists
d3.csv("datasets/species_city.csv", function(data) {

  // Function to update the chart
  function updateChart(selectedCity) {
    // Filter the data based on the selected city
    var datafiltered = data.filter(function(d) {
      return d.city == selectedCity;
    });

    // Sort the data in descending order by the "count" column
    datafiltered.sort(function(a, b) {
      return d3.descending(+a.count, +b.count);
    });

    // Take only the top 50 entries
    datafiltered = datafiltered.slice(0, 50);

    // Update the x and y domains based on the selected data
    x.domain([0, d3.max(datafiltered, function(d) { return +d.count; })]);
    y.domain(datafiltered.map(function(d) { return d.common_name; }));

    // Calculate the dynamic height based on the number of y-axis labels
    var dynamicHeight = Math.max(datafiltered.length * 40, 400); // Minimum height of 400px

    // Update the height of the SVG
    svg.attr("height", dynamicHeight + margin.top + margin.bottom);

    // Update the x and y axes
    xAxis.transition()
      .duration(1000)
      .call(d3.axisBottom(x).ticks(5));

    yAxis.transition()
      .duration(1000)
      .call(d3.axisLeft(y));

    // Set the new data for the bars
    var bars = svg.selectAll("rect")
      .data(datafiltered);

    // Remove bars that are not needed anymore
    bars.exit().remove();

    // Update existing bars
    bars.transition()
      .duration(1000)
      .attr("y", function(d) { return y(d.common_name); })
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", function(d) { return x(d.count); })
      .attr("fill", "#ADC178");

    // Add new bars for newly added data
    bars.enter()
      .append("rect")
      .attr("y", function(d) { return y(d.common_name); })
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", function(d) { return x(d.count); })
      .attr("fill", "#ADC178")
      .on('mouseover', function (d, i) {
        tooltip
        .html(
            `<div>Name: ${d.common_name}</div>
            <div>Average height in meters:  ${d3.format('.3f')(d.mean_h)}</div>
              <div>Count: ${d.count}</div>`
        )
        .style('visibility', 'visible');
        d3.select(this).transition().attr('fill', '#eec42d');
      })
      .on('mousemove', function () {
        tooltip
          .style('top', d3.event.pageY - 10 + 'px')
          .style('left', d3.event.pageX + 10 + 'px');
      })
      .on('mouseout', function () {
        tooltip.html(``).style('visibility', 'hidden');
        d3.select(this).transition().attr('fill', "#ADC178");
      });
  }

  // List of cities
  var cities = data.map(function(d) {
    return d.city;
  });

  // Remove duplicates from the list of cities
  var uniqueCities = cities.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  });

  // Add the options to the button
  var selectButton = d3.select("#selectButton");
  selectButton
    .selectAll('option')
    .data(uniqueCities)
    .enter()
    .append('option')
    .text(function(d) { return d; })
    .attr("value", function(d) { return d; });

  // Set the initial city to the first one in the list
  var initialCity = uniqueCities[0];

  // Initial chart setup
  updateChart(initialCity);

  // Listen to the slider (select button) change event
  selectButton.on("change", function() {
    var selectedCity = this.value;
    updateChart(selectedCity);
  });
});
