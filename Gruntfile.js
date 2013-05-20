module.exports = function (grunt) {
  var bundles = grunt.file.readJSON('./config/bundles.json');

  grunt.initConfig({
    requirejs: {
      dist: {
        options: grunt.util._.merge(grunt.file.readJSON('./config/requirejs.json'), {
          appDir: __dirname + '/public',
          baseUrl: 'js',
          dir: 'build',
          preserveLicenseComments: false,
          skipDirOptimize: true,
          paths: {
            lib: '../../shared/lib',
            helpers: '../../shared/helpers',
            models: '../../shared/models',
          },
          modules: Object.keys(bundles).filter(function (name) {
            return this[name].js;
          }, bundles).map(function (name) {
            return {
              name: name
            };
          })
        })
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
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('buildcss', function () {
    var minifier = require('mini-fier').create();
    var async = this.async();

    Object.keys(bundles).forEach(function (name) {
      var files = bundles[name].css || [];

      minifier.css({
        srcPath: __dirname + '/public/',
        filesIn: files,
        destination: __dirname + '/build/css/all.' + name + '.css'
      }).on('error', function () {
        async(false);
      }).on('complete', function () {
        async();
      });
    });
  });

  /**
   * Runs the specified test suites. If no targets are provided, all test suites
   * are ran. Targets can restrict which test suites to run.
   *
   * The command `grunt test:storage:model` will run only the storage and model suites
   * The command `grunt test:model* will run all suites starting with the word `model`
   */
  grunt.registerTask('test', function () {
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
    }

    // Just ignore the .js files that are there to help us.
    suites.push('!config/*', '!support/*');

    grunt.file.expand(suites.map(function (match) {
      return './test/' + match + '.js';
    })).forEach(function (file) {
      mocha.addFile(file);
    });

    mocha.run(function (failures) {
      async(failures? false : true);
    });
  });

  grunt.registerTask('build', ['requirejs', 'buildcss']);
};