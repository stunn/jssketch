define(
  ['handlebars', 'jquery', 'helpers/view'],
  function (Handlebars, jQuery, ViewHelpers)
  {
    ViewHelpers(Handlebars);

    var libraryListViewTpl = Handlebars.compile($('#library-list-tpl').html());

    function LibraryListView()
    {
      this.$el = $(jQuery.parseHTML(libraryListViewTpl()));
      this.itemIndex = [];
    }

    LibraryListView.prototype.appendItem = function (key, view) {
      this.itemIndex.push({ key: key, view: view.render() });
      this.$el.append(view.render());
    };

    LibraryListView.prototype.removeItem = function (key) {
      this.itemIndex.some(function (v, k, collection) {
        if (v.key != key) {
          return false;
        }

        v.view.remove(v.view);
        collection.splice(k, 1);
        return true;
      });
    };

    LibraryListView.prototype.render = function () {
      return this.$el;
    };

    var libraryViewTpl = Handlebars.compile($('#library-tpl').html());

    function LibraryView(library)
    {
      this.library = library;
      this.$el = $(jQuery.parseHTML(libraryViewTpl({
        name: library.get('name'),
        version: library.get('version'),
        colour: library.get('colour'),
        dependsOn: library.dependsOn
      })));
      this.$el.data('vm', library);
    }

    LibraryView.prototype.render = function () {
      return this.$el;
    };

    return {
      LibraryListView: LibraryListView,
      LibraryView: LibraryView,
    };
  }
);
