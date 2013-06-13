define(['jquery'], function () {
  return {
    CodeMirrorStrategy: {
      show: function (el, container) {
        var $container = $(container);
        $container.children().detach();
        $container.append($(el));
      },
      hide: function (el, container) {
        $(container).children().detach();
      }
    },

    PreviewStrategy: {
      show: function (el, container) {
        var $container = $(container);
        $container.children().detach();
        $container.append($(el).show());
      },
      hide: function (el, container) {
        $(container).children().hide().appendTo($('body'));
      }
    }
  };
});
