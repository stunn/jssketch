define(['models/version', 'models/model'], function (Version, Model) {
  return new Model({
    properties: {
      id: {
        type: "number",
        updateable: false
      },
      type: {
        type: "string",
        updateable: false,
        required: true
      },
      name: {
        type: "string",
        updateable: false
      },
      defaultVersion: {
        type: Version,
        updateable: true
      }
    },

    collections: {
      "versions": {
        type: Version,
        validator: function (instance) {
          // Check the URL and ID of the versions are unique
          return !this.some(function (other) {
            return other.id === instance.id || other.url === instance.url;
          });
        }
      }
    }
  });
});