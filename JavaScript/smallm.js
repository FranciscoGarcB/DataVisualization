d3.csv("../datasets/stacked_other.csv").then(function(data) {
    var columns = ["city", "Crape myrtle", "Mexican fan palm", "Queen palm", "Southern magnolia", "American sweetgum", "Other"];
    data = data.map(function(d) {
        var result = {};
        columns.forEach(function(column) {
            result[column] = d[column];
        });
        return result;
    });

    function drawHorizontalBarChart(data, columnName, containerId) {
        var margin = { top: 40, right: 30, bottom: 40, left: 110 };
        var width = 380 - margin.left - margin.right;
        var height = 200 - margin.top - margin.bottom;

        var svg = d3.select(containerId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d[columnName]; })])
            .range([0, width]);

        var y = d3.scaleBand()
            .domain(data.map(function(d) { return d.city; }))
            .range([0, height])
            .padding(0.1);

        // Inicializa las barras en la parte inferior del gráfico
        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", height) // Posición inicial en la parte inferior
            .attr("width", 0)  // Ancho inicial cero
            .attr("height", y.bandwidth());

        // Transición para animar las barras a su posición final
        bars.transition()
            .duration(1000)  // Duración de la transición en milisegundos
            .attr("x", 0)
            .attr("y", function(d) { return y(d.city); })
            .attr("width", function(d) { return x(+d[columnName]); });

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(5))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .text(columnName);
    }

    drawHorizontalBarChart(data, "Crape myrtle", "#chart1");
    drawHorizontalBarChart(data, "Mexican fan palm", "#chart2");
    drawHorizontalBarChart(data, "Queen palm", "#chart3");
    drawHorizontalBarChart(data, "Southern magnolia", "#chart4");
    drawHorizontalBarChart(data, "American sweetgum", "#chart5");
    drawHorizontalBarChart(data, "Other", "#chart6");
});
