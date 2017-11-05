### Interactions

> Extend the **select** pattern and respond to user interactions with
> the elements on screen.


### D3 makes adding **listeners** easy

- Part of the **select**/**add**/**update**/**remove** pattern
- Use the `on` function (with any DOM event type): 
- `event.name` when multiple listeners for event

```javascript
// on enter() also add event listeners  
circles.enter().append('circle').attr("class", "added")
   .attr("cy", "50")
   .attr("cx", function(d, i) { return i * 100})
   .attr("r", function(d) { return d.value })
   .on("mouseover", handleMouseOver)
   .on("mouseup.foo", handleMouseUp1)
   .on("mouseup.bar", handleMouseUp2)
   .on("mouseenter mouseleave", handleMouseEnterMouseLeave)
```


### **Event** listeners in D3

```javascript
function handleMouseOver(d, i, nodes) {
    var boundData = d;
    var index = i;
    var currentElement = nodes(i);  // also bound to this
    
  // Select element, and add a transition 
  d3.select(this)
    .transition()
    .attr({ fill: "orange", r: 100 });
}
```


## **Static** example

<img src="../images/recs.png" height=400></img>

[Rotating rectangles](./examples/tile-circles) <!-- .element: target="_blank" -->


## Add **interactivity**

```javascript
var tiles = chart.selectAll("g").data(data).enter()... 
              
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
```


## **Interactive** example

<img src="../images/recs2.png" height=400></img>

[Rotating colored rectangles](./examples/tile-circles/index-2.html) <!-- .element: target="_blank" -->


### Some additional helpers

- Helpers to get more information:
  - `d3.event`: the current event
  - `d3.mouse`: `x`,`y` relative to a container
  - `d3.touch`: `x`,`y` of touch relative to a container
  - `d3.touches`: `x`,`y` of touches rel. to a container


### There is **more**

- `d3.brush`: select multiple elements by clicking and dragging the mouse.
- `d3.drag`: drag and drop any element to a new location

[d3.brush](http://localhost/dev/git/dataviz-d3js/src/chapter-08/D08-06.html) <!-- .element: target="_blank" -->