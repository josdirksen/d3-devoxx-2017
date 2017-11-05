// data from: https://datahub.io/core/global-temp

function show() {
    'use strict';

    var margin = { top: 50, bottom: 50, right: 40, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
                                        + margin.top + ")");


    // the main group which will contain the graph
    var graph = chart.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")");
    var overlay = chart.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")");

    // some globals
    var MONTHS = ['Jan','Feb','Mar','Apr','May', 'Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // load in the data and convert to single array.
    d3.csv("data/loti.csv", function(trans) {

        var res = trans.reduce(function(result, yearRow) {

            var year = yearRow['Year'];

            var monthValues = MONTHS.map(function(m, i) {
                return {
                    month: m,
                    monthIndex: i,
                    originalValue: yearRow[m],
                    value: parseFloat(yearRow[m])
                }
            });

            var resultObject = {
                year: year,
                months: monthValues.filter(function(d) {return d.originalValue !== "***"})
            };

            return result.concat(resultObject);
        } ,[]);

        // add the first one of the next year, so our circles close
        res.forEach(function(d,i) {
           if (i < res.length-1) {
               d.months.push(res[i+1].months[0])
           }
        });

        // at the end there might be some months without values
        processData(res)
    });


    /**
     * Each month contains a single value.
     *
     * @param months
     */
    function processData(months) {

        // and add the main path element, which will contain everything
        var minR = 20;
        var maxR = height/2;

        // determine min and max values to determine range
        var allMonths = months.reduce(function(result, year) {return result.concat(year.months)}, []);
        var minValue = allMonths.reduce(function(result, monthRow) { return (monthRow.value < result) ? monthRow.value : result; }, 0);
        var maxValue = allMonths.reduce(function(result, monthRow) { return (monthRow.value > result) ? monthRow.value : result; }, 0);

        // set the scale for the radius
        var radius = d3.scaleLinear().range([minR, maxR]).domain([minValue, maxValue+0.3]);
        var color = d3.scaleLinear().domain([0, months.length]);

        var color2 = d3.scaleSequential(d3.interpolateRainbow).domain([0, months.length]);

        // configure the path generator
        var radialGenerator = d3.lineRadial();
        radialGenerator.radius(function(d) { return radius(d.value); });
        radialGenerator.angle(function(d) { return ((2*Math.PI)/12) * d.monthIndex; });

        // draw the main temperature offset lines
        var circles = ["0", "+0.5", "+1.5"]
        overlay.selectAll("text.temps").data(circles).enter().append("text").attr("dx","4").attr("class","temps").attr("x", function(d) {return radius(d)}).text(function(d) {return d + " °"})
        overlay.selectAll("circle").data(circles).enter().append("circle").attr("class","reference").attr("r", function(d,i) {return radius(d)})

        // draw the months
        overlay.selectAll("text.months")
            .data(MONTHS).enter().append("text").attr("class","months").attr("dx", "30").attr("x", height/2).attr("y", "0.4em").text(function(d, i) { return d; })
            .attr("transform", function(d, i) { return "rotate(" + (-90 + ((360 / MONTHS.length) * i)) + ")"; });

        // draw the background
        graph.append("circle").attr("class","background").attr("r", function(d,i) {return radius(maxValue + 0.5)}).style("fill: black");

        // draw the year
        graph.append("text").attr("class","currentYear").attr("text-anchor","middle").text("");

        var year = 1;
        function appendMonth() {

            // select and bind the data
            var dataToShow = months.slice(0, year);
            var current = graph.selectAll("path").data(dataToShow);

            // We only add new data, we don't update existing data.
            current.enter()
                .append("path")
                .attr("d", function(d,i) { return radialGenerator(d.months)})
                .attr("stroke", function(d,i) { return color2(i)});

            console.log(dataToShow[dataToShow.length-1])
            graph.select(".currentYear").text(dataToShow[dataToShow.length-1].year);

            year++;
        }
        appendMonth();
        d3.interval(function() { appendMonth(); }, 70);
    }
}


