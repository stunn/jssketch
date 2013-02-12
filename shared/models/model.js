define(['models/collection'], function (Collection) {
  /*
   * This is the Constructor that all Models will extend. Basically, the inheritance
   * chain will be:
   *
   * (Model Instance) -> Model -> Base
   */
  function Base() {

  }

  /**
   * Updates multiple properties of the model at once, by passing a map of
   * attributes: values as the first parameter. Which of the object keys are applied
   * to the model can be specified using the optional second and third parameters.
   *
   * @param obj: A map of property: values to update
   * @param which: An optional array of properties which will be taken from obj.
   *        if this is left unspecified, only the properties which are updateable
   *        will be updated.
   * @param exclusive: By default, only the properties specified in "which" will be
   *        set. Set exclusive to true to set only the properties which do not appear
   *        in which.
   * @return self
   */
  Base.prototype.update = function (obj, which, exclusive) {
    var isAccepted = (function () {
      if (arguments.length > 1) {
        if (which instanceof Array) {
          return function (key) {
            var exists = which.indexOf(key) >= 0;

            return exclusive ? !exists : exists;
          };
        } else {
          throw new Error('update() expects 2nd parameter to be an array');
        }
      } else {
        var props = this._model.properties;

        return function (key) {
          return props.hasOwnProperty(key) && props[key].updateable;
        }
      }
    }).apply(this, arguments);

    Object.keys(obj).forEach(function (key) {
      if (this._properties.hasOwnProperty(key) && isAccepted(key)) {
        this[key] = obj[key];
      }
    }, this);

    return this;
  }

  /**
   * Validates the Model instance. If a profile is provided as the first parameter
   * the properties are validated according to that profile. If no profile is provided,
   * the properties are validated according to the options passed when the model was
   * defined.
   *
   * This is designed to be useful if you have different validation requirements for
   * different parts of your application; e.g. you can validate a "Customer" according
   * to one set of requirements in one part of your app, and by another set of requirements
   * in another part.
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

    var properties = this._properties;

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
   * Returns the JSON representation of the object; which are it's properties.
   *
   * @see https://developer.mozilla.org/en/docs/JSON#toJSON()_method
   * @return Object which represents the JSON representation of this model instance.
   */
  Base.prototype.toJSON = function () {
    // TODO: This should probably return a copy of the _properties;
    // utils.extend({}, this._properties) would support this, but utils isn't currently
    // available as a AMD module.
    return this._properties;
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
    if (typeof model.collections !== "object") {
      model.collections = {};
    }

    function Constructor(properties) {
      // _properties is where the actual properties are stored; not on the Model
      // itself.
      Object.defineProperty(this, '_properties', {
        enumerable: false,
        value: {}
      });

      // Define a setter and getter for each property. Note that no validation
      // is done on the setting; that's in validate(). The only magic that set
      // does it set the property to its default value, when it is set to undefined.
      Object.keys(model.properties).forEach(function (key) {
        Object.defineProperty(this, key, {
          enumerable: true,
          get: function () {
            return this._properties[key];
          },
          set: function (val) {
            if (typeof val === "undefined") {
              val = model.properties[key].fallback;
            }

            this._properties[key] = val;
          }
        });

        this[key] = undefined;
      }, this);

      // Establish collections
      Object.keys(model.collections).forEach(function (key) {
        Object.defineProperty(this, key, {
          value: new Collection(model.collections[key]),
          writeable: false,
          enumerable: false
        });
      }, this);

      // Constructor accepts initial state of object; set the properties here.
      if (typeof properties === "object") {
        this.update(properties, [], true);
      }

      Object.seal(this);
    }

    Constructor.prototype = new Base;
    Constructor.prototype._model = model;

    return Constructor;
  };
});