var express = require('express');

module.exports = function (config) {
  var app = express();

  app.set('trust proxy', !!config.trust_proxy);
  app.set('env', config.production ? 'production' : 'development');
  app.set('views', __dirname + '/../views');

  app.set('base', config.base);
  app.set('jail', config.jail);
  app.set('port', config.port);

  app.use(express.timeout(30000));

  // This is a workaround for https://github.com/senchalabs/connect/issues/750
  app.use(function (req, res, next) {
    res.on('error', function (e) {
      console.log('Catching an error in the response: ' + e.toString());
    });

    next();
  });

  app.use(express.compress());

  return app;
}