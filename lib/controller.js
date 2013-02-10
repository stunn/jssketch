var express = require('express');

module.exports = function (config) {
  var app = express();

  app.set('trust proxy', !!config.trust_proxy);
  app.set('env', config.production ? 'production' : 'development');
  app.set('views', __dirname + '/../views');

  app.use(express.timeout(30000));
  app.use(express.compress());

  return app;
}