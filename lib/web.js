var controller = require('./controller');

var jssketch = require('jssketch-be');
var express = require('express');
var utils = require('utils');

module.exports.init = function (config) {
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
      doctypes: client.doctypes,
      dm: client.dm
    }, res);
  }

  function createAndValidateRevisionFromPostData(req, res, next) {
    var revision = req.revision || new client.Revision();
    var sketch = req.sketch || new client.Sketch();

    var assetTypes = ["css", "js"];
    var assetKeys = assetTypes.map(function (type) {
      return type + "_assets";
    });

    function error(reason) {
      console.log(reason);
      next('route');

      return false;
    }

    revision.update(req.body);
    sketch.revisions.add(revision);

    // If what we've got so far is validate, move onto checking the assets.
    if (revision.validate() !== true) {
      return error('Revision did not validate');
    }

    // We need to validate that each asset list is an array of objects first,
    // as inter-type dependancy checking can hit all lists. We can therefore re-validate
    // the list every time we hit it, or validate first and then access without checking.
    for (var i=0;i<assetKeys.length;i++) {
      var key = assetKeys[i];
      var array;

      try {
        req.body[key] = array = JSON.parse(req.body[key]);
      } catch (e) {}

      // Check that the input is actually an array we can iterate over.
      // Note that this may not be an array of objects; it's just an array
      // of some types.
      if (!Array.isArray(array)) {
        return error(key + ' is not a valid JSON array');
      }

      // This is where we check each element of the array is a non-null object.
      if (!array.every(function (key) {
        return typeof key === "object" && key !== "null";
      })) {
        return error('Asset is a non-object');
      };
    }

    for (var i=0;i<assetTypes.length;i++) {
      var type = assetTypes[i];
      var key = assetKeys[i];

      var collection = revision[utils.camelize(key)];
      var assetsOfType = req.body[key];

      for (var j=0;j<assetsOfType.length;j++) {
        var assetRep = assetsOfType[j];
        var asset = new client.Asset();

        switch (assetRep.type) {
          // Only CSS or JS assets can have a parent ("user" can't). If there
          // is a parent, check it is included in the sketch & exists.
          case type:
            var parent = assetRep.parent;

            // Then we have to validate parent
            if (typeof parent === "object" && parent !== null) {
              if (["css", "js"].indexOf(parent.type) === -1) {
                return error('Asset parents must be of CSS or JS, not ' + parent.type);
              }

              // Check the parent is included in the sketch.
              if (!req.body[parent.type + "_assets"].some(function (assetRep) {
                return assetRep.library === parent.library && assetRep.id === parent.id;
              })) {
                return error('Asset references a parent which is not present in the revision');
              }

              // dm.find returns a Version or false. If it's false, it'll be picked
              // up by the validate() function.
              asset.parent = client.dm.find(parent.type, parent.library, parent.id);
            }

            asset.version = client.dm.find(type, assetRep.library, assetRep.id);
          break;
          case "user":
            // DM does all the hard work of validating ID. It'll return false if
            // invalid, which'll be picked up by validate() later.
            asset.version = client.dm.create(assetRep.id);
          break;
          default:
            return error('Asset was of the wrong type (' + assetRep.type + ' in ' + key + ')');
          break;
        }

        if (asset.validate() === true) {
          collection.add(asset);
        } else {
          return error('Asset validation failed');
        }
      }
    }

    req.sketch = sketch;
    req.revision = revision;

    next();
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
    // This case handles (2); e.g. the loading of an existing sketch and addition of a new revision
    // In all other situations, we want to add a revision to a newly created sketch, which
    // createAndValidateRevisionFromPostData will do.
    if (typeof req.body.id === "string" && req.body.id.length > 0 && req.body.save === "update") {
      client.load(req.body.id, function (err, sketch) {
        if (!err) {
          req.sketch = sketch;
          next();
        } else {
          next('route');
        }
      });
    } else {
      next();
    }
  }, createAndValidateRevisionFromPostData, function (req, res, next) {
    var sketch = req.sketch;
    var revision = req.revision;

    client.save(sketch, function (err) {
      if (!err) {
        res.redirect('/' + sketch.id + '/' + revision.id);
      } else {
        next('route');
      }
    });
  });

  base.get('/:id/:rev?', function (req, res, next) {
    var sketch = req.sketch;
    var revision = req.revision;

    // If no revision ID is provided in the URL, show the first
    if (!revision && sketch && req.params.rev === "") {
      revision = sketch.revisions[0];
    }

    if (revision && sketch) {
      editor(sketch, revision, res);
    } else {
      next();
    }
  });

  jail.post('/preview', createAndValidateRevisionFromPostData, function (req, res, next) {
    preview(req.sketch, req.revision, res);
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