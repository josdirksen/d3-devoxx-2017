function show() {
    'use strict';

    var margin = { top: 20, bottom: 20, right: 40, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
                                        + margin.top + ")");

    function update() {

        var circles = chart.selectAll('circle').data(getRandomData())

        circles.enter().append('circle')
            .attr("r", function(d) { return d })
            .attr("cx", function(d, i) { return i * 100})
            .attr("class", "added")
            .attr("cy", "50")

        circles
            .attr("class", "updated")  // set the class to updated
            .attr("r", function(d) { return d })

        circles.exit().transition().duration(2000)
            .attr("r", 0)
            .style("opacity", 0)
            .on('end', function(d) {
                this.remove()
            });
    }

    // run the update function every couple of seconds
    update();
    d3.interval(function() { update(); }, 5000);

    function getRandomData() {
        var radius = 40;
        var numCircles = Math.ceil(Math.random() * 10);

        console.log("New number of circles to render: " + numCircles)

        var data = [];
        for (var i = 0 ; i < numCircles ; i++) {
            data.push((Math.random() * radius / 2)
                + radius / 2);
        }

        console.log(data);

        return data;
    }
}


