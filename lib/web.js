var controller = require('./controller');
var validators = require('./validators');

var jssketch = require('jssketch-be');
var express = require('express');
var utils = require('utils');

module.exports.init = function (config) {
  var app = express();
  var client = jssketch({
    storage: new jssketch.MemoryStorage()
  });
  var validator = validators(client);

  var jail = controller(client);
  var base = controller(client);

  app.use(express.bodyParser());
  app.use(express.vhost(config.base, base));
  app.use(express.vhost(config.jail, jail));

  var render = (function () {
    function expand(bundles, format, production) {
      var ret = {};

      Object.keys(bundles).forEach(function (bundle) {
        ret[bundle] = (production ? [format.replace(/%n%/g, bundle)] : bundles[bundle]);
      });

      return ret;
    }

    var stylesheets = expand(config.css_bundles, config.css_bundle_name, config.production);
    var scripts = expand(config.js_bundles, config.js_bundle_name, config.production);

    return function (file, options, bundle, res) {
      if (typeof res === "undefined") {
        res = bundle;
        bundle = '';
      }

      res.render(file, utils.extend({
        stylesheets: stylesheets[bundle] || [],
        scripts: scripts[bundle] || []
      }, options));
    }
  }());

  function editor(sketch, revision, res) {
    render('index.ejs', {
      sketch: sketch,
      revision: revision,
      doctypes: client.doctypes,
      config: config
    }, 'editor', res);
  }

  function preview(sketch, revision, res) {
    render('preview.ejs', {
      sketch: sketch,
      revision: revision,
      doctypes: client.doctypes,
      dm: client.dm
    }, res);
  }

  base.get('/', function (req, res) {
    var sketch = new client.Sketch();
    var revision = new client.Revision();

    editor(sketch, revision, res);
  });

  /**
   * Saves a new revision of a sketch. There are 3 general scenario here:
   *
   * 1. This is the first time a sketch has been saved. A sketch needs to be created, and a new revision added.
   * 2. This is an update of a sketch. The sketch needs to be loaded, and a new revision added.
   * 3. This should be a fork of a sketch. A new sketch needs to be created and a new revision added.
   */
  base.post('/save', validator.createAndValidateRevisionFromPostData, function (req, res, next) {
    var sketchId = typeof req.body.id === "string" && req.body.id.length > 0 && req.body.save === "update" ? req.body.id : undefined;
    var revision = req.revision;

    client.saveRevision(revision, sketchId, function (err, revision, sketchId) {
      if (!err) {
        res.redirect('/' + sketchId + '/' + revision.id);
      } else {
        next('route');
      }
    });
  });

  base.get('/:id/:rev', validator.loadAndVerifyRevisionFromUrl, function (req, res, next) {
    editor(req.sketch, req.revision, res);
  });

  jail.post('/preview', validator.createAndValidateRevisionFromPostData, function (req, res, next) {
    preview(req.sketch, req.revision, res);
  });

  jail.get('/preview/:id/:rev', validator.loadAndVerifyRevisionFromUrl, function (req, res, next) {
    preview(req.sketch, req.revision, res);
  });

  base.use(express.static(__dirname + '/../public'));
  app.listen(config.port);
}