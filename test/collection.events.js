var broker = require('../lib/broker');
var Collection = broker.load('models/collection');
var should = require('should');

describe('Collection Events', function () {
  var collection = new Collection(Object);
  var el = {};
  var fired = 0;

  it('should pass new element', function () {
    collection.on('add', function (element) {
      el.should.equal(element);
      fired++;
    });

    collection.add(el);
  });

  it('should pass removed element', function () {
    collection.on('remove', function (element) {
      el.should.equal(element);
      fired++;
    });

    collection.remove(el);
  });


  it('should have fired twice', function () {
    fired.should.equal(2);
  });
});