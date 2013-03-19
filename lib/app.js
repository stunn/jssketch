var util = require('utils');
var path = require('path');

function readConfigFile(file) {
  return util.readJsonFileSync(__dirname + '/../config/' + file + '.json');
}

function Application(config) {
  this._config = util.extend({}, {
    base: 'jssketch.local.mattlunn.me.uk',
    jail: 'jssketch-other.mattlunn.me.uk',
    port: 3000,

    trust_proxy: false,
    production: false,

    storage: "memory",
    storageArgs: []
  }, config, {
    js_modules: readConfigFile('js_modules'),
    css_bundles: readConfigFile('css_bundles')
  });
}

Application.prototype.build = function(callback) {
  var minifier = require('mini-fier');
  var config = this._config;
  var counter = 0;
  var fired = false;

  console.log('Building Application');

  function process(type, files, destination) {
    counter++;

    minifier[type]({
      srcPath: config.public_path,
      filesIn: files,
      destination: destination
    }).on('complete', function () {
      counter--;

      if (counter === 0 && !fired) {
        console.log('Build Complete');
        callback();
      }
    }).on('error', function (reason) {
      fired = true;

      callback(reason);
    });
  }

  ["css", "js"].forEach(function (type) {
    var bundles = config[type + "_bundles"];

    Object.keys(bundles).forEach(function (bundle) {
      process(type, this[bundle], path.join(config.public_path, config[type + "_bundle_name"].replace(/%n%/g, bundle)));
    }, bundles);
  });
};

Application.prototype.start = function() {
  require('./web').init(this._config);
  console.log('Listening...');
};

module.exports = function (config) {
  if (typeof config !== "object" || config === null) {
    config = {};
  }

  return new Application(config);
}