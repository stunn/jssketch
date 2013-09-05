jQuery(document).ready(function ($) {
  var Sketch = require('./models/sketch');
  var Revision = require('./models/revision');
  var revisionHelper = require('./helpers/revision');

  var EditorManager = require('./editor/manager');
  var Tab = require('./editor/tab');

  var editors = {
    javascript: 'javascript',
    html: 'htmlmixed',
    css: 'css'
  };

  var editor = module.exports = new EditorManager($('#editors'), {
    panes: 2,
    panesTemplate: (function () {
      var template = Handlebars.compile($('#editor-tpl').html())();

      return function (tab) {
        var el = $(jQuery.parseHTML(template));

        el.attr('id', 'tab-' + tab.get('id'));
        el.find('.editor-codepad').append(tab.get('template'));
        return el;
      };
    }()),
    navContainer: '.editor-mode ul',
    navBuilder: function (tab, isCurrent) {
      var li = $(document.createElement('li'));

      li.text(tab.get('id'));
      li.toggleClass('active', isCurrent);

      return li;
    }
  });

  Object.keys(editors).forEach(function (type) {
    var target = $('textarea[name="' + type + '"]');
    var instance = CodeMirror.fromTextArea(target[0], {
      mode: editors[type],
      lineNumbers: true
    });
    var tab = new Tab({
      id: type,
      detachable: true,
      template: $(instance.getWrapperElement())
    });

    instance.setSize(null, '100%');
    tab.on('show', function () {
      instance.refresh();
    });

    editor.tabs.push(tab);
  });

  (function () {
    var sourceTemplate = Handlebars.compile($('#source-template').html().replace(/<\\\/script>/g, '</script>'));
    var cm = new CodeMirror(document.body, {
      mode: 'htmlmixed',
      readOnly: 'nocursor',
      lineNumbers: true
    });

    var tab = new Tab({
      id: 'view source',
      detachable: true,
      template: cm.getWrapperElement()
    });

    cm.setSize(null, '100%');

    function prep() {
      var params = $('#the-form').serializeArray();
      var ret = {};

      params.forEach(function (obj) {
        ret[obj.name] = obj.value;
      });

      return ret;
    }

    tab.on('show', function () {
      var revision = new Revision();
      var sketch = new Sketch();

      revisionHelper.updateRevisionFromHash(revision, jsSketch.doctypes, jsSketch.dm, prep());

      cm.refresh();
      cm.setValue(sourceTemplate({
        full: false,
        revision: revision,
        sketch: sketch,
        doctype: jsSketch.doctypes[revision.get('doctype')]
      }));
    });

    editor.tabs.push(tab);
  }());

  editor.tabs.push(new Tab({
    id: 'result',
    template: $('#render'),
    detachable: false
  }));

  if (jsSketch.isNew) {
    editor.setActiveTab(0, 'javascript');
    editor.setActiveTab(1, 'html');
  } else {
    editor.setActiveTab(0, 'view source');
    editor.setActiveTab(1, 'result');
  }
});