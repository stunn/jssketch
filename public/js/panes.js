(function ($) {
  "use strict";

  function proxy(func, cancel) {
    return function (e, ui) {
      if (this === ui.element[0]) {
        func.apply(this, arguments);

        if (cancel !== false) {
          e.stopImmediatePropagation();
        }
      }
    }
  };

  /**
   * Panes allows the borders between children of a container to be moveable. 
   *
   * Panes utilizes the jQuery UI resizeable plugin, which is a requirement for
   * this to work, and should work in any environment that jQuery UI resizeable does.
   *
   * To use, call panes() on a jQuery object which contains the parent of the elements
   * you wish to be resizeable. panes() requires a string as the parameter, which is
   * "x" for resizing in the x (horizontal) direction, and "y" for the vertical.
   */
  jQuery.fn.panes = function (direction) {
    var modifier = (function () {
      var modifier = (direction === "x" ? "Width" : "Height");

      return function (prefix) {
        return typeof prefix === "undefined" ? modifier.toLowerCase() : prefix + modifier;
      }
    }());

    return this.each(function () {
      var self = $(this);

      self.children(':not(:last-child)').resizable({
        handles: direction === 'x' ? 'e' : 's'
      }).on('resizestart', proxy(function (event, ui ) {
        var that = ui.element;
        var next = that.next();
        var data = {
          next: next,
          originalSize: {
            width: next.width(),
            height: next.height()
          }
        };

        that.resizable('option', modifier('min'), parseInt(that.css(modifier('min')), 10));
        that.resizable('option', modifier('max'), ui.originalSize[modifier()] + (data.originalSize[modifier()] - parseInt(next.css(modifier('min')), 10)));

        that.data('panes', data);

        self.trigger('panesstart', that, next);
      })).on('resize', proxy(function (event, ui) {
        var data = ui.element.data('panes');

        // We cannot use `ui.size` properties reliably as they are not the current height and width... 
        // no matter how much the docs tries to reassure you this is the case.
        if (direction === "x") {
          data.next.width(data.originalSize.width + ui.originalSize.width - $(ui.element).width())
        } else {
          data.next.height(data.originalSize.height + ui.originalSize.height - $(ui.element).height());
        }
      })).on('resizestop', proxy(function (event, ui) {
        var that = ui.element;
        var data = that.data('panes');

        // Clean up.
        that.removeData('panes');
        self.trigger('panesstop', [that, data.next]);
      }));
    });
  };

}(jQuery));