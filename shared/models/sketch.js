define(['models/model'], function (Model) {
  return new Model({
    properties: {
      id: {
        type: "string",
        updateable: false
      }
    }
  });
});