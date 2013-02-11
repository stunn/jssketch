var Dependency = require('./dependency');
var Model = require('./model');

module.exports = new Model({
  properties: {
    id: {
      type: "string",
      updateable: false,
      required: true
    },
    name: {
      type: "string",
      updateable: false,
      required: true
    },
    url: {
      type: "string",
      updateable: false,
      required: true
    },
    library: {
      validator: function (el) {
        if (!(el instanceof require('./library'))) {
          return "Version does not belong to a library";
        }

        return true;
      },
      updateable: false,
      required: false
    }
  },

  collections: {
    "dependencies": Dependency
  }
});