function show() {

    var margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var NumberOfRectangles = 5;

    // We have a square area, so only need a single linearscale
    var tileScale = d3.scaleLinear().domain([0, NumberOfRectangles]).range([0, width]);
    var colorScale = d3.scaleSequential(d3.interpolateWarm).domain([0,1]);
    var tileWidth = tileScale(1)

    // create the data elements, which we'll use
    var data = d3.range(0, NumberOfRectangles * NumberOfRectangles).map(function(i) {
        return {
            x: tileScale(i % NumberOfRectangles),
            y: tileScale(Math.floor(i / NumberOfRectangles)),
            r: 0,
            color: colorScale(Math.random())
        }
    });

    // create the quarter circles
    var arc = d3.arc();
    var arc1 = arc({innerRadius: (tileWidth/2), outerRadius: tileWidth/2, startAngle: 0, endAngle: Math.PI / 2 });
    var arc2 = arc({innerRadius: (tileWidth/2), outerRadius: tileWidth/2, startAngle: Math.PI / 2, endAngle:  Math.PI });
    var arc3 = arc({innerRadius: (tileWidth/2), outerRadius: tileWidth/2, startAngle:  Math.PI, endAngle: 1.5 * Math.PI });
    var arc4 = arc({innerRadius: (tileWidth/2), outerRadius: tileWidth/2, startAngle: 1.5 * Math.PI, endAngle: 2 * Math.PI });


    /**
     * Call on each interval, randomly changes the rotation of the tiles, and rerenders everything
     */
    function tick() {
        updateData();
        updateCircles();
    }

    /**
     * Randomly increase the rotation of the datas
     */
    function updateData() {
        data.forEach(function (d) {
            if (Math.random() < 0.5) d.r += 90;
        })
    }

    /**
     * Select and update the circles. Transitions handle the rotation of each tile to a new position.
     */
    function updateCircles() {
        var tiles = chart.selectAll("g")
            .data(data)
            .enter()
            .append("g") // group which handles the position of the tiles
                .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")"})
             .append("g") // group which will be rotated
                .attr("class","rotatable")
                .attr("style","transform-origin: center")
                .attr("transform", "rotate(0)");

        tiles.on("mouseover", function(d, i ,nodes) {
            d3.select(this)
                .selectAll("path")
                .attr("stroke", colorScale(Math.random()))
                .attr("stroke-width", "10")
        });

        tiles.on("mouseout", function(d, i ,nodes) {
            d3.select(this).selectAll("path")
                .transition().duration(5000)
                .attr("stroke", "#000")
                .attr("stroke-width", "2")
        });

        // add the quarter circles at the correct locations and add an enclosing rectangle
        tiles.append("rect").attr("width", tileWidth).attr("height", tileWidth).attr("fill", "None");
        tiles.append("path")
            .attr("stroke", "#000")
            .attr("stroke-width", "2")
            .attr("d", function (d, i) {return i % 2 == 0 ? arc3 : arc2 })
            // .attr("stroke", function(d) {return d.color})
            .attr("transform", function(d, i) {return i % 2 == 0 ? "translate(" + tileWidth +")" : "translate(0)"})

        tiles.append("path").attr("d", function (d, i) {return i %2 == 0 ? arc1: arc4 })
            // .attr("stroke", function(d) {return d.color})
            .attr("stroke-width", "2")
            .attr("stroke", "#000")
            .attr("stroke-width", "2")
            .attr("transform", function(d, i) {return i % 2 ==0 ? "translate(" + 0 + " " + tileWidth + ")" : "translate(" + tileWidth + " " + tileWidth + ")"})

        chart.selectAll(".rotatable")
            .attr("stroke", "#000")
            .attr("stroke-width", "2")
            .transition().duration(1000).ease(d3.easeLinear)
            .attr("transform", function(d, i) { return "rotate(" + d.r + ")" })
    }

    // draw the first circle, and use d3.interval to do this once every so often
    updateCircles();
    d3.interval(tick, 1500);
}


// function rotate(x, y, deg) {
//     var a = parseFloat(deg) * (Math.PI/180);
//     var inputMatrix  = math.matrix([x, y, 1]);
//     var translateMatrix = math.matrix([
//         [Math.cos(a), -Math.sin(a), 0],
//         [Math.sin(a), Math.cos(a), 0],
//         [0, 0, 1]
//     ]);
//
//     var result = math.multiply(inputMatrix, translateMatrix);
//     return [math.subset(result, math.index(0)), math.subset(result, math.index(1))]
// }
//
// function translate(x, y, tX, tY) {
//     var inputMatrix  = math.matrix([x, y, 1])
//     var translateMatrix = math.matrix([
//         [1, 0, 0],
//         [0, 1, 0],
//         [tX, tY, 1]]
//     );
//
//     var result = math.multiply(inputMatrix, translateMatrix);
//     return [math.subset(result, math.index(0)), math.subset(result, math.index(1))]
// }
//
// // get the first arc, since we're misusing the arc function, we get two arcs instead of one.
// function parseArcs(path) {
//     var n = Array.from(parseSvg(path));
//     return n.find(function(d) {return d[0] === 'A'});
// }