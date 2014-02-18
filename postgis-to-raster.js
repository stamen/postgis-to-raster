"use strict";

function PostGISToRaster(config) {

  var pg     = require("pg"),
      mapnik = require("mapnik");

  var conString = config.dburl ? config.dburl || "postgres://"+config.user+"@"+config.host+"/"+config.db,
      client;

  var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
      options = {
        width  : null,
        height : null,
        color  : null
      },
      sm, s, ds, l, map, bboxObject;

function getMapInstance(id, callback, opitons) {

  opitons = opitons || opitons;

  client = new pg.Client(conString);

  var width  = options.width  || 300,
      height = options.height || 300,
      color  = options.color  || 'red';

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

  client.connect(function(err) {
    if(err) {
      callback(err, null);
    }
    client.query('SELECT st_astext('+config.geo_column+') as wkt, st_asgeojson(st_box2d(cpad_2013b_superunits_ids.geom)) as bbox, '+config.id_column+' as id, '+config.name_column+' as name FROM '+config.table+' WHERE '+config.id_column+'='+id+';', function(err, result) {
      if(err) {
        callback(err, null);
      }

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

      client.end();

      client = null;

      //
      // Draw an image.
      //
      callback(null, map, mapnik);

    });
  });

}

return {
  getMapInstance : getMapInstance
}

}

module.exports = PostGISToRaster;