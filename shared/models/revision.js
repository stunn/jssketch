define(['models/model', 'models/asset'], function (Model, Asset) {
  return {
    init: function (doctypes) {
      return new Model({
        properties: {
          id: {
            type: "number",
            updateable: false
          },
          javascript: {
            type: "string",
            updateable: true,
            required: true,
            fallback: ""
          },
          css: {
            type: "string",
            updateable: true,
            required: true,
            fallback: ""
          },
          html: {
            type: "string",
            updateable: true,
            required: true,
            fallback: ""
          },
          doctype: {
            type: "string",
            updateable: "true",
            required: true,
            fallback: "1",
            validator: function (val) {
              if (!doctypes.hasOwnProperty(val)) {
                return "Invalid doctype provided";
              }

              return true;
            }
          }
        },

        // TODO: Decide whether its by-design if assets can be added multiple times.
        collections: {
          jsAssets: Asset,
          cssAssets: Asset
        }
      });
    }
  };
});