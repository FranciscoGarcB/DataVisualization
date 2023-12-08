// set the dimensions and margins of the graph
var margin = { top: 60, right: 30, bottom: 20, left: 70 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the main svg object to the body of the page
var mainSvg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read data from CSV
d3.csv("../datasets/temps_ridgeline1.csv", function (data) {
    // Get the different categories and count them
    var categories = Object.keys(data[0]).filter(function (key) { return key !== "Year"; });
    var n = categories.length;

    // Add X axis
    var x = d3.scaleLinear()
        .domain([-50, 60])
        .range([0, width]);
    mainSvg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Create a Y scale for densities
    var y = d3.scaleLinear()
        .domain([0, 0.5])
        .range([height, 0]);

    // Create the Y axis for names
    var yName = d3.scaleBand()
        .domain(categories)
        .range([0, height])
        .paddingInner(1);
    mainSvg.append("g")
        .call(d3.axisLeft(yName));

    // Compute kernel density estimation for each column:
    var kde = kernelDensityEstimator(kernelCosine(10), x.ticks(40));
    var allDensity = [];
    categories.forEach(function (key) {
        density = kde(data.map(function (d) { return +d[key]; }));
        allDensity.push({ key: key, density: density });
    });

    // Add areas for the first dataset (blue)
    mainSvg.selectAll("areas")
        .data(allDensity)
        .enter()
        .append("path")
        .attr("transform", function (d) { return ("translate(0," + (yName(d.key) - height) + ")"); })
        .datum(function (d) { return (d.density); })
        .attr("fill", "#0077b6") // Azul claro
        .attr("fill-opacity", 0) // Opacidad inicial
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function (d) { return x(d[0]); })
            .y(function (d) { return y(d[1]); })
        )
        .transition() // Agregar transición
        .duration(1000) // Duración de la transición en milisegundos
        .ease(d3.easeLinear) // Tipo de animación (lineal en este caso)
        .attr("fill-opacity", 0.5); // Nueva opacidad al final de la transición

    // Read additional data from CSV
    d3.csv("../datasets/temps_ridgeline2.csv", function (data2) {
        // Compute kernel density estimation for the second dataset:
        var kde2 = kernelDensityEstimator(kernelCosine(7), x.ticks(40));
        var allDensity2 = [];
        categories.forEach(function (key) {
            density = kde2(data2.map(function (d) { return +d[key]; }));
            allDensity2.push({ key: key, density: density });
        });

        // Add areas for the second dataset (red)
        mainSvg.selectAll("areas2")
            .data(allDensity2)
            .enter()
            .append("path")
            .attr("transform", function (d) { return ("translate(0," + (yName(d.key) - height) + ")"); })
            .datum(function (d) { return (d.density); })
            .attr("fill", "#bc4749") // Rojo
            .attr("fill-opacity", 0) // Opacidad reducida para el relleno
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .curve(d3.curveBasis)
                .x(function (d) { return x(d[0]); })
                .y(function (d) { return y(d[1]); })
            )
            .transition() // Agregar transición
            .duration(1000) // Duración de la transición en milisegundos
            .ease(d3.easeLinear) // Tipo de animación (lineal en este caso)
            .attr("fill-opacity", 0.5); // Nueva opacidad al final de la transición
    });

    // Add color legend
    var legendSvg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", 120) // Ajustar el ancho según sea necesario
        .attr("height", height + margin.top + margin.bottom);

    legendSvg.append("rect")
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#0077b6")
        .attr("fill-opacity",0.8); // Blue

    legendSvg.append("text")
        .attr("x", 40)
        .attr("y", 25)
        .text("Minimum")
        .attr("fill", "#000");

        legendSvg.append("rect")
        .attr("x", 10)
        .attr("y", 40)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#bc4749")
        .attr("fill-opacity",0.8); // Red

    legendSvg.append("text")
        .attr("x", 40)
        .attr("y", 55)
        .text("Maximum")
        .attr("fill", "#000")
});

// Compute KDE 
function kernelDensityEstimator(kernel, X) {
    return function (V) {
        return X.map(function (x) {
            return [x, d3.mean(V, function (v) { return kernel(x - v); })];
        });
    };
}

function kernelCosine(k) {
    return function (v) {
        return Math.abs(v /= k) <= 1 ? (Math.PI / 4) * Math.cos(Math.PI / 2 * v) / k : 0;
    };
}
