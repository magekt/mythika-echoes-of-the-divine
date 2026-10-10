/* Deprecation scanner + removal safety (Phase 19, D-02/D-03).
 * Classic global `Deprecation`, dependency-free. Static analysis is
 * regex-based (no bundler/AST lib in this repo); the runtime probe wraps
 * globals and records calls. No gameplay mutations; scanner reads text
 * only and never evals source.
 */
(function (root) {
  'use strict';

  var usage = Object.create(null);
  var wrapped = Object.create(null);

  // Find top-level candidate definitions in one source text:
  // `X = function`, `function X(`, `const X =`, `var X =`, `X: function`.
  function candidatesIn(source, file) {
    var out = [];
    var seen = Object.create(null);
    var patterns = [
      /(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=/g,
      /function\s+([A-Za-z_$][\w$]*)\s*\(/g,
      /([A-Za-z_$][\w$]*)\s*=\s*function(\s|\()/g,
      /([A-Za-z_$][\w$]*)\s*:\s*function(\s|\()/g
    ];
    for (var p = 0; p < patterns.length; p++) {
      var re = patterns[p];
      re.lastIndex = 0;
      var m;
      while ((m = re.exec(source || '')) !== null) {
        var name = m[1];
        if (!name || seen[name]) continue;
        if (/^(if|for|while|switch|catch|return|function|var|let|const)$/.test(name)) continue;
        seen[name] = true;
        out.push({ name: name, file: file || '?', kind: 'definition' });
      }
    }
    return out;
  }

  function countRefs(name, sources) {
    var re = new RegExp('[^\\w$]' + name.replace(/[$]/g, '\\$') + '[^\\w$]', 'g');
    var total = 0;
    var files = [];
    for (var i = 0; i < sources.length; i++) {
      var padded = ' ' + (sources[i].text || '') + ' ';
      // Subtract the candidate's own definition line occurrence.
      var hits = padded.match(re);
      var n = hits ? hits.length : 0;
      if (sources[i].file && candidatesIn(sources[i].text, sources[i].file).some(function (c) { return c.name === name; })) {
        n = Math.max(0, n - 1);
      }
      if (n > 0) {
        total += n;
        files.push(sources[i].file || '?');
      }
    }
    return { count: total, files: files };
  }

  var Deprecation = {
    _usage: usage,

    // scan(sources) -> candidates[] with { name, file, refs, refFiles }.
    // sources: [{ file, text }]. Pure; no I/O.
    scan: function (sources) {
      var all = [];
      var seen = Object.create(null);
      for (var i = 0; i < (sources || []).length; i++) {
        var cs = candidatesIn(sources[i].text, sources[i].file);
        for (var j = 0; j < cs.length; j++) {
          if (seen[cs[j].name + '@' + cs[j].file]) continue;
          seen[cs[j].name + '@' + cs[j].file] = true;
          all.push(cs[j]);
        }
      }
      for (var k = 0; k < all.length; k++) {
        var r = countRefs(all[k].name, sources);
        all[k].refs = r.count;
        all[k].refFiles = r.files;
        all[k].runtimeHits = usage[all[k].name] || 0;
      }
      return all;
    },

    // probe(names): wrap root globals so calls are counted. Usage:
    // `?probe&deprecation` harness calls Deprecation.probe(Object.keys(...)).
    probe: function (names) {
      var self = this;
      (names || []).forEach(function (name) {
        if (wrapped[name] || typeof root[name] !== 'function') return;
        var orig = root[name];
        wrapped[name] = true;
        usage[name] = usage[name] || 0;
        root[name] = function () {
          usage[name]++;
          return orig.apply(this, arguments);
        };
        root[name]._deprecationWrapped = true;
      });
      return self.runtimeMap();
    },

    recordCall: function (name) {
      usage[name] = (usage[name] || 0) + 1;
    },

    runtimeMap: function () {
      var out = {};
      for (var k in usage) out[k] = usage[k];
      return out;
    },

    resetProbe: function () {
      for (var k in usage) delete usage[k];
      for (var w in wrapped) delete wrapped[w];
    },

    // Safe only when: zero static refs + zero runtime hits + replacement
    // (when named) exists with contract coverage flag.
    verifyRemoval: function (candidate, opts) {
      if (!candidate) return false;
      if ((candidate.refs || 0) > 0) return false;
      if ((candidate.runtimeHits || usage[candidate.name] || 0) > 0) return false;
      var o = opts || {};
      if (candidate.replacement && !o.replacementHasContract) return false;
      return true;
    },

    // checkSaveMigration(hydrateFn, fixtures): fixtures is
    // [{ name, state }]; hydrateFn(state) must return truthy and leave a
    // validator-approved shape. Returns per-fixture results.
    checkSaveMigration: function (hydrateFn, fixtures, validate) {
      return (fixtures || []).map(function (f) {
        var ok = false, error = null;
        try {
          ok = !!hydrateFn(f.state);
          if (ok && typeof validate === 'function') ok = !!validate(f.name);
        } catch (e) {
          ok = false;
          error = String((e && e.message) || e);
        }
        return { name: f.name, ok: ok, error: error };
      });
    },

    logRemoval: function (entry) {
      var e = entry || {};
      return '- ' + (e.date || new Date().toISOString().slice(0, 10)) +
        ' | `' + (e.file || '?') + '` | `' + (e.fn || e.name || '?') + '`' +
        ' | replacement: ' + (e.replacement || 'none') +
        ' | evidence: ' + (e.evidence || 'n/a') +
        ' | contract: ' + (e.contract || 'n/a') +
        ' | status: ' + (e.status || 'removed');
    }
  };

  root.Deprecation = Deprecation;
  if (typeof module !== 'undefined' && module.exports) module.exports = Deprecation;
})(typeof globalThis !== 'undefined' ? globalThis : this);
