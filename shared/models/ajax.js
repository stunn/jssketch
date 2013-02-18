define(['models/model'], function (Model, Asset) {
  return new Model({
    properties: {
      id: {
        type: "number",
        updateable: false
      },
      payload: {
        type: "string",
        fallback: "",
        required: true,
        updateable: true
      },
      type: {
        type: "string",
        required: true,
        updateable: true,
        validator: function (val) {
          if (["json", "xml", "html"].indexOf(val) === -1) {
            return "Invalid type specified";
          }

          return true;
        }
      }
    }
  });
});