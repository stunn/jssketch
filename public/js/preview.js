define(['jquery', 'application', 'models/sketch', 'models/revision', 'helpers/revision', 'helpers/view', 'editor'], function (jQuery, application, Sketch, Revision, revisionHelper, viewHelpers) {
  jQuery(document).ready(function () {
    var template = Handlebars.compile($('#source-template').html().replace(/<\\\/script>/g, '</script>'));
    var cm = $('#source textarea').data('mirror');

    viewHelpers(Handlebars);

    function prep() {
      var params = $('#the-form').serializeArray();
      var ret = {};

      params.forEach(function (obj) {
        ret[obj.name] = obj.value;
      });

      return ret;
    }

    function handler() {
      var revision = new Revision;
      var sketch = new Sketch;

      revisionHelper.updateRevisionFromHash(revision, application.doctypes, application.dm, prep());

      cm.setValue(template({
        revision: revision,
        sketch: sketch,
        doctype: application.doctypes.filter(function (doctype) {
          return doctype.id === revision.get('doctype');
        })[0]
      }));
    }

    $('#render').on('load', handler);

    cm.setOption('readOnly', 'nocursor');
    handler();
  });
});