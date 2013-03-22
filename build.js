var bundles = require('./config/bundles.json');
var utils = require('utils');

// Minify JS
(function  () {
  var config = require('./config/requirejs');
  var requirejs = require('requirejs');

  utils.extend(config, {
    appDir: __dirname + '/public',
    baseUrl: 'js',
    dir: 'build',
    preserveLicenseComments: false,
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
  }, true);

  requirejs.optimize(config, function (buildResponse) {
    console.log('JS files build successfully');
  }, function(err) {
    console.log('Error building JS files: ' + err.toString());
  });
}());

// Minify CSS
(function () {
  var minifier = require('mini-fier').create();

  Object.keys(bundles).forEach(function (name) {
    var files = bundles[name].css || [];

    minifier.css({
      srcPath: __dirname + '/public/',
      filesIn: files,
      destination: __dirname + '/build/css/all.' + name + '.css'
    }).on('error', function (err) {
      console.log('Error building CSS files: ' + err.toString());
    }).on('complete', function () {
      console.log('CSS files build successfully')
    });
  });
}());