module.exports = function(grunt) {

	var deployFile = 'deploy_settings.json';

	if (!grunt.file.exists(deployFile)) {
		grunt.file.copy('deploy_settings_sample.json', deployFile);
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		secret: grunt.file.readJSON(deployFile),

		clean: {
			build: {
				src: 'dist/'
			}
		},

		copy: {
			main: {
				expand: true,
				cwd: 'src',
				src: ['**', '!assets/css/**', '!**/*.jade'],
				dest: 'dist/',
			},
		},

		jade: {
			options: {
				pretty: true,
				basedir: 'src/'
			},
			compile: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: '**/*.jade',
						dest: 'dist/',
						ext: '.html'
					},
				],
			}
		},

		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: [
					{
						expand: true,
						cwd: 'dist/',
						src: '**/*.html',
						dest: 'dist/',
						ext: '.html'
					},
				],
			}
		},

		sass: {
			dist: {
				options: {
					style: 'compressed'
				},
				files: {
					'dist/assets/css/main.css': 'src/assets/css/main.sass'
				}
			}
		},

		'class-id-minifier': {
			simple: {
				options: {
					jsMapFile: 'dist/map.js',
					jsMapDevFile: 'dist/map.dev.js'
				},
				files: [
					{
						expand: true,
						cwd: 'dist/',
						src: '**/*.{html,css,js}',
						dest: 'dist/'
					}
				]
			}
		},

		autoprefixer: {
			no_dest: {
				src: 'dist/assets/css/main.css'
			},
			options: {
				map: true
			}
		},

		connect: {
			server: {
				options: {
					port: 4000,
					base: 'dist/',
					keepalive: false
				}
			}
		},

		watch: {
			options: {
				livereload: true,
				spawn: true
			},

			html: {
				files: ['src/**/*.html'],
				tasks: ['copy']
			},

			jade: {
				files: ['src/**/*.jade'],
				tasks: ['jade']
			},

			css: {
				files: ['src/assets/css/**/*.sass', 'src/assets/css/**/*.scss'],
				tasks: ['sass']
			},

			img: {
				files: ['src/assets/img/**/*.jpg', 'src/assets/img/**/*.png'],
				tasks: ['copy']
			}
		},

		sshconfig: {
			production: {
				host: '<%= secret.host %>',
				username: '<%= secret.username %>',
				password: '<%= secret.password %>'
			}
		},

		sftp: {
			deploy: {
				files: {
					'./': ['dist/**', '!dist/assets/css/**.css.map', '!dist/map.js', '!dist/dev/map.js']
				},
				options: {
					path: '<%= secret.dir %>',

					srcBasePath: 'dist/',

					showProgress: true,
					createDirectories: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');

	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-class-id-minifier');

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-ssh');

	grunt.option('config', 'production');

	grunt.registerTask('build', ['clean', 'copy', 'jade', 'sass', 'autoprefixer']);
	grunt.registerTask('build-production', ['build', 'htmlmin', 'class-id-minifier']);
	grunt.registerTask('deploy', ['build-production', 'sftp:deploy']);
	grunt.registerTask('default', ['build', 'connect', 'watch']);

};
