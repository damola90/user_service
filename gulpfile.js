const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const path = require('path');
const run = require('gulp-run');
const shell = require('gulp-shell');

const tscompile = ts.createProject('tsconfig.json');
const BUILD_PATH = tscompile.options.outDir

gulp.task('help', () =>{
});

gulp.task('compile', () => {
    const compileRes = 
        tscompile.src().
        pipe(tscompile());
    return compileRes.js.pipe(gulp.dest(BUILD_PATH));
});

gulp.task('clean', () => {
    return del([path.join(BUILD_PATH, '*')]);
});

gulp.task('build', ['clean', 'compile'], () => {

});

gulp.task('live-build', ['build'], () => {
    gulp.watch('src/**/*.ts', ['build']);
    console.log("Monitoring ts files. Will recompile on file change");
});

gulp.task('default', ['help']);

