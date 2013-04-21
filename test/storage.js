var app = require('./support/server').app;
var dm = app.client.dm;

var broker = require('../lib/broker');
var Ajax = broker.load('models/ajax');
var Revision = broker.load('models/revision');
var revisionHelper = broker.load('helpers/revision');

var revision = new Revision();
var ajax = new Ajax({
  payload: JSON.stringify({
    test: 4
  }),
  type: 'json'
});
var sketchId;

describe('AJAX', function () {
  it('should save correctly', function (done) {
    app.client.saveAjax(ajax, function (err, ajax) {
      (err === null).should.be.true;
      ajax.get('id').should.be.a('string');

      done();
    });
  });

  it('should load correctly', function (done) {
    app.client.loadAjax(ajax.get('id'), function (err, retrieved) {
      (err === null).should.be.true;
      ajax.properties.should.eql(retrieved.properties);

      done();
    });
  });
});

describe('Revision', function () {
  var hash = {
    js_assets: JSON.stringify([{
      type: 'js',
      parent: {
        type: 'js',
        library: 2,
        id: '1'
      },
      library: 1,
      id: '1'
    }, {
      parent: null,
      type: 'js',
      library: 2,
      id: '1'
    }]),
    css_assets: JSON.stringify([{
      parent: null,
      type: 'css',
      library: 1,
      id: '2'
    }, {
      library: 2,
      type: 'css',
      id: '1',
      parent: {
        type: 'js',
        library: 2,
        id: '1'
      }
    }]),
    ajax: [ajax.get('id')],
    javascript: 'alert(\'Hello\');',
    css: 'body { background: red; }',
    html: '<h1>Hello</h1>',
    doctype: '1',
    parentSketchId: '12345',
    parentRevisionId: 1
  };

  revisionHelper.updateRevisionFromHash(revision, app.config.get('doctypes'), dm, hash);

  function hashVsRevision(instance) {
    ['doctype', 'html', 'css', 'javascript'].forEach(function (key) {
      hash[key].should.equal(instance.get(key));
    });

    ['js', 'css'].forEach(function (key) {
      hash[key + '_assets'].every(function (asset) {
        return instance[key + 'Assets'].some(function (candidate) {
          return candidate.get('version').get('id') === asset.id &&
            candidate.get('version').get('library').get('id') === asset.library;
        });
      }).should.be.true;
    });
  }

  it('should update correctly', function () {
    hashVsRevision(revision);
  });

  it('should save new revisions correctly', function (done) {
    app.client.saveRevision(revision, function (err, revision, sId) {
      (err === null).should.be.true;

      (1).should.equal(revision.get('id'));
      sId.should.be.a('string');
      sketchId = sId;

      done();
    });
  });

  it('should load revisions correctly', function (done) {
    app.client.loadRevision(1, sketchId, function (err, revision, sketch) {
      (err === null).should.be.true;

      sketchId.should.equal(sketch.get('id'));
      (1).should.equal(revision.get('id'));
      hashVsRevision(revision);

      done();
    });
  });
});

describe('AJAX Revision', function () {
  var ajaxReqs = [ajax];

  it('should attach correctly', function (done) {
    app.client.saveAjaxForRevision(ajaxReqs, sketchId, revision.get('id'), function (err) {
      (err === null).should.be.true;

      done();
    });
  });

  it('should retrive correctly', function (done) {
    app.client.loadAjaxForRevision(sketchId, revision.get('id'), function (err, reqs) {
      (err === null).should.be.true;
      reqs.length.should.equal(ajaxReqs.length);

      ajaxReqs.every(function (ajax) {
        return ajaxReqs.some(function (candidate) {
          return candidate.get('id') === ajax.get('id');
        });
      }).should.be.true;

      done();
    });
  });
});