// Scene helpers: shared implementations for patterns repeated across scenes.
//
// Conventions every scrollable scene follows:
//   data.staticDraws : array of draw entries built in build*(), rendered every frame
//                      by Scene.drawStatic() INSIDE the clip/translate (so they scroll
//                      with content and survive the per-frame clearRect).
//   clampScroll()    : clamps data.scrollY against data.contentHeight.
//   Modal guard      : `if (UI.Modal.active) { UI.Modal.handleInput(); return; }`
//                      at the very top of update().
(function() {

  // Render static draws recorded by a scene's build functions.
  // Entry shapes:
  //   { text:       [str, x, y, color, font] }
  //   { textCenter: [str, x, y, color, font] }
  //   { rect:  [x, y, w, h, radius, fill], stroke: [x, y, w, h, color], lw: 2 }
  Scene.drawStatic = function(ctx, draws) {
    for (const d of draws || []) {
      if (d.text) {
        R.text(ctx, d.text[0], d.text[1], d.text[2], d.text[3], d.text[4]);
      } else if (d.textCenter) {
        R.textCenter(ctx, d.textCenter[0], d.textCenter[1], d.textCenter[2], d.textCenter[3], d.textCenter[4]);
      } else if (d.rect) {
        R.roundRect(ctx, d.rect[0], d.rect[1], d.rect[2], d.rect[3], d.rect[4], d.rect[5]);
        if (d.stroke) {
          ctx.strokeStyle = d.stroke[4];
          ctx.lineWidth = d.lw || 2;
          ctx.strokeRect(d.stroke[0], d.stroke[1], d.stroke[2], d.stroke[3]);
        }
      }
    }
  };

  // Standard wheel/touch scroll handling for scenes with data.scrollY + clampScroll().
  Scene.scrollInput = function(scene) {
    const sd = Input.getScrollDelta();
    if (sd) {
      scene.data.scrollY += sd * G.SCROLL_SPEED;
      scene.clampScroll();
    }
  };

  // Right-edge scrollbar thumb for a scrolled content area.
  // minBar: minimum thumb height in px (default 16; ashram/characterCreate use 18).
  Scene.drawScrollbar = function(ctx, top, contentHeight, viewportH, scrollY, minBar) {
    if (!(contentHeight > viewportH)) return;
    const ratio = viewportH / contentHeight;
    const barH = Math.max(minBar || 16, ratio * viewportH);
    const maxTrack = viewportH - barH;
    const scrollFrac = scrollY / Math.max(1, contentHeight - viewportH);
    const barY = top + scrollFrac * maxTrack;
    R.roundRect(ctx, G.W - 4, barY, 3, barH, 2, 'rgba(232,160,48,0.25)');
  };

  // Human-readable name for an equipped-gear slot that may hold an object,
  // a legacy string, or nothing.
  Scene.gearLabel = function(slot) {
    return (slot && slot.name) || slot || 'None';
  };

})();
