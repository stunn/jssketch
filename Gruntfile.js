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

  grunt.registerTask('test', function () {
    var async = this.async();
    var Mocha = require('mocha');
    var path = require('path');
    var fs = require('fs');

    require('should');

    var mocha = new Mocha({
      reporter: 'spec'
    });

    fs.readdirSync('test').filter(function (file) {
      return path.extname(file) === '.js';
    }).forEach(function (file) {
      mocha.addFile(path.join('test', file));
    });

    mocha.run(function (failures) {
      async(failures? false : true);
    });
  });

  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('build', ['requirejs', 'buildcss']);
};