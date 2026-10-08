const Backgrounds = (function() {
  const cache = new Map();
  const loading = new Map();
  const accessOrder = [];
  const MAX_ENTRIES = 20;
  const MAX_MEMORY = 5 * 1024 * 1024;
  const LOAD_TIMEOUT = 2000;

  const fallbackGenerators = {
    realm: function(key) {
      const id = key.replace('realm:', '');
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      const colors = {
        arjuna: ['#1a0a20', '#0a0510'],
        bhima: ['#2a0a0a', '#100505'],
        karna: ['#2a1a0a', '#100a05'],
        hanuman: ['#2a200a', '#101005'],
        draupadi: ['#2a0a1a', '#10050a'],
        default: ['#1a1a30', '#0a0a1a']
      };
      const c = colors[id] || colors.default;
      grad.addColorStop(0, c[0]);
      grad.addColorStop(1, c[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 720);
      return canvas;
    },
    zone: function(key) {
      const id = key.replace('zone:', '');
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      const colors = {
        aryavarta: ['#0a1a20', '#0a0a10'],
        dandaka: ['#0a0a1a', '#05050a'],
        meru: ['#1a1a3a', '#0a0a1a'],
        patala: ['#1a0a10', '#0a0508'],
        svarga: ['#0a0a2a', '#050515'],
        default: ['#1a1a30', '#0a0a1a']
      };
      const c = colors[id] || colors.default;
      grad.addColorStop(0, c[0]);
      grad.addColorStop(1, c[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 720);
      return canvas;
    },
    combat: function(key) {
      const type = key.replace('combat:', '');
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      const colors = {
        rakshasa: ['#2a0a0a', '#1a0505'],
        wolf: ['#1a1a10', '#0a0a05'],
        bandit: ['#1a100a', '#0a0505'],
        spider: ['#1a0a1a', '#0a050a'],
        wraith: ['#0a0a2a', '#050515'],
        asura: ['#2a100a', '#150805'],
        dragon: ['#0a2a0a', '#051505'],
        default: ['#1a1a30', '#0a0a1a']
      };
      const c = colors[type] || colors.default;
      grad.addColorStop(0, c[0]);
      grad.addColorStop(1, c[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 720);
      return canvas;
    },
    cultivation: function(key) {
      const realm = key.replace('cultivation:', '');
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(200, 360, 0, 200, 360, 400);
      const colors = {
        qi: ['rgba(200,160,80,0.15)', '#0a0a1a'],
        foundation: ['rgba(200,160,80,0.2)', '#0a0a1a'],
        core: ['rgba(200,160,80,0.25)', '#0a0a1a'],
        golden_core: ['rgba(232,160,48,0.3)', '#0a0a1a'],
        nascent_soul: ['rgba(232,200,80,0.3)', '#0a0a1a'],
        spirit_severing: ['rgba(200,100,160,0.3)', '#0a0a1a'],
        dao_seeking: ['rgba(100,160,200,0.3)', '#0a0a1a'],
        immortality: ['rgba(200,200,200,0.3)', '#0a0a1a'],
        default: ['rgba(200,160,80,0.15)', '#0a0a1a']
      };
      const c = colors[realm] || colors.default;
      grad.addColorStop(0, c[0]);
      grad.addColorStop(1, c[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 720);
      return canvas;
    },
    ashram: function() {
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      grad.addColorStop(0, '#2a200a');
      grad.addColorStop(0.5, '#1a1508');
      grad.addColorStop(1, '#0a0805');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 720);
      return canvas;
    },
    map: function(key) {
      const region = key.replace('map:', '');
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 720;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      const colors = {
        east: ['#0a1a20', '#0a0a10'],
        west: ['#1a0a1a', '#0a050a'],
        north: ['#1a1a3a', '#0a0a1a'],
        south: ['#1a0a10', '#0a0508'],
        center: ['#0a0a2a', '#050515'],
        default: ['#1a1a30', '#0a0a1a']
      };
      const c = colors[region] || colors.default;
      grad.addColorStop(0, c[0]);
      grad.addColorStop(1, c[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 720);
      return canvas;
    }
  };

  const customGenerators = new Map();

  function generateFallback(key) {
    if (customGenerators.has(key)) {
      return customGenerators.get(key)(key);
    }
    const type = key.split(':')[0];
    const generator = fallbackGenerators[type];
    if (generator) {
      return generator(key);
    }
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 720;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = R.colors.surface;
    ctx.fillRect(0, 0, 400, 720);
    return canvas;
  }

  function estimateSize(canvas) {
    return canvas.width * canvas.height * 4;
  }

  function evictLRU() {
    while (accessOrder.length > 0 && (cache.size >= MAX_ENTRIES || getMemoryUsage() >= MAX_MEMORY)) {
      const oldest = accessOrder.shift();
      if (cache.has(oldest)) {
        cache.delete(oldest);
        const authoredKey = oldest + '_authored';
        if (cache.has(authoredKey)) {
          cache.delete(authoredKey);
          const aidx = accessOrder.indexOf(authoredKey);
          if (aidx !== -1) accessOrder.splice(aidx, 1);
        }
      }
    }
  }

  function getMemoryUsage() {
    let total = 0;
    for (const canvas of cache.values()) {
      total += estimateSize(canvas);
    }
    return total;
  }

  function clearCache() {
    cache.clear();
    accessOrder.length = 0;
  }

  function registerSlot(key, generator) {
    if (!generator || typeof generator !== 'function') return;
    customGenerators.set(key, generator);
  }

  function get(key) {
    const isLoading = loading.has(key);
    if (cache.has(key)) {
      const idx = accessOrder.indexOf(key);
      if (idx !== -1) accessOrder.splice(idx, 1);
      accessOrder.push(key);
      const authoredKey = key + '_authored';
      if (cache.has(authoredKey)) {
        const aidx = accessOrder.indexOf(authoredKey);
        if (aidx !== -1) accessOrder.splice(aidx, 1);
        accessOrder.push(authoredKey);
      }
      return { fallback: cache.get(key), authored: cache.get(authoredKey), loading: isLoading, error: null };
    }

    const fallback = generateFallback(key);
    cache.set(key, fallback);
    accessOrder.push(key);
    evictLRU();

    return { fallback, authored: null, loading: isLoading, error: null };
  }

  function preload(key, url) {
    if (!url || loading.has(key)) return Promise.resolve();

    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const timeout = setTimeout(() => {
        loading.delete(key);
        reject(new Error('Load timeout'));
      }, LOAD_TIMEOUT);

      img.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 400;
        canvas.height = img.naturalHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        cache.set(key + '_authored', canvas);
        accessOrder.push(key + '_authored');
        evictLRU();
        loading.delete(key);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeout);
        loading.delete(key);
        reject(new Error('Load failed'));
      };

      img.src = url;
    });

    loading.set(key, loadPromise);
    return loadPromise;
  }

  function renderBackground(ctx, key, alpha) {
    const entry = get(key);
    const useReducedMotion = R.reducedMotion();
    const targetAlpha = alpha !== undefined ? alpha : 1;

    if (entry.authored && !useReducedMotion && entry.loading === false) {
      ctx.save();
      ctx.globalAlpha = targetAlpha;
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(entry.authored, 0, 0, G.W, G.H);
      ctx.restore();
      return true;
    }

    ctx.save();
    ctx.globalAlpha = targetAlpha;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(entry.fallback, 0, 0, G.W, G.H);
    ctx.restore();
    return false;
  }

  function renderCharacterMoment(ctx, key, x, y, w, h, alpha) {
    const entry = get(key);
    const targetAlpha = alpha !== undefined ? alpha : 1;

    if (entry.authored) {
      ctx.save();
      ctx.globalAlpha = targetAlpha;
      ctx.drawImage(entry.authored, x, y, w, h);
      ctx.restore();
      return true;
    }

    return false;
  }

  return {
    registerSlot,
    get,
    preload,
    clear: clearCache,
    getMemoryUsage,
    renderBackground,
    renderCharacterMoment,
    MAX_ENTRIES,
    MAX_MEMORY,
    LOAD_TIMEOUT
  };
})();

if (typeof window !== 'undefined') {
  window.R = window.R || {};
  window.R.Backgrounds = Backgrounds;
}