var broker = require('../lib/broker');
var Collection = broker.load('models/collection');
var should = require('should');

describe('Collection Events', function () {
  var collection = new Collection(Object);
  var el = {};

  it('should equal', function () {

    collection.on('add', function (element) {
      el.should.equal(element);
    });

    collection.add(el);
  });

  it('should equal', function () {
    var el = {};

    collection.on('remove', function (element) {
      el.should.equal(element);
    });

    collection.remove(el);
  });
});