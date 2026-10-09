(function(global) {
  const UI = global.UI = global.UI || {};
  const finite = function(value, fallback) {
    return typeof value === 'number' && isFinite(value) ? value : fallback;
  };
  const nonNegative = function(value, fallback) { return Math.max(0, finite(value, fallback)); };
  const clamp = function(value) { return Math.max(0, Math.min(1, finite(value, 0))); };
  const text = function(value, fallback) {
    const result = typeof value === 'string' ? value.trim() : '';
    return result ? result.slice(0, 80) : fallback;
  };
  const itemLabel = function(item) {
    return item && typeof item === 'object' && !Array.isArray(item) ? text(item.name, 'Equipped') : 'Empty';
  };

  const HeroSurface = {
    getModel: function(hero, context) {
      const h = hero && typeof hero === 'object' && !Array.isArray(hero) ? hero : {};
      const level = Math.max(1, Math.floor(nonNegative(h.level, 1)));
      const currentHp = nonNegative(h.hp, 0);
      const baseMaxHp = nonNegative(h.maxHp, currentHp);
      const currentMp = nonNegative(h.mp, 0);
      const baseMaxMp = nonNegative(h.maxMp, currentMp);
      let stats = { maxHp: baseMaxHp, maxMp: baseMaxMp, str: nonNegative(h.str, 0), agi: nonNegative(h.agi, 0), mag: nonNegative(h.mag, 0), def: nonNegative(h.def, 0) };
      if (typeof global.calcHeroStats === 'function') {
        try { stats = Object.assign(stats, global.calcHeroStats(h) || {}); } catch (e) {}
      }
      stats.maxHp = Math.max(1, finite(stats.maxHp, baseMaxHp));
      stats.maxMp = Math.max(0, finite(stats.maxMp, baseMaxMp));
      const xp = nonNegative(h.xp, 0);
      let needed = 40;
      if (global.Progression && typeof global.Progression.xpForLevel === 'function') {
        try { needed = Math.max(1, finite(global.Progression.xpForLevel(level), 40)); } catch (e) {}
      }
      const statuses = [];
      if (text(h.ailmentName, '')) statuses.push(text(h.ailmentName, ''));
      if (Array.isArray(h.ailments)) h.ailments.slice(0, 3).forEach(a => statuses.push(text(a && (a.name || a.label), 'Ailment')));
      if (Array.isArray(h.buffs)) h.buffs.slice(0, 3).forEach(b => statuses.push(text(b && (b.name || b.label), 'Buff')));
      const heroId = text(h.id, '');
      let affinity = { value: 0, tier: 'Wary', visible: false, ratio: 0 };
      try {
        const Bond = global.BondSystem;
        if (heroId && Bond && typeof Bond.get === 'function') {
          const lookup = Bond.get(heroId) || {};
          const value = Math.max(0, Math.min(100, Math.floor(finite(lookup.value, 0))));
          affinity = {
            value: value,
            tier: typeof lookup.tier === 'string' && lookup.tier ? lookup.tier.slice(0, 24) : 'Wary',
            visible: lookup.visible === true,
            ratio: clamp(value / 100)
          };
        }
      } catch (e) {}
      return {
        id: heroId, name: text(h.name, 'Unknown hero'), role: text(h.role, 'Unassigned role'),
        className: text(h.className || h.classId, ''), level,
        hp: { current: currentHp, max: stats.maxHp, ratio: clamp(currentHp / stats.maxHp) },
        mp: { current: currentMp, max: stats.maxMp, ratio: clamp(currentMp / Math.max(1, stats.maxMp)) },
        xp: { current: xp, needed, ratio: clamp(xp / needed) }, stats,
        equipment: [
          { slot: 'weapon', label: itemLabel(h.weaponEquipped) },
          { slot: 'armor', label: itemLabel(h.armorEquipped) },
          { slot: 'accessory', label: itemLabel(h.accessoryEquipped) }
        ],
        status: statuses.length ? statuses.join(' · ') : 'No active status',
        nextAction: context === 'result' ? (h.hp > 0 ? 'Continue' : 'Return to safety') : context === 'cultivation' ? 'Meditate or break through' : context === 'combat' ? 'Act or target a foe' : context === 'compact' ? 'Inspect hero' : 'Inspect or equip',
        affinity: affinity,
        context: context || 'detail', alive: currentHp > 0
      };
    },
    renderCompact: function(ctx, x, y, w, h, hero) { return this._render(ctx, x, y, w, h, hero, 'compact'); },
    renderDetail: function(ctx, x, y, w, h, hero, context) { return this._render(ctx, x, y, w, h, hero, context || 'detail'); },
    renderResult: function(ctx, x, y, w, h, hero) { return this._render(ctx, x, y, w, h, hero, 'result'); },
    _render: function(ctx, x, y, w, h, hero, context) {
      const model = this.getModel(hero, context);
      const R = global.R;
      if (!R || !ctx) return model;
      R.roundRect(ctx, x, y, w, h, R.radius ? R.radius.m : 8, R.colors.panel);
      R.text(ctx, model.name, x + 12, y + 20, R.colors.gold, R.fonts.md);
      R.text(ctx, model.role + ' · Lv.' + model.level, x + 12, y + 38, R.colors.text, R.fonts.sm);
      R.text(ctx, 'HP ' + Math.floor(model.hp.current) + '/' + Math.floor(model.hp.max) + '  MP ' + Math.floor(model.mp.current) + '/' + Math.floor(model.mp.max), x + 12, y + 55, R.colors.text, R.fonts.xs);
      if (context !== 'compact') R.text(ctx, 'XP ' + Math.floor(model.xp.current) + '/' + model.xp.needed + ' · ' + model.status, x + 12, y + 71, R.colors.textDim, R.fonts.xs);
      if (model.affinity && model.affinity.visible === true) {
        const tierFills = { Wary: R.colors.textDim, Trusted: R.colors.info, Sworn: R.colors.success, Legend: R.colors.gold };
        const barH = 5;
        const barX = x + 12;
        const barW = Math.max(0, w - 24);
        const barY = context !== 'compact' ? y + 80 : y + 64;
        const ratio = Math.max(0, Math.min(1, finite(model.affinity.ratio, 0)));
        R.roundRect(ctx, barX, barY, barW, barH, R.radius ? R.radius.xs : 3, R.colors.borderHairline);
        if (ratio > 0 && barW > 0) {
          R.roundRect(ctx, barX, barY, Math.max(0, barW * ratio), barH, R.radius ? R.radius.xs : 3, tierFills[model.affinity.tier] || R.colors.textDim);
        }
        R.text(ctx, model.affinity.tier + ' ' + Math.floor(model.affinity.value) + '/100', barX, barY + barH + 11, R.colors.textDim, R.fonts.xs);
      }
      return model;
    }
  };
  UI.HeroSurface = HeroSurface;
})(typeof globalThis !== 'undefined' ? globalThis : this);
