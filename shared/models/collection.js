define(function ()  {
  /**
   * As a shortcut, "prefs" can be the object we want to collect, as well as
   * the normal options object.
   */
  function Collection(prefs) {
    switch (typeof prefs) {
      case "function":
        this._type = prefs;
        break;
      case "object":
        if (prefs !== "null") {
          this._type = prefs.type; // or undefined
          this._validator = prefs.validator;

          break;
        }
      default:
        throw new Error('Collection must be passed either a settings object or a Constructor');
    }

    if (typeof this._validator !== "function") {
      this._validator = function () {
        return true;
      };
    }

    this.length = 0;
  }

  Collection.prototype = new Array;

  Collection.prototype.add = Collection.prototype.push = function (instance) {
    if (this._type && !(instance instanceof this._type) || this._validator(instance) === false) {
      throw new TypeError("Cannot add element to collection; it does not validate");
    }

    // Otherwise we're good.
    this[this.length++] = instance;
    return this.length;
  };

  Collection.prototype.remove = function (el) {
    if (typeof el === "number") {
      return this.splice.call(this, i, 0)[0];
    } else {
      for (var i=0;i<this.length;i++) {
        if (this[i] === el) {
          return this.remove(i);
        }
      }
    }
  };

  Collection.prototype.id = function (id) {
    // This is a shortcut for probably the most common form of ID
    if (typeof id === "number" && id - 1 < this.length && this[id - 1].id === id) {
      return this[id - 1];
    }

    // Otherwise lets enumerate over each element
    for (var i=0;i<this.length;i++) {
      if (this[i].id === id) {
        return this[i];
      }
    }

    return null;
  };

  return Collection;
});