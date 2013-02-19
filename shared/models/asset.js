define(['models/version', 'models/model'], function (Version, Model) {
  var Constructor = new Model({
    properties: {
      version: {
        required: true,
        type: Version
      },
      parent: {
        required: false,
        type: Version
      }
    }
  });

  Constructor.prototype.getType = function () {
    var library = this.get('version').get('library');

    return (typeof library === "undefined" ? "user" : library.get('type'));
  }

  return Constructor;
});