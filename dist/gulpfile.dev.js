"use strict";

var gulp = require("gulp");

var sass = require("gulp-sass");

var watch = require("gulp-watch");

var browserSync = require("browser-sync");

var reload = require("browser-sync").reload;

var imagemin = require("gulp-imagemin");

var pngquant = require("imagemin-pngquant");

var rigger = require("gulp-rigger"); // Include files with //= ...


var sourcemaps = require("gulp-sourcemaps");

var uglify = require("gulp-uglify-es")["default"];

var prefixer = require("gulp-autoprefixer");

var cssmin = require("gulp-minify-css");

var rimraf = require("rimraf");

var plumber = require("gulp-plumber");

var pug = require("gulp-pug");

var config = {
  server: {
    baseDir: "./build"
  },
  tunnel: false,
  host: "localhost",
  port: 9000,
  logPrefix: "Frontend_Devil"
};
var path = {
  build: {
    html: "build/",
    js: "build/js/",
    css: "build/css/",
    img: "build/img/",
    fonts: "build/fonts/",
    webfonts: "build/webfonts/"
  },
  src: {
    html: "src/*.html",
    js: "src/js/main.js",
    style: "src/style/*.sass",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*",
    webfonts: "src/webfonts/**/*.*"
  },
  watch: {
    html: "src/**/*.html",
    // PUG or HTML file here
    js: "src/js/**/*.js",
    style: "src/style/**/*.sass",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*"
  },
  clean: "./build"
};
gulp.task("html:build", function () {
  gulp.src(path.src.html) //Выберем файлы по нужному пути
  .pipe(plumber()).pipe(rigger()) //Прогоним через rigger
  .pipe(pug()) // remove if use HTML
  .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
  .pipe(reload({
    stream: true
  })); //И перезагрузим наш сервер для обновлений
});
gulp.task("js:build", function () {
  gulp.src(path.src.js).pipe(plumber()).pipe(rigger()).pipe(sourcemaps.init()).pipe(uglify()).pipe(sourcemaps.write()).pipe(gulp.dest(path.build.js)).pipe(reload({
    stream: true
  }));
});
gulp.task("style:build", function () {
  gulp.src(path.src.style) //Выберем наш main.scss
  .pipe(plumber()).pipe(sourcemaps.init()) //То же самое что и с js
  .pipe(sass()) //Скомпилируем
  .pipe(prefixer()) //Добавим вендорные префиксы
  .pipe(cssmin()) //Сожмем
  .pipe(sourcemaps.write()).pipe(gulp.dest(path.build.css)) //И в build
  .pipe(reload({
    stream: true
  }));
});
gulp.task("image:build", function () {
  gulp.src(path.src.img) //Выберем наши картинки
  .pipe(imagemin({
    //Сожмем их
    progressive: true,
    svgoPlugins: [{
      removeViewBox: false
    }],
    use: [pngquant()],
    interlaced: true
  })).pipe(gulp.dest(path.build.img)) //И бросим в build
  .pipe(reload({
    stream: true
  }));
});
gulp.task("fonts:build", function () {
  gulp.src(path.src.fonts).pipe(gulp.dest(path.build.fonts));
  gulp.src(path.src.webfonts).pipe(gulp.dest(path.build.webfonts));
});
gulp.task("build", ["html:build", "js:build", "style:build", "fonts:build", "image:build"]);
gulp.task("watch", function () {
  watch([path.watch.html], function (event, cb) {
    gulp.start("html:build");
  });
  watch([path.watch.style], function (event, cb) {
    gulp.start("style:build");
  });
  watch([path.watch.js], function (event, cb) {
    gulp.start("js:build");
  });
  watch([path.watch.img], function (event, cb) {
    gulp.start("image:build");
  });
  watch([path.watch.fonts], function (event, cb) {
    gulp.start("fonts:build");
  });
});
gulp.task("webserver", function () {
  browserSync(config);
});
gulp.task("clean", function (cb) {
  rimraf(path.clean, cb);
});
gulp.task("default", ["build", "webserver", "watch"]);