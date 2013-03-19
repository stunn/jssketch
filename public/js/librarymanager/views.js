define(['handlebars', 'jquery'], function (Handlebars, jQuery) {
  var libraryListViewTpl = Handlebars.compile($('#library-list-tpl').html());

  function LibraryListView()
  {
    this.$el = $(jQuery.parseHTML(libraryViewTpl()));
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
      colour: library.get('colour')
    })));
  }

  LibraryView.prototype.render = function () {
    return this.$el;
  };

  var dependencyViewTpl = Handlebars.compile($('#dependency-tpl').html());

  function DependencyView(dependency)
  {
    this.dependency = dependency;
    this.$el = $(jQuery.parseHTML(dependencyViewTpl({
      name: library.get('name'),
      version: library.get('version'),
      refTo: library.get('refTo')
    })));
  }

  DependencyView.prototype.render = function () {
    return this.$el;
  }
});
