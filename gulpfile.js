"use strict";
var gulp = require('gulp');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');

var fileinclude = require('gulp-file-include');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

/**
 * DIRECTORY
 */
var root = "./public";
var language = {
    en : "/en"
};
var type = {
    pc : "/pc"
};
var srcRoot = "/src", //작업 폴더
    distRoot = "/dist"; //배포 폴더
var paths = { //작업&배포 폴더 트리 구조
    html: "/html",
    stylesheets : "/stylesheets",
    css : "/css",
    sass : "/sass",
    script : "/javascripts",
    map : "../map",
    images : "/images"
};
var typeRoot = {
    srcPcA : root + language.en + type.pc + srcRoot, //typeRoot.srcPc 배포
    distPcA : root + language.en + type.pc + distRoot, //typeRoot.distPc 작업
};

/**
 * html copy
 */
var htmlCopyFun = function(o){
    return gulp.src(root + o.language + o.type + srcRoot + "/*.html")
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe(gulp.dest(root + o.language + o.type + distRoot));
};
gulp.task('pc-html-copy', function(){htmlCopyFun({language : language.en, type : type.pc});});

/**
 * SASS
 */
var sassFun = function(o){
    return gulp.src(root + o.language + o.type + srcRoot + paths.stylesheets + paths.sass + '/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass.sync({outputStyle:'compact'}).on('error', sass.logError))// nested, expanded, compact, or compressed.
        .pipe(sourcemaps.write(paths.map))
        .pipe(gulp.dest(root + o.language + o.type + distRoot + paths.stylesheets + paths.css));
};
gulp.task('pc-sass', function(){sassFun({language : language.en, type : type.pc});});

/**
 * SCRIPT USED
 */
var scriptFun = function(o){
    return gulp.src([
        root + o.language + o.type + srcRoot + paths.script + "/function/default.js",
        root + o.language + o.type + srcRoot + paths.script + "/function/*.js"
    ])
    .pipe(concat('design_common.js'))
    .pipe(gulp.dest(root + o.language + o.type + distRoot + paths.script));
};
gulp.task('pc-script', function(){scriptFun({language: language.en, type: type.pc});});

/**
 * SCRIPT API
 */
var pluginFun = function(o){
    return gulp.src([
        root + o.language + o.type + srcRoot + paths.script + "/plugin/*.js"
    ])
    .pipe(concat('plugin.js'))
    .pipe(gulp.dest(root + o.language + o.type + distRoot + paths.script));
};
gulp.task('pc-plugin', function(){pluginFun({language: language.en, type: type.pc});});

/**
 * images copy
 */
var imagesFun = function(o){
    return gulp.src(root + o.language + o.type + srcRoot + paths.images + "/**/*.{gif,jpg,png,svg}")
    .pipe(gulp.dest(root + o.language + o.type + distRoot + paths.images));
};
gulp.task('pc-image-copy', function(){imagesFun({language : language.en, type : type.pc});});

/**
 * WACTH
 */
gulp.task('pc-all', function(){
    var browserSyncPCA = require('browser-sync').create();
    browserSyncPCA.init({
        server: {
            baseDir: typeRoot.distPcA,
            index: "work_list.html"
        },
        ui: false,
        port:1290
    });

    gulp.watch(typeRoot.srcPcA + paths.stylesheets + '/**/*.scss', ['pc-sass']);
    gulp.watch(typeRoot.srcPcA + paths.script + "/function/*.js", ["pc-script"]);
    gulp.watch([typeRoot.srcPcA + "/*.html", typeRoot.srcPcA + "/include/*.html"], ['pc-html-copy']);
    gulp.watch(typeRoot.srcPcA + paths.images + "/**/*.{gif,jpg,png,svg}", ['pc-image-copy']);
    gulp.watch([
        typeRoot.distPcA + paths.stylesheets + '/**/*.css',
        typeRoot.distPcA + "/*.html",
        typeRoot.distPcA + paths.script + "/*.js"
    ]).on('change', browserSyncPCA.reload);
});


/**
 * TASK
 */
gulp.task('default', runSequence(
    'pc-image-copy',
    'pc-plugin',
    'pc-all'
));



