;(function($, window, undefined) {
  var document = window.document,
      screenshot;

  var createCanvas = function(settings) {
    var canvas = document.createElement('canvas');

    canvas.height = 1;
    canvas.width  = Math.floor(settings.width.slice(0, -2));

    var $canvas = $(canvas);

    $canvas.css({
      'border':   '1px solid #666',
      'position': 'fixed',
      'z-index':  settings.zIndex
    });

    var location = settings.location.split(/[\t ]+/);
    if ($.inArray('bottom', location) !== -1) {
      $canvas.css({
        'border-bottom': 'none',
        'bottom':        '0'
      });
    }
    if ($.inArray('left', location) !== -1) {
      $canvas.css({
        'border-left': 'none',
        'left':        '0'
      });
    }
    if ($.inArray('right', location) !== -1) {
      $canvas.css({
        'border-right': 'none',
        'right':        '0'
      });
    }
    if ($.inArray('top', location) !== -1) {
      $canvas.css({
        'border-top': 'none',
        'top':        '0'
      });
    }

    return $canvas[0];
  };

  $.fn.minimap = function(options) {
    var defaults = {
      highlight:     'rgba(135, 206, 250, 0.5)',
      lowlight:      'rgba(0, 0, 0, 0.5)',
      location:      'top right',
      preventSelect: true,
      width:         '160px',
      zIndex:        9999
    };

    var settings = $.extend({}, defaults, options);

    return this.each(function() {
      var  canvas = createCanvas(settings),
          $canvas = $(canvas);

      var ctx = canvas.getContext('2d');

      html2canvas(this, {
        onrendered: function(c) {
          // Clone html2canvas screenshot for later use.
          var screenshot = document.createElement('canvas');

          screenshot.width  = c.width;
          screenshot.height = c.height;

          screenshot.getContext('2d').drawImage(c, 0, 0);

          var scale = screenshot.height / screenshot.width;
          var height = Math.round(ctx.canvas.width * scale);
          if (height < $(window).height()) {
            ctx.canvas.height = height;
          } else {
            ctx.canvas.height = $(window).height();
            ctx.canvas.width  = $(window).height() / scale;
          }

          var timeoutID, timeoutID2;

          $(window).scroll(function() {
            // Delay update via setTimeout(), ensuring the onscreen canvas is
            // updated less frequently to improve performance.
            $canvas.show();

            if (typeof timeoutID !== 'undefined') {
              window.clearTimeout(timeoutID);
              timeoutID = null;
            }

            timeoutID = window.setTimeout(function() {
              ctx.drawImage(screenshot, 0, 0, screenshot.width,
               screenshot.height, 0, 0, ctx.canvas.width, ctx.canvas.height);

              // Calculate top and bottom of visible region (in minimap coords).
              var top = $(this).scrollTop() / $(document).height() *
               ctx.canvas.height;
              var bottom = top + ($(this).height() / $(document).height() *
               ctx.canvas.height);

              // Draw low-lit upper and lower regions.
              ctx.fillStyle = settings.lowlight;
              ctx.fillRect(0, 0, ctx.canvas.width, top);
              ctx.fillRect(0, Math.round(bottom), ctx.canvas.width,
               Math.round(ctx.canvas.height - bottom));

              // Draw high-lit visible region.
              ctx.fillStyle = settings.highlight;
              ctx.fillRect(0, Math.round(top), ctx.canvas.width,
               Math.round(bottom - top + 1));

              if (typeof timeoutID2 !== 'undefined') {
                window.clearTimeout(timeoutID2);
                timeoutID2 = null;
              }

              timeoutID2 = window.setTimeout(function() {
                $canvas.fadeOut();
                timeoutID2 = null;
              }, 1000 * 2);	// 2 second delay before fade

              timeoutID = null;
            }, 1000 / 24);	// 24 fps
          });

          $(window).scroll();	// draw initial screenshot

          $canvas.hover(function() {
            // Cancel fade out timeout.
            if (typeof timeoutID2 !== 'undefined') {
              window.clearTimeout(timeoutID2);
              timeoutID2 = null;
            }

            $canvas.css('cursor', 'pointer');
          });

          $canvas.mouseout(function() {
            // Reset fade out timeout.
            if (typeof timeoutID2 !== 'undefined') {
              window.clearTimeout(timeoutID2);
              timeoutID2 = null;
            }

            timeoutID2 = window.setTimeout(function() {
              $canvas.fadeOut();
              timeoutID2 = null;
            }, 1000 * 2);	// 2 second delay before fade
          });

          var isDragging = false;

          if (settings.preventSelect) {
            $(window).mousedown(function(e) { e.preventDefault(); });
          }

          $canvas.mousedown(function(e) {
            var that = this;

            var update = function(e) {
              var offset = $(that).offset();

              var top = Math.round((e.pageY - offset.top) / $(that).height() *
               $(document).height());

              // Subtract half-height of window (to centre).
              top -= Math.round($(window).height() / 2);

              $('body, html').scrollTop(top);
            };

            update(e);

            $canvas.mousemove(function(e) {
              isDragging = true;
              $canvas.css('cursor', 'crosshair');
              update(e);
            });
          });

          $(window).mouseup(function(e) {
            var wasDragging = isDragging;
            isDragging = false;
            $canvas.css('cursor', 'pointer');
            $canvas.unbind('mousemove');
          });

          $canvas.hide();
          $(document.body).append(canvas);
        }
      });
    });
  };
})(jQuery, window);
