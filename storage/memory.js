function MemoryStorage() {
  this._revisions = {};
  this._ajax = {};
};

MemoryStorage.prototype.saveSketch = function (sketch, callback, generator) {
  if (typeof sketch.id === "undefined") {
    while (true) {
      var id = generator();

      if (!this._revisions.hasOwnProperty(id)) {
        this._revisions[id] = [];

        break;
      }
    }

    callback(null, id);
  } else {
    callback(new Error('Sketch already has an ID'));
  }
};

MemoryStorage.prototype.getSketch = function (id, callback) {
  if (this._revisions.hasOwnProperty(id)) {
    callback(null, {
      id: id
    });
  } else {
    callback(new Error(id + ' does not exist'));
  }
};

MemoryStorage.prototype.addRevisionToSketch = function (revision, cssAssets, jsAssets, ajax, sketchId, callback) {
  var id = this._revisions[sketchId].push(JSON.stringify({
    revision: revision,
    cssAssets: cssAssets,
    jsAssets: jsAssets,
    ajax: ajax
  }));

  callback(null, id);
};

MemoryStorage.prototype.getRevision = function (revisionId, sketchId, callback) {
  var revision = (this._revisions[sketchId] || [])[revisionId - 1];

  if (revision) {
    revision = JSON.parse(revision);
    revision.revision.id = revisionId;

    callback(null, revision.revision, revision.cssAssets, revision.jsAssets, revision.ajax, sketchId);
  } else {
    callback(new Error('v' + revisionId + ' of sketch ' + sketchId + ' does not exist'));
  }
};

MemoryStorage.prototype.saveAjax = function (ajax, callback, generator) {
  if (typeof ajax.id === "undefined") {
    var id;

    do {
      id = generator();
    } while (this._ajax.hasOwnProperty(id));

    this._ajax[id] = JSON.stringify(ajax);
    callback(null, id);
  } else {
    callback(new Error('AJAX Model already has a ID'));
  }
};

MemoryStorage.prototype.getAjax = function (id, callback) {
  if (this._ajax.hasOwnProperty(id)) {
    callback(null, JSON.parse(this._ajax[id]));
  } else {
    callback(new Error('No Ajax model with ID of ' + id + ' exists'));
  }
};

module.exports = function () {
  return new MemoryStorage();
}