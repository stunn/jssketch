var broker = require('../lib/broker');
var Collection = broker.load('models/collection');

describe('Collection', function () {
  it('should fire for each new element added', function () {
    var collection = new Collection(Object);
    var fired = 0;

    collection.on('add', function (element) {
      fired++;
    });

    collection.add({}, {});
    fired.should.equal(2);
  });

  it('should fire event on removed element', function () {
    var collection = new Collection(Object);
    var fired = false;
    var el = {};

    collection.on('remove', function (element) {
      el.should.equal(element);
      fired = true;
    });

    collection.add(el);
    collection.remove(el);
    fired.should.be.true;
  });

  it('should clear when calling empty()', function () {
    var collection = new Collection(Object);

    collection.add({}, {});
    collection.empty();
    Number(0).should.equal(collection.length);
  });
});