define(['models/version'], function (Version) {
  /**
   * The DependancyManager provides an easy to use API to access, parse, and create
   * CSS, JS and user specified Libraries, Versions and to track Dependancies.
   *
   * See the DM API methods, which makes the Libraries, Versions and Dependancies
   * easier to traverse.
   *
   * @constructor
   */
  function DependencyManager() {
    this._libraries = {};
  }

  /**
   * Creates a user-Version (e.g. a Version model for a user-specified CSS/JS asset)
   *
   * The returned Version has its ID and URL set to the URL provided, and it's name
   * is set to the name of the file (e.g. "foo.js" in "http://example.com/blah/foo.js")
   *
   * "parent", and all other fields are "undefined".
   *
   * @param: id: The URL of the asset they're including
   * @return Version instance.
   */
  DependencyManager.prototype.createVersion = function (id) {
    if (typeof id === 'string' && /^http(s)?:\/\/\S+$/.test(id)) {
      return new Version({
        id: id,
        url: id,
        name: (function (str) {
          var pos = str.lastIndexOf('/');

          if (pos === -1 || pos === str.length) {
            str = 0;
          }

          return str.slice(pos);
        }(id))
      });
    }

    return false;
  };

  /**
   * Returns an array of libraries which are of the given type
   *
   * @param type: The type of libraries you want
   * @return An array of types. If type is invalid, an empty array is returned.
   */
  DependencyManager.prototype.getLibraries = function (type) {
    if (this._libraries.hasOwnProperty(type)) {
      return Object.keys(this._libraries[type]).map(function (key) {
        return this[key];
      }, this._libraries[type]);
    }

    return [];
  };

  DependencyManager.prototype.addLibrary = function (library) {
    if (!this._libraries.hasOwnProperty(library.get('type'))) {
      this._libraries[library.get('type')] = {};
    }

    this._libraries[library.get('type')][library.get('id')] = library;
  };

  /**
   * Returns the library of the type give, with the ID provided.
   *
   * @param type The type the library is (CSS/JS etc).
   * @param id The id of the library
   * @return The library, or undefined if non existed
   */
  DependencyManager.prototype.getLibrary = function (type, id) {
    type = this._libraries[type];

    if (typeof type === 'object' && type.hasOwnProperty(id)) {
      return type[id];
    }
  };

  /**
   * Returns a Version Model for the specified type, library & id, or undefined if
   * non exists.
   *
   * @param type: The type the library is from (e.g. "css" or "js").
   * @param library: The id of the library
   * @param id: The id of the version.
   * @return Version model or undefined if not found.
   */
  DependencyManager.prototype.getLibraryVersion = function (type, library, id) {
    var types = this._libraries;

    if (types.hasOwnProperty(type) && types[type].hasOwnProperty(library)) {
      var versions = types[type][library].versions;

      for (var i=0;i<versions.length;i++) {
        if (versions[i].get('id') === id) {
          return versions[i];
        }
      }
    }
  };

  /**
   * Returns an Array of the types which have been registered within the DependencyManager
   *
   * @return array of types
   */
  DependencyManager.prototype.getRegisteredTypes = function () {
    return Object.keys(this._libraries);
  };

  return DependencyManager;
});