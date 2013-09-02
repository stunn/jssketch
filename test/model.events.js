var Model = require('../shared/models/model');

describe('Model Events', function () {
  var Base = new Model({
    properties: {
      id: {
        fallback: 12
      },
      name: {

      }
    }
  });

  it('should fire when value changes', function () {
    var instance = new Base();
    var fired = 0;

    instance.on('change', function () {
      fired++;
    });

    instance.on('change', 'id', function () {
      fired++;
    });

    instance.on('change', 'name', function () {
      fired++;
    });

    instance.set('id', 4);
    instance.set('id', 4);

    fired.should.equal(2);
  });

  it('should pass old and new values', function () {
    var instance = new Base();
    var prev = instance.get('id');
    var curr = 24;
    var fired = 0;

    instance.on('change', 'id', function (newVal, oldVal) {
      newVal.should.equal(curr);
      oldVal.should.equal(prev);

      fired++;
    });

    instance.set('id', curr);
    fired.should.equal(1);
  });
});