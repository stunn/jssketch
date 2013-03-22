define(
  ['application', 'models/model'],
  function (application, Model)
  {
    var LibraryVM = new Model({
      properties: {
        id: {
          type: "number",
          updateable: false,
          required: true
        },
        name: {
          type: "string",
          updateable: false,
          required: true
        },
        version: {
          type: "string",
          updateable: false,
          required: true
        },
        colour: {
          type: "string",
          updateable: false,
          required: true
        }
      },
      collections: {
        dependsOn: {
          validator: function (el) {
            return (el instanceof LibraryVM);
          }
        }
      }
    });

    var LibraryListVM = new Model({
      properties: {
        name: {
          type: "string",
          updateable: false,
          required: true
        }
      },
      collections: {
        libraries: LibraryVM
      }
    });

    return {
      LibraryListVM: LibraryListVM,
      LibraryVM: LibraryVM,
    };
  }
);
