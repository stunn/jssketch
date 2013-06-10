define(['models/eventable'], function (eventable) {
  /**
   * As a shortcut, 'prefs' can be the object we want to collect, as well as
   * the normal options object.
   */
  function Collection(prefs) {
    switch (typeof prefs) {
    case 'function':
      this._type = prefs;
      break;
    case 'object':
      if (prefs !== 'null') {
        this._type = prefs.type; // or undefined
        this._validator = prefs.validator;

        break;
      }

      /* falls through */
    default:
      throw new Error('Collection must be passed either a settings object or a Constructor');
    }

    if (typeof this._validator !== 'function') {
      this._validator = function () {
        return true;
      };
    }

    this.length = 0;
  }

  /**
   * This adds on() and trigger() functionality
   */
  eventable(Collection);

  Collection.prototype.add = Collection.prototype.push = function () {
    for (var i=0;i<arguments.length;i++) {
      var curr = arguments[i];

      if ((this._type && !(curr instanceof this._type)) || this._validator(curr) === false) {
        throw new TypeError('Cannot add element to collection; it does not validate');
      }

      // Otherwise we're good.
      this[this.length++] = curr;
      this.trigger('add', [curr]);
    }

    return this.length;
  };

  Collection.prototype.remove = function (el) {
    if (typeof el === 'number') {
      var removed = [].splice.call(this, i, 1)[0];

      this.trigger('remove', [removed]);
      return removed;
    } else {
      for (var i=0;i<this.length;i++) {
        if (this[i] === el) {
          return this.remove(i);
        }
      }
    }
  };

  Collection.prototype.empty = function () {
    while (this.length) {
      this.remove(0);
    }
  };

  Collection.prototype.id = function (id) {
    // This is a shortcut for probably the most common form of ID
    if (typeof id === 'number' && id - 1 < this.length && this[id - 1].get('id') === id) {
      return this[id - 1];
    }

    // Otherwise lets enumerate over each element
    for (var i=0;i<this.length;i++) {
      if (this[i].get('id') === id) {
        return this[i];
      }
    }

    return null;
  };

  ['some', 'every', 'forEach', 'reduce', 'reduceRight', 'map'].forEach(function (key) {
    Collection.prototype[key] = Array.prototype[key];
  });

  return Collection;
});