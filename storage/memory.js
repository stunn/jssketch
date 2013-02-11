function MemoryStorage() {
  this._revisions = {};
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

module.exports = function () {
  return new MemoryStorage();
}