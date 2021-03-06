"use strict";

function PostGISToRaster(config) {

  var util = require("util");

  var pg     = require("pg"),
      mapnik = require("mapnik");

  var conString = config.dburl ? config.dburl : "postgres://"+config.user+"@"+config.host+"/"+config.db;

  var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
      options = {
        width  : null,
        height : null,
        color  : null
      },
      sm, s, ds, l, bboxObject;

function getMapInstance(id, callback, options) {

  options = options || options;

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
  var map = new mapnik.Map(parseInt(width,10), parseInt(height, 10));
  map.fromStringSync(s);

  pg.connect(conString, function(err, client, cb) {
    var done = function() {
      cb();
      return callback.apply(null, arguments);
    }

    if(err) {
      return done(err);
    }

    return client.query(util.format("SELECT ST_AsText(%s) AS wkt," +
      " ST_AsGeoJSON(ST_Envelope(cpad_2013b_superunits_ids.geom)) AS bbox, %s AS id," +
      " %s AS name FROM %s WHERE %s=%d",
        config.geo_column,
        config.id_column,
        config.name_column,
        config.table,
        config.id_column,
        id), function(err, result) {

      if(err) {
        return done(err);
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

      //
      // Draw an image.
      //
      return done(null, map, mapnik);
    });
  });

}

return {
  getMapInstance : getMapInstance
}

}

module.exports = PostGISToRaster;