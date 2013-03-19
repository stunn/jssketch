define(['module', 'helpers/dm'], function (module, dmHelper) {
  var config = module.config();

  return {
    dm: dmHelper.fromSerializedForm({
      css: config.css,
      js: config.js
    }),
    doctypes: config.doctypes
  };
});
