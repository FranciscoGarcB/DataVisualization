// Tooltip
tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')

// Read the CSV file
d3.csv("../datasets/temps.csv", function (data) {
  // Set up initial values for RegionSelect and initialYear
  let selectedRegion = "National"; // You can set a default region
  let initialYear = 1923; // You can set a default initial year
  let lastYear = 1923; // You can set a default last year

  // Function to update the chart based on user selections
  function updateChart() {
    // Filter the data based on user selections
    const filteredDataMin = data.filter(d => d.RegionName === selectedRegion && d.Type === "Minimum" && +d.Year >= initialYear && +d.Year <= lastYear);
    const filteredDataMax = data.filter(d => d.RegionName === selectedRegion && d.Type === "Maximum" && +d.Year >= initialYear && +d.Year <= lastYear);
    const filteredDataAvg = data.filter(d => d.RegionName === selectedRegion && d.Type === "Average" && +d.Year >= initialYear && +d.Year <= lastYear);

    // Extract months and corresponding temperature values
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Set up the SVG dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 40 };
    const width = 450 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // Remove existing SVG to update the chart
    d3.select("#my_dataviz").selectAll("svg").remove();

    // Create a new SVG container for each year
    const svgContainer = d3.select("#my_dataviz")
      .selectAll("svg")
      .data(filteredDataMin)
      .enter()
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("opacity", 0)
      .call(enter => enter.transition().duration(1000).style("opacity", 1)); // Apply the transition

    // Append a group element to each SVG container
    svgContainer.each(function (d, i) {
      const svg = d3.select(this);
      const svgGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Set up scales for x and y axes
      const xScale = d3.scaleBand()
        .domain(months)
        .range([0, width])
        .padding(0.1);

      const yScale = d3.scaleLinear()
        .domain([
          d3.min(filteredDataMin, d => d3.min(months, month => +d[month])),
          d3.max(filteredDataMax, d => d3.max(months, month => +d[month])),
        ])
        .range([height, 0]);

      // Create x and y axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      // Append x and y axes to each SVG container
      svgGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

      svgGroup.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

      // Create line functions for the temperature data
      const lineMin = d3.line()
        .x((_, i) => xScale(months[i]))
        .y(d => yScale(+d));

      const lineMax = d3.line()
        .x((_, i) => xScale(months[i]))
        .y(d => yScale(+d));

      const lineAvg = d3.line()
        .x((_, i) => xScale(months[i]))
        .y(d => yScale(+d));


      // Append lines to each SVG container

      // Append line for the "Minimum" data
      svgGroup.append("path")
      .datum(months.map(month => +d[month]))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", lineMin);

      // Append line for the "Maximum" data
      svgGroup.append("path")
        .datum(months.map(month => +filteredDataMax[i][month]))
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", lineMax);

      // Append circles for the "Average" data
      svgGroup.selectAll("circle")
        .data(months.map((month, index) => ({ month, value: +filteredDataAvg[i][month] })))
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.month) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.value))
        .attr("r", 2)
        .attr("fill", "green")
        .on("mouseover", function (d, i) {
          tooltip
            .html(
              `<div>Month: ${d.month}</div>
              <div>Temperature:  ${d3.format('.3f')(d.value)} °C</div>
              <div>Type: Average</div>`
            )
            .style('visibility', 'visible');
        })
        .on('mousemove', function () {
          tooltip
            .style('top', d3.event.pageY - 10 + 'px')
            .style('left', d3.event.pageX + 10 + 'px');
        })
        .on('mouseout', function () {
          tooltip.html(``).style('visibility', 'hidden');
        });

      // Add title with the year to each SVG container
      svgGroup.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Custom-RobotoSlab")
        .text(d => `${d.Year}`);

      // Add label to y-axis
      svgGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("°C");
      });

      // Create a legend container
    const legendContainer = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", 100)
    .attr("height", 100)
    .attr("class", "legend-container")
    .style("position", "absolute")
    .style("top", "10px")
    .style("right", "10px");

  // Add legend items
  const legendItems = [
    { type: "Minimum", label: "Minimum", shape: "line", color: "steelblue" },
    { type: "Maximum", label: "Maximum", shape: "line", color: "red" },
    { type: "Average", label: "Average", shape: "circle", color: "green" },
  ];

  legendContainer.selectAll("g")
    .data(legendItems)
    .enter()
    .append("g")
    .attr("transform", (_, i) => `translate(0, ${i * 20})`)
    .each(function (d) {
      const group = d3.select(this);
      if (d.shape === "line") {
        group.append("line")
          .attr("x1", 0)
          .attr("y1", 8)
          .attr("x2", 15)
          .attr("y2", 8)
          .attr("stroke", d.color);
      } else if (d.shape === "circle") {
        group.append("circle")
          .attr("cx", 7.5)
          .attr("cy", 8)
          .attr("r", 5)
          .attr("fill", d.color);
      }

      group.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(d.label)
        .style("font-size", "12px");
    });
}

  // Initial chart rendering
  updateChart();

  // Event listener for RegionSelect, initialYear, and lastYear change
  d3.selectAll("#RegionSelect, #initialYear, #lastYear").on("change", function () {
    // Update selectedRegion, initialYear, and lastYear based on user selections
    selectedRegion = d3.select("#RegionSelect").node().value;
    initialYear = +d3.select("#initialYear").node().value;
    lastYear = +d3.select("#lastYear").node().value;
    // Update the chart with the new selections
    updateChart();
  });
});
