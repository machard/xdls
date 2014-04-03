/*global module:false*/
var LIVERELOAD_PORT = 3002;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};


module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            'dist'
          ]
        }]
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      client: {
        src: 'lib/xdls.js',
        dest: 'dist/<%= pkg.name %>.js'
      },
      server: {
        src: 'lib/xdls-serve.js',
        dest: 'dist/<%= pkg.name %>-serve.js'
      },
    },
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      lib_test: {
        src: ['lib/{,*/}*.js']
      },
      gruntfile : {
        src: ['Gruntfile.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'nyan'
        },
        src: ['test/*.js']
      }
    },
    watch: {
      options: {
          spawn: false
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'mochaTest']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '{./lib,./test}/{,*/}*.html',
          '{./lib,./test}/{,*/}*.js'
        ]
      },
    },
    connect: {
      options: {
        hostname: 'localhost'
      },
      client: {
        options: {
          port: 3000,
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'lib'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
      server: {
        options: {
          port: 3001,
          middleware: function (connect) {
            return [
              mountFolder(connect, 'lib'),
              mountFolder(connect, 'test')
            ];
          }
        }
      }
    },
    open: {
      'manual-test': {
        url: 'http://localhost:3000/test-client.html'
      }
    }
  });

  

  // Default task.
  grunt.registerTask('default', ['clean:dist', 'mochaTest', 'uglify:client', 'uglify:server']);

  // Specific tasks
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('manual-test', ['connect', 'open:manual-test','watch']);
  grunt.registerTask('hint', ['jshint']);

};
