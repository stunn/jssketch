var app = require('./support/server').app;
var dm = app.client.dm;

var broker = require('../lib/broker');
var Revision = broker.load('models/revision');
var revisionHelper = broker.load('helpers/revision');

describe('Revision', function () {
  var revision = new Revision;
  var hash = {
    js_assets: JSON.stringify([{
      "type": "js",
      "parent": {
        "type": "js",
        "library": 2,
        "id": "1"
      },
      "library": 1,
      "id": "1"
    }, {
      "parent": null,
      "type": "js",
      "library": 2,
      "id": "1"
    }]),
    css_assets: JSON.stringify([{
      "parent": null,
      "type": "css",
      "library": 1,
      "id": "2"
    }, {
      "library": 2,
      "type": "css",
      "id": "1",
      "parent": {
        "type": "js",
        "library": 2,
        "id": "1"
      }
    }]),
    ajax: [],
    javascript: "alert('Hello');",
    css: "body { background: red; }",
    html: "<h1>Hello</h1>",
    doctype: "1"
  };
  var id;

  revisionHelper.updateRevisionFromHash(revision, app.config.get('doctypes'), dm, hash);

  function hashVsRevision(instance) {
    ["doctype", "html", "css", "javascript"].forEach(function (key) {
      hash[key].should.equal(instance.get(key));
    });

    ["js", "css"].forEach(function (key) {
      hash[key + "_assets"].every(function (asset) {
        return instance[key + 'Assets'].some(function (candidate) {
          return candidate.get('version').get('id') === asset.id
            && candidate.get('version').get('library').get('id') === asset.library;
        });
      }).should.be.true;
    });
  }

  it('should update correctly', function () {
    hashVsRevision(revision);
  });

  it('should save new revisions correctly', function () {
    app.client.saveRevision(revision, function (err, revision, sketchId) {
      (err === null).should.be.true;

      (1).should.equal(revision.get('id'));
      sketchId.should.be.a('string');

      id = sketchId;
    });
  });

  it('should load revisions correctly', function () {
    app.client.loadRevision(1, id, function (err, revision, sketch) {
      (err === null).should.be.true;

      id.should.equal(sketch.get('id'));
      (1).should.equal(revision.get('id'));

      hashVsRevision(revision);
    });
  });
});