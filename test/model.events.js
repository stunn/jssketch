var broker = require('../lib/broker');
var Model = broker.load('models/model');
var should = require('should');

describe('Model Events', function () {
  var Base = new Model({
    properties: {
      id: {

      },
      name: {

      }
    }
  });

  var instance;

  before(function () {
    instance = new Base;
  });

  it('should fire', function () {
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
});