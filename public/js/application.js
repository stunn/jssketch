var dmHelper = require('./helpers/dm');

module.exports = {
  dm: dmHelper.fromSerializedForm({
    css: Application.css,
    js: Application.js
  }),
  doctypes: Application.doctypes
};

jQuery.extend(Application, module.exports);