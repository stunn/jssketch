var controller = require('./controller');
var broker = require('./broker');

var revisionHelper = broker.load('helpers/revision');
var Revision = broker.load('models/revision');
var Sketch = broker.load('models/sketch');
var Ajax = broker.load('models/ajax');

var jssketch = require('./jssketch');
var express = require('express');
var utils = require('utils');

var hbs = require('hbs');

broker.load('helpers/view')(hbs.handlebars);
require('../helpers/view')(hbs.handlebars);

module.exports.init = function (config) {
  var client = jssketch(utils.extract(config, ['storage', 'storageArgs']));
  var app = controller(config);

  var jail = controller(config);
  var base = controller(config);

  app.use(express.bodyParser());
  app.use(express.vhost(config.base, base));
  app.use(express.vhost(config.jail, jail));

  // Use express.static for all our static endpoints.
  ["css","js","codemirror","img"].forEach(function (dir) {
    base.use('/' + dir, express.static(__dirname + '/../public/' + dir));
  });

  // JS requests are also served from the shared directory, as well as public/js
  base.use('/js', express.static(__dirname + '/../shared/'));

  /**
   * Renders a view, passing the given arguments as local variables to the view file.
   *
   * @param file The filename of the view we wish to render
   * @param options An object of KVPs that we want exposed in the view
   * @param bundle An optional name of the CSS/JS bundle we want to include in the view header
   * @param res The response object of the request we're handling
   */
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

  /**
   * This view helper will render the editor for the given sketch and revision
   *
   * @param sketch The sketch instance we want to show the editor for
   * @param revision The revision instance we want to show the editor for
   * @param res The response object of the request we're handling
   * @return void
   */
  function editor(sketch, revision, res) {
    render('index.hbs', {
      sketch: sketch,
      revision: revision,
      css: utils.readJsonFileSync(__dirname + '/../config/css_libraries'),
      js: utils.readJsonFileSync(__dirname + '/../config/js_libraries'),
      doctypes: client.doctypes
    }, 'editor', res);
  }

  /**
   * This view helper will render the preview of the provided sketch and revision
   *
   * @param sketch The sketch instance who's revision we want to render
   * @param revision The revision instance we want to render a preview of
   * @param res The response object of the request we're handling
   * @return void
   */
  function preview(sketch, revision, res) {
    render('preview.hbs', {
      sketch: sketch,
      revision: revision,
      dm: client.dm,
      doctype: client.doctypes.filter(function (doctype) {
        return doctype.id === revision.doctype;
      })[0]
    }, res);
  }

  /**
   * This utility function can be used as a pre-filter to any endpoint expecting
   * a sketch and revision ID in the url. This pre-filter will attempt to load
   * the corresponding sketch and revision, and place their instances in req.sketch
   * and req.revision.
   *
   * If the sketch revision or sketch does not exist, the next route chain will be
   * called.
   */
  function loadAndVerifyRevisionFromUrl(req, _, next) {
    var sketchId = req.params.id;
    var revisionId = req.params.rev;

    // Check that the rev and the id are actual sketch ID's and revision ID's...
    // otherwise bail to another handler.
    if (sketchId.length !== 5 || !/^[0-9]+$/.test(revisionId)) {
      return next('route');
    } else {
      revisionId = +revisionId;

      client.loadRevision(revisionId, sketchId, function (err, revision, sketch) {
        if (err) {
          next('route');
        } else {
          req.sketch = sketch;
          req.revision = revision;

          next();
        }
      });
    }
  }

  /**
   * This utility function can be used as a pre-filter to any endpoint expecting
   * a Revision to be provided as POST data. This function will create a Revision
   * instance in req.revision, and populate it with all the data given in the POST.
   *
   * This instance will then be validated; if it is not valid, the handling will
   * be passed to the next route chain.
   */
  function createAndValidateRevisionFromPostData(req, res, next) {
    var revision = req.revision || new Revision();
    var valid = revisionHelper.updateRevisionFromHash(revision, client.doctypes, client.dm, req.body);

    if (valid === false) {
      next('route');
    } else {
      req.revision = revision;
      next();
    }
  }

  /**
   * Displays the editor interface to create a new sketch
   */
  base.get('/', function (req, res) {
    var sketch = new Sketch();
    var revision = new Revision();

    editor(sketch, revision, res);
  });

  /**
   * Saves a new revision for either an existing sketch, or a new sketch.
   */
  base.post('/save', createAndValidateRevisionFromPostData, function (req, res, next) {
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

  base.post('/ajax/create', function (req, res, next) {
    var ajax = new Ajax();

    ajax.update(req.body);

    function succeed(id) {
      res.json({
        success: true,
        id: id
      });
    }

    function error(reason) {
      res.json({
        success: false,
        error: reason
      });
    }

    if (ajax.validate() === true) {
      client.saveAjax(ajax, function (err, ajax) {
        if (err) {
          error(err.toString());
        } else {
          succeed(ajax.id);
        }
      });
    } else {
      error('The AJAX endpoint form was not filled out correctly');
    }
  });

  /**
   * Displays the editor interface for a particular sketch and revision.
   */
  base.get('/:id/:rev', loadAndVerifyRevisionFromUrl, function (req, res, next) {
    editor(req.sketch, req.revision, res);
  });

  /**
   * Renders a preview for the revision provided in the POST data
   */
  jail.post('/preview', createAndValidateRevisionFromPostData, function (req, res, next) {
    preview(req.sketch, req.revision, res);
  });

  /**
   * Renders the preview for a specific sketch and revision.
   */
  jail.get('/preview/:id/:rev', loadAndVerifyRevisionFromUrl, function (req, res, next) {
    preview(req.sketch, req.revision, res);
  });

  jail.all('/ajax/:id', function (req, res, next) {
    client.loadAjax(req.params.id, function (err, ajax) {
      if (err) {
        next('route');
      } else {
        res.type(ajax.type);
        res.send(ajax.payload);
      }
    });
  });

  app.listen(config.port);
}