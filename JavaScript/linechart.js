// Tooltip
const tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip');

// Select the 'select' element with id 'RegionSelect'
const regionSelect = d3.select('#RegionSelect');


// Select the 'div' element with id 'my_dataviz'
const myDataviz = d3.select('#my_dataviz');

// Array to store selected years
let selectedYears = [];

// Function to generate the line chart
function generateLineChart(selectedRegion) {
  // Remove the existing chart before generating a new one
  myDataviz.selectAll('*').remove();

  // Read the CSV file
  d3.csv("../datasets/temps_fallback.csv", function (data) {
    // Filter the data based on the selected value in the 'select' tag
    const filteredDataMin = data.filter(d => d.RegionName === selectedRegion && d.Type === 'Minimum');
    const filteredDataMax = data.filter(d => d.RegionName === selectedRegion && d.Type === 'Maximum');
    const filteredDataAvg = data.filter(d => d.RegionName === selectedRegion && d.Type === 'Average');

    // Get the columns of months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Convert temperature values to numbers
    const processData = (filteredData) => {
      filteredData.forEach(d => {
        months.forEach(month => {
          d[month] = +d[month];
        });
      });

      // Prepare data for the line chart
      return filteredData.map(d => ({
        year: d.Year,
        type: d.Type,
        values: months.map(month => ({ month, value: d[month], color: d3.schemeCategory10[months.indexOf(month)] }))
      }));
    };

    const lineDataMin = processData(filteredDataMin);
    const lineDataMax = processData(filteredDataMax);
    const lineDataAvg = processData(filteredDataAvg);

    // Set up the size and margins of the chart
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Set up the scale for the x-axis
    const xScale = d3.scaleBand().domain(months).range([0, width]).padding(0.1);

    // Set up the scale for the y-axis
    const yScale = d3.scaleLinear().domain([
      d3.min([...lineDataMin, ...lineDataMax], d => d3.min(d.values, v => v.value)),
      d3.max([...lineDataMin, ...lineDataMax], d => d3.max(d.values, v => v.value))
    ]).range([height, 0]);

    // Set up the line function
    const line = d3.line()
      .x(d => xScale(d.month) + xScale.bandwidth() / 2)
      .y(d => yScale(d.value));

    // Set up the color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create the SVG container for the chart
    const svg = myDataviz.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Add lines to the chart (Minimum)
    addLines(svg, lineDataMin, 'line-min', 'Minimum');

    // Add lines to the chart (Maximum)
    addLines(svg, lineDataMax, 'line-max', 'Maximum');

    // Add circles to the chart (Average)
    addCircles(svg, lineDataAvg, 'circle-avg', 'Average', 5);

    // Add legend
    addLegend(svg, width, lineDataMin, lineDataMax, colorScale);

    // Add x and y axes to the chart
    addAxes(svg, xScale, yScale, height);

    // Add a change event to the 'select' tag
    regionSelect.on('change', function () {
      const selectedRegion = regionSelect.property('value');
      generateLineChart(selectedRegion);
    });

    function addLines(svg, data, className, type) {
      svg.selectAll(`.${className}`)
        .data(data)
        .enter().append('path')
        .attr('class', className)
        .attr('d', d => line(d.values))
        .style('fill', 'none')
        .style('stroke', (d, i) => colorScale(d.year))
        .style('stroke-opacity', d => (d.type === type ? 1 : 1))
        .attr("stroke-width", 4)
        .on("mouseover", function (d) {
          handleMouseOver(d, svg, colorScale, type);
        })
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);
    }

    function addCircles(svg, data, className, type, radius) {
      svg.selectAll(`.${className}`)
        .data(data)
        .enter().append('g')
        .attr('class', `${className}-group`)
        .selectAll('circle')
        .data(d => d.values.map(value => ({ year: d.year, month: value.month, type: d.type, value: value.value })))
        .enter().append('circle')
        .attr('class', className)
        .attr('cx', d => xScale(d.month) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.value))
        .attr('r', radius)
        .style('fill', d => colorScale(d.year))
        .style('fill-opacity', d => (d.type === type ? 0.6 : 1))
        .on("mouseover", function (d) {
          handleMouseOver(d, svg, colorScale, type);
        })
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);
    }

    function addLegend(svg, width, lineDataMin, lineDataMax, colorScale) {
      const legend = svg.append('g')
        .attr('transform', 'translate(' + (width - 100) + ', 0)');

      const legendData = Array.from(new Set([...lineDataMin, ...lineDataMax].map(d => d.year)));

      legend.selectAll('.legend-item')
        .data(legendData)
        .enter().append('rect')
        .attr('class', 'legend-item')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20)
        .attr('width', 15)
        .attr('height', 15)
        .style('fill', d => colorScale(d))
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

      legend.selectAll('.legend-text')
        .data(legendData)
        .enter().append('text')
        .attr('class', 'legend-text')
        .attr('x', 20)
        .attr('y', (d, i) => i * 20 + 12)
        .text(d => d)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

      // Add click event to legend items
      legend.selectAll('.legend-item')
        .on('click', function (selectedYear) {
          handleLegendClick(selectedYear, svg, colorScale);
        });
    }

    function addAxes(svg, xScale, yScale, height) {
      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale));

      svg.append('g')
        .call(d3.axisLeft(yScale));

      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('°C');
    }

    function handleMouseOver(d, svg, colorScale, type) {
      // Change the color of all circles and lines to gray
      svg.selectAll('.circle-avg')
        .style('fill', '#E9E9E9');
      svg.selectAll('.line-min, .line-max')
        .style('stroke', '#E9E9E9');

      // Show tooltip information for the current data point
      tooltip
        .html(
          `<div>Year: ${d.year}</div>
          <div>Type: ${type}</div>`
        )
        .style('visibility', 'visible');

      // Change the color of lines and circles of the same year to their original color
      svg.selectAll('.line-min, .line-max')
        .filter(line => line.year === d.year)
        .style('stroke', line => colorScale(line.year));
      svg.selectAll('.circle-avg')
        .filter(circle => circle.year === d.year)
        .style('fill', circle => colorScale(circle.year));

      // Add the year to the selectedYears array if not already present
      if (!selectedYears.includes(d.year)) {
        selectedYears.push(d.year);
      }
    }

    function handleMouseMove() {
      tooltip
        .style('top', d3.event.pageY - 10 + 'px')
        .style('left', d3.event.pageX + 10 + 'px');
    }

    function handleMouseOut() {
      // Change the color of all circles and lines to their original colors
      svg.selectAll('.circle-avg')
        .style('fill', d => colorScale(d.year))
        .style('fill-opacity', d => (d.type === 'Average' ? 0.6 : 1));
      svg.selectAll('.line-min, .line-max')
        .style('stroke', (d, i) => colorScale(d.year));

      // Hide the tooltip when exiting the data point
      tooltip.html('').style('visibility', 'hidden');

      // Clear the selectedYears array
      selectedYears = [];
    }

    function handleLegendClick(selectedYear, svg, colorScale) {
      // Toggle the selection state of the clicked year
      if (selectedYears.includes(selectedYear)) {
        // Remove the year from the selectedYears array if already present
        selectedYears = selectedYears.filter(year => year !== selectedYear);
      } else {
        // Add the year to the selectedYears array if not already present
        selectedYears.push(selectedYear);
      }

      // Change the color of all circles and lines to gray
      svg.selectAll('.circle-avg')
        .style('fill', '#E9E9E9');
      svg.selectAll('.line-min, .line-max')
        .style('stroke', '#E9E9E9');

      // Change the color of the selected years' circles and lines to their original color
      svg.selectAll('.line-min, .line-max')
        .filter(line => selectedYears.includes(line.year))
        .style('stroke', line => colorScale(line.year));
      svg.selectAll('.circle-avg')
        .filter(circle => selectedYears.includes(circle.year))
        .style('fill', circle => colorScale(circle.year));
    }
  });
}

// Generate the initial chart with the first region in the 'select' tag
generateLineChart("National");
