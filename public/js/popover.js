
(function ($) {
  "use strict";

  function position(launcher, popover, options) {
    var dangerZone = options.dangerZone;
    var that = $(window);

    var desiredPos = options.position.split(' ');
    var launcherPos = $.extend({}, launcher.offset(), {
      width: launcher[0].offsetWidth,
      height: launcher[0].offsetHeight
    });

    var actualWidth = popover[0].offsetWidth;
    var actualHeight = popover[0].offsetHeight;

    var viewportPos = {
        top: that.scrollTop(),
        left: that.scrollLeft(),
        width: that.width(),
        height: that.height()
    };

    var map = {
        bottom: {
            obj: {top: launcherPos.top + launcherPos.height, left: launcherPos.left + launcherPos.width / 2 - actualWidth / 2},
            tester: fitVertically
        },
        top: {
            obj: {top: launcherPos.top - actualHeight, left: launcherPos.left + launcherPos.width / 2 - actualWidth / 2},
            tester: fitVertically
        },
        left: {
            obj: {top: launcherPos.top + launcherPos.height / 2 - actualHeight / 2, left: launcherPos.left - actualWidth},
            tester: fitHorizontally
        },
        right: {
            obj: {top: launcherPos.top + launcherPos.height / 2 - actualHeight / 2, left: launcherPos.left + launcherPos.width},
            tester: fitHorizontally
        }
    };

    // Make sure we're not exceeding height, and readjust width
    function fitVertically(dims) {
        if (dims.top < viewportPos.top || dims.top + actualHeight + launcherPos.height > viewportPos.top + viewportPos.height) {
            return false;
        }

        // Used to calculate drift in return value
        var orig = dims.left;

        dims.left = Math.min(Math.max(dims.left, viewportPos.left + dangerZone), viewportPos.left + viewportPos.width - actualWidth - dangerZone);
        return orig - dims.left;
    };

    // Make sure we're not exceeding width and readjust height
    function fitHorizontally(dims) {
        if (dims.left < viewportPos.left || dims.left + actualWidth + launcherPos.width > viewportPos.left + viewportPos.width) {
            return false;
        }

        // Used to calculate drift in return value
        var orig = dims.top;

        dims.top = Math.min(Math.max(dims.top, viewportPos.top + dangerZone), viewportPos.top + viewportPos.height - actualHeight - dangerZone);
        return orig - dims.top;
    };

    // We allow multiple space-separated positions to be specified.
    // We try and position for each of them, until we find one which
    // fits in.
    for (var i=0; i<desiredPos.length; i++) {
      var position = desiredPos[i];
      var curr = map[position];
      var drift = curr.tester(curr.obj);

      if (drift !== false) {
          popover.css(curr.obj).addClass(position);
          popover.find('.arrow').css(/left|right/.test(options.position) ? 'marginTop' : 'marginLeft', function (i) {
              return (drift - 10) + 'px';
          });

          break;
      }
    }
  }

  jQuery.fn.popover = function (opts) {
    var options = jQuery.extend({
      placement: 'bottom',
      content: $(),
      dangerZone: 0
    }, opts);

    this.on("click", function (e) {
      var self = $(this);

      if (self.hasClass('open')) {
        self.data('popover').fadeOut('slow', function () {
          self.removeData('popover').removeClass('open');
        });
      } else {
        var popover = $('<div class="popover"><div class="arrow"></div><div class="popover-inner"></div></div>');

        popover.find('.popover-inner').append(options.content);

        position(self, popover, options);

        popover.appendTo(document.body).fadeIn('slow');
        self.data('popover', popover).addClass('open');
      }
    });
  };

}(jQuery));