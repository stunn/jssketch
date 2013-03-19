var utils = require('utils');
var bundles = utils.readJsonFileSync(__dirname + '/config/bundles');

// Minify JS
(function  () {
  var requirejs = require('requirejs');
  var config = utils.readJsonFileSync(__dirname + '/config/requirejs');

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
    console.log(buildResponse);
  }, function(err) {
    console.log(err.toString());
  });
}());

// Minify CSS
(function () {
  var minifier = require('mini-fier');

  Object.keys(bundles).forEach(function (name) {
    var files = bundles[name].css || [];

    minifier.css({
      srcPath: __dirname + '/public/',
      filesIn: files,
      destination: __dirname + '/build/css/all.' + name + '.css'
    });
  });
}());