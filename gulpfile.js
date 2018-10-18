const gulp         = require('gulp'),
      gutil        = require('gulp-util'),
      clean        = require('gulp-clean'),
      gulpif       = require('gulp-if'),
      concat       = require('gulp-concat'),
      less         = require('gulp-less'),
      autoprefixer = require('gulp-autoprefixer'),
      sourcemaps   = require('gulp-sourcemaps'),
      uglify       = require('gulp-uglifyes'),
      babel        = require('gulp-babel'),
      plumber      = require('gulp-plumber'),
      changed      = require('gulp-changed'),
      imagemin     = require('gulp-imagemin'),
      terser       = require('gulp-terser');
      merge        = require('gulp-merge');

var fs = require("fs");


const dev = false;
// const BABEL_POLYFILL = "node_modules/babel-polyfill/browser.js";
// const FETCH_POLYFILL = "node_modules/whatwg-fetch/fetch.js";


var adminSourceJS = [
  "src/app-config.js",
  "src/components/points-editor/points-editor.js",
  "src/components/points-map/points-map.js",
  "src/components/point-data/point-data.js",
  "src/components/image-upload/image-upload.js",
  "src/components/info-block/info-block.js",
  "src/js/storage.js",
  "src/js/model.js",
  "src/js/importExport.js",
  ];

var mainSourceJS = [
  "src/app-config.js",
  "src/js/importExport.js",
  "src/js/storage.js",
  "src/js/model.js",
  "src/components/categories-list/categories-list.js",
  "src/js/main.js"
  ];


// process stylesheets
gulp.task('styles', function () {

  gulp.src('src/**/*.less')
    .pipe(concat('yms-app.less'))
    .pipe(less().on('error', /*() => "err test"*/ gutil.log))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']  // config object
    }))
    .pipe(gulp.dest('dist/css'));

});


// process scripts
gulp.task('adminScripts', function () {

  gulp.src(adminSourceJS)
    .pipe(gulpif(dev, sourcemaps.init()))
    .pipe(concat('yms-admin.min.js'))
    /*.pipe(babel({
      presets: ['es2015']  // babel config object
    }))*/
    .pipe(terser()) //.on("error", gutil.log)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));

});

gulp.task('mainScripts', function () {

  /*merge(
    //gulp.src(FETCH_POLYFILL),
    //gulp.src(mainSourceJS)
  )*/
  gulp.src(mainSourceJS)
    .pipe(gulpif(dev, sourcemaps.init()))
    .pipe(concat('yms-main.min.js'))
    //.pipe(babel())
    .pipe(terser()).on("error", function(error) {
      done(error);
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));

});


gulp.task('imagemin', function() {
  var imgSrc = "src/images/**/*.+(png|jpg|jpeg|gif)";
  var imgDst = "dist/images";

  gulp.src(imgSrc)
    .pipe(changed(imgDst))
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst));
});


gulp.task('html', function() {
  gulp.src("src/*.html")
    .pipe(gulp.dest("dist"));
});
gulp.task('data', function() {
  gulp.src("src/data/*")
    .pipe(gulp.dest("dist/data"));
});
gulp.task('lib', function() {
  gulp.src("src/lib/*")
    .pipe(gulp.dest("dist/lib"));
});

function done(e) {
  console.log(`gulp error: ${e}`);
  fs.writeFile("gulplog.txt", `${e} \n ${e.stack}`, function(err) {
    if (err) console.log("fs error: " + err);
  });
}

gulp.task('clean', function() {
  return gulp.src(['dist'], {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    gulp.start('html', 'styles', 'adminScripts', 'mainScripts', 'imagemin', 'data');
});

/*
function wrapPipe(taskFn) {
  return function(done) {
    var onSuccess = function() {
      done();
    };
    var onError = function(err) {
      done(err);
    }
    var outStream = taskFn(onSuccess, onError);
    if(outStream && typeof outStream.on === 'function') {
      outStream.on('end', onSuccess);
    }
  }
}
*/