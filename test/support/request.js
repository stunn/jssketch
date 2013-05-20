var supertest = require('supertest');

module.exports.getBase = function (app, path) {
  return supertest(app.app).get(app.config.getBaseUrl(path)).set('Host', app.config.get('base'));
};

module.exports.getJail = function (app, path) {
  return supertest(app.app).get(app.config.getJailUrl(path)).set('Host', app.config.get('jail'));
};

module.exports.postBase = function (app, path) {
  return supertest(app.app).post(app.config.getBaseUrl(path)).set('Host', app.config.get('base'));
};

module.exports.postJail = function (app, path) {
  return supertest(app.app).post(app.config.getJailUrl(path)).set('Host', app.config.get('jail'));
};