module.exports = function(grunt) {

	grunt.initConfig({

		// Import package manifest
		pkg: grunt.file.readJSON("package.json"),

		// Banner definitions
		meta: {
			banner: "/*\n" +
				" *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
				" *  <%= pkg.description %>\n" +
				" *  <%= pkg.homepage %>\n" +
				" *\n" +
				" *  Made by <%= pkg.author.name %>\n" +
				" *  Under <%= pkg.license %> License\n" +
				" */\n"
		},


		// sass
		sass: {
			options: {
				style: 'expanded'
			},
			dist: {
				files: {
					'src/css/main.css' : 'src/scss/main.scss'
				}
			}
		},


		// Concat definitions
		concat: {
			options: {
				banner: "<%= meta.banner %>"
			},
			dist: {
				files: {
					'dist/jquery.seatmaps.generator.css': [ 'src/css/main.css' ],
					'dist/jquery.seatmaps.generator.js': [ 
						'src/jquery.seatmaps.generator.js' 
					]
				}
			}
		},

		// Lint definitions
		jshint: {
			files: ["src/jquery.seatmaps.generator.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		// Minify definitions
		uglify: {
			my_target: {
				src: ["dist/jquery.seatmaps.generator.js"],
				dest: "dist/jquery.seatmaps.generator.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		// CoffeeScript compilation
		coffee: {
			compile: {
				files: {
					"dist/jquery.seatmaps.generator.js": "src/jquery.seatmaps.generator.coffee"
				}
			}
		},
		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: 'dist/',
					themedir: 'doc_themes/yuidoc-bootstrap-theme-master/',
					helpers: ["doc_themes/yuidoc-bootstrap-theme-master/helpers/helpers.js"],
					outdir: 'docs/'
				}
			}
		},

		// watch for changes to source
		// Better than calling grunt a million times
		// (call 'grunt watch')
		watch: {
		    files: ['src/**/*'],
		    tasks: ['default']
		}

	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-coffee");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks('grunt-bowercopy');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');

	grunt.registerTask("build", ["concat", "uglify", "sass", "yuidoc"]);
	grunt.registerTask("default", ["jshint", "build"]);
	grunt.registerTask("travis", ["default"]);

};
