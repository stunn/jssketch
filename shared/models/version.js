define(['models/dependency', 'models/model', 'require'], function (Dependency, Model, require) {
  return new Model({
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
          if (!(el instanceof require('models/library'))) {
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
});