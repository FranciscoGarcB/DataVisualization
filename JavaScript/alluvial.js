// Aquí deberías cargar tus datos desde pandas
var data = [
    {"state": "California", "city": "Los Angeles", "common_name": "Crape myrtle", "count": 34729},
    {"state": "California", "city": "Sacramento", "common_name": "London planetree", "count": 14111},
    {"state": "California", "city": "Rancho Cucamonga", "common_name": "Crape myrtle", "count": 12877},
    {"state": "Colorado", "city": "Denver", "common_name": "Green ash", "count": 25736},
    {"state": "Colorado", "city": "Denver", "common_name": "Littleleaf linden", "count": 12961},
    {"state": "Colorado", "city": "Aurora", "common_name": "Honeylocust", "count": 8388},
    {"state": "District of Columbia", "city": "Washington DC", "common_name": "Red maple", "count": 12543},
    {"state": "District of Columbia", "city": "Washington DC", "common_name": "Pin oak", "count": 8815},
    {"state": "District of Columbia", "city": "Washington DC", "common_name": "Crape myrtle", "count": 4350}
  ];
  
  // Crear una función para convertir los datos en el formato necesario para el gráfico Sankey
  function convertToSankeyData(data) {
    var nodes = [];
    var links = [];
  
    data.forEach(function (d) {
      nodes.push({ name: d.state, type: "state" });
      nodes.push({ name: d.city, type: "city" });
      nodes.push({ name: d.common_name, type: "common_name" });
    });
  
    // Eliminar duplicados de nodos
    nodes = nodes.filter(function (node, index, self) {
      return self.findIndex(n => n.name === node.name) === index;
    });
  
    data.forEach(function (d) {
      links.push({ source: nodes.findIndex(n => n.name === d.state), target: nodes.findIndex(n => n.name === d.city), value: d.count });
      links.push({ source: nodes.findIndex(n => n.name === d.city), target: nodes.findIndex(n => n.name === d.common_name), value: d.count });
    });
  
    return { nodes, links };
  }
  
  var sankeyData = convertToSankeyData(data);
  
  var margin = { top: 10, right: 100, bottom: 10, left: 20 };
  var width = 1000 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
  
  // Colores para nodos
  var nodeColors = d3.scaleOrdinal()
    .domain(["state", "city", "common_name"])
    .range(["#8B4513", "#FFD700", "#008000"]); // Café, Amarillo, Verde
  
  var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([width, height]);
  
  var graph = sankey(sankeyData);
  
  // Dibujar enlaces
  var linkGroup = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", "#ddd") // Cambiar el color de los enlaces a gris claro
    .attr("stroke-width", function (d) { return Math.max(1, d.width); })
    .style("fill", "none")
    .style("stroke-opacity", 0.2) // Añadir opacidad al contorno
    .style("stroke", "#000") // Añadir color al contorno
    .on("mouseover", function (d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html("Value: " + d.value)
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
  
  // Dibujar nodos
  var nodeGroup = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
    .append("rect")
    .attr("height", function (d) { return d.y1 - d.y0; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function (d) { return nodeColors(d.type); }) // Usar colores diferentes para cada tipo de nodo
    .style("stroke", "#000");
  
  // Etiquetas de nodos
  var nodeLabelGroup = svg.append("g")
    .selectAll(".node-label")
    .data(graph.nodes)
    .enter().append("text")
    .attr("class", "node-label")
    .attr("x", function (d) { return d.x1 + 6; }) // Ajustar la posición para que se vea por fuera
    .attr("y", function (d) { return (d.y0 + d.y1) / 2; })
    .attr("dy", "0.35em")
    .attr("text-anchor", "start") // Alinear a la izquierda
    .text(function (d) { return d.name; })
    .style("fill", "#000");
  
  // Tooltip
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  