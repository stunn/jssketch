var requirejs = require('requirejs');
var utils = require('utils');

var jsModules = utils.readJsonFileSync(__dirname + '/config/js_modules');
var config = utils.readJsonFileSync(__dirname + '/config/requirejs');

utils.extend(config, {
  dir: "build",
  preserveLicenseComments: false,
  baseUrl: __dirname + "/public/js",
  paths: {
    lib: "../../shared/lib",
    helpers: "../../shared/helpers",
    models: "../../shared/models",
  },
  modules: jsModules.map(function (name) {
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