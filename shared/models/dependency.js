define(['models/model', 'require'], function (Model, require) {
  return new Model({
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
          return el instanceof require('models/version');
        }
      }
    }
  });
});