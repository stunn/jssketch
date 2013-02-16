define(function () {
  return function (Handlebars) {
    Handlebars.registerHelper('rel', function (url) {
      var rel = "";

      switch (url.slice(url.lastIndexOf("."))) {
        case ".css":
          rel = "stylesheet";
        break;
        case ".less":
          rel = "stylesheet/less";
        break;
      }

      return new Handlebars.SafeString(rel);
    });

    Handlebars.registerHelper('jsonify', function (obj) {
      return new Handlebars.SafeString(JSON.stringify(obj));
    });

    Handlebars.registerHelper('pad', function (str, len) {
      var spaces = (new Array(len + 1)).join(' ');

      return str.replace(/\n/g, '\n' + spaces);
    });
  };
});