var Model = require('./model');

module.exports = new Model({
  properties: {
    required: {
      type: "boolean",
      updateable: false,
      fallback: true
    }
  },

  collections: {
    versions: {
      validator: function (el) {
        return el instanceof require('./version');
      }
    }
  }
});