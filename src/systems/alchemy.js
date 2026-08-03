const AlchemySystem = {};

AlchemySystem.getLearnedRecipes = function() {
  return (G.state.alchemyRecipes || []).map(id => ALCHEMY_RECIPES[id]).filter(Boolean);
};

AlchemySystem.learnRecipe = function(recipeId) {
  if (!G.state.alchemyRecipes) G.state.alchemyRecipes = [];
  if (G.state.alchemyRecipes.includes(recipeId)) return false;
  G.state.alchemyRecipes.push(recipeId);
  return true;
};

AlchemySystem.canCraft = function(recipeId) {
  const recipe = ALCHEMY_RECIPES[recipeId];
  if (!recipe) return false;
  if (recipe.reqAshram > (G.state.ashramLevel || 1)) return false;
  if (!G.state.alchemyRecipes || !G.state.alchemyRecipes.includes(recipeId)) return false;
  for (const [herb, qty] of Object.entries(recipe.ingredients)) {
    if ((G.state.farmPlots || []).filter(p => p.herb === herb && p.harvested).length < qty) {
      return false;
    }
  }
  return true;
};

AlchemySystem.craft = function(recipeId) {
  if (!this.canCraft(recipeId)) return false;
  const recipe = ALCHEMY_RECIPES[recipeId];
  for (const [herb, qty] of Object.entries(recipe.ingredients)) {
    let needed = qty;
    for (const plot of G.state.farmPlots || []) {
      if (plot.herb === herb && plot.harvested && needed > 0) {
        plot.herb = null;
        plot.harvested = false;
        plot.growTimer = 0;
        needed--;
      }
    }
  }

  const craftedItem = {
    name: recipe.name,
    type: 'consumable',
    desc: recipe.desc,
    recipeId: recipeId
  };

  const effect = recipe.effect;
  if (effect.cultivationBase) craftedItem.cultivationBase = effect.cultivationBase;
  if (effect.tribulationBonus) craftedItem.tribulationBonus = effect.tribulationBonus;
  if (effect.str) craftedItem.str = effect.str;
  if (effect.mag) craftedItem.mag = effect.mag;
  if (effect.hp) craftedItem.hp = effect.hp;
  if (effect.prana) craftedItem.prana = effect.prana;
  if (effect.divineFragments) craftedItem.divineFragments = effect.divineFragments;

  if (!G.state.inventory) G.state.inventory = [];
  Economy.addItem(craftedItem);
  if (!G.state.flags) G.state.flags = {};
  G.state.flags.itemsCrafted = (G.state.flags.itemsCrafted || 0) + 1;
  AchievementSystem.check();
  Audio.heal();
  return true;
};

AlchemySystem.getHerbCount = function(herbId) {
  return (G.state.farmPlots || []).filter(p => p.herb === herbId && p.harvested).length;
};
