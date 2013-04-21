var request = require('supertest');
var app = require('../../lib/app')({
  'base': 'jssketch.local.mattlunn.me.uk',
  'jail': 'jssketch-other.local.mattlunn.me.uk',
  'port': 3000,
  'production': false,

  'storage': 'memory',
  'storageArgs': []
});

module.exports.app = app;

module.exports.getBase = function (path) {
  return request(app.app).get(app.config.getBaseUrl(path)).set('Host', app.config.get('base'));
};

module.exports.getJail = function (path) {
  return request(app.app).get(app.config.getJailUrl(path)).set('Host', app.config.get('jail'));
};

module.exports.postBase = function (path) {
  return request(app.app).post(app.config.getBaseUrl(path)).set('Host', app.config.get('base'));
};

module.exports.postJail = function (path) {
  return request(app.app).post(app.config.getJailUrl(path)).set('Host', app.config.get('jail'));
};