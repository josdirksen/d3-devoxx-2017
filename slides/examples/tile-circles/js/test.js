var math = require("../js/math.min.js");
var svgParse = require("../js/parse-svg.js");

// number of tiles in row
var NumberOfRectangles = 2;
var tileScale = 400;

// paths, two per cube
var s1 = "M1.2246467991473532e-14,200A200,200,0,0,1,-200,2.4492935982947064e-14A200,200,0,0,0,1.2246467991473532e-14,200Z";
var s2 = "M1.2246467991473532e-14,-200A200,200,0,0,1,200,0A200,200,0,0,0,1.2246467991473532e-14,-200Z";
var s3 = "M1.2246467991473532e-14,200A200,200,0,0,1,-200,2.4492935982947064e-14A200,200,0,0,0,1.2246467991473532e-14,200Z";
var s4 = "M1.2246467991473532e-14,-200A200,200,0,0,1,200,0A200,200,0,0,0,1.2246467991473532e-14,-200Z";
var s5 = "M200,0A200,200,0,0,1,1.2246467991473532e-14,200A200,200,0,0,0,200,0Z";
var s6 = "M-200,2.4492935982947064e-14A200,200,0,0,1,-3.6739403974420595e-14,-200A200,200,0,0,0,-200,2.4492935982947064e-14Z";
var s7 = "M200,0A200,200,0,0,1,1.2246467991473532e-14,200A200,200,0,0,0,200,0Z";
var s8 = "M-200,2.4492935982947064e-14A200,200,0,0,1,-3.6739403974420595e-14,-200A200,200,0,0,0,-200,2.4492935982947064e-14Z";

var paths = [s1, s2, s3, s4, s5, s6, s7, s8];

var arcs = paths.map(parseArcs);
var chunked = [];
for (var i = 0, j = arcs.length; i < j; i+=2) {
    chunked.push(arcs.slice(i,i+2));
}

var toTranslate = chunked.map(function(d, i) {
    tX = (tileScale) * (i % NumberOfRectangles)
    tY = (tileScale) * (Math.floor(i / NumberOfRectangles))

    return {tX:tX, tY:tY, data: d}
});

var bb = toTranslate.map(function(d, i) {
   var a1begin = d.data[0].begin;
   var a1end = d.data[0].end;
   var a2begin = d.data[1].begin;
   var a2end = d.data[1].end;

    return {
                a1: [translate(a1begin[0], a1begin[1],d.tX, d.tY), translate(a1end[0], a1end[1],d.tX, d.tY)],
                a2: [translate(a2begin[0], a2begin[1],d.tX, d.tY), translate(a2end[0], a2end[1],d.tX, d.tY)],
                i: i,
                size: d.data[0].size
            }

});

for (var i = 0; i < bb.length; i++) {
    // we need to check i + 1 and ((Math.floor(i/NumberOfRectangles)+1) * NumberOfRectangles + i % NumberOfRectangles
    var tile = bb[i];

    // we're not the last in the row
    if ((i + 1) % NumberOfRectangles != 0) {
        // check one to the right
        var checkWith = bb[i+1];

        console.log("tile: ", tile.a1, tile.a2)
        console.log("with: ", checkWith.a1, checkWith.a2)

        // TODO: due to rotation the end and start can be swapped
        if ((tile.a1[0][0] === checkWith.a1[0][0]) && (tile.a1[0][1] === checkWith.a1[0][1])) {
            console.log("Match first arc begin in tile: " + i + " with first arc begin in tile: " + (i + 1) )
        } else if ((tile.a1[0][0] === checkWith.a2[0][0]) && (tile.a1[0][1] === checkWith.a2[0][1]))  {
            console.log("Match first arc begin in tile: " + i + " with second arc begin in tile: " + (i + 1) )
        } else if ((tile.a1[1][0] === checkWith.a1[0][0]) && (tile.a2[1][1] === checkWith.a1[0][1])) {
            console.log("Match first arc end in tile: " + i + " with first arc begin in tile: " + (i + 1) )
        } else if ((tile.a1[1][0] === checkWith.a2[0][0]) && (tile.a2[1][1] === checkWith.a2[0][1])) {
            console.log("Match first arc end in tile: " + i + " with second arc begin tile: " + (i + 1))
        }
    }

    // we're not the bottom row
    if (Math.floor(i/NumberOfRectangles) != (NumberOfRectangles-1)) {
        // check below
        var checkWith = bb[i + NumberOfRectangles];
        // console.log("tile", tile)
        // console.log("below", checkWith)

        // TODO: due to rotation the end and start can be swapped

    }

}



// steps to do
// 1. collect all the
// var arcCoordinatesStart = [arc[1], arc[2]]
// var arcCoordinatesEnd = [arc[6], arc[7]]

var translated = translate(10, 10, 20, 30);
var rotated = rotate(10, 20, 90);

function rotateAndTranslate() {

}

function rotate(x, y, deg) {
    var a = parseFloat(deg) * (Math.PI/180);
    var inputMatrix  = math.matrix([x, y, 1]);
    var translateMatrix = math.matrix([
        [Math.cos(a), -Math.sin(a), 0],
        [Math.sin(a), Math.cos(a), 0],
        [0, 0, 1]
    ]);

    var result = math.multiply(inputMatrix, translateMatrix);
    return [math.subset(result, math.index(0)), math.subset(result, math.index(1))]
}

function translate(x, y, tX, tY) {
    var inputMatrix  = math.matrix([x, y, 1])
    var translateMatrix = math.matrix([
        [1, 0, 0],
        [0, 1, 0],
        [tX, tY, 1]]
    );

    var result = math.multiply(inputMatrix, translateMatrix);
    return [math.subset(result, math.index(0)), math.subset(result, math.index(1))]
}

// get the first arc, since we're misusing the arc function, we get two arcs instead of one.
function parseArcs(path) {
    var n = Array.from(svgParse(path));
    var moveTo =  n.find(function(d) {return d[0] === 'M'});
    var arc =  n.find(function(d) {return d[0] === 'A'});

    var begin = [Math.round(moveTo[1]), Math.round(moveTo[2])];
    var end = [Math.round(arc[6]), Math.round(arc[7])];
    var size = arc[1];

    return {
      begin: begin,
      end: end,
      size: size
    };
}

function checkConnected(c1, c2) {
    if ((c1[0] === c2[0]) && (c1[1] === c2[2])) {
        return 1;
    } else if ((c1[1] === c2[0]) && (c1[0] === c2[2])) {
        return -1;
    }
    returun 0;
}
