define(['lib/dm', 'models/dependency', 'models/library', 'models/version'], function (DependencyManager, Dependency, Library, Version) {

  function fromSerializedForm(structure) {
    var dm = new DependencyManager;

    function findOrCreateLibrary(type, id) {
      var existing = dm.getLibrary(type, id);

      if (existing) {
        return existing;
      } else {
        var library = new Library;
        var libraryRep = (function () {
          var libraries = structure[type];

          if (Array.isArray(libraries)) {
            for (var i=0;i<libraries.length;i++) {
              if (libraries[i].id === id) {
                return libraries[i];
              }
            }
          }

          throw new Error('No Library of type ' + type + ' with ID of ' + id + ' exists!');
        }());

        library.set('id', id);
        library.set('name', libraryRep.name);
        library.set('type', type);

        libraryRep.versions.forEach(function (versionRep) {
          var version = new Version(versionRep);
          version.set('library', library);

          if (versionRep.id === libraryRep.defaultVersion) {
            library.set('defaultVersion', version);
          }

          if (version.validate() === true) {
            library.versions.add(version);
          } else {
            throw new Error('Version for ' + library.name + ' with ID of ' +
                             version.id + ' could not validate because "' +
                             version.validate() + '"');
          }
        });

        if (library.validate() === true) {
          dm.addLibrary(library);
        } else {
          throw new Error('Library of type ' + type + ' with ID of ' +
                           id + ' could not validate because "' +
                           library.validate() + '"');
        }

        libraryRep.versions.forEach(function (versionRep) {
          var version = library.versions.id(versionRep.id);

          versionRep.dependencies.forEach(function (dependencyRep) {
            var libraryDependency = findOrCreateLibrary(dependencyRep.type, dependencyRep.library);
            var dependency = new Dependency;
            var minVersion = dependencyRep.minVersion;
            var maxVersion = dependencyRep.maxVersion;

            dependency.set('library', libraryDependency);
            dependency.set('required', dependencyRep.required);
            dependency.set('isExplicitMinVersion', !!minVersion);
            dependency.set('isExplicitMaxVersion', !!maxVersion);

            libraryDependency.versions.reduce(function (prev, curr) {
              if (curr.get('id') === minVersion) {
                prev = true;
              }

              if (prev) {
                dependency.versions.add(curr);
                console.log("Adding version " + curr.get('id') + " where minVersion is " + minVersion + " and maxVersion is " + maxVersion + " for " + library.get('type') + ' ' + library.get('id'));
              }

              if (curr.get('id') === maxVersion) {
                prev = false;
              }

              return prev;
            }, !minVersion);

            if (dependency.validate() === true) {
              version.dependencies.add(dependency);
            } else {
              throw new Error('Dependency for version ' + version.id + ' of ' +
                               library.name + ' could not validate because "' +
                               dependency.validate() + '"');
            }
          });
        });

        return library;
      };
    };

    Object.keys(structure).forEach(function (type) {
      structure[type].forEach(function (libraryRep) {
        findOrCreateLibrary(type, libraryRep.id);
      });
    });

    return dm;
  };

  function toSerializedForm(dm) {
    var types = {};

    dm.getRegisteredTypes().forEach(function (type) {
      var curr = types[type] = [];

      dm.getLibraries(type).forEach(function (library) {
        var libraryRep = library.toJSON();

        delete libraryRep.type;

        libraryRep.defaultVersion = library.get('defaultVersion').get('id');
        libraryRep.versions = library.versions.map(function (version) {
          var versionRep = version.toJSON();

          delete versionRep.library;

          versionRep.dependencies = version.dependencies.map(function (dependency) {
            var dependencyRep = {};
            var libraryDependency = dependency.get('library');

            dependencyRep.required = dependency.get('required');
            dependencyRep.type = libraryDependency.get('type');
            dependencyRep.library = libraryDependency.get('id');

            if (dependency.get('isExplicitMinVersion')) {
              dependencyRep.minVersion = dependency.versions[0].get('id');
            }

            if (dependency.get('isExplicitMaxVersion')) {
              dependencyRep.maxVersion = dependency.versions[dependency.versions.length - 1].get('id');
            }

            return dependencyRep;
          });

          return versionRep;
        });

        curr.push(libraryRep);
      });
    });

    return types;
  };

  /**
   *
   * {
   *   js: [{
   *     "id": 1,
   *     "name": "jQuery",
   *     "defaultVersion": "1",
   *     "versions": [{
   *       "id": "1",
   *       "name": "1.9.0",
   *       "url": "http://code.jquery.com/jquery-1.9.0.js",
   *       "dependencies": [{
   *         "type": "css",
   *         "library": 2,
   *         "minVersion": "1",
   *         "maxVersion": "1",
   *         "required": false
   *       }]
   *     }]
   *   }],
   *
   *   css: []
   * }
   *
   */

  return {
    /**
     * Accepts an Object which is in the structure shown above. The method will
     * return a DependencyManager instance which includes the types and libraries
     * represented by this Object representation.
     *
     * @param Object in the format above
     * @return DependencyManager containing types and libraries
     * @throws Any validation errors which occur whilst parsing the representation
     */
    fromSerializedForm: fromSerializedForm,

    /**
     * Accepts a DependencyManager and returns an Object whose structure is like
     * that shown above, which is an accurate representation of the types and
     * libraries contained within the DependencyManager
     *
     * @param DependencyManager containing types and libraries
     * @return Object in the format above
     * @throws Any validation errors which occur whilst creating the representation
     */
    toSerializedForm: toSerializedForm
  };
});