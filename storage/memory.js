function MemoryStorage() {
  this._revisions = {};
  this._ajax = {};
}

MemoryStorage.prototype._loadRevisionData = function (sketchId, revisionId) {
  return (this._revisions[sketchId] || [])[revisionId - 1];
};

MemoryStorage.prototype.saveSketch = function (sketch, callback, generator) {
  if (typeof sketch.id === 'undefined') {
    var id;

    while (true) {
      id = generator();

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

MemoryStorage.prototype.addRevisionToSketch = function (revision, cssAssets, jsAssets, sketchId, callback) {
  var id = this._revisions[sketchId].push({
    revision: JSON.stringify({
      revision: revision,
      cssAssets: cssAssets,
      jsAssets: jsAssets
    })
  });

  callback(null, id);
};

MemoryStorage.prototype.getRevision = function (revisionId, sketchId, callback) {
  var revision = this._loadRevisionData(sketchId, revisionId);

  if (revision) {
    revision = JSON.parse(revision.revision);
    revision.revision.id = revisionId;

    callback(null, revision.revision, revision.cssAssets, revision.jsAssets, sketchId);
  } else {
    callback(new Error('v' + revisionId + ' of sketch ' + sketchId + ' does not exist'));
  }
};

MemoryStorage.prototype.saveAjax = function (ajax, callback, generator) {
  if (typeof ajax.id === 'undefined') {
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
    var parsed = JSON.parse(this._ajax[id]);

    parsed.id = id;
    callback(null, parsed);
  } else {
    callback(new Error('No Ajax model with ID of ' + id + ' exists'));
  }
};

MemoryStorage.prototype.getAjaxForRevision = function (sketchId, revisionId, callback) {
  var revision = this._loadRevisionData(sketchId, revisionId);

  if (revision) {
    callback(null, JSON.parse(revision.ajax));
  } else {
    callback(new Error('v' + revisionId + ' of sketch ' + sketchId + ' does not exist'));
  }
};

MemoryStorage.prototype.saveAjaxForRevision = function (sketchId, revisionId, ajaxRequests, callback) {
  var revision = this._loadRevisionData(sketchId, revisionId);

  if (revision) {
    revision.ajax = JSON.stringify(ajaxRequests);
    callback(null);
  } else {
    callback(new Error('v' + revisionId + ' of sketch ' + sketchId + ' does not exist'));
  }
};

module.exports = function () {
  return new MemoryStorage();
};