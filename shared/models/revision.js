var Model = require('./model');
var Asset =require('./asset');

module.exports = new Model({
  properties: {
    id: {
      type: 'number',
      updateable: false
    },
    javascript: {
      type: 'string',
      updateable: true,
      required: true,
      fallback: ''
    },
    css: {
      type: 'string',
      updateable: true,
      required: true,
      fallback: ''
    },
    html: {
      type: 'string',
      updateable: true,
      required: true,
      fallback: ''
    },
    doctype: {
      type: 'string',
      updateable: true,
      required: true,
      fallback: '1'
    },
    createdAt: {
      type: Date,
      updateable: false,
      required: false
    },
    parentSketchId: {
      type: 'string',
      updateable: true,
      required: false
    },
    parentRevisionId: {
      type: 'number',
      updateable: true,
      required: false
    }
  },

  // TODO: Decide whether its by-design if assets can be added multiple times.
  collections: {
    jsAssets: Asset,
    cssAssets: Asset
  }
});