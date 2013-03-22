var express = require('express');
var utils = require('utils');

var Config = require('../models/config');
var controller = require('./controller');
var jssketch = require('./jssketch');
var routes = require('./routes');

function Application(cfg) {
  var config = this.config = new Config;
  this.config.set(cfg);

  ['css_libraries', 'js_libraries', 'doctypes'].forEach(function (key) {
    this.set(key, require(this.get(key + '_path')));
  }, config);

  if (config.validate() !== true) {
    throw new Error(config.validate());
  }

  this.client = jssketch(config);

  this.app = controller(config);
  this.base = controller(config);
  this.jail = controller(config);

  this.app.use(express.bodyParser());
  this.app.use(express.vhost(config.get('base'), this.base));
  this.app.use(express.vhost(config.get('jail'), this.jail));

  this._initializeStaticRoutes();
  this._initializeRoutes();
};

Application.prototype.start = function() {
  this.app.listen(this.config.get('port'));

  console.log('Listening on ' + this.config.get('base') + ':' +
              this.config.get('port') + '...');
};

Application.prototype._initializeStaticRoutes = function () {
  var folder = __dirname  + '/../' + (this.config.get('production') ? 'build' : 'public') + '/';

  // Use express.static for all our static endpoints.
  ["css", "js", "codemirror", "img"].forEach(function (dir) {
    this.base.use('/' + dir, express.static(folder + dir));
  }, this);

  // JS requests are also served from the shared directory, as well as public/js
  this.base.use('/js', express.static(__dirname + '/../shared/'));
};

Application.prototype._initializeRoutes = function () {
  routes(this.base, this.jail, this.config, this.client);
};

module.exports = function (config) {
  if (typeof config !== "object" || config === null) {
    config = {};
  }

  return new Application(config);
}