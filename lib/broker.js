var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname + '/../shared/'
});

module.exports.load = function (path) {
  return requirejs(path);
}