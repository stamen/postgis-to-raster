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

...oh, if you see this error: `dyld: lazy symbol binding failed: Symbol not found: __ZN6mapnik15freetype_engine14register_fontsERKSsb`

...you're running OS X 10.9. Do this:

```bash
rm -rf node_modules/
export CXXFLAGS="-mmacosx-version-min=10.9"
export CFLAGS="-mmacosx-version-min=10.9"
export LDFLAGS="-mmacosx-version-min=10.9"
npm install
```

------------------------------------------------------------------------

Some code straight up stolen from @springmeyer & @mojodna. Thanks guys!
