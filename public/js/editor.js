function log(message)
{
  if (typeof console !== "undefined")
  {
    console.log(message);
  }
}

define(
  ['module', 'jquery', 'codemirror/lib/codemirror', 'application',
   'librarymanager/presenter', 'editor/manager', 'editor/tab',
   'handlebars', 'codemirror/mode/css/css',
   'codemirror/mode/javascript/javascript', 'codemirror/mode/xml/xml',
   'codemirror/mode/htmlmixed/htmlmixed'],
  function (module, jQuery, CodeMirror, Application, LibManagerPresenter, EditorManager, Tab)
  {
    var config = module.config();

    $(document).ready(function () {
      var libManagerPresenter = new LibManagerPresenter($('#library-manager'));
      libManagerPresenter.loadFromJSON(
        [
          {
            libraryType: 'js',
            libraryId: 1,
            versionId: '1',
            dependsOn: null
          },
          {
            libraryType: 'js',
            libraryId: 2,
            versionId: '1',
            dependsOn: [{
              libraryType: 'js',
              libraryId: 1,
              versionId: '1',
              dependsOn: null
            }]
          }
        ]
      );

      var editors = {
        javascript: 'javascript',
        html: 'htmlmixed',
        css: 'css'
      };
      var editor = new EditorManager($('#editors'), {
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
          mode: editors[type]
        });
        var tab = new Tab({
          id: type,
          template: $(instance.getWrapperElement()),
          detachable: true
        });

        instance.setSize(null, '100%');
        tab.on('show', function () {
          instance.refresh();
        });

        editor.tabs.push(tab);
      });

      editor.tabs.push(new Tab({
        id: 'result',
        template: $('#render'),
        detachable: false
      }));

      editor.setActiveTab(0, 'javascript');
      editor.setActiveTab(1, config.isNew ? 'html' : 'result');

      $('#run_btn').on('click', function (e) {
        var $form = $('#the-form');

        e.preventDefault();

        $form.prop({
          target: 'render',
          action: $form.data('preview-url')
        });

        editor.setActiveTab(1, 'result');

        $form.submit();
      });

      $('#publish_btn').on('click', function (e) {
        var $form = $('#the-form');

        $form.prop({
          target: '_self',
          action: $form.data('save-url')
        });
      });
    });
  }
);
