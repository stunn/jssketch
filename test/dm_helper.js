var broker = require('../lib/broker');
var should = require('should');

var dmHelper = broker.load('helpers/dm');
var utils = require('utils');

describe('DependencyManager Helper', function () {
  var obj = {
    js: utils.readJsonFileSync(__dirname + '/../config/js_libraries'),
    css: utils.readJsonFileSync(__dirname + '/../config/css_libraries')
  };
  var dm = dmHelper.fromSerializedForm(obj);

  it('should create valid libraries', function () {
    dm.getLibraries('js').forEach(function (library) {
      library.validate().should.be.true;

      library.versions.forEach(function (version) {
        version.validate().should.be.true;

        version.dependencies.forEach(function (dependency) {
          dependency.validate().should.be.true;
        });
      });
    });
  });

  it('should serialize to be the same value', function () {
    obj.should.eql(dmHelper.toSerializedForm(dm));
  });
});