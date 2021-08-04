const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass'); // scss to css
const dartSass = require('sass'); // scss to css
var postcss = require('gulp-postcss'); // js in css
const autoprefixer = require('autoprefixer'); //自动完成 css 属性浏览器前缀
const fileinclude = require('gulp-file-include') // html中使用include
const cssnano = require('cssnano'); //css压缩
const webpack = require('webpack-stream');  //在这里用来处理js的打包

const scss = sass(dartSass);

const gulpMode = process.env.NODE_ENV;
//files path
const basePath = {
  src: './src/',
  dest: './dist/'
};
const srcAssets = {
  pages: basePath.src + 'pages/',
  styles: basePath.src + 'scss/',
  scripts: basePath.src + 'js/',
  images: basePath.src + 'img/'
};
const destAssets = {
  pages: basePath.dest + 'pages/',
  styles: basePath.dest + 'css/',
  scripts: basePath.dest + 'js/',
  images: basePath.dest + 'img/'
};

// Copy page templates into finished HTML files
gulp.task('pages', () => {
  return gulp.src(srcAssets.pages + '**/*.{html,hbs,handlebars}')
    .pipe(fileinclude())
    .pipe(gulp.dest(destAssets.pages))
    .pipe(browserSync.stream());
});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', () => {
  return gulp.src(srcAssets.scripts + 'app.js', { allowEmpty: true })
    .pipe(webpack({
      mode: 'development',
      output: {
        filename: 'app.js',
      },
    }))
    .pipe(gulp.dest(destAssets.scripts))
    .pipe(browserSync.stream());
});

//sass to css and copy to dist path
gulp.task('css', () => {
  const plugins = [
    autoprefixer(),
    ((gulpMode==='production') ? cssnano : ''),
  ].filter(Boolean);
  return gulp.src(srcAssets.styles + 'app.scss')
    .pipe(scss())
    .pipe(postcss(plugins))
    .pipe(gulp.dest(destAssets.styles))
    .pipe(browserSync.stream());
});

gulp.task('start', gulp.series('css', 'javascript', 'pages', function () {
  browserSync.init({
    server: {
      baseDir: basePath.dest,
      index: "./pages/index.html"  //相对于baseDir的index路径
    },
    port: 3000
  });
  gulp.watch(srcAssets.styles + '*.scss', gulp.series('css'));
  gulp.watch(srcAssets.scripts + '*.js', gulp.series('javascript'));
  gulp.watch(srcAssets.pages + '*.html', gulp.series('pages'));
  // gulp.watch("./src/pages/*.html").on('all', browserSync.reload);
}));

gulp.task('build', gulp.series('css', 'javascript', 'pages', function(){

}));

gulp.task('default', gulp.series('start'));