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

    /**
     * This is a stolen copy of the #each helper, but which treats array-like
     * objects as arrays (i.e. objects with a `.length` property which is a number)
     * rather than objects. This lets us iterate over our Collection's.
     */
    Handlebars.registerHelper('iter', function(context, options) {
      var fn = options.fn, inverse = options.inverse;
      var i = 0, ret = "", data;

      if (options.data) {
        data = Handlebars.createFrame(options.data);
      }

      if(context && typeof context === 'object') {
        if(typeof context.length === "number"){
          for(var j = context.length; i<j; i++) {
            if (data) { data.index = i; }
            ret = ret + fn(context[i], { data: data });
          }
        } else {
          for(var key in context) {
            if(context.hasOwnProperty(key)) {
              if(data) { data.key = key; }
              ret = ret + fn(context[key], {data: data});
              i++;
            }
          }
        }
      }

      if(i === 0){
        ret = inverse(this);
      }

      return ret;
    });
  };
});