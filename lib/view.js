var utils = require('utils');

module.exports = function (config, client) {
  /**
   * Renders a view, passing the given arguments as local variables to the view file.
   *
   * @param file The filename of the view we wish to render
   * @param options An object of KVPs that we want exposed in the view
   * @param bundle Name of the bundle this view uses; 'stylesheets' in the view
   *               will then be an array of either the un-minified files in non
   *               production, or an array containing the single minified bundle
   *               in production.
   * @param res The response object of the request we're handling
   */
  var render = (function () {
    var requirejs = require('../config/requirejs.json');
    var bundles = (function () {
      var bundles = require('../config/bundles.json');
      var ret = {};

      Object.keys(bundles).forEach(function (name) {
        var curr = this[name];

        ret[name] = {
          css: (config.get('production') ? ['css/all.' + name + '.css'] : curr.css) || [],
          js: (curr.js ? [name] : [])
        };
      }, bundles);

      return ret;
    }());

    requirejs.urlArgs = ('v=' + config.get('version'));

    return function render(file, options, bundle, res) {
      if (arguments.length === 3) {
        res = bundle;
        bundle = '';
      }

      bundle = bundles[bundle] || {};

      res.render(file, utils.extend({
        stylesheets: bundle.css,
        scripts: bundle.js,
        requirejs: requirejs
      }, options));
    };
  }());


  /**
   * This view helper will render the editor for the given sketch and revision
   *
   * @param sketch The sketch instance we want to show the editor for
   * @param revision The revision instance we want to show the editor for
   * @param ajax An AJAX requests which are used by the revision
   * @param res The response object of the request we're handling
   * @return void
   */
  function editor(sketch, revision, ajax, res) {
    render('index.hbs', {
      sketch: sketch,
      revision: revision,
      ajax: ajax,
      css: config.get('css_libraries'),
      js: config.get('js_libraries'),
      doctypes: config.get('doctypes')
    }, 'editor', res);
  }

  /**
   * This view helper will render the preview of the provided sketch and revision
   *
   * @param sketch The sketch instance who's revision we want to render
   * @param revision The revision instance we want to render a preview of
   * @param res The response object of the request we're handling
   * @return void
   */
  function preview(sketch, revision, res) {
    render('preview.hbs', {
      sketch: sketch,
      revision: revision,
      dm: client.dm,
      doctype: config.get('doctypes')[revision.get('doctype')]
    }, res);
  }

  return {
    editor: editor,
    preview: preview
  };
};