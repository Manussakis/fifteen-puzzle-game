
'use strict';

const
gulp         = require('gulp'),
sass         = require('gulp-sass'),
autoprefixer = require('autoprefixer'),
postcss      = require('gulp-postcss');

// SASS settings
const css = {
  src        : './sass/style.scss',
  dist       : './css',
  sassOpts   : {
    outputStyle     : 'expanded',
    precision       : 3,
    sourcemap       : false,
    errLogToConsole : true
  },
  processors : [
    autoprefixer()
  ]
};

/**
 * Style task
 */
gulp.task( 'style', () => {
   gulp.src( css.src )
    .pipe( sass( css.sassOpts ).on('error', sass.logError) )
    .pipe( postcss( css.processors ) )
    .pipe( gulp.dest(css.dist) );
});

gulp.task('watch', () => {
  gulp.watch( css.src, ['style'] );
});

gulp.task( 'default', ['watch'] );
