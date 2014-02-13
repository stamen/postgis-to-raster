"use strict";

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
var pg     = require("pg"),
    mapnik = require("mapnik");

var config    = require("./config.json"),
    conString = "postgres://"+config.postgis.user+"@"+config.postgis.host+"/"+config.postgis.db,
    client    = new pg.Client(conString);

var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
    sm, s, ds, l, map, bboxObject;

//
// Create the stylesheet
// TODO: Use Carto
//
sm = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
s = '<Map srs="' + sm + '">';
s += '<Style name="line">';
s += ' <Rule>';
s += ' <LineSymbolizer stroke-width="0" />';
s += ' <PolygonSymbolizer fill-opacity="1" fill="'+color+'" />';
s += ' </Rule>';
s += '</Style>';
s += '</Map>';

//
// Start the mapnik map instance
//
map = new mapnik.Map(parseInt(width,10), parseInt(height, 10));
map.fromStringSync(s);

//
// Get the shape from postgis
//
console.log('Connecting to PostGIS server at ' + config.postgis.host + '...');
client.connect(function(err) {
  if(err) {
    return console.error("could not connect to postgres", err);
  }
  client.query('SELECT st_astext('+config.postgis.geo_column+') as wkt, st_asgeojson(st_box2d(cpad_2013b_superunits_ids.geom)) as bbox, '+config.postgis.id_column+' as id, '+config.postgis.name_column+' as name FROM '+config.postgis.table+' WHERE '+config.postgis.id_column+'='+su_id+';', function(err, result) {
    if(err) {
      return console.error("error running query", err);
    }

    console.log('Generating a ' + width + 'x' + height + ' image for ' + result.rows[0].name + '...');

    //
    // Construct the CSV datasource
    //
    ds = new mapnik.Datasource({
      'type': 'csv',
      'inline': 'id,wkt\n1,"' + result.rows[0].wkt + '"\n'
    });

    l        = new mapnik.Layer('test');
    l.srs    = wgs84;
    l.styles = ['line'];
    l.datasource = ds;
    map.add_layer(l);

    //
    // Use the bounding box from the postgis query to set the 
    // extent of the map draw
    //
    bboxObject = JSON.parse(result.rows[0].bbox).coordinates[0];

    map.extent = [
      bboxObject[0][0],
      bboxObject[0][1],
      bboxObject[3][0],
      bboxObject[3][1]
    ];

    map.zoomAll();

    //
    // Draw an image.
    //
    map.renderFileSync(image);

    console.log('Done. Your image is named: ' + image);

    client.end();
  });
});