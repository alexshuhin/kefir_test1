import gulp from 'gulp';
import debug from 'gulp-debug';
import gutil from 'gulp-util';
import sourceMap from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import plumber from 'gulp-plumber';
import environments from 'gulp-environments';
import browserify from 'browserify';
import pug from 'gulp-pug';
import BrowserSync from 'browser-sync';
import runSequence from 'run-sequence';
import sass from 'gulp-sass';
import rename from 'gulp-rename';

import rollupify from 'rollupify';
import babelify from 'babelify';

import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

import spy from 'through2-spy';


//import rollupJade from './gulp-plugins/rollup-jade';
//
const browserSync = BrowserSync.create();

const development = environments.development;
const production = environments.production;
const destination = production() ? '@build/' : '@target/';

const browserifyPlugins = [
];

let makeReload = true;
const plumberHandler = function(error) {
  makeReload = false;

  gutil.log(
    gutil.colors.cyan('Plumber') + gutil.colors.red(' found unhandled error:\n'),
    error.toString()
  );

  this.emit('end');
};
const reload = function() {
  if (makeReload) browserSync.reload();
  else {
    gutil.log(
      gutil.colors.cyan('BrowserSync:') +
        gutil.colors.yellow(' prevent from reloading!')
    )
  }
  makeReload = true;
};

//.pipe(rollup({ format: 'es6', plugins: rollupPlugins, sourceMap: true }))
//.pipe(babel({ sourceMaps: true }))
gulp.task('javascript', () => {
  const b = browserify({
    entries: './src/app/index.js',
    debug: true,
    transform: [rollupify, babelify]
  });

  return b.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(plumber(plumberHandler))
    .pipe(development(sourceMap.init({ loadMaps: true })))
    .pipe(production(uglify()))
    .pipe(development(sourceMap.write('./')))
    .pipe(gulp.dest(destination));
});

gulp.task('page', () => {
  return gulp.src('src/index.pug')
    .pipe(plumber(plumberHandler))
    .pipe(pug())
    .pipe(gulp.dest(destination));
});

gulp.task('css', () => {
  return gulp.src('src/css/app.scss')
    .pipe(plumber(plumberHandler))
    .pipe(sass({outputStyle: production() ? 'compressed' : 'nested'}))
    .pipe(rename('application.css'))
    .pipe(gulp.dest(destination));
});


gulp.task('server', () => {
  browserSync.init({
    server: `./${destination}`,
    open: false,
    notify: false
  });

  gulp.watch(['src/app/**/*.js', 'src/app/**/*.js'], () => {
    runSequence('javascript', reload);
  });

  gulp.watch('src/*.pug', () => {
    runSequence('page', reload);
  });

  gulp.watch(['src/css/*.scss', 'src/css/**/*.scss'], () => {
    runSequence('css', reload);
  });
});

gulp.task('default', ['javascript', 'page', 'css', 'server']);
