/* tools/layout_harness/assert.js
 *
 * Pure-Node assertion module for the layout harness (Phase 30, Plan 30-01).
 * Zero dependencies, no browser globals. Required by both the Node unit tests
 * and the verify_matrix.py --layout driver (which shells out to this single
 * implementation, so the rule below is the one contract).
 *
 * FINDING SHAPE (stable JSON contract, also emitted by verify_matrix.py):
 *   { kind: 'intersect' | 'overflow' | 'clip',
 *     a: <text of first box>, b: <text of second box or null>,
 *     boxes: [<box(es) with x,y,w,h coordinates>] }
 *
 * RULES (CONTEXT scope: intersection + canvas + active-scroll-clip only;
 * panel-level containment is deferred):
 *   (a) boxes with overlay === true are skipped entirely;
 *   (b) pairwise intersection with overlap AREA > 1px^2 (1px tolerance kills
 *       anti-aliasing edge kisses);
 *   (c) canvas containment: a box extending past [0,0,W,H] by more than 2px
 *       on any side;
 *   (d) scroll-clip containment: when a clip is known (per-box box.clip,
 *       falling back to opts.clip), a box extending past it by more than 2px;
 *   (e) allowlist: array of {aMatch, bMatch} substring rules. Intersect
 *       findings match order-insensitively. Overflow/clip findings match when
 *       aMatch is a substring of the box text and the entry has no bMatch.
 *       Allowlisted findings are returned separately as `waived`, never
 *       silently dropped.
 *
 * Return: { violations: [...], waived: [...], boxCount }.
 */
'use strict';

var INTERSECT_TOLERANCE_AREA = 1;
var CONTAIN_MARGIN = 2;

function overlapArea(a, b) {
  var x0 = Math.max(a.x, b.x);
  var x1 = Math.min(a.x + a.w, b.x + b.w);
  var y0 = Math.max(a.y, b.y);
  var y1 = Math.min(a.y + a.h, b.y + b.h);
  var w = x1 - x0;
  var h = y1 - y0;
  if (w <= 0 || h <= 0) return 0;
  return w * h;
}

// Positive outset of box beyond rect, per side (<= 0 means inside).
function outset(box, rect) {
  return {
    left: rect.x - box.x,
    top: rect.y - box.y,
    right: (box.x + box.w) - (rect.x + rect.w),
    bottom: (box.y + box.h) - (rect.y + rect.h)
  };
}

function textMatches(text, sub) {
  if (sub === undefined || sub === null || sub === '') return true;
  return String(text).indexOf(String(sub)) !== -1;
}

function allowlisted(finding, allowlist) {
  if (!Array.isArray(allowlist)) return false;
  for (var i = 0; i < allowlist.length; i++) {
    var rule = allowlist[i] || {};
    if (finding.kind === 'intersect') {
      var straight = textMatches(finding.a, rule.aMatch) && textMatches(finding.b, rule.bMatch);
      var swapped = textMatches(finding.b, rule.aMatch) && textMatches(finding.a, rule.bMatch);
      if (straight || swapped) return true;
    } else {
      // Overflow/clip findings carry a single box text in `a`.
      if ((rule.bMatch === undefined || rule.bMatch === null || rule.bMatch === '') &&
          textMatches(finding.a, rule.aMatch)) {
        return true;
      }
    }
  }
  return false;
}

function findViolations(boxes, opts) {
  var o = opts || {};
  var W = typeof o.W === 'number' ? o.W : 400;
  var H = typeof o.H === 'number' ? o.H : 720;
  var fallbackClip = o.clip || null;
  var allowlist = Array.isArray(o.allowlist) ? o.allowlist : [];

  var live = (Array.isArray(boxes) ? boxes : []).filter(function (b) {
    return b && b.overlay !== true && isFinite(b.x) && isFinite(b.y) &&
      isFinite(b.w) && isFinite(b.h) && b.w > 0 && b.h > 0;
  });

  var findings = [];
  var i, j;

  // (b) pairwise intersection.
  for (i = 0; i < live.length; i++) {
    for (j = i + 1; j < live.length; j++) {
      var area = overlapArea(live[i], live[j]);
      if (area > INTERSECT_TOLERANCE_AREA) {
        findings.push({
          kind: 'intersect',
          a: live[i].text,
          b: live[j].text,
          area: Math.round(area * 10) / 10,
          boxes: [live[i], live[j]]
        });
      }
    }
  }

  // (c) canvas containment.
  var canvas = { x: 0, y: 0, w: W, h: H };
  for (i = 0; i < live.length; i++) {
    var o1 = outset(live[i], canvas);
    if (o1.left > CONTAIN_MARGIN || o1.top > CONTAIN_MARGIN ||
        o1.right > CONTAIN_MARGIN || o1.bottom > CONTAIN_MARGIN) {
      findings.push({
        kind: 'overflow',
        a: live[i].text,
        b: null,
        outset: {
          left: Math.round(o1.left * 10) / 10,
          top: Math.round(o1.top * 10) / 10,
          right: Math.round(o1.right * 10) / 10,
          bottom: Math.round(o1.bottom * 10) / 10
        },
        boxes: [live[i]]
      });
    }
  }

  // (d) scroll-clip containment (per-box clip wins, opts.clip is fallback).
  for (i = 0; i < live.length; i++) {
    var clip = live[i].clip || fallbackClip;
    if (!clip) continue;
    var o2 = outset(live[i], clip);
    if (o2.left > CONTAIN_MARGIN || o2.top > CONTAIN_MARGIN ||
        o2.right > CONTAIN_MARGIN || o2.bottom > CONTAIN_MARGIN) {
      findings.push({
        kind: 'clip',
        a: live[i].text,
        b: null,
        outset: {
          left: Math.round(o2.left * 10) / 10,
          top: Math.round(o2.top * 10) / 10,
          right: Math.round(o2.right * 10) / 10,
          bottom: Math.round(o2.bottom * 10) / 10
        },
        boxes: [live[i]]
      });
    }
  }

  // (e) allowlist split.
  var violations = [];
  var waived = [];
  for (i = 0; i < findings.length; i++) {
    if (allowlisted(findings[i], allowlist)) waived.push(findings[i]);
    else violations.push(findings[i]);
  }

  return { violations: violations, waived: waived, boxCount: live.length };
}

module.exports = {
  findViolations: findViolations,
  INTERSECT_TOLERANCE_AREA: INTERSECT_TOLERANCE_AREA,
  CONTAIN_MARGIN: CONTAIN_MARGIN
};
