define(
  ['librarymanager/models', 'librarymanager/views', 'application', 'jquery'],
  function (models, views, app, jQuery)
  {
    function Presenter(domParent)
    {
      // Setup our library management lists. Hardcoding these as they're not 
      // gunna change (famous last words).
      this.libLists = {
        js: new LibraryListVM({ name: "js" }),
        css: new LibraryListVM({ name: "css" })
      };

      // Build out list views, and simple behaviours.
      Object.keys(this.libLists).forEach(function (v) {
        var libListView = new LibraryListView();
        $(domParent).append(libListView.render());

        this.v.libraries.on('add', function (libVM) {
          var libView = new LibraryView(libVM);
          libListView.appendItem(libVM, libView.render());
        });

        this.v.libraries.on('remove', function (libVM) {
          libListView.removeItem(libVM);
        });
      }, this.libLists);
    }

    Presenter.prototype.loadFromJSON = function (json) {
      // Assemble LibraryVMs.
      json.forEach(function (v, k) {
        // Resolve the library reference. If we can't, log and give up.
        var version = app.dm.getLibraryVersion(v.type, v.library, v.id);
        if (typeof version === "undefined") {
          log(
            'Unable to resolve library: type ' + v.type + ', lib ' +
            v.library + ', version ' + v.id + '.');
        }

        var libvm = new LibraryVM({
          id: version.get('library').get('id'),
          name: version.get('library').get('name'),
          version: version.get('name'),
          color: 'FF0000'
        });

        // Add in to the appropriate library list.
        this.libLists[v.type].libraries.add(libvm);
      });
    };
  }
);
