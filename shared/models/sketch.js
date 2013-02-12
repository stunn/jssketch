define(['models/model'], function (Model) {
  return {
    init: function (Revision) {
      return new Model({
        properties: {
          id: {
            type: "string",
            updateable: false
          }
        }
      });
    }
  };
});