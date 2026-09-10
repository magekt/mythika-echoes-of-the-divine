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
    const herbName = HERB_GROWTH[herb] ? HERB_GROWTH[herb].name : herb;
    if (Economy.getItemCount(herbName) < qty) {
      return false;
    }
  }
  return true;
};

AlchemySystem.craft = function(recipeId) {
  if (!this.canCraft(recipeId)) return false;
  const recipe = ALCHEMY_RECIPES[recipeId];
  for (const [herb, qty] of Object.entries(recipe.ingredients)) {
    const herbName = HERB_GROWTH[herb] ? HERB_GROWTH[herb].name : herb;
    Economy.removeItemByName(herbName, qty);
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
  const herbName = HERB_GROWTH[herbId] ? HERB_GROWTH[herbId].name : herbId;
  return Economy.getItemCount(herbName);
};
