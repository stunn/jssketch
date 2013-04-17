var broker = require('../lib/broker');
var Collection = broker.load('models/collection');

describe('Collection', function () {
  var collection = new Collection(Object);
  var el = {};

  it('should fire for each new element added', function () {
    var fired = 0;

    collection.on('add', function (element) {
      fired++;
    });

    collection.add(el, {});
    fired.should.equal(2);
  });

  it('should fire event on removed element', function () {
    var fired = false;

    collection.on('remove', function (element) {
      el.should.equal(element);
      fired = true;
    });

    collection.remove(el);
    fired.should.be.true;
  });
});