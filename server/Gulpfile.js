var gulp    = require('gulp');
var jshint  = require('gulp-jshint');
var connect = require('gulp-connect');

var options = {
    client: 'client/**/*',
    javascript: [
        '*.js',
        'configs/**/*.js',
        'models/**/*.js',
        'routes/**/*.js'
    ]
};

gulp.task('connect', function() {
  connect.server({
    root: 'client',
    port: 3000,
    livereload: true
  });
});

gulp.task('reload', function() {
  gulp.src(options.client)
    .pipe(connect.reload());
});

gulp.task('lint', function() {
  gulp.src(options.javascript)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function () {
  gulp.watch(options.javascript, ['lint']);
  gulp.watch(options.client, ['reload']);
});

gulp.task('default', ['lint', 'connect', 'watch']);