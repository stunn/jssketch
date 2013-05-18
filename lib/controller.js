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

  app.use(express.timeout(30000));
  app.use(express.compress());

  return app;
};
