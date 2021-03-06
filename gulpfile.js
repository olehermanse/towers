var gulp = require("gulp"),
  rename = require("gulp-rename"),
  concat = require("gulp-concat"),
  del = require("del"),
  browserify = require("browserify"),
  source = require("vinyl-source-stream"),
  buffer = require("vinyl-buffer"),
  uglify = require("gulp-uglify"),
  sourcemaps = require("gulp-sourcemaps"),
  babelify = require("babelify"),
  inlinesource = require("gulp-inline-source"),
  fs = require("fs"),
  path = require("path");

gulp.task("default", function (done) {
  gulp.series(["styles", "scripts", "copy"], "html")();
  done();
});

gulp.task(
  "watch",
  gulp.series("default", function () {
    gulp.watch(["frontend/src/**/*"], ["default"]);
  })
);

gulp.task("styles", function () {
  return gulp
    .src("frontend/src/styles/**/*.css")
    .pipe(concat("style.css"))
    .pipe(gulp.dest("frontend/dist/styles"));
});

gulp.task("scripts", function () {
  var b = browserify({
    entries: "frontend/src/scripts/main.js",
    debug: true,
  });

  return b
    .transform(
      "babelify", {
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-proposal-class-properties"]
    })
    .bundle()
    .pipe(source("main.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadmaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./frontend/dist/scripts"));
});

gulp.task("html", function () {
  var options = {
    compress: false,
    rootpath: path.resolve("frontend/dist"),
  };

  return gulp.src("./frontend/src/index.html")
    .pipe(inlinesource(options))
    .pipe(gulp.dest("./frontend/dist"));
});

gulp.task("copy", function (done) {
  gulp.src("./frontend/src/favicon.ico")
    .pipe(gulp.dest("./frontend/dist/"));
  done();
});
