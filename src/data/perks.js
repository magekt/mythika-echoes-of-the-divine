const PERKS = {
  tier1: {
    ojas:            { name: 'Ojas',            desc: '+% physical vitality',   maxLvl: 5, costs: [1,5,25,100,250],  values: [10,25,50,100,200] },
    prajna:          { name: 'Prajna',          desc: '+% wisdom power',        maxLvl: 5, costs: [1,5,25,100,250],  values: [10,25,50,100,200] },
    drishti:         { name: 'Drishti',         desc: '+% inner vision',        maxLvl: 2, costs: [100,250],          values: [50,100] },
    tapas:           { name: 'Tapas',           desc: '+% austerity shield',    maxLvl: 5, costs: [1,5,25,100,250],  values: [5,10,15,20,25] },
    vidya:           { name: 'Vidya',           desc: '+% knowledge gained',    maxLvl: 3, costs: [5,25,100],         values: [10,25,50] },
    samskara:        { name: 'Samskara',        desc: '+starting karmic traces',maxLvl: 3, costs: [5,25,100],         values: [2,5,10] },
    vasana:          { name: 'Vasana',          desc: '+starting karmic wealth',maxLvl: 3, costs: [5,25,100],         values: [10,25,50] },
    siddhi:          { name: 'Siddhi',          desc: '+% material manifestation',maxLvl: 3, costs: [5,25,100],      values: [10,25,50] },
    prithvi:         { name: 'Prithvi',         desc: '+max earthly abundance', maxLvl: 3, costs: [5,25,100],         values: [50,100,200] },
    ayurveda:        { name: 'Ayurveda',        desc: '+max life essence',      maxLvl: 4, costs: [5,25,100,250],     values: [3,4,5,6] },
    marga:           { name: 'Marga',           desc: '+% rare spiritual paths',maxLvl: 3, costs: [25,100,250],       values: [15,35,50] }
  }
};

function getPerkValue(perkId, level) {
  const p = PERKS.tier1[perkId];
  if (!p || level < 1) return 0;
  return p.values[Math.min(level - 1, p.values.length - 1)];
}

function getPerkCost(perkId, level) {
  const p = PERKS.tier1[perkId];
  if (!p || level > p.maxLvl) return -1;
  return p.costs[Math.min(level - 1, p.costs.length - 1)];
}
