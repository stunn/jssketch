define(
  ['handlebars', 'jquery', 'helpers/view', 'editortabs/viewer',
  'editortabs/tab'],
  function (Handlebars, jQuery, viewHelpers, Viewer, Tab)
  {
    viewHelpers(Handlebars);

    function Presenter(contId, tabs, startTab, coord, holdsPreview)
    {
      var that = this;

      this.editorCont = $(contId);
      this.editorTpl = Handlebars.compile($('#editor-tpl').html());

      // Render in the editor, tabless.
      this.editorCont.append(jQuery.parseHTML(this.editorTpl({
        holdsPreview: holdsPreview
      })));

      this.holdsPreview = holdsPreview;
      this.viewer = new Viewer();

      // Auto-add GUI tabs when underlying viewmodel changes.
      this.viewer.tabs.on('add', function (tab) {
        var $tab = $('<li />');
        $tab.text(tab.get('id'));
        $tab.data('model', tab);
        this.editorCont.find('nav ul').append($tab);
      }.bind(this));

      // Sync the active tab with the underlying viewmodel.
      this.viewer.on('change', 'current', function (newVal, oldVal) {
        var $tabs = that.editorCont.find('nav ul').children();
        var newTab = $tabs.filter(function () {
          return $(this).data('model').get('id') === newVal;
        }).addClass('active').data('model');

        if (typeof oldVal !== 'undefined') {
          var oldTab = $tabs.filter(function () {
            return $(this).data('model').get('id') === oldVal;
          }).removeClass('active').data('model');

          oldTab.trigger('hide', [
            oldTab.get('contentEl'),
            that.editorCont.find('.editor-codepad').first()
          ]);
        }

        newTab.trigger('show', [
          newTab.get('contentEl'),
          that.editorCont.find('.editor-codepad').first()
        ]);
      });

      // Set the tabs in to the viewer.
      tabs.forEach(function (tab) {
        this.viewer.tabs.add(tab);
      }, this);
      coord.addViewer(this.viewer);
      this.viewer.set('current', startTab.get('id'));

      this.editorCont.find('nav ul').children().on('click', function (e) {
        e.preventDefault();

        that.viewer.set('current', $(e.target).data('model').get('id'));
      });
    }

    return Presenter;
  }
);
