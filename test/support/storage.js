module.exports.run = function (app) {
  var dm = app.client.dm;
  var utils = require('utils');
  var Ajax = require('../shared/models/ajax');
  var Revision = require('../shared/models/revision');
  var revisionHelper = require('../shared/helpers/revision');

  function createRevision(opts) {
    var revision = new Revision();

    revisionHelper.updateRevisionFromHash(revision, app.config.get('doctypes'), dm, utils.extend({
      javascript: 'alert(\'Hello\');',
      css: 'body { background: red; }',
      html: '<h1>Hello</h1>',
      doctype: '1',
      parentSketchId: '12345',
      parentRevisionId: 1,
      js_assets: [],
      css_assets: [],
      ajax: []
    }, opts || {}));

    return revision;
  }

  function createSavedRevision(done, opts) {
    var revision = createRevision(opts);

    app.client.saveRevision(revision, function (err, revision, sid) {
      done(revision, sid);
    });
  }

  function createAjax(opts) {
    return new Ajax(utils.extend({
      payload: JSON.stringify({
        test: 4
      }),
      type: 'json'
    }, opts || {}));
  }

  function createSavedAjax(done, opts) {
    var ajax = createAjax(opts);

    app.client.saveAjax(ajax, function (err, ajax) {
      done(ajax);
    });
  }

  describe('AJAX', function () {
    var ajax = createAjax();

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

    it('should handle invalid IDs correctly', function (done) {
      app.client.loadAjax('iii', function (err) {
        (err === null).should.be.false;
        false.should.equal(err.isApplication);

        done();
      });
    });
  });

  describe('Revision', function () {
    var sketchId;
    var revision = new Revision();
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

    it('should handle non-existant revisions', function (done) {
      app.client.loadRevision(100, sketchId, function (err) {
        (err === null).should.be.false;
        false.should.equal(err.isApplication);

        done();
      });
    });

    it('should handle non-existant sketchs', function (done) {
      app.client.loadRevision(1, 'iiiii', function (err) {
        (err === null).should.be.false;
        false.should.equal(err.isApplication);

        done();
      });
    });
  });

  describe('AJAX Revision', function () {
    var ajaxReqs = [];
    var revision;
    var sketchId;

    before(function (done) {
      createSavedRevision(function (rev, sid) {
        revision = rev;
        sketchId = sid;

        done();
      });
    });

    before(function (done) {
      createSavedAjax(function (a) {
        ajaxReqs = [a];

        done();
      });
    });

    it('should retrieve empty ones correctly', function (done) {
      app.client.loadAjaxForRevision(sketchId, revision.get('id'), function (err, reqs) {
        (err === null).should.be.true;
        reqs.should.be.an.instanceOf(Array);

        done();
      });
    });

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
};