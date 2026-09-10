// Duel: shared round-based arena combat used by the Tournament and the Endless Trials.
// A duel is a lightweight 1v1 simulation — separate from full Combat — with four
// player actions (attack / special / heal / defend) and a counterattacking foe.
//
// Usage:
//   var d = Duel.create(hero, foe);            // state: { hero, foe, playerHP, log }
//   var result = Duel.round(d, 'attack', {     // returns 'win' | 'lose' | null (ongoing)
//     healPct: 0.15,                           // heal restores hero.maxHp * healPct
//     regen: 0.05,                             // foe heals maxHp * regen while alive
//     enrage: 0.2,                             // foe damage +20%
//     thorns: 0.10                             // striking a living foe reflects dmg%
//   });
const Duel = {};

Duel.create = function(hero, foe) {
  return { hero: hero, foe: foe, playerHP: hero.maxHp, log: [] };
};

Duel.round = function(state, action, opts) {
  const o = opts || {};
  const hero = state.hero, foe = state.foe;
  let pDmg = 0, pDef = 0;

  if (action === 'attack') {
    pDmg = Math.max(1, hero.str + Math.floor(Math.random() * 10) - Math.floor(foe.def * 0.5));
  } else if (action === 'special') {
    pDmg = Math.max(1, Math.floor((hero.str + hero.mag) * 1.2) + Math.floor(Math.random() * 15) - Math.floor(foe.def * 0.3));
  } else if (action === 'heal') {
    const healAmt = Math.floor(hero.maxHp * (o.healPct || 0.2));
    state.playerHP = Math.min(state.playerHP + healAmt, hero.maxHp);
    state.log.push('You heal for ' + healAmt + ' HP');
  } else if (action === 'defend') {
    pDef = Math.floor(hero.def * 1.5);
    state.log.push('You brace for impact');
  }

  foe.hp -= pDmg;
  if (foe.hp < 0) foe.hp = 0;
  if (pDmg > 0) {
    state.log.push('You deal ' + pDmg + ' damage!');
    // Thorns: striking a LIVING foe reflects a share of the damage.
    if (o.thorns && foe.hp > 0) {
      const thorns = Math.max(1, Math.floor(pDmg * o.thorns));
      state.playerHP -= thorns;
      state.log.push('Thorns scar you for ' + thorns + '!');
    }
  }

  if (foe.hp <= 0) return 'win';
  if (state.playerHP <= 0) return 'lose';

  if (o.regen && foe.hp < foe.maxHp) {
    foe.hp = Math.min(foe.maxHp, foe.hp + Math.ceil(foe.maxHp * o.regen));
  }

  const foeStr = foe.str * (o.enrage ? 1 + o.enrage : 1);
  const eAtk = Math.max(1, Math.floor(foeStr + Math.floor(Math.random() * 8) - Math.floor((hero.def + pDef) * 0.4)));
  state.playerHP -= eAtk;
  if (state.playerHP < 0) state.playerHP = 0;
  state.log.push(foe.name + ' deals ' + eAtk + ' damage');

  return state.playerHP <= 0 ? 'lose' : null;
};
