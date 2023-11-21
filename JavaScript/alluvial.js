// Cargar datos desde un archivo JSON
d3.json("../datasets/sankey.json").then(function(data) {

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

    // Consolidar enlaces con el mismo origen y destino
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

  var margin = { top: 10, right: 100, bottom: 10, left: 20 };
  var width = 1400 - margin.left - margin.right;
  var height = 1500 - margin.top - margin.bottom;

  // Colores para nodos (paleta de colores verde)
  var nodeColors = d3.scaleOrdinal(d3.schemeGreens[3]);

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
      tooltip.html(d.source.name + " <span>&#8594;</span> " + d.target.name + "<br>Count: " + d.value)
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

  // Animación
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