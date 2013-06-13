/**
 * Viewer model. Holds its collection of tabs.
 */
define(['models/model', 'editortabs/tab'], function (Model, Tab) {
  return new Model({
    properties: {
      current: {
        type: 'string',
        required: true,
        updateable: true
      }
    },
    collections: {
      tabs: {
        type: Tab,
        validator: function (instance) {
          // Prevent adding a tab with an ident matching one already in
          // collection.
          return !this.some(function (other) {
            return other.get('id') === instance.get('id');
          });
        }
      }
    }
  });
});
