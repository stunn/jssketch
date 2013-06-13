var url = require('url');

module.exports = function (Handlebars, config) {
  ['Base', 'Jail'].forEach(function (name) {
    Handlebars.registerHelper(name.toLowerCase(), function () {
      var path = Array.prototype.slice.call(arguments, 0, -1).join('/');

      return new Handlebars.SafeString(config['get' + name + 'Url'](path, true));
    });
  });

  Handlebars.registerHelper('asset', function () {
    var path = Array.prototype.slice.call(arguments, 0, -1).join('/');

    return new Handlebars.SafeString(url.parse(path).protocol ? path : config.getAssetUrl(path, true));
  });

  (function () {
    var preview = require('fs').readFileSync(__dirname + '/../views/preview.hbs', 'utf8').replace(/<\/script>/g, '<\\/script>');

    Handlebars.registerPartial('preview', function () {
      return preview;
    });
  }());
};