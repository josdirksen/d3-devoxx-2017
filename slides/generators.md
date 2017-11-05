### D3: Using Generators

> SVG provides a number of **primitives** (circle, rect, ellipse, line, polyline, polygon) used
> for drawing. Real power, though, comes from the '**path**' element. Writing '**path**'s by hand is
> rather complex. With **generators**, D3.js wraps the **complexity** in a simple function.  


### The **path** element is versatile

- the `d` attribute describes a path:

```html
<path class="arc" d="M136.86141570725613,-17.69047457265137A138,138,
0,0,1,124.60150267951192,59.31665474390461L62.948628653284814,28.
257214134993035A69,69,0,0,0,68.61145448511735,-7.312203049469534Z" 
style="fill: rgb(252, 160, 130);"></path>
```
- `M`, `L`, `A`, `C`, `A`, `Q`, `T` ... for lines, arcs, curves 
- Hard to determine the correct values yourself
- D3.js provides generators for complex shapes


### The arc **generator**

<img src="../images/arc_1.png" height="100"/>

```javascript
var arc = d3.arc().outerRadius(200).innerRadius(100);

// generate a path string
var pathString = arc({
  startAngle: 0,
  endAngle: Math.PI
}); 

// "M1.469576158976824e-14,-240A240,240,0,1,1,1.469576158976824e-14,
// 240L7.34788079488412e-15,120A120,120,0,1,0,7.34788079488412e-15,
// -120Z"
select(".chart").append("path").attr("d", pathString);
```


### Now it's easy to create a **pie chart**

<img src="../images/arcs_1.png" height="400"/>

[Generator](http://localhost/Dev/git/dataviz-d3js/src/chapter-02/D02-01.html) <!-- .element: target="_blank" -->


### Combined with the **pie** function
- `d3.pie()` to generate config for `d3.arc`

```javascript
var arc = d3.arc()
    .outerRadius(height/2 * 0.6).innerRadius(height/2 * 0.3);
var data = [{count:10}, {count:20}, {count:30}]

var pie = d3.pie().padAngle(0.04)
.value(function (d) { return d.count; });

var arcs = pie(data)    
// "[{"data":{"count":10},"index":2,"value":10,
//    "startAngle":5.215987755982988,
//    "endAngle":6.283185307179586,"padAngle":0.04},
//   {"data":{"count":20},"index":1,"value":20,
//    "startAngle":3.121592653589793,
//    "endAngle":5.215987755982988,"padAngle":0.04} ... 
selectAll("path").data(arcs).enter()
   .append("path").attr("d", arc);
``` 
<!-- .element: style="font-size: 0.4em" -->


### Another standard pattern 

1. (Optionally) Use a generator which creates **config** for other generators (`d3.pie`)
2. Pass initial **data** through step 1, result is **enriched data** with config.
3. Use the normal `selectAll()`, `enter()`, `merge()`, `exit()` pattern
4. Use generator which creates a **path** based on properties. (`d3.arc`)


### Using another **generator**

<img src="../images/temp.png" height="400"/>

[Temperature spiral](examples/spiral) <!-- .element: target="_blank" -->


## Spiral code: Setup 1/2

```javascript
  var minR = 20;
  var maxR = height/2;

  // determine min and max values to determine range
  var allMonths = months.reduce(function(result, year) {return result.concat(year.months)}, []);
  var minValue = allMonths.reduce(function(result, monthRow) { return (monthRow.value < result) ? monthRow.value : result; }, 0);
  var maxValue = allMonths.reduce(function(result, monthRow) { return (monthRow.value > result) ? monthRow.value : result; }, 0);

  // set the scale for the radius
  var radius = d3.scaleLinear().range([minR, maxR]).domain([minValue, maxValue+0.3]);
  var color = d3.scaleSequential(d3.interpolateRainbow).domain([0, months.length]);

  // configure the path generator
  var radialGenerator = d3.lineRadial();
  radialGenerator.radius(function(d) { return radius(d.value); });
  radialGenerator.angle(function(d) { return ((2*Math.PI)/12) * d.monthIndex; });

```
<!-- .element: style="font-size: 0.4em" -->


## Spiral: Render loop 2/2

```javascript
function appendMonth() {

    // select and bind the data
    var dataToShow = months.slice(0, year);
    var current = graph.selectAll("path").data(dataToShow);

    // We only add new data, we don't update existing data.
    current.enter()
        .append("path")
        .attr("d", function(d,i) { return radialGenerator(d.months)})
        .attr("stroke", function(d,i) { return color(i)});

    console.log(dataToShow[dataToShow.length-1])
    graph.select(".currentYear").text(dataToShow[dataToShow.length-1].year);

    year++;
}
```
<!-- .element: style="font-size: 0.4em" -->


### Sidestep: SVG and positioning

- Absolute positioning:
```html
<rect x="100", y="100"></rect>
<circle cx="100", cy="100"></circle>
```
- Provides a `g` element for grouping
 - `g` has no `x` or `y`, uses `transform`
 - All attributes on this element apply on children
```
<g transform="translate(50 200)">...</g> <!-- positioning -->    
<g transform="scale(0.5 0.3)">...</g> <!-- sizing -->
<g transform="rotate(45)">...</g> <!-- rotate the g -->    
``` 
- Actions can be combined, still annoying


### Positioning with scales

- A scale translates input domain to an output range
- Different scales (https://github.com/d3/d3-scale)
  - **scaleLinear**: continuous input to cont. output
    - scalePow, scaleLog, scaleTime
  - **scaleSequential**: continuous input to interpolator
  - scaleQuantize: continuous input to discrete range
  - scaleQuantile: sampled input to discrete range
  - scaleThreshold: scaleQuantize with thresholds
  - scaleOrdinal: discrete input to discrete range


### scaleLinear: continuous input to continuous output

```javascript
var x = d3.scaleLinear()
    .domain([10, 130])   // e.g the min and max of your data
    .range([0, 960]);    // the width of your chart

x(20); // 80
x(50); // 320

var color = d3.scaleLinear()
    .domain([10, 100])
    .range(["brown", "steelblue"]);

color(20); // "#9a3439"
color(50); // "#7b5167"
```


### What can we interpolate?

The domain are numbers, the range can be any of this:
 
![](../images/what_interpolate.png) 

And if this doesn't match, you can create your own.

