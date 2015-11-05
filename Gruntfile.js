module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['app/config.js', 'app/models/*.js', 'app/collections/*.js', 'lib/*.js','server-config.js', 'server.js'],
        dest: 'dist/buildserver.js'
      },
      assets: {
        src: ['public/client/*.js'],
        dest: 'public/dist/buildassets.js'
      },
      lib: {
        src: ['public/lib/underscore.js', 'public/lib/jquery.js', 'public/lib/backbone.js', 'public/lib/handlebars.js'],
        dest: 'public/dist/buildlib.js'
      }
    },

    clean: {
      dist: {
        src: ["dist"]
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      dist: {
           files: {
             'dist/buildserver.min.js': ['dist/buildserver.js'],
             'public/dist/buildassets.min.js': ['public/dist/buildassets.js']
           }
         }
    },

    jshint: {
      files: ['Gruntfile.js', 'app/**/*.js', 'public/client/*.js', 'server-config.js', 'server.js'],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      target: {
        files:  {
         'public/dist/buildstyle.css': ['public/style.css'] 
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: [
          'azure site scale free shortlyBP',
          'git push azure master'].join('&&');
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', ['jshint', 'test', 'concat', 'uglify', 'cssmin']);

  grunt.registerTask('clean', ['clean']);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
      grunt.run(['test', 'build', 'shell:prodServer']);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
      // add your production server task here
      grunt.task.run(['clean', 'upload']);
  ]);


};
