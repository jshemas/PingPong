'use strict';

module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			server: {
				src: ['*.js']
			},
			serverModels: {
				src: ['models/*.js']
			},
			serverRoutes: {
				src: ['routes/*.js']
			}
		},
		mochaTest: {
			test: {
				options: {
					//reporter: 'spec'
					reporter: 'Nyan'
				},
				src: ['../spec/*.js']
			}
		},
		express: {
			options: {
				port: 3000
			},
			dev: {
				options: {
					script: './app.js',
					node_env: 'dev',
					nospawn: true,
					delay: 5
				}
			},
			prod: {
				options: {
					script: './app.js',
					node_env: 'production'
				}
			}
		},
		watch: {
			gruntfile: {
				files: 'Gruntfile.js',
				tasks: ['jshint:gruntfile']
			},
			server: {
				files: 'server/*.js',
				tasks: ['jshint:server','mochaTest:test']
			},
			serverTests: {
				files: 'server/tests/server/*.js',
				tasks: ['jshint:serverTests','mochaTest:test']
			},
			serverModels: {
				files: 'server/models/*.js',
				tasks: ['jshint:serverModels','mochaTest:test']
			},
			serverControllers: {
				files: 'server/controllers/*.js',
				tasks: ['jshint:serverControllers','mochaTest:test']
			},
			express: {
				files:  [ 'server/*.js' ],
				tasks:  [ 'express:dev' ],
				options: {
					nospawn: true
				}
			}
		}
	});
	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express-server');
	// Tasks.
	grunt.registerTask('default', ['jshint', 'mochaTest']);
	grunt.registerTask('server', ['express:dev', 'watch']);
	grunt.registerTask('testserver','run backend tests', function () {
		var tasks = ['jshint', 'mochaTest', 'watch'];
		// always use force when watching, this will rerun tests if they fail
		grunt.option('force', true);
		grunt.task.run(tasks);
	});
};