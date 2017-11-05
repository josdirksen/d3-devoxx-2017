### Creating Maps

> Often used way to represent data is on **maps**. D3 provides a standard
> way to easily create **interactive** maps in different **projections**.

(Not really a pattern, but nicely shows a combination of the other patterns and concepts we've seen)
<!-- .element: style="font-size: 0.4em" -->


### Best part of D3.js

At least for me.... since I really like maps


### Cause it looks nice

<img src="../images/cf1.png" height=500></img>


### and informative

<img src="../images/cf2.png" height=500></img>


### and beautiful

<img src="../images/cf3.png" height=500></img>


### Quick note on projections

Defines how the source **coordinates** (lat, lon) are projected to a **2D** flat canvas. E.g: **Sinu Mollweide**:

<img src="../images/proj1.png" height=250></img>
 
[Example](http://localhost/dev/git/dataviz-d3js/src/chapter-05/D05-02.html) <!-- .element: target="_blank" -->


### Visualizing is easy

Lets recreate this:

<img src="../images/map.png" height=350></img>

[Example](http://localhost/dev/git/dataviz-d3js/src/chapter-05/D05-03.html) <!-- .element: target="_blank" -->


### Note on data

- D3.js can work with:
    - **GeoJSON**: A standard supported by many applications.
    - **TopoJSON**: A specific optimized format for smaller files.
- Most common format is **ArcGIS** shapefile.
    - binary format
    - Use QGis, Mapshaper, OGR to convert 


### GeoJSON and TopoJSON formats

- Can contain multiple geometries.
- Each geometry is described (usually) as a path.
- Can contain additional properties
    - population, unemployment rate, etc.
    - one file for everything
- Try to work with TopoJSON, since it's much smaller
    
```json
{"type":"Topology","objects":{"cb_2015_us_county_500k": {"type":
"GeometryCollection","geometries":[{"type":"Polygon","properties":
{"GEOID":"01005","NAME":"Barbour"},"id":"01005","arcs":[[0,1,2,3
,4,5,6,-7,6,7,8,9,10,11,12,13,14 ...
```
<!-- .element: style="font-size: 0.5em" -->


### Pattern: topo data and D3.js

1. Load the data
2. Setup a path **generator** and projection
3. Use the projection to generate path segments
4. Use **select** / **bind** / **update** / **remove** pattern


### Sidestep: Loading data

- D3.js provides standard loaders:
 - `d3.csv`, `d3.tsv`
 - `d3.json`, `d3.xml`
 - `d3.text`, `d3.html` 

```javascript
d3.json("somedata.csv", function(rows) {
   // do something with the data
});
```


### Setup the path generator

```javascript
var projection = d3.geoNaturalEarth()
var path = d3.geoPath().projection(projection)
```

- For all the supported projections see:
 - https://github.com/d3/d3-geo/
 - https://github.com/d3/d3-geo-projection
- Pretty much any projection you can think off
 - Relatively easy to create your own one


### With a generator and the data

```
var projection = d3.geoNaturalEarth()
var path = d3.geoPath().projection(projection)

d3.json("./data/world-110m-inet.json", function(loadedTopo) {
  countries  = topojson.feature(loadedTopo, 
                       loadedTopo.objects.countries).features;
                       
  svg.selectAll('.country').data(countries).enter()
     .append("path")
     .classed('country', true)
     .attr("d", path);
}
```
<!-- .element: style="font-size: 0.5em" -->

- `topojson.feature`: convert the topoJSON format to geoJSON
- Which can be processed by the path generator


### And you're done!

<img src="../images/loaded_topo_2.png" height=450></img>

But colors?


### Add a simple scale

```
var color = d3.scaleSequential(d3.interpolateGreens).domain([0,100])
var projection = d3.geoNaturalEarth()
var path = d3.geoPath().projection(projection)

d3.json("./data/world-110m-inet.json", function(loadedTopo) {
  countries  = topojson.feature(loadedTopo, 
                       loadedTopo.objects.countries).features;
                       
  svg.selectAll('.country').data(countries).enter()
     .append("path")
     .classed('country', true)
     .attr("d", path);
     .attr("fill", function(d) {return d.properties.value 
                ? color(+d.properties.value) 
                : '#ccc'});
}
```
<!-- .element: style="font-size: 0.5em" -->


### Easy right?

<img src="../images/loaded_topo_3.png" height=450></img>


### Sidenote: Support of HTML5 canvas

- Also possible to use `<canvas>`

```javascript
var projection = d3.geoNaturalEarth()

// c is a canvas.getContext("2D"); 
var path = d3.geoPath().projection(projection).context(c);

d3.json("./data/world-110m-inet.json", function(loadedTopo) {
  countries  = topojson.feature(loadedTopo, 
                       loadedTopo.objects.countries).features;
  
  countries.forEach(function(toDraw) {
    toDraw.properties.value ? c.fillStyle = color(toDraw.properties.value) 
                            : c.fillStyle = '#ccc';
    c.beginPath(); 
    path(toDraw);
    c.fill();
  })                   
});
```
<!-- .element: style="font-size: 0.4em" -->
