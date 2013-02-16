module.exports = function (Handlebars) {
  (function () {

    function prefix(host, port, path) {
      if (path[0] === "/" || /^https?:\/\//.test(path)) {
        return path;
      }

      return 'http://' + host + (port === 80 ? '' : (':' + port)) + '/' + path;
    }

    function prepArgs(callback) {
      return function () {
        var configProvided = true;
        var config = arguments[arguments.length - 2];
        var path;

        if (typeof config !== "object") {
          configProvided = false;
          config = this.settings;
        }

        path = Array.prototype.slice.call(arguments, 0, (configProvided ? - 2 : - 1)).join("/");

        return new Handlebars.SafeString(callback.call(this, path, config));
      }
    };

    Handlebars.registerHelper('base', prepArgs(function (path, config) {
      return prefix(config.base, config.port, path);
    }));

    Handlebars.registerHelper('jail', prepArgs(function (path, config) {
      return prefix(config.jail, config.port, path);
    }));

  }());

  (function () {
    var preview = require('fs').readFileSync(__dirname + '/../views/preview.hbs', 'utf8').replace(/<\/script>/g, '<\\/script>');

    Handlebars.registerPartial('preview', function () {
      return preview;
    });
  }());
};