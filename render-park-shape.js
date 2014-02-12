"use strict";

var pg = require("pg");

var config    = require("./config.json"),
    conString = "postgres://"+config.postgis.user+"@"+config.postgis.host+"/"+config.postgis.db;

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error("could not connect to postgres", err);
  }
  client.query('SELECT '+config.postgis.geo_column+','+config.postgis.id_column+' FROM '+config.postgis.table+' WHERE '+config.postgis.id_column+'=2977;', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0]);
    client.end();
  });
});