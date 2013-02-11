var Version = require('./version');
var Model = require('./model');

module.exports = new Model({
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

module.exports.prototype.getType = function () {
  var library = this.version.library;

  return (typeof library === "undefined" ? "user" : library.type);
}