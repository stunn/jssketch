function MemoryStorage() {
  this._revisions = {};
  this._ajax = {};
}

MemoryStorage.prototype = require('./storage').create();

MemoryStorage.prototype._loadRevisionData = function (sketchId, revisionId) {
  return (this._revisions[sketchId] || [])[revisionId - 1];
};

MemoryStorage.prototype.saveSketch = function (sketch, callback, generator) {
  var id;

  while (true) {
    id = generator();

    if (!this._revisions.hasOwnProperty(id)) {
      this._revisions[id] = [];

      break;
    }
  }

  callback(null, id);
};

MemoryStorage.prototype.getSketch = function (id, callback) {
  if (this._revisions.hasOwnProperty(id)) {
    callback(null, {
      id: id
    });
  } else {
    callback(new this.Error(id + ' does not exist', false));
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
    revision.revision.id = +revisionId;

    callback(null, revision.revision, revision.cssAssets, revision.jsAssets, sketchId);
  } else {
    callback(new this.Error('v' + revisionId + ' of sketch ' + sketchId + ' does not exist', false));
  }
};

MemoryStorage.prototype.saveAjax = function (ajax, callback, generator) {
  var id;

  do {
    id = generator();
  } while (this._ajax.hasOwnProperty(id));

  this._ajax[id] = JSON.stringify(ajax);
  callback(null, id);
};

MemoryStorage.prototype.getAjax = function (id, callback) {
  if (this._ajax.hasOwnProperty(id)) {
    var parsed = JSON.parse(this._ajax[id]);

    parsed.id = id;
    callback(null, parsed);
  } else {
    callback(new this.Error('No Ajax model with ID of ' + id + ' exists', false));
  }
};

MemoryStorage.prototype.getAjaxForRevision = function (sketchId, revisionId, callback) {
  var that = this;

  callback(null, JSON.parse(this._loadRevisionData(sketchId, revisionId).ajax).map(function (id) {
    return JSON.parse(that._ajax[id]);
  }));
};

MemoryStorage.prototype.saveAjaxForRevision = function (sketchId, revisionId, ajaxRequests, callback) {
  this._loadRevisionData(sketchId, revisionId).ajax = JSON.stringify(ajaxRequests.map(function (obj) {
    return obj.id;
  }));

  callback(null);
};

module.exports = function () {
  return new MemoryStorage();
};