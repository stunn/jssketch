var util = require('utils');
var dm = require('./broker').load('lib/dependency_manager');

function JsSketch(settings) {
  this._settings = settings;

  this.storage = this._prepStorage(settings.storage, settings.storageArgs);
  this.doctypes = this._prepDoctypes(util.readJsonFileSync(__dirname + '/../config/doctypes'));

  this.generator = util.generator('abcdefghjkmnpqrstuvwxyzABCEFGHJKLMNPQRSTUVWXYZ123456789', 5);
  this.dm = dm.init({
    css: util.readJsonFileSync(__dirname + '/../config/css_libraries'),
    js: util.readJsonFileSync(__dirname + '/../config/js_libraries')
  });

  this.Revision = require('./broker').load('models/revision');
  this.Sketch = require('./broker').load('models/sketch');
  this.Asset = require('./broker').load('models/asset');
}

JsSketch.prototype._prepStorage = function (storage, args) {
  switch (typeof storage) {
    case "string":
      var storages = module.exports.storage;

      if (storages.hasOwnProperty(storage)) {
        return storages[storage].apply(null, args);
      } else {
        throw new Error(storage + ' is not a recognised storage type');
      }
    break;
    case "object":
      if (storage !== "null") {
        return storage;

        break;
      }
    default:
      throw new Error('Storage medium has been been defined properly');
  }
}

JsSketch.prototype._prepDoctypes = function (doctypes) {
  return Object.keys(doctypes).map(function (key) {
    doctypes[key].id = key;

    return doctypes[key];
  });
}

JsSketch.prototype.saveRevision = function (revision, sketchId, callback) {
  // sketchId is optional; if it isn't provided, we want to create a new sketch.
  // ... shuffle arguments accordingly...
  if (arguments.length === 2) {
    callback = sketchId;
    sketchId = undefined;
  }

  // Ensure that the revision we've been provided is valid. This also requires the
  // validating of the assets as well.
  if (revision.validate() !== true || ["cssAssets", "jsAssets"].some(function (key) {
    return revision[key].some(function (asset) {
      return asset.validate() !== true;
    });
  })) {
    return callback(new Error('Cannot save Revision; it does not validate'));
  }

  var addRevisionToSketch = (function (sketchId, revision) {
    function serializeAsset(type) {
      return function (asset) {
        var version = asset.version;
        var type = asset.getType();

        if (type === "user") {
          return {
            type: type,
            parent: null,
            library: null,
            id: version.id
          };
        } else {
          var library = version.library;

          return {
            type: type,
            library: library.id,
            id: version.id,
            parent: typeof asset.parent === "undefined" ? null : (function (version) {
              var library = version.library;

              return {
                type: library.type,
                library: library.id,
                id: version.id
              };
            }(asset.parent))
          }
        }
      };
    };

    var cssAssets = revision.cssAssets.map(serializeAsset('css'));
    var jsAssets = revision.jsAssets.map(serializeAsset('js'));

    this.storage.addRevisionToSketch(revision, cssAssets, jsAssets, [], sketchId, function (err, revisionId) {
      if (err) {
        callback(error);
      } else {
        revision.id = revisionId;
        callback(null, revision, sketchId);
      }
    });
  }).bind(this);

  if (typeof sketchId === "undefined") {
    var sketch = new this.Sketch();

    this.storage.saveSketch(sketch, function (err, id) {
      if (err) {
        callback(err);
      } else {
        addRevisionToSketch(id, revision);
      }
    }, this.generator);
  } else {
    this.storage.getSketch(sketchId, function (err, sketch) {
      if (sketch && !err) {
        addRevisionToSketch(sketchId, revision);
      } else {
        callback(new Error(sketchId + ' is not a valid sketch'));
      }
    });
  }
};

JsSketch.prototype.loadRevision = function (revisionId, sketchId, callback) {
  var that = this;

  this.storage.getRevision(revisionId, sketchId, function (err, revisionProperties, cssAssets, jsAssets, ajax, sketchId) {
    if (err) {
      callback(new Error('v' + revisionId + ' of sketch ' + sketchId + ' does not exist'));
    } else {
      var revision = new that.Revision(revisionProperties);
      var sketch = new that.Sketch({
        id: sketchId
      });

      [["cssAssets", cssAssets], ["jsAssets", jsAssets]].forEach(function (arr) {
        var name = arr[0];

        arr[1].forEach(function (assetRep) {
          var asset = new that.Asset();

          if (assetRep.type === "user") {
            asset.version = that.dm.create(assetRep.id);
          } else {
            asset.version = that.dm.getLibraryVersion(assetRep.type, assetRep.library, assetRep.id);

            if (assetRep.parent !== null) {
              var parent = assetRep.parent;

              asset.parent = that.dm.getLibraryVersion(parent.type, parent.library, parent.id);
            }
          }

          revision[name].add(asset);
        });
      });

      callback(null, revision, sketch);
    }
  });
}

module.exports = function (prefs) {
  return new JsSketch(prefs);
};

module.exports.storage = {
  memory: require('../storage/memory.js')
};