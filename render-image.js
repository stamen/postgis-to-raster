"use strict";

var usage = 'Usage: node render-image <id> <CSS friendly color> <width in pixels> <height in pixels> <path to image>';

//
// Check arguments
//
var su_id = process.argv[2];
if (!su_id) {
   console.log(usage);
   process.exit(1);
}

var color = process.argv[3];
if (!color) {
   console.log(usage);
   process.exit(1);
}

var width = process.argv[4];
if (!width) {
   console.log(usage);
   process.exit(1);
}

var height = process.argv[5];
if (!height) {
   console.log(usage);
   process.exit(1);
}

var image = process.argv[6];
if (!image) {
   console.log(usage);
   process.exit(1);
}

//
// K, lets get started.
//
var config = require("./config.json");

var postGISToRaster = new require('./postgis-to-raster.js')(config.postgis);

//
// Get the shape from postgis
//

postGISToRaster.getMapInstance(su_id, function(err, map) {

  if(err) {
    console.log('There was an error making this image: ', err);
  }

  map.renderFileSync(image);
  console.log('Done. Your image is named: ' + image);

}, {
  width  : width,
  height : height,
  color  : color
});
