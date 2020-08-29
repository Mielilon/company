const gulp = require("gulp");
const sass = require("gulp-sass");
const watch = require("gulp-watch");
const browserSync = require("browser-sync");
const reload = require("browser-sync").reload;
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const rigger = require("gulp-rigger"); // Include files with //= ...
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify-es").default;
const prefixer = require("gulp-autoprefixer");
const cssmin = require("gulp-minify-css");
const rimraf = require("rimraf");
const plumber = require("gulp-plumber");
const pug = require("gulp-pug");

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
    html: "src/**/*.html", // PUG or HTML file here
    js: "src/js/**/*.js",
    style: "src/style/**/*.sass",
    img: "src/img/**/*.*",
    fonts: "src/fonts/**/*.*"
  },
  clean: "./build"
};

gulp.task("html:build", function() {
  gulp
    .src(path.src.html) //Выберем файлы по нужному пути
    .pipe(plumber())
    .pipe(rigger()) //Прогоним через rigger
    .pipe(pug()) // remove if use HTML
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(
      reload({
        stream: true
      })
    ); //И перезагрузим наш сервер для обновлений
});

gulp.task("js:build", function() {
  gulp
    .src(path.src.js)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(
      reload({
        stream: true
      })
    );
});

gulp.task("style:build", function() {
  gulp
    .src(path.src.style) //Выберем наш main.scss
    .pipe(plumber())
    .pipe(sourcemaps.init()) //То же самое что и с js
    .pipe(sass()) //Скомпилируем
    .pipe(prefixer()) //Добавим вендорные префиксы
    .pipe(cssmin()) //Сожмем
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css)) //И в build
    .pipe(
      reload({
        stream: true
      })
    );
});

gulp.task("image:build", function() {
  gulp
    .src(path.src.img) //Выберем наши картинки
    .pipe(
      imagemin({
        //Сожмем их
        progressive: true,
        svgoPlugins: [
          {
            removeViewBox: false
          }
        ],
        use: [pngquant()],
        interlaced: true
      })
    )
    .pipe(gulp.dest(path.build.img)) //И бросим в build
    .pipe(
      reload({
        stream: true
      })
    );
});

gulp.task("fonts:build", function() {
  gulp.src(path.src.fonts).pipe(gulp.dest(path.build.fonts));

  gulp.src(path.src.webfonts).pipe(gulp.dest(path.build.webfonts));
});

gulp.task("build", [
  "html:build",
  "js:build",
  "style:build",
  "fonts:build",
  "image:build"
]);

gulp.task("watch", function() {
  watch([path.watch.html], function(event, cb) {
    gulp.start("html:build");
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start("style:build");
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start("js:build");
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start("image:build");
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start("fonts:build");
  });
});

gulp.task("webserver", function() {
  browserSync(config);
});

gulp.task("clean", function(cb) {
  rimraf(path.clean, cb);
});

gulp.task("default", ["build", "webserver", "watch"]);
