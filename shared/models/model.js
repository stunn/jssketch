define(['models/collection'], function (Collection) {

  var defineProperty = (function () {
    if (Object.defineProperty) {
      return Object.defineProperty.bind(Object);
    } else {
      return function (obj, key, descriptor) {
        obj[key] = descriptor.value;
      };
    }
  }());

  /*
   * This is the Constructor that all Models will extend. Basically, the inheritance
   * chain will be:
   *
   * (Model Instance) -> Model -> Base
   */
  function Base() {

  }

  /**
   * Validates the Model instance. If a profile is provided as the first
   * parameter the properties are validated according to that profile. If no
   * profile is provided, the properties are validated according to the options
   * passed when the model was defined.
   *
   * This is designed to be useful if you have different validation requirements
   * for different parts of your application; e.g. you can validate a "Customer"
   * according to one set of requirements in one part of your app, and by another
   * set of requirements in another part.
   *
   * {
   *   propName: {
   *     required: false,
   *     type: "string",
   *     validator: function () {
   *       return true;
   *     }
   *   },
   *   anotherPropName: {
   *     // same as above
   *   }
   * }
   *
   * required checks the property has a value other than "undefined". Default: false
   *
   * type checks against the values "typeof" result if "type" is a "string", or if
   * type is a "function", "instanceof" is used to compare the value against the type.
   *
   * validator performs arbritary validation. Return an error message as a string
   * if the validation fails, or some other value otherwise. First parameter to the
   * validator function is the value, second is the property name.
   *
   * @param profile: Optional as specified above. Format of profile is given as an
   *        example above.
   * @return true if validation was successful
   * @throws Error describing a validation error.
   */
  Base.prototype.validate = function (profile) {
    if (arguments.length == 0) {
      profile = this._model.properties;
    } else if (typeof profile !== "object" || profile === null) {
      throw new Error('Profile passed to validate() must be an object');
    }

    var properties = this.properties;

    function error(reason) {
      return reason;
    }

    // Standard for as we need to break out of it when an error occurs.
    for (var key in profile) {
      if (profile.hasOwnProperty(key)) {
        var settings = profile[key];

        if (typeof properties[key] === "undefined") {
          // Check required
          if (settings.required) {
            return error(key + ' is required.');
          }
        } else {
          // Check type
          switch (typeof settings.type) {
            case "undefined":
              break;
            case "string":
              if (typeof properties[key] !== settings.type) {
                return error(key + ' must be a ' + settings.type);
              }

              break;
            case "function":
              if (!(properties[key] instanceof settings.type)) {
                return error(key + ' is not a instance of the correct type');
              }

              break;
            default:
              throw new Error('type option for ' + key + ' is expected to be a string or function');
          }

          // Check validator()
          if (typeof settings.validator === "function") {
            var result = settings.validator.call(this, properties[key], key);

            if (typeof result === "string") {
              return error(result);
            }
          }
        }
      }
    }

    return true;
  }

  /**
   * Updates either a single property on the object, or a hash of attributes.
   *
   * If a single property is to be updated, the first parameter should be the name
   * of the attribute, and the second should be the new value. The third parameter
   * defaults to false, and is whether the "change" event for the update should be
   * supressed.
   *
   * In the second case, the first parameter should be the hash which maps properties
   * to values. Properties which do not exist on this Model will be ignored. The
   * second parameter is an optional array, which provides a "view" of which
   * parameters from the given hash will be used. By default, all will be. The
   * array overrrides any "updateable" property on the model. The final parameter
   * is "silent", which behaves exactly as it does for the first use case.
   *
   * @param key: Name of value to update, or a hash of multiple values.
   * @param value: The value to update to, or an array of which values to take
   *        from the hash.
   * @param silent: Whether the update will fire the "change" event on the model
   * @return self
   */
  Base.prototype.set = function (key, value, silent) {
    var descriptors = this._model.properties;

    if (typeof key === "object") {
      var hash = key;
      var isSilent = silent || (typeof value === "boolean" ? value : false);
      var isAccepted = (function () {
        if (Array.isArray(value)) {
          return function (key) {
            return value.indexOf(key) >= 0;
          };
        } else {
          var props = descriptors;

          return function (key) {
            return props.hasOwnProperty(key) && props[key].updateable;
          }
        }
      }).apply(this, arguments);

      Object.keys(hash).forEach(function (key) {
        if (descriptors.hasOwnProperty(key) && isAccepted(key)) {
          this.set(key, hash[key], true);

          silent || this.trigger('change', key, true);
        }
      }, this);

      silent && this.trigger('change', '*');
    } else {
      var descriptor = descriptors[key];

      if (typeof descriptor === "undefined") {
        throw new Error('Model does not have a property called ' + key);
      }

      if (typeof value === "undefined") {
        value = descriptor.fallback;
      }

      if (this.properties[key] !== value) {
        this.properties[key] = value;

        silent || this.trigger('change', key);
      }
    }

    return this;
  };

  /**
   * Sets the given property to it's fallback value, or "undefined" if none was
   * given.
   *
   * @param key: The property to unset
   * @param silent: Whether the "change" event will fire on the model. Default false.
   * @return self;
   */
  Base.prototype.unset = function (key, silent) {
    this.set(key, undefined, silent);

    return this;
  };

  /**
   * Returns the current value of the "key" property, or "undefined" if the
   * property does not exist.
   *
   * @param key: The parameter to retrieve
   * @return value
   */
  Base.prototype.get = function (key) {
    return this.properties[key];
  };

  /**
   * Attaches an event handler for the "event" event, optionally filtered by the
   * "filter" filter. In practise, the "event" is something generic like "change",
   * and "filter" is something more specific such as the property the change
   * event was fired on.
   *
   * @param event The name of the event we want to subscribe for
   * @param filter Default '*' (i.e. all occurences of the event). Allows us to
   *        optionally filter for only specific types of the event.
   * @param callback The callback function. "this" will be the instance the event
   *        occured on
   * @return self
   */
  Base.prototype.on = function (event, filter, callback) {
    if (typeof filter === "function") {
      callback = filter;
      filter = '*';
    };

    var events = this._events[event] = this._events[event] || {};

    if (!events.hasOwnProperty(filter)) {
      events[filter] = [];
    }

    events[filter].push(callback);

    return this;
  };

  /**
   * Triggers the "event" event on the Model Instance.
   *
   * @param event: The name of the event to trigger
   * @param filter: An optional filter of the event (@see on). Default is '*'
   * @param local: Whether the global '*' event will be supressed. Default is false
   *        this is mainly used internally.
   * @return self
   */
  Base.prototype.trigger = function (event, filter, local) {
    var events = this._events[event] = this._events[event] || {};

    filter = filter || '*';

    if (events.hasOwnProperty(filter)) {
      events[filter].forEach(function (callback) {
        callback.apply(this);
      }, this);
    }

    if (filter !== '*' && !local) {
      this.trigger(event, '*');
    }

    return this;
  };

  /**
   * Returns the JSON representation of the object; which are it's properties.
   *
   * @see https://developer.mozilla.org/en/docs/JSON#toJSON()_method
   * @return Object which represents the JSON representation of this model instance.
   */
  Base.prototype.toJSON = function () {
    // TODO: This should probably return a copy of the properties;
    // utils.extend({}, this.properties) would support this, but utils isn't currently
    // available as a AMD module.
    return this.properties;
  }

  /**
   * Creates a Constructor function for a new model. The settings in the example
   * shown below for the property options are the defaults if left unspecified.
   *
   * {
   *   properties: {
   *     propName: {
   *       required: false,
   *       updateable: true,
   *       type: someType,
   *       validator: function (newValue) {
   *         return true;
   *       }
   *     },
   *     anotherPropName: {
   *       /* same options as above; note all of them are optional.
   *     }
   *   },
   *
   *   collections: {
   *     collectionName: collectionType,
   *     anotherCollection: {
   *       type: collectionType,
   *       validator: function (newItem) {
   *         return true;
   *       }
   *     }
   *   }
   * }
   *
   * @param model: Specifies the properties of the new model. See above for example
   * @return A constructor for the model.
   */
  return function (model) {
    if (typeof model !== "object" && !model.hasOwnProperty('properties')) {
      throw new Error('Model must be provided with properties');
    }

    function Constructor(properties) {
      var descriptors = this._model.properties;

      switch (typeof properties) {
        case "object":
        break;
        case "undefined":
          properties = {};
        break;
        default:
          throw new Error('Properties must be an object, or left undefined');
      }

      defineProperty(this, 'properties', {
        enumerable: false,
        value: {}
      });

      defineProperty(this, '_events', {
        enumerable: false,
        value: {}
      });

      Object.keys(descriptors).forEach(function (key) {
        this.set(key, properties[key], true);
      }, this);

      if (typeof model.collections === "object") {
        Object.keys(model.collections).forEach(function (key) {
          defineProperty(this, key, {
            value: new Collection(model.collections[key]),
            writeable: false,
            enumerable: false
          });
        }, this);
      }

      (typeof Object.seal === "function") && Object.seal(this);
    }

    Constructor.prototype = new Base;
    Constructor.prototype._model = model;

    return Constructor;
  };
});