// Tooltip
const tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip');

// Selecciona el elemento 'select' con id 'RegionSelect'
const regionSelect = d3.select('#RegionSelect');

// Selecciona el elemento 'div' con id 'my_dataviz'
const myDataviz = d3.select('#my_dataviz');

// Función para generar la gráfica
function generateLineChart(selectedRegion) {
  // Elimina la gráfica existente antes de generar una nueva
  myDataviz.selectAll('*').remove();

  // Read the CSV file
  d3.csv("../datasets/temps_fallback.csv", function (data) {
    // Filtra los datos por el valor seleccionado en el tag 'select'
    const filteredDataMin = data.filter(d => d.RegionName === selectedRegion && d.Type === 'Minimum');
    const filteredDataMax = data.filter(d => d.RegionName === selectedRegion && d.Type === 'Maximum');
    const filteredDataAvg = data.filter(d => d.RegionName === selectedRegion && d.Type === 'Average');
    
    // Obtiene las columnas de meses
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Convierte los valores de temperatura a números
    const processData = (filteredData) => {
      filteredData.forEach(d => {
        months.forEach(month => {
          d[month] = +d[month];
        });
      });

      // Prepara los datos para la gráfica de líneas
      return filteredData.map(d => ({
        year: d.Year,
        type: d.Type,
        values: months.map(month => ({ month, value: d[month], color: d3.schemeCategory10[months.indexOf(month)] }))
      }));
    };

    const lineDataMin = processData(filteredDataMin);
    const lineDataMax = processData(filteredDataMax);
    const lineDataAvg = processData(filteredDataAvg);

    // Configura el tamaño y márgenes del gráfico
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 1000 - margin.left - margin.right;
    const height = 1000 - margin.top - margin.bottom;

    // Configura la escala para el eje x
    const xScale = d3.scaleBand().domain(months).range([0, width]).padding(0.1);

    // Configura la escala para el eje y
    const yScale = d3.scaleLinear().domain([
      d3.min([...lineDataMin, ...lineDataMax], d => d3.min(d.values, v => v.value)),
      d3.max([...lineDataMin, ...lineDataMax], d => d3.max(d.values, v => v.value))
    ]).range([height, 0]);

    // Configura la función de línea
    const line = d3.line()
      .x(d => xScale(d.month) + xScale.bandwidth() / 2)
      .y(d => yScale(d.value));

    // Configura la escala de colores
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Crea el contenedor svg para el gráfico
    const svg = myDataviz.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Añade las líneas al gráfico (Minimum)
svg.selectAll('.line-min')
.data(lineDataMin)
.enter().append('path')
.attr('class', 'line-min')
.attr('d', d => line(d.values))
.style('fill', 'none')
.style('stroke', (d, i) => colorScale(d.year))
.style('stroke-opacity', d => (d.type === 'Minimum' ? 0.3 : 1))
.attr("stroke-width", 3)
.on("mouseover", function (d) {
  // Cambia el color de todos los círculos y líneas a gris
  svg.selectAll('.circle-avg')
    .style('fill', '#E9E9E9');
  svg.selectAll('.line-min, .line-max')
    .style('stroke', '#E9E9E9');

  // Muestra la información del tooltip para la línea actual (Minimum)
  tooltip
    .html(
      `<div>Year: ${d.year}</div>
      <div>Type: Minimum</div>`
    )
    .style('visibility', 'visible');

  // Cambia el color de las líneas del mismo año a su color original
  svg.selectAll('.line-min, .line-max')
    .filter(line => line.year === d.year)
    .style('stroke', line => colorScale(line.year));
  svg.selectAll('.circle-avg')
    .filter(circle => circle.year === d.year)
    .style('fill', circle => colorScale(circle.year));
})
.on('mousemove', function () {
  tooltip
    .style('top', d3.event.pageY - 10 + 'px')
    .style('left', d3.event.pageX + 10 + 'px');
})
.on('mouseout', function () {
  // Cambia el color de todos los círculos y líneas a sus colores originales
  svg.selectAll('.circle-avg')
    .style('fill', d => colorScale(d.year))
    .style('fill-opacity', d => (d.type === 'Average' ? 0.6 : 1));
  svg.selectAll('.line-min, .line-max')
    .style('stroke', (d, i) => colorScale(d.year));

  // Oculta el tooltip al salir de la línea
  tooltip.html('').style('visibility', 'hidden');
});

   // Añade los círculos al gráfico (Average)
  svg.selectAll('.circle-avg')
  .data(lineDataAvg)
  .enter().append('g')
  .attr('class', 'circle-avg-group')
  .selectAll('circle')
  .data(d => d.values.map(value => ({ year: d.year, month: value.month, type: d.type, value: value.value })))
  .enter().append('circle')
  .attr('class', 'circle-avg')
  .attr('cx', d => xScale(d.month) + xScale.bandwidth() / 2)
  .attr('cy', d => yScale(d.value))
  .attr('r', 5) // Ajusta el radio de los círculos aquí
  .style('fill', d => colorScale(d.year)) // Usa el color del año para asignar un color diferente a cada círculo
  .style('fill-opacity', d => (d.type === 'Average' ? 0.6 : 1)) // Ajusta la opacidad de los círculos Average
  .on("mouseover", function (d) {
    // Cambia el color de todos los círculos y líneas a gris
    svg.selectAll('.circle-avg')
      .style('fill', '#E9E9E9');
    svg.selectAll('.line-min, .line-max')
      .style('stroke', '#E9E9E9');

    // Muestra la información del tooltip para el círculo actual (Average)
    tooltip
      .html(
        `<div>Year: ${d.year}</div>
        <div>Month: ${d.month}</div>
        <div>Type: ${d.type}</div>
        <div>Value: ${d.value}</div>`
      )
      .style('visibility', 'visible');

    // Cambia el color del círculo actual y las líneas del mismo año a su color original
    d3.select(this)
      .style('fill', colorScale(d.year));
    svg.selectAll('.line-min, .line-max')
      .filter(line => line.year === d.year)
      .style('stroke', line => colorScale(line.year));
  })
  .on('mousemove', function () {
    tooltip
      .style('top', d3.event.pageY - 10 + 'px')
      .style('left', d3.event.pageX + 10 + 'px');
  })
  .on('mouseout', function () {
    // Cambia el color de todos los círculos y líneas a sus colores originales
    svg.selectAll('.circle-avg')
      .style('fill', d => colorScale(d.year))
      .style('fill-opacity', d => (d.type === 'Average' ? 0.6 : 1));
    svg.selectAll('.line-min, .line-max')
      .style('stroke', (d, i) => colorScale(d.year));

    // Oculta el tooltip al salir del círculo
    tooltip.html('').style('visibility', 'hidden');
  });


  // Añade las líneas al gráfico (Maximum)
svg.selectAll('.line-max')
.data(lineDataMax)
.enter().append('path')
.attr('class', 'line-max')
.attr('d', d => line(d.values))
.style('fill', 'none')
.style('stroke', (d, i) => colorScale(d.year))
.attr("stroke-width", 3)
.on("mouseover", function (d) {
  // Cambia el color de todos los círculos y líneas a gris
  svg.selectAll('.circle-avg')
    .style('fill', '#E9E9E9');
  svg.selectAll('.line-min, .line-max')
    .style('stroke', '#E9E9E9');

  // Muestra la información del tooltip para la línea actual (Maximum)
  tooltip
    .html(
      `<div>Year: ${d.year}</div>
      <div>Type: Maximum</div>`
    )
    .style('visibility', 'visible');

  // Cambia el color de las líneas del mismo año a su color original
  svg.selectAll('.line-min, .line-max')
    .filter(line => line.year === d.year)
    .style('stroke', line => colorScale(line.year));
  svg.selectAll('.circle-avg')
    .filter(circle => circle.year === d.year)
    .style('fill', circle => colorScale(circle.year));
})
.on('mousemove', function () {
  tooltip
    .style('top', d3.event.pageY - 10 + 'px')
    .style('left', d3.event.pageX + 10 + 'px');
})
.on('mouseout', function () {
  // Cambia el color de todos los círculos y líneas a sus colores originales
  svg.selectAll('.circle-avg')
    .style('fill', d => colorScale(d.year))
    .style('fill-opacity', d => (d.type === 'Average' ? 0.6 : 1));
  svg.selectAll('.line-min, .line-max')
    .style('stroke', (d, i) => colorScale(d.year));

  // Oculta el tooltip al salir de la línea
  tooltip.html('').style('visibility', 'hidden');
});

    // Añade el legend de colores en la esquina superior derecha
    const legend = svg.append('g')
    .attr('transform', 'translate(' + (width - 100) + ', 0)');

    // Crea un conjunto de datos único para el legend
    const legendData = Array.from(new Set([...lineDataMin, ...lineDataMax].map(d => d.year)));

    legend.selectAll('.legend-item')
    .data(legendData)
    .enter().append('rect')
    .attr('class', 'legend-item')
    .attr('x', 0)
    .attr('y', (d, i) => i * 20)
    .attr('width', 15)
    .attr('height', 15)
    .style('fill', d => colorScale(d)); // Asigna un color diferente a cada línea

    legend.selectAll('.legend-text')
    .data(legendData)
    .enter().append('text')
    .attr('class', 'legend-text')
    .attr('x', 20)
    .attr('y', (d, i) => i * 20 + 12)
    .text(d => d); // Muestra los años en el legend

    // Añade ejes x e y al gráfico
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
  });
}

// Añade un evento de cambio al tag 'select'
regionSelect.on('change', function () {
  const selectedRegion = regionSelect.property('value');
  generateLineChart(selectedRegion);
});

// Genera la gráfica inicial con la primera región en el tag 'select'
generateLineChart("National");
