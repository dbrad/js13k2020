const gulp = require( `gulp` );
const clean = require( `gulp-clean` );
const imagemin = require( `gulp-imagemin` );
const jsonMinify = require( `gulp-json-minify` );
const minifyHTML = require( `gulp-minify-html` );
const minifyCSS = require( `gulp-clean-css` );
const preprocess = require( `gulp-preprocess` );
const sourcemaps = require( `gulp-sourcemaps` );
const rollup = require( `rollup` );
const rollupTerser = require( `rollup-plugin-terser` ).terser;
const rollupSourcemaps = require( `rollup-plugin-sourcemaps` );
const express = require( `express` );
const path = require( `path` );
const minimist = require( `minimist` );
const transfob = require( `transfob` );

var knownOptions = {
  string: `env`,
  default: { env: process.env.NODE_ENV || `production` }
};

var options = minimist( process.argv.slice( 2 ), knownOptions );

const devBuild = options.env === `development`;
const preprocessContext = { DEBUG: true };
const port = devBuild ? 1234 : 2345;
const env = devBuild ? `debug` : `release`;

function lzw_encode( s )
{
  if ( !s ) return s;
  const dict = new Map(); // Use a Map!
  const data = ( s + `` ).split( `` );
  const out = [];
  let currChar;
  let phrase = data[ 0 ];
  let code = 256;
  for ( let i = 1; i < data.length; i++ )
  {
    currChar = data[ i ];
    if ( dict.has( phrase + currChar ) )
    {
      phrase += currChar;
    }
    else
    {
      out.push( phrase.length > 1 ? dict.get( phrase ) : phrase.codePointAt( 0 ) );
      dict.set( phrase + currChar, code );
      code++;
      if ( code === 0xd800 ) { code = 0xe000; }
      phrase = currChar;
    }
  }
  out.push( phrase.length > 1 ? dict.get( phrase ) : phrase.codePointAt( 0 ) );
  for ( let i = 0; i < out.length; i++ )
  {
    out[ i ] = String.fromCodePoint( out[ i ] );
  }
  //console.log (`LZW MAP SIZE`, dict.size, out.slice (-50), out.length, out.join(``).length);
  return out.join( `` );
};

// HTML
function buildHtml()
{
  return gulp
    .src( `./src/html/index.html` )
    .pipe( preprocess( { includeBase: `./build/${ env }/pre`, extension: `html` } ) )
    .pipe( minifyHTML() )
    .pipe( gulp.dest( `./build/${ env }/www` ) );
}

// CSS
function buildCss()
{
  return gulp
    .src( `./src/css/*.css` )
    .pipe( minifyCSS() )
    .pipe( gulp.dest( `./build/${ env }/www` ) );
}

// JS
function preprocessJs()
{
  if ( devBuild )
  {
    return gulp.src( `./build/js/*.js` )
      .pipe( sourcemaps.init( { loadMaps: true } ) )
      .pipe( preprocess( { context: preprocessContext } ) )
      .pipe( sourcemaps.write() )
      .pipe( gulp.dest( `./build/${ env }/pre` ) );
  }
  else
  {
    return gulp.src( `./build/js/*.js` )
      .pipe( preprocess( { context: {} } ) )
      .pipe( gulp.dest( `./build/${ env }/pre` ) );
  }
}

function rollupJs()
{
  return rollup.rollup( {
    input: `./build/${ env }/pre/game.js`,
    plugins: [
      rollupSourcemaps(),
      rollupTerser()
    ]
  } ).then( bundle =>
  {
    return bundle.write( {
      file: `./build/${ env }/www/game.js`,
      format: `iife`,
      name: `game`,
      sourcemap: devBuild
    } );
  } );
}

// PNG
function cleanPng()
{
  return gulp
    .src( `./build/${ env }/www/*.png`, {
      read: false,
    } )
    .pipe( clean() );
}
function buildPng()
{
  return gulp
    .src( `src/res/*.png` )
    .pipe( imagemin( [ imagemin.optipng( { optimizationLevel: 7 } ) ] ) )
    .pipe( gulp.dest( `./dist/src/` ) )
    .pipe( gulp.dest( `./build/${ env }/www/` ) );
}

// JSON
function cleanJson()
{
  return gulp
    .src( `./build/${ env }/pre/*.json`, {
      read: false,
    } )
    .pipe( clean() );
}

function buildJson()
{
  return gulp
    .src( `src/res/*.json` )
    .pipe( jsonMinify() )
    .pipe( transfob( function ( file, enc, next )
    {
      file.contents = Buffer.from(lzw_encode(file.contents.toString()), `utf8`);
      next( null, file );
    } ) )
    .pipe( gulp.dest( `./build/${ env }/pre` ) );
  // .pipe( gulp.dest( `./build/${ env }/www/` ) );
}

function serve()
{
  var htdocs = path.resolve( __dirname, `./build/${ env }/www/` );
  var app = express();

  app.use( express.static( htdocs ) );
  app.listen( port, function ()
  {
    console.log( `Server started on http://localhost:` + port );
  } );
}

function watch()
{
  gulp.watch( [ `./src/res/*.png` ], gulp.series( cleanPng, buildPng ) );
  gulp.watch( [ `./src/res/*.json` ], gulp.series( cleanJson, buildJson, buildHtml ) );
  gulp.watch( [ `./src/html/index.html` ], gulp.series( cleanJson, buildJson, buildHtml ) );
  gulp.watch( [ `./src/css/*.css` ], buildCss );
  gulp.watch( [ `./build/js/*.js` ], preprocessJs );
  gulp.watch( [ `./build/${ env }/pre/*.js` ], rollupJs );
}

const build = exports.build =
  gulp.parallel(
    gulp.series( cleanPng, buildPng ),
    gulp.series( cleanJson, buildJson, buildHtml ),
    gulp.series( preprocessJs, rollupJs ),
    buildCss );

exports.watch = gulp.series( build, gulp.parallel( serve, watch ) );

exports.serve = serve;