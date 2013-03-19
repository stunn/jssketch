var broker = require('./broker');

var dm = broker.load('helpers/dm');
var util = require('utils');

var Revision = broker.load('models/revision');
var Sketch = broker.load('models/sketch');
var Asset = broker.load('models/asset');
var Ajax = broker.load('models/ajax');

function JsSketch(settings) {
  this._settings = settings;

  this.storage = this._prepStorage(settings.storage, settings.storageArgs);
  this.doctypes = this._prepDoctypes(util.readJsonFileSync(__dirname + '/../config/doctypes'));

  this.sketchIdGenerator = util.generator('abcdefghjkmnpqrstuvwxyzABCEFGHJKLMNPQRSTUVWXYZ123456789', 5);
  this.ajaxIdGenerator = util.generator('abcdefghjkmnpqrstuvwxyzABCEFGHJKLMNPQRSTUVWXYZ123456789', 3);
  this.dm = dm.fromSerializedForm({
    css: util.readJsonFileSync(__dirname + '/../config/css_libraries'),
    js: util.readJsonFileSync(__dirname + '/../config/js_libraries')
  });
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
  return doctypes;
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
    var cssAssets = revision.cssAssets.map(serializeAsset('css'));
    var jsAssets = revision.jsAssets.map(serializeAsset('js'));
    var revisionRep = util.extract(revision.properties, [
      'id', 'javascript',
      'css', 'html', 'doctype'
    ]);

    // Date is better as a number rather than ISO date formatted string, kthx.
    revisionRep.createdAt = revision.get('createdAt').getTime();

    function serializeAsset(type) {
      return function (asset) {
        var version = asset.get('version');
        var type = asset.getType();

        if (type === "user") {
          return {
            type: type,
            parent: null,
            library: null,
            id: version.get('id')
          };
        } else {
          var library = version.get('library');

          return {
            type: type,
            library: library.get('id'),
            id: version.get('id'),
            parent: typeof asset.parent === "undefined" ? null : (function (version) {
              var library = version.library;

              return {
                type: library.type,
                library: library.get('id'),
                id: version.get('id')
              };
            }(asset.parent))
          }
        }
      };
    };

    this.storage.addRevisionToSketch(revisionRep, cssAssets, jsAssets, sketchId, function (err, revisionId) {
      if (err) {
        callback(error);
      } else {
        revision.set('id', revisionId);
        callback(null, revision, sketchId);
      }
    });
  }).bind(this);

  if (typeof sketchId === "undefined") {
    var sketch = new Sketch();

    this.storage.saveSketch(sketch, function (err, id) {
      if (err) {
        callback(err);
      } else {
        addRevisionToSketch(id, revision);
      }
    }, this.sketchIdGenerator);
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

  this.storage.getRevision(revisionId, sketchId, function (err, revisionProperties, cssAssets, jsAssets, sketchId) {
    if (err) {
      callback(new Error('v' + revisionId + ' of sketch ' + sketchId + ' does not exist'));
    } else {
      var revision = new Revision(revisionProperties);
      var sketch = new Sketch({
        id: sketchId
      });

      [["cssAssets", cssAssets], ["jsAssets", jsAssets]].forEach(function (arr) {
        var name = arr[0];

        arr[1].forEach(function (assetRep) {
          var asset = new Asset();

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

      revision.set('createdAt', new Date(revisionProperties.createdAt));
      callback(null, revision, sketch);
    }
  });
}

JsSketch.prototype.saveAjax = function (ajax, callback) {
  if (ajax.validate() === true) {
    this.storage.saveAjax(ajax, function (err, id) {
      if (err) {
        callback(err);
      } else {
        ajax.set('id', id);
        callback(null, ajax);
      }
    }, this.ajaxIdGenerator);
  }
};

JsSketch.prototype.loadAjax = function (id, callback) {
  this.storage.getAjax(id, function (err, ajaxProperties) {
    if (err) {
      callback(err);
    } else {
      callback(null, new Ajax(ajaxProperties));
    }
  });
};

JsSketch.prototype.loadAjaxForRevision = function (sketch, revision, callback) {
  if (sketch instanceof Sketch) {
    sketch = sketch.get('id');
  }

  if (revision instanceof Revision) {
    revision = revision.get('id');
  }

  this.storage.getAjaxForRevision(sketch, revision, function (err, ajaxRequests) {
    if (err) {
      callback(err);
    } else {
      callback(null, ajaxRequests.map(function (request) {
        return new Ajax(request);
      }));
    }
  });
};

JsSketch.prototype.saveAjaxForRevision = function (ajaxRequests, sketch, revision, callback) {
  if (sketch instanceof Sketch) {
    sketch = sketch.get('id');
  }

  if (revision instanceof Revision) {
    revision = revision.get('id');
  }

  this.storage.saveAjaxForRevision(sketch, revision, ajaxRequests, callback);
}

module.exports = function (prefs) {
  return new JsSketch(prefs);
};

module.exports.storage = {
  memory: require('../storage/memory.js')
};