'use strict';

var fs         = require('fs'),
    handlebars = require('handlebars');

var style_template = fs.readFileSync('./style_xml_template.xml', {encoding : 'utf8'});

var mapnik = require('mapnik');
var sys = require('fs');
var child_process = require('child_process');

var usage = 'usage: render-park-shape.js <su_id> <color> <width> <height> <image path>';

console.log('Making you a nice little park shape to look at...');

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

var map = new mapnik.Map(parseInt(width, 10), parseInt(height, 10));

var stylesheet = handlebars.compile(style_template)({
  su_id : su_id, 
  color : '#' + color
});

map.fromStringSync(stylesheet);
map.zoomAll();
map.renderFileSync(image);

console.log('k. done ' + image);