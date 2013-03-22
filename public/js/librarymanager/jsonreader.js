define(
  ['application', 'lib/hashtable', 'librarymanager/models'],
  function (app, HashTable, models)
  {

    /**
     * Read library manager JSON in to models.
     *
     * @author James Stephenson
     */
    function JsonReader(input)
    {
      this.input = input;
      this.table = new HashTable();
    }

    /**
     * Process input JSON, return a model array with dependencies setup
     * properly.
     *
     * @return {LibraryVM[]}
     */
    JsonReader.prototype.read = function () {
      var result = [];

      // Populate the library table.
      this.input.forEach(function (entry) {
        var version = app.dm.getLibraryVersion(
          entry.libraryType,
          entry.libraryId,
          entry.versionId);
        var library = version.get('library');

        var model = new models.LibraryVM({
          id: library.get('id'),
          name: library.get('name'),
          version: version.get('name')
        });

        this.table.add(library.get('id') + version.get('id'), model);
        result.push(model);
      }.bind(this));

      // Resolve dependencies, depth first.
      var pending = this.input.slice(0).reverse();
      while (pending.length > 0) {
        var entry = pending.pop();
        var model = this.table.get(entry.libraryId + entry.versionId);

        if (entry.dependsOn !== null) {
          entry.dependsOn.forEach(function (dependencyEntry) {
            model.dependsOn.add(this.table.get(
                dependencyEntry.libraryId + dependencyEntry.versionId));

            if (dependencyEntry.dependsOn !== null) {
              pending.push(dependencyEntry);
            }
          }.bind(this));
        }
      }

      return result;
    };

    return JsonReader;

  }
);
