/**
 * A simple 'tab' model, with a string ident for the tab and a content element.
 */
define(['models/model'], function (Model) {
  return new Model({
    properties: {
      id: {
        type: 'string',
        updateable: false,
        required: true
      },
      contentEl: {
        updateable: false,
        required: true,
        validator: function (value) {
          if (value instanceof jQuery.fn.init) {
            var filtered = value.filter(function () {
              return this.nodeType === 1;
            });
            if (filtered.length === value.length) {
              return true;
            }
          }

          return 'Value must be a jQuery wrap over one or more DOM elements.';
        }
      },
      switchStrategy: {
        type: 'object',
        updateable: false,
        required: true
      }
    },
  });
});
