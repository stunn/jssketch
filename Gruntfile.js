module.exports = function (grunt) {
  var bundles = grunt.file.readJSON('./config/bundles.json');
  var config = grunt.file.readJSON('./config/config.json');

  grunt.initConfig({
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'public',
          src: '**/*',
          dest: 'build/'
        }, {
          expand: true,
          cwd: 'shared',
          src: '**/*',
          dest: 'build/js/'
        }]
      }
    },
    jshint: {
      options: {
        node: true,
        globals: {
          define: true
        },
        loopfunc: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        immed: true,
        indent: 2,
        newcap: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        es5: true,
      },
      dist: {
        src: ['*.js', 'bin/**/*.js', 'config/**/*.js', 'helpers/**/*.js', 'lib/**/*.js', 'models/**/*.js', 'storage/**/*.js']
      },
      test: {
        options: {
          globals: {
            it: true,
            describe: true,
            before: true
          },
          immed: false, /* otherwise it won't like (function () {}).should.throw (http://www.jshint.com/docs/#options). */
          expr: true
        },
        src: 'test/**/*.js'
      },
      shared: {
        globals: {
          define: true
        },
        src: 'shared/**/*.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('buildcss', function () {

    if (config.production) {
      var minifier = require('mini-fier').create();
      var async = this.async();

      Object.keys(bundles).forEach(function (name) {
        var files = bundles[name].css || [];

        minifier.css({
          srcPath: __dirname + '/build/',
          filesIn: files,
          destination: __dirname + '/build/css/all.' + name + '.css'
        }).on('error', function () {
          console.log(arguments);
          async(false);
        }).on('complete', function () {
          async();
        });
      });
    }
  });

  grunt.registerTask('buildjs', function () {
    var minifier = require('mini-fier').create();
    var path = require('path');

    grunt.file.expand('build/**/*.js').forEach(function (file) {
      grunt.file.copy(file, file, {
        process: function (contents, folder) {
          return 'define(\'' + folder + '\', function (require, module) {\n' + contents + '\n});'
        },
        noProcess: 'build/js/support.js'
      });
    });

    if (config.production) {
      var async = this.async();

      Object.keys(bundles).forEach(function (name) {
        var files = bundles[name].js || [];

        minifier.js({
          srcPath: __dirname + '/build/',
          filesIn: files,
          destination: __dirname + '/build/js/all.' + name + '.js'
        }).on('error', function () {
          console.log(arguments);
          async(false);
        }).on('complete', function () {
          async();
        });
      });
    }
  });

  /**
   * Runs the specified test suites. If no targets are provided, all test suites
   * are ran. Targets can restrict which test suites to run.
   *
   * The command `grunt test:storage:model` will run only the storage and model suites
   * The command `grunt test:model* will run all suites starting with the word `model`
   */
  grunt.registerTask('test', function () {
    var testDir = './test/';
    var suites = [].slice.call(arguments, 0);
    var async = this.async();
    var Mocha = require('mocha');
    var mocha = new Mocha({
      reporter: 'spec'
    });

    require('should');

    // Default is to run all tests
    if (!suites.length) {
      suites.push('**/*');

      // For Travis, we want to test all storage types as well. Normally however,
      // memory will be sufficient
      if (!process.env.TRAVIS) {
        suites.push('!storage/*');
        suites.push('storage/memory');
      }
    }

    // Just ignore the .js files that are there to help us.
    suites.push('!config/**/*', '!support/**/*', '!browser/**/*');

    grunt.file.expand({
      cwd: testDir
    }, suites.map(function (match) {
      return match + '.js';
    })).forEach(function (file) {
      mocha.addFile(testDir + file);
    });

    mocha.run(function (failures) {
      async(failures? false : true);
    });
  });

  grunt.registerTask('build', ['copy', 'buildjs', 'buildcss']);
};