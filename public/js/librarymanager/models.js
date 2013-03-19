define(
  ['application', 'models/model', 'models/version'],
  function (application, Model, Version)
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
        dependsOn: Version
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

    var DependencyVM = new Model({
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
        refTo: {
          type: Version,
          updateable: false,
          required: false,
          fallback: null
        }
      }
    });

    return {
      LibraryListVM: LibraryListVM
    };
  }
);
