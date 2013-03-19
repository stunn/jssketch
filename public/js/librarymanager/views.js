define(['handlebars', 'jquery'], function (Handlebars, jQuery) {
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
