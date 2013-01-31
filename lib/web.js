module.exports.init = function (config) {
  var controller = require('./controller');
  var jssketch = require('jssketch-be');
  var express = require('express');
  var utils = require('utils');

  var app = express();
  var client = jssketch({
    storage: new jssketch.MemoryStorage()
  });

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
      doctypes: client.doctypes
    }, res);
  }

  base.get('/', function (req, res) {
    var sketch = new client.Sketch();
    var revision = new client.Revision();

    sketch.revisions.add(revision);
    editor(sketch, revision, res);
  });

  /**
   * Saves a new revision of a sketch. There are 3 general scenario here:
   * 
   * 1. This is the first time a sketch has been saved. A sketch needs to be created, and a new revision added.
   * 2. This is an update of a sketch. The sketch needs to be loaded, and a new revision added.
   * 3. This should be a fork of a sketch. A new sketch needs to be created and a new revision added.
   */
  base.post('/save', function (req, res, next) {
    function withSketch(sketch) {
      var revision = new client.Revision();

      revision.update(req.body);
      sketch.revisions.add(revision);

      client.save(sketch, function (err) {
        if (!err) {
          res.redirect('/' + sketch.id + '/' + revision.id);
        }
      });
    }

    // This first case handles (2); e.g. the loading of an existing sketch and addition of a new revision
    if (typeof req.body.id === "string" && req.body.id.length > 0 && req.body.save === "update") {
      client.load(req.body.id, function (err, sketch) {
        if (!err) {
          withSketch(sketch);
        } else {
          next();
        }
      });

    // In all other situations, we want to add a revision to a newly created sketch
    } else {
      withSketch(new client.Sketch());
    }
  });

  base.get('/:id/:rev?', function (req, res, next) {
    var sketch = req.sketch;
    var revision = req.revision;

    if (!revision && sketch && req.params.rev === "") {
      revision = sketch.revisions[0];
    }

    if (revision && sketch) {
      editor(sketch, revision, res);
    } else {
      next();
    }
  });

  jail.post('/preview', function (req, res) {
    var sketch = new client.Sketch();
    var revision = new client.Revision();
    
    revision.update(req.body);
    sketch.revisions.add(revision);

    preview(sketch, revision, res);
  });

  jail.get('/preview/:id/:rev', function (req, res, next) {
    if (req.revision) {
      preview(req.sketch, req.revision, res);
    } else {
      next();
    }
  });

  base.use(express.static(__dirname + '/../public'));
  app.listen(config.port);
}