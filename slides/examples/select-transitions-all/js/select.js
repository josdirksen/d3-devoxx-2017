function show() {
    'use strict';

    var margin = { top: 20, bottom: 20, right: 40, left: 40 },
        width = 1200 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
                                        + margin.top + ")");

    function update() {

        var circles = chart.selectAll('circle').data(getRandomData(), function(d) {return d.index});

        circles.enter().append('circle')
            .attr("class", "added")
            .attr("cy", "50")
            .transition().duration(2000)
            .attr("cx", function(d, i) { return i * 100})
            .attr("r", function(d) { return d.value });

        circles
            .attr("class", "updated")  // set the class to updated
            .transition().duration(2000)
            .attr("cx", function(d, i) { return i * 100})
            .attr("r", function(d) { return d.value });

        circles.exit()
            .transition().duration(2000)
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
            data.push({
                index: i,
                value: (Math.random() * radius / 2) + radius / 2
            })
        }

        var sorted = data.sort(function(a,b) {return a.value > b.value})
        console.log(sorted);
        return sorted
    }
}


