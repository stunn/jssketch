var models = require('./models');
var views = require('./views');
var app = require('../application');
var JsonReader = require('./jsonreader');

function handleMoveNested(event, ui)
{
  var $el = ui.item;
  if ($el.parent()[0] == $('#libraries')[0]) {
    var newView = new views.LibraryView($el.data('vm'));
    $el.replaceWith(newView.render());
  }
}

function Presenter(domParent)
{
  // Setup our library management lists. Hardcoding these as they're not
  // gunna change (famous last words).
  this.libLists = {
    js: new models.LibraryListVM({ name: "js" }),
    css: new models.LibraryListVM({ name: "css" })
  };

  this.libListView = new views.LibraryListView();
  $(domParent).append(this.libListView.render());

  // Build out list views, and simple behaviours.
  var that = this; // TODO: Probably change the binding below instead.
  Object.keys(this.libLists).forEach(function (v) {
    this[v].libraries.on('add', function (libVM) {
      var libView = new views.LibraryView(libVM);
      that.libListView.appendItem(libVM, libView);
    });

    this[v].libraries.on('remove', function (libVM) {
      that.libListView.removeItem(libVM);
    });
  }, this.libLists);
}

function get_random_color() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

Presenter.prototype.loadFromJSON = function (json) {
  var reader = new JsonReader(json);
  var libraryList = reader.read();

  libraryList.forEach(function (v) {
    v.set('colour', get_random_color());
  });

  libraryList.forEach(function (v, k) {
    this.libLists['js'].libraries.add(v); // TODO: Make this work.
  }.bind(this));

  // TODO: Bit of a hack - looks like we need to wait for the list to be
  // populated before setting this up.
  $('#libraries').sortable({
    axis: 'y'
  });
};

module.exports = Presenter;