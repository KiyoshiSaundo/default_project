// params.js

module.exports = {

	// params
	isImageMin: false,
	isCssMap: false,

	// paths
	paths: {
		in: {
			html:    ['source/html/**/*'],
			css:     ['source/scss/**/*.scss'],
			js:      ['source/js/**/*.js'],
			img:     ['source/images/**/*.{jpg,jpeg,gif,png}'],
			fonts:   ['source/fonts/**/*.{woff,woff2}'],
			fontsjs: ['source/fonts/fonts.js'],
			sprites: ['source/sprites/**/*.{jpg,jpeg,gif,png}'],
		},
		watch: {
			html:    ['source/html/**/*', 'source/html_partials/**/*'],
			css:     ['source/scss/**/*.scss'],
			js:      ['source/js/**/*.js'],
			img:     ['source/images/**/*.{jpg,jpeg,gif,png}'],
			fonts:   ['source/fonts/**/*.{woff,woff2}', 'source/fonts/fonts.js'],
			sprites: ['source/sprites/**/*.{jpg,jpeg,gif,png}'],
		},
		out: {
			html:    'www/static/',
			css:     'www/static/',
			js:      'www/static/js/',
			img:     'www/static/images/',
			fonts:   'www/static/fonts/',
			fontsjs: 'www/static/js/',

			sprites_i: 'source/images/',
			sprites_s: 'source/scss/'
		},
		server: './www/static',
		clean:  'www/static'
	}

};