var dmHelper = require('./helpers/dm');

module.exports = {
  dm: dmHelper.fromSerializedForm({
    css: jsSketch.css,
    js: jsSketch.js
  }),
  doctypes: jsSketch.doctypes
};

jQuery.extend(jsSketch, module.exports);