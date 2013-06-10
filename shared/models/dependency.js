define(['models/model', 'require'], function (Model, require) {
  return new Model({
    properties: {
      required: {
        type: 'boolean',
        updateable: false,
        fallback: true
      },
      isExplicitMinVersion: {
        type: 'boolean',
        required: true
      },
      isExplicitMaxVersion: {
        type: 'boolean',
        required: true
      },
      library: {
        required: true,
        validator: function (el) {
          return el instanceof require('models/library');
        }
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