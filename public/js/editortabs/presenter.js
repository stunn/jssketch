define(
  ['handlebars', 'jquery', 'helpers/view', 'editortabs/viewer',
  'editortabs/tab'],
  function (Handlebars, jQuery, ViewHelpers, Viewer, Tab)
  {
    ViewHelpers(Handlebars);

    function Presenter(contId, tabs)
    {
      this.editorCont = $(contId);
      this.editorTpl = Handlebars.compile($('#editor-tpl').html());

      // Render in the editor, tabless.
      this.editorCont.append(jQuery.parseHTML(this.editorTpl()));

      this.viewer = new Viewer();

      // Auto-add GUI tabs when underlying viewmodel changes.
      this.viewer.tabs.on('add', function (tab) {
        var $tab = $('<li />');
        $tab.text(tab.get('id'));
        $tab.data('model', tab);
        this.editorCont.find('nav ul').append($tab);
      }.bind(this));

      // Sync the active tab with the underlying viewmodel.
      var that = this;
      this.viewer.on('change', 'current', function () {
        $tabs = that.editorCont.find('nav ul').children();
        $tabs.removeClass('active');
        var newTab = $tabs.filter(function () {
          return $(this).data('model').get('id') === that.viewer.get('current');
        });
        newTab.addClass('active');
        that.editorCont.find('.editor-codepad').html(
          newTab.first().data('model').get('contentEl'));
      });

      // Set the tabs in to the viewer.
      tabs.forEach(function (tab) {
        this.viewer.tabs.add(tab);
      }.bind(this));
      this.viewer.set('current', tabs[0].get('id')); // TODO: Filthy.

      var that = this; // TODO: Repeat.
      this.editorCont.find('nav ul').children().on('click', function (e) {
        e.preventDefault();

        that.viewer.set('current', $(e.target).data('model').get('id'));
      });
    }

    return Presenter;
  }
);
