define(['models/dependency', 'models/library', 'models/version'], function (Dependency, Library, Version) {
  /**
   * The DependancyManager provides an easy to use API to access, parse, and create
   * CSS, JS and user specified Libraries, Versions and to track Dependancies.
   *
   * A DependancyManager should be passed an object which maps types to a listing of
   * libaries, versions and depandancies, as demonstrated in the example JSON file.
   *
   * The DM will then parse this parsed JSON structure into instances of Libraries,
   * Versions and Dependancy model instances, and validate the original structure.
   *
   * See the DM API methods, which makes the Libraries, Versions and Dependancies
   * easier to traverse.
   *
   * @param libraries: An object which maps type names against an array of
   *        libraries included in that type.
   * @constructor
   */
  function DependencyManager(libraries) {
    this._libraries = this._parse(libraries);
  }

  /**
   * Internal method called by constructor to turn the provided parsed JSON structure
   * into actual Model instances, and to validate the format.
   *
   * @param types: The value passed to DM as "libraries"
   * @return: An object which maps types to an array of Library model instances.
   */
  DependencyManager.prototype._parse = function (types) {
    var ret = {};

    Object.keys(types).forEach(function (type) {
      var libraries = ret[type] = {};

      types[type].forEach(function (libraryRep) {
        var library = new Library(libraryRep);

        library.type = type;

        if (libraries.hasOwnProperty(library.id)) {
          throw new Error(type + ' already contains a library with ID ' + library.id);
        } else {
          libraries[library.id] = library;
        }

        // Now we setup the versions.
        libraryRep.versions.forEach(function (versionRep) {
          var version = new Version(versionRep);

          version.library = library;

          library.versions.add(version);

          // Set this version as the defaultVersion of the library if the IDs match
          if (libraryRep.defaultVersion === version.id) {
            library.defaultVersion = version;
          }
        });

        // If we get this far and there is no defaultVersion set, the defaultVersion
        // points to a non-existent ID in the config; throw an error.
        if (!library.defaultVersion) {
          throw new Error(library.name + ' does not have a defaultVersion specified');
        }
      });
    });

    // Now we need to do the dependancies. This needs to be done afterwards as
    // dependancies could otherwise include versions/ types which haven't been
    // parsed yet, and it was easier to do it this way than come up with a more
    // complicated recursive initializer shin-dig.
    Object.keys(types).forEach(function (type) {
      types[type].forEach(function (libraryRep) {
        libraryRep.versions.forEach(function (versionRep) {
          versionRep.dependencies.forEach(function (dependencyRep) {
            var library = (ret[dependencyRep.type] || {})[dependencyRep.library];
            var version = ret[type][libraryRep.id].versions.id(versionRep.id);
            var dependency = new Dependency(dependencyRep);
            var min = dependencyRep.minValue;
            var max = dependencyRep.maxValue;

            if (typeof library === "undefined") {
              throw new Error('Library with ID of ' + dependencyRep.id
                + ' does not exist for type ' + dependencyRep.type);
            }

            if (typeof version === "undefined") {
              throw new Error('Sanity Check Failed: Version not loaded');
            }

            library.versions.reduce(function (prev, curr, i, arr) {
              if (curr.id === min) {
                prev = true;
              }

              if (prev) {
                dependency.versions.add(curr);
              }

              if (curr.id === max) {
                prev = false;
              }

              return prev;
            }, !min);

            if (dependency.versions.length) {
              version.dependencies.add(dependency);
            } else {
              throw new Error('minValue and maxValue combination does not match and versions in ' + version.name);
            }
          });
        });
      });
    });

    return ret;
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
    if (typeof id === "string" && /^http(s)?:\/\/\S+$/.test(id)) {
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
  }

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
  }

  /**
   * Returns the library of the type give, with the ID provided.
   *
   * @param type The type the library is (CSS/JS etc).
   * @param id The id of the library
   * @return The library, or undefined if non existed
   */
  DependencyManager.prototype.getLibrary = function (type, id) {
    var type = this._libraries[type];

    if (typeof type === "object" && type.hasOwnProperty(id)) {
      return type[id];
    }
  }

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
        if (versions[i].id === id) {
          return versions[i];
        }
      }
    }
  }

  return {
    init: function (libraries) {
      if (typeof libraries !== "object" || libraries === null) {
        throw new Error('libraries must be a valid object');
      }

      return new DependencyManager(libraries);
    }
  };
});