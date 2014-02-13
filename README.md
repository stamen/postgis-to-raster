PostGIS to Raster
=================

Takes a polygon geom column from postgis and renders a raster.

To use for the first time:
  * Git clone and cd into the root
  * `cp config.json.sample config.json`
  * Add your postgis config specifics to the config file
  * `npm install`
  * Find the id for the row you would like
  * `node render-image <id> <CSS friendly color> <width in pixels> <height in pixels> <path to image>`

Some code streaght up stollen from @springmeyer & @mojodna. Thanks guys!