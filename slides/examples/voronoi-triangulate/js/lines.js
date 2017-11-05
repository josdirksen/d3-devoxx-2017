function show() {

    var canvasId = 'canvas';
    var imgId = 'srcimg';
    var blurFactor = '2';
    var blockSize = 5;
    var ratio = 1;
    var threshold = 20;

    // start when image is loaded
    var img = document.getElementById(imgId);
    img.onload = function() {
        var width = img.naturalWidth; // this will be 300
        var height = img.naturalHeight; // this will be 400

        // resize the canvas
        var cv = document.getElementById(canvasId);
        cv.width = width;
        cv.height = height;

        var sites = process(canvasId, imgId, blurFactor, blockSize, ratio, threshold)

        // for (var i = 0; i <= width; i += 100) sites.push([i, 0], [i, height]);
        // for (var i = 0; i <= height; i += 60) sites.push([0, i], [width, i]);

        sites.push([0,0]);

        // var original = document.createElement('canvas');
        // original.width = img.width;
        // original.height = img.height;
        // var originalContext = original.getContext('2d');
        // originalContext.drawImage(img, 0, 0, width, height);


        cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
        cv.getContext('2d').fillStyle = "#fff";
        cv.getContext('2d').fillRect(0, 0, cv.width, cv.height);
        cv.getContext('2d').fill();

        drawLines(sites, cv.getContext('2d'))
        // drawVoronoi(cv, width, height, sites, originalContext)
        // draw2(sites, cv.getContext('2d'), width, height, originalContext)
    };

}

/**
 * Convert
 * @param canvasId
 */
function process(canvasId, srcId, blurFactor, blockSize, ratio, threshold) {
    stackBlurImage(srcId, canvasId, blurFactor, false );
    toGrayscale(canvasId);
    detectEdges(canvasId);
    return getPoints(canvasId, blockSize, 0.5, threshold, ratio);
}

var drawLines = function(cells, con) {



    // Draw path
    con.beginPath();
    con.moveTo(0,0);

    var currentPoint = [0,0];

    while (cells.length > 1) {
        var pointTo = getAndRemoveClosest(currentPoint, cells);
        con.lineTo(pointTo[0], pointTo[1]);
        currentPoint = pointTo
    }

    // Fill path
    con.strokeStyle = '#000';
    con.lineWidth = 0.5;
    con.stroke();
    con.closePath();
};

function getAndRemoveClosest(from, toSearch) {
    var lengthFound = Infinity;
    var shortestIndex = 0;

    toSearch.forEach(function (d,i) {
        var dx = Math.abs(from[0] - d[0]);
        var dy = Math.abs(from[1] - d[1]);

       var distance = Math.sqrt(dx*dx + dy*dy);

        if (distance < lengthFound) {
            lengthFound = distance;
            shortestIndex = i
        }
    });

    return toSearch.splice(shortestIndex, 1)[0];
}

function drawVoronoi(cv, width, height, sites, original) {

    var voronoi = d3
        .voronoi()
        .extent([[-10000, -10000], [width+10000, height+10000]]);

    voronoi(sites).polygons()

    drawTriangle(cv, voronoi, sites, original)

}

// Function to draw a cell
var drawCell = function(cell, con, original) {
    if (!cell || !con)
        return false;

    // Draw path
    con.beginPath();
    con.moveTo(cell[0][0], cell[0][1]);
    for (var j = 1, m = cell.length; j < m; ++j) {
        con.lineTo(cell[j][0], cell[j][1]);
    }

    // Fill path
    con.fillStyle = getColor(cell, original);
    // con.fillStyle = '#333333';
    con.strokeStyle = con.fillStyle;
    con.lineWidth = 1;
    con.fill();
    con.stroke();
    con.closePath();
    return true;
};

// Function to draw triangles
var drawTriangle = function(canvas, voronoi, sites, original) {
    var polygons = voronoi(sites).triangles();

    var context = canvas.getContext("2d");
    // context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paths!
    for (var i = 0, n = polygons.length; i < n; ++i) {
        drawCell(polygons[i], context, original);
    }
};

var getColor = function(d, context) {
    // Get triangle center
    var x = 0;
    var y = 0;
    d.forEach(function(dd) {
        x += dd[0];
        y += dd[1];
    });
    x = x / 3;
    y = y / 3;

    // Get color
    var pixelData = context
        .getImageData(x, y, 1, 1)
        .data;


    var color = 'rgba(' + pixelData[0] + ',' + pixelData[1] + ',' + pixelData[2] + ',' + pixelData[3] + ')';
    return color;
};


/**
 * Look at the determined edges and get a specific amount of points from there.
 *
 * @param canvasId the canvas to read from
 * @param blockSize the block size used to determine the threshold value
 * @param stepRatio the overlap of the blocks, 1 is no overlap. 0.5 is 50 % overlap.
 * @param threshold the 'score' below which results are ignored.
 * @param pixelRatio when all previous steps are calculated, the random percentage of points to use
 * @returns {Array} a 2D array of x,y coordinates of the resulting points.
 */
function getPoints(canvasId, blockSize, stepRatio, threshold, pixelRatio) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext('2d');

    var width = canvas.width;
    var height = canvas.height;

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    var points = [];
    for (var x = 0 ; x < width-blockSize ; x+= Math.round(blockSize * stepRatio)) {
        for (var y = 0 ; y < height -blockSize; y+= Math.round(blockSize * stepRatio)) {
            var block = [];
            for (var bx = 0 ; bx < blockSize ; bx++) {
                for (var by = 0 ; by < blockSize ; by++) {
                    block.push(getGrayValueAt(imageData, x+bx + (y+by) * width))
                }
            }

            // now we have a block where we can calculate the average
            // and add it to the final result if the threshold is reached.
            var blockResult = block.reduce(function(d, i) { return d + i}, 0) / (blockSize * blockSize)

            if (blockResult > threshold) {
                points.push({
                    x: x,
                    y: y,
                    blockResult: blockResult
                });
            }
        }
    }

    var initialLength = points.length * pixelRatio
    var ratioApplied = d3.range(0, Math.floor(initialLength), 1).map(function(i) {
        var currentLength = points.length;
        var index = Math.floor(Math.random() * currentLength);
        var point = (points.splice(index, 1))[0];
        return [point.x, point.y]
    });

    return ratioApplied;

    /**
     * it's all grayscale so we only need to get a single value, while we ignore the rest
     * @param data the image data
     * @param index the x,y based index.
     */
    function getGrayValueAt(data, index) {
        return data.data[index*4]
    }
}

function detectEdges(canvasId) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext('2d');

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Sobel constructor returns an Uint8ClampedArray with sobel data
    var sobelData = Sobel(imageData, 50);

    // [sobelData].toImageData() returns a new ImageData object
    var sobelImageData = sobelData.toImageData();
    context.putImageData(sobelImageData, 0, 0);
}

/**
 * Retrieve the provided canvas by id and convert it to grayscale
 * @param canvasId the id to convert
 */
function toGrayscale(canvasId) {
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext('2d');

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    for(var i = 0; i < data.length; i += 4) {
        var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
    }

    // overwrite original image
    context.putImageData(imageData, 0, 0);
}

