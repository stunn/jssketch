var express = require('express');
var hbs = require('hbs');

var broker = require('./broker');
var viewHelpers = require('../helpers/view');
var sharedViewHelpers = broker.load('helpers/view');

module.exports = function (config) {
  var engine = hbs.create();
  var app = express();

  app.set('trust proxy', config.get('trust_proxy'));
  app.set('env', config.get('production') ? 'production' : 'development');
  app.set('views', __dirname + '/../views');

  viewHelpers(engine.handlebars, config);
  sharedViewHelpers(engine.handlebars);
  app.engine('hbs', engine.__express);

  // This is a workaround for https://github.com/senchalabs/connect/issues/750
  app.use(function (req, res, next) {
    res.on('error', function (e) {
      console.log('Catching an error in the response: ' + e.toString());
    });

    next();
  });

  app.use(express.timeout(30000));
  app.use(express.compress());

  return app;
};