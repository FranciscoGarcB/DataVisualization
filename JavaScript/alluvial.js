// Load data from a JSON file
d3.json("../datasets/sankey.json").then(function(data) {

  // Create a function to convert data into the necessary format for the Sankey diagram
  function convertToSankeyData(data) {
    var nodes = [];
    var links = [];

    data.forEach(function (d) {
      nodes.push({ name: d.state, type: "state" });
      nodes.push({ name: d.city, type: "city" });
      nodes.push({ name: d.common_name, type: "common_name" });
    });

    // Remove duplicate nodes
    nodes = nodes.filter(function (node, index, self) {
      return self.findIndex(n => n.name === node.name) === index;
    });

    data.forEach(function (d) {
      links.push({ source: nodes.findIndex(n => n.name === d.state), target: nodes.findIndex(n => n.name === d.city), value: d.count });
      links.push({ source: nodes.findIndex(n => n.name === d.city), target: nodes.findIndex(n => n.name === d.common_name), value: d.count });
    });

    // Consolidate links with the same source and target
    var consolidatedLinks = [];
    links.forEach(function(link) {
      var existingLink = consolidatedLinks.find(l => l.source === link.source && l.target === link.target);
      if (existingLink) {
        existingLink.value += link.value;
      } else {
        consolidatedLinks.push({ source: link.source, target: link.target, value: link.value });
      }
    });

    return { nodes, links: consolidatedLinks };
  }

  var sankeyData = convertToSankeyData(data);

  var margin = { top: 10, right: 150, bottom: 10, left: 50 };
  var width = 950 - margin.left - margin.right;
  var height = 750 - margin.top - margin.bottom;

  // Colors for nodes (green color palette)
  var nodeColors = d3.scaleOrdinal(d3.schemeGreens[3]);

  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(15)
    .size([width, height]);

  var graph = sankey(sankeyData);

  // Draw links
  var linkGroup = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", "#ddd") // Change link color to light gray
    .attr("stroke-width", function (d) { return Math.max(1, d.width); })
    .style("fill", "none")
    .style("stroke-opacity", 0.2) // Add opacity to the outline
    .style("stroke", "#000") // Add color to the outline
    .on("mouseover", function (d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(d.source.name + " <span>&#8594;</span> " + d.target.name + "<br>Count: " + d.value)
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Draw nodes
  var nodeGroup = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
    .append("rect")
    .attr("height", function (d) { return d.y1 - d.y0; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function (d) { return nodeColors(d.type); }) // Use different colors for each node type
    .style("stroke", "#000");

  // Node labels
  var nodeLabelGroup = svg.append("g")
    .selectAll(".node-label")
    .data(graph.nodes)
    .enter().append("text")
    .attr("class", "node-label")
    .attr("x", function (d) { return d.x1 + 6; }) // Adjust position to be visible outside
    .attr("y", function (d) { return (d.y0 + d.y1) / 2; })
    .attr("dy", "0.35em")
    .attr("text-anchor", "start") // Align to the left
    .text(function (d) { return d.name; })
    .style("fill", "#000");

  // Tooltip
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Animation
  linkGroup
    .style("stroke-dasharray", function (d) {
      var length = this.getTotalLength();
      return length + " " + length;
    })
    .style("stroke-dashoffset", function (d) {
      return this.getTotalLength();
    })
    .transition()
    .duration(1500)
    .style("stroke-dashoffset", 0);

});
