var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var vinylPaths = require('vinyl-paths');
plugins.source = require('vinyl-source-stream');
plugins.browserify = require('browserify');

// Clean the dist folder.
gulp.task('clean', function() {
    return gulp.src('dist').pipe(vinylPaths(del));
});

gulp.task('styles', function() {
  return gulp.src('src/wizard.css')
    .pipe(gulp.dest('dist'))
    .pipe(plugins.cssnano())
    .pipe(plugins.rename('wizard.min.css'))
    .pipe(gulp.dest('dist'));
});

// Wire the dependencies into index.html
gulp.task('scripts', function() {
    var bundle = plugins.browserify({
      entries: 'src/wizard.js',
      debug: false
    }).transform('brfs');

    return bundle.bundle()
      .pipe(plugins.source('wizard.js'))
      .pipe(gulp.dest('dist/'))
      .pipe(plugins.rename('wizard.min.js'))
      .pipe(plugins.streamify(plugins.uglify()))
      .pipe(gulp.dest('dist/'))
      .on('error', function(err){
          console.log(err);
          this.emit('end');
      });
});

// Define the build task.
gulp.task('build', ['clean', 'scripts', 'styles']);