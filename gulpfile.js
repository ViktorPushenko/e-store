(function () {
   'use strict';
}());

var	gulp 		= require('gulp'),
	wiredep 	= require('wiredep').stream,
	useref 		= require('gulp-useref'),
	uglify 		= require('gulp-uglify'),
	clean 		= require('gulp-clean'),
	gulpif 		= require('gulp-if'),
	filter 		= require('gulp-filter'),
	size 		= require('gulp-size'),
	imagemin 	= require('gulp-imagemin'),
	concatcss 	= require('gulp-concat-css'),
	minifycss 	= require('gulp-minify-css'),
	jade 		= require('gulp-jade'),
	prettify 	= require('gulp-prettify'),
	browserSync = require('browser-sync'),
	reload 		= browserSync.reload,
	scss		= require('gulp-sass');



// ======================================================
// ============ Bower components link ===================
// ======================================================
// 
gulp.task('wiredep', function() {
	gulp.src('app/templates/common/*.jade')
		.pipe(wiredep({
			ignorepath: '/^(\.\.\/)*\.\.\/'
		}))
		.pipe(gulp.dest('app/templates/common/'));
});

// ======================================================
// ============ Server starting =========================
// ======================================================

// ============ Server start ====================
// 
gulp.task('server', ['jade', 'scss'], function() {
	browserSync({
		notyfy: false,
		port: 9000,
		server: {
			baseDir: 'app'
		}
	});
});


// ======================================================
// ============ WATCHER =================================
// ======================================================

// ============ Watcher start ===========================
// 
gulp.task('watch', function() {
	gulp.watch('app/templates/**/*.jade', ['jade']);
	gulp.watch('app/scss/*.scss', ['scss']);
	gulp.watch('bower.json', ['wiredep']);
	gulp.watch([
		'app/js/**/*.js',
		'app/css/**/*.css',
		]).on('change', reload);
});

// ============ Default task ============================
// 
gulp.task('default', ['server', 'watch']);


// ======================================================
// ============ Work in app =============================
// ======================================================

// ============ JADE TO HTML compile ====================
// 
gulp.task('jade', function() {
	gulp.src('app/templates/pages/*.jade')
		.pipe(jade())
		.on('error', log)
		.pipe(prettify({indent_size: 2}))
		.pipe(gulp.dest('app/'))
		.pipe(reload({stream: true}));
});

// ============ SCSS TO CSS compile ====================
// 
gulp.task('scss', function () {
  	gulp.src('app/scss/*.scss')
    	.pipe(scss.sync().on('error', log))
    	.pipe(gulp.dest('app/css'))
    	.pipe(reload({stream: true}));
});

// ======================================================
// ============ Building ================================
// ======================================================

// ============ Dist folfer cleaning ====================
// 
gulp.task('clean', function() {
	return gulp.src('dist')
		.pipe(clean());
});

// ============ HTML, CSS, JS moving to Dist folder =====
// 
gulp.task('useref', function() {
	var assets = useref.assets();
	return gulp.src('app/*html')
		.pipe(assets)
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', minifycss({compatibility: 'ie8'})))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'));
});

// ============ Fonts moving to Dist folder =============
// 
gulp.task('fonts', function() {
	gulp.src('app/fonts/*')
		.pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
		.pipe(gulp.dest('dist/fonts/'));
});

// ============ Images minifying and moving to Dist folder
// 
gulp.task('images', function() {
	return gulp.src('app/img/**/*')
		.pipe(imagemin({
			progressive: true,
			interlacse: true
		}))
		.pipe(gulp.dest('dist/img'));
});

// ============ Rest files moving to Dist folder ========
// 
gulp.task('extras', function() {
	gulp.src([
		'app/*.*', 'app/*', 'app/.*' , '!app/*html'])
		.pipe(gulp.dest('dist'));
});

// ============ Build and size messaging ================
// 
gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function() {
	return gulp.src('dist/**/*')
		.pipe(size({title: 'build'}));
});

// ============ Dist building after JADE compilyng and Dist folder cleaning  =====
// 
gulp.task('build', ['clean','jade'], function() {
	gulp.start('dist');
});


// ======================================================
// ============ Error logging ===========================
// ======================================================
var log = function(error) {
	var today = new Date();

	console.log([
	'',
	'=================== ERROR MESSAGE START ================',
	today,
	('[' + error.name + ' in ' + error.plugin + ']'),
	error.message,
	'=================== ERROR MESSAGE END ==================',
	''
	].join('\n'));
	this.end();
};