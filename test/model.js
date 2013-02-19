var broker = require('../lib/broker');
var Model = broker.load('models/model');
var should = require('should');

describe('Model', function () {
  var Base = new Model({
    properties: {
      id: {
        type: "number",
        updateable: false,
        fallback: -1,
        validator: function (val) {
          if (!(10 <= val && 10 <= 20)) {
            return "Value must be in range";
          }
        }
      },

      array: {
        required: true,
        type: Array
      }
    }
  });

  it('should accept updatable at start', function () {
    var instance = new Base({
      id: 4
    });

    instance.get('id').should.be.equal(4);
  });

  it('should accept updatable via direct set', function () {
    var instance = new Base;

    instance.set('id', 4);
    instance.get('id').should.be.equal(4);
  });

  it('should not accept updatable via set with hash', function () {
    var instance = new Base;

    instance.set({
      id: 4
    });

    instance.get('id').should.be.equal(-1);
  });

  it('should not validate wrong type', function () {
    var instance = new Base({
      id: 'string',
      array: []
    });

    instance.validate().should.be.a('string');
  });

  it('should not validate validator function', function () {
    var instance = new Base({
      id: 4,
      array: []
    });

    instance.validate().should.be.a('string');
  });

  it('should require required values', function () {
    var instance = new Base({
      id: 15
    });

    instance.validate().should.be.a('string');
  });

  it('should validate', function () {
    var instance = new Base({
      id: 15,
      array: []
    });

    instance.validate().should.not.be.a('string');
  });
});