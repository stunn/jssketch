var broker = require('./broker');
var view = require('./view');

var revisionHelper = broker.load('helpers/revision');
var Revision = broker.load('models/revision');
var Sketch = broker.load('models/sketch');
var Ajax = broker.load('models/ajax');


module.exports = function (base, jail, config, client) {
  var views = view(config, client);

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
    var valid = revisionHelper.updateRevisionFromHash(revision, config.get('doctypes'), client.dm, req.body);

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
  base.get(config.getBaseUrl('/'), function (req, res) {
    var sketch = new Sketch();
    var revision = new Revision();

    views.editor(sketch, revision, [], res);
  });

  /**
   * Saves a new revision for either an existing sketch, or a new sketch.
   */
  base.post(config.getBaseUrl('/save'), createAndValidateRevisionFromPostData, function (req, res, next) {
    var processed = req.ajax = [];
    var ajax;

    // Validates the 'ajax' entries to make sure we get a JSON array of strings
    try {
      ajax = JSON.parse(req.body.ajax);
    } catch (e) {
      return next('route');
    }

    if (!Array.isArray(ajax) || !ajax.every(function (el) {
      return typeof el === 'string';
    })) {
      return next('route');
    }

    // Ensure all AJAX ID's exist.
    (function load(i) {
      if (i === ajax.length) {
        next();
      } else {
        client.loadAjax(ajax[i], function (err, ajax) {
          if (err) {
            next('route');
          } else {
            processed.push(ajax);

            load(++i);
          }
        });
      }
    }(0));
  }, function (req, res, next) {
    var sketchId = typeof req.body.id === 'string' && req.body.id.length > 0 && req.body.save === 'update' ? req.body.id : undefined;
    var revision = req.revision;

    client.saveRevision(revision, sketchId, function (err, revision, sketchId) {
      if (!err) {
        client.saveAjaxForRevision(req.ajax, sketchId, revision.get('id'), function () {
          if (!err) {
            res.redirect(config.getBaseUrl('/' + sketchId + '/' + revision.get('id'), true));
          } else {
            next('route');
          }
        });
      } else {
        next('route');
      }
    });
  });

  /**
   * Creates a mock AJAX request with the given properties.
   *
   * On success:
   * {
   *   'success': true,
   *   'id': 'abc'
   * }
   *
   * On failure:
   * {
   *   'success': false,
   *   'error': 'Blah blah blah'
   * }
   */
  base.post(config.getBaseUrl('/ajax/create'), function (req, res) {
    var ajax = new Ajax();

    ajax.set(req.body);

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
          succeed(ajax.get('id'));
        }
      });
    } else {
      error('The AJAX endpoint form was not filled out correctly');
    }
  });

  /**
   * Displays the editor interface for a particular sketch and revision.
   */
  base.get(config.getBaseUrl('/:id/:rev'), loadAndVerifyRevisionFromUrl, function (req, res) {
    // Only transient errors will be thown by this; low enough possibility to ignore.
    client.loadAjaxForRevision(req.sketch, req.revision, function (err, ajaxRequests) {
      views.editor(req.sketch, req.revision, ajaxRequests || [], res);
    });
  });

  /**
   * Renders a preview for the revision provided in the POST data
   */
  jail.post(config.getJailUrl('/preview'), createAndValidateRevisionFromPostData, function (req, res) {
    views.preview(new Sketch(), req.revision, res);
  });

  /**
   * Renders the preview for a specific sketch and revision.
   */
  jail.get(config.getJailUrl('/preview/:id/:rev'), loadAndVerifyRevisionFromUrl, function (req, res) {
    views.preview(req.sketch, req.revision, res);
  });

  /**
   * Renders the mock AJAX request with the given ID
   */
  jail.all(config.getJailUrl('/ajax/:id'), function (req, res, next) {
    client.loadAjax(req.params.id, function (err, ajax) {
      if (err) {
        next('route');
      } else {
        res.type(ajax.get('type'));
        res.send(ajax.get('payload'));
      }
    });
  });
};