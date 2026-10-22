// Helper: compute wrapped text height for bazaar items
const computeBazaarItemHeight = function(item, listWidth) {
  // Layout: left 5px bar + 4px padding + content (name, desc, stat, price)
  // Content width: listWidth - 5 (bar) - 34 (padding+type) - 50 (price) - 8 (gaps)
  const contentW = listWidth - 5 - 34 - 50 - 8;
  let lines = 1; // minimum 1 line for name
  
  // Estimate lines: name (often wraps), description (if present)
  const nameLines = Math.ceil((item.name ? item.name.length : 0) * 5.5 / contentW) || 1;
  const descLines = item.desc ? Math.ceil(item.desc.length * 4.8 / contentW) : 0;
  lines = Math.max(1, nameLines + (descLines > 0 ? 1 + descLines : 0));
  
  // Cap at 3 lines; clamp at least 1
  lines = Math.min(3, Math.max(1, lines));
  
  // Base 14px per line + 4px padding = 14*lines + 4
  return lines * 14 + 4;
};

const bazaarScene = Scene.create({
  name: 'bazaar',
  data: {
    buttons: [],
    inventory: [],
    tabBar: null,
    buyList: null,
    sellList: null
  },

  enter: function() {
    this.generateInventory();
    this.buildUI();
  },

  leave: function() {
    this._heroMoment = null;
    this.data.buttons = [];
    this.data.inventory = [];
    this.data.tabBar = null;
    this.data.buyList = null;
    this.data.sellList = null;
  },

  generateInventory: function() {
    this.data.inventory = [];
    const allWeapons = Object.values(ITEMS.weapons).filter(i => !i.unique);
    const allArmors = Object.values(ITEMS.armors);
    const allAccessories = Object.values(ITEMS.accessories);
    const allConsumables = Object.values(ITEMS.consumables);
    const allItems = [...allWeapons, ...allArmors, ...allAccessories, ...allConsumables];
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const item = allItems[Math.floor(Math.random() * allItems.length)];
      this.data.inventory.push(JSON.parse(JSON.stringify(item)));
    }
    // Recipe scrolls: offer 1-2 undiscovered recipes as learnable scrolls.
    const learned = G.state.alchemyRecipes || [];
    const undiscovered = Object.values(ALCHEMY_RECIPES).filter(r => !learned.includes(r.id));
    const offerCount = Math.min(2, undiscovered.length);
    for (let i = 0; i < offerCount; i++) {
      const r = undiscovered[Math.floor(Math.random() * undiscovered.length)];
      if (!r || this.data.inventory.some(it => it.recipeId === r.id)) continue;
      const cost = 120 * r.reqAshram;
      this.data.inventory.push({ name: 'Recipe: ' + r.name, type: 'recipe', recipeId: r.id, cost: cost, desc: 'Teaches ' + r.name + ' (' + r.desc + ')' });
    }
  },

  buildUI: function() {
    this.data.buttons = [];
    const tabBar = UI.TabBar(30, 90, G.W - 60, 28, {
      onChange: function(idx) {
        bazaarScene.buildBuySellLists();
      }
    });
    tabBar.setTabs(['Buy', 'Sell']);
    this.data.tabBar = tabBar;
    this.buildBuySellLists();
  },

  buildBuySellLists: function() {
    const isBuy = this.data.tabBar && this.data.tabBar.getActiveIndex() === 0;
    this.data.buttons = [];
    this.data.buyList = null;
    this.data.sellList = null;
    const listY = 125;
    const footerY = G.H - 50;
    const footerH = 56;
    const listH = G.H - listY - footerH;
    const footerButtonW = (G.W - 36) / 2;

    if (isBuy) {
      const buyItems = this.data.inventory;
      const listW = G.W - 28;
      const list = UI.ScrollList(14, listY, listW, listH, {
        getItemHeight: function(item) { return computeBazaarItemHeight(item, listW); },
        itemGap: 4,
        onRenderItem: function(ctx, item, i, x, y, w, h, selected) {
          const cost = getItemCost(item);
          const canBuy = (G.state.gold || 0) >= cost;
          R.roundRect(ctx, x, y, w, h, 5, selected ? R.colors.gold : (canBuy ? 'rgba(232,160,48,0.12)' : R.colors.btn));
          if (!canBuy) ctx.globalAlpha = 0.45;
          R.roundRect(ctx, x, y, 5, h, 0, R.colors.gold);
          const typeLabel = item.type || '';
          R.text(ctx, typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1), x + 34, y + 8, R.colors.gold, R.fonts.xs);
          R.text(ctx, item.name, x + 34, y + 20, R.colors.white, R.fonts.sm);
          R.text(ctx, cost + 'g', x + w - 50, y + 8, canBuy ? R.colors.gold : R.colors.red, R.fonts.sm);
          if (item.desc) {
            R.text(ctx, item.desc, x + 34, y + h - 14, R.colors.textDim, R.fonts.xs);
          }
          if (item.atk) R.text(ctx, 'ATK+' + item.atk, x + w - 90, y + 20, R.colors.orange, R.fonts.xs);
          if (item.def) R.text(ctx, 'DEF+' + item.def, x + w - 90, y + 20, R.colors.blueLight, R.fonts.xs);
          if (item.mag) R.text(ctx, 'MAG+' + item.mag, x + w - 90, y + 20, R.colors.blueLight, R.fonts.xs);
          ctx.globalAlpha = 1;
        },
        onClick: function(item, i) {
          const cost = getItemCost(item);
          if (item.type === 'recipe' && item.recipeId) {
            if (Economy.spendGold(cost)) {
              if (AlchemySystem.learnRecipe(item.recipeId)) {
                Notify.show('Learned ' + item.name + '!', 2, R.colors.gold);
              } else {
                Notify.show('Recipe already known!', 2);
              }
              bazaarScene.data.inventory.splice(i, 1);
              bazaarScene.buildBuySellLists();
              Audio.click();
            } else {
              Notify.show('Not enough gold! Need ' + cost + 'g', 2);
              return false;
            }
            return;
          }
          if (Economy.spendGold(cost)) {
            G.state.inventory.push(JSON.parse(JSON.stringify(item)));
            bazaarScene.data.inventory.splice(i, 1);
            Notify.show('Bought ' + item.name + '!', 2);
            bazaarScene.buildBuySellLists();
            Audio.click();
          } else {
            Notify.show('Not enough gold! Need ' + cost + 'g', 2);
            return false;
          }
        }
      });
      list.setItems(buyItems);
      this.data.buyList = list;

      const refreshBtn = UI.Button(14, footerY, footerButtonW, 44, 'Refresh (10g)');
      refreshBtn.onClick = function() {
        if (Economy.spendGoldOrNotify(10)) {
          bazaarScene.generateInventory();
          bazaarScene.buildBuySellLists();
        } else {
          return false;
        }
      };
      this.data.buttons.push(refreshBtn);
    } else {
      const inv = (G.state.inventory || []).filter(i => typeof i === 'object' && i.name);
      const list = UI.ScrollList(14, listY, G.W - 28, listH, {
        getItemHeight: function(item) { return computeBazaarItemHeight(item, G.W - 28); },
        itemGap: 4,
        onRenderItem: function(ctx, item, i, x, y, w, h, selected) {
          const sellPrice = Math.floor((getItemCost(item) || 5) * 0.5);
          const qtyStr = item.qty && item.qty > 1 ? ' x' + item.qty : '';
          R.roundRect(ctx, x, y, w, h, 5, selected ? R.colors.gold : 'rgba(138,138,160,0.08)');
          R.roundRect(ctx, x, y, 5, h, 0, R.colors.textDim);
          const typeLabel = item.type || '';
          R.text(ctx, typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1) + qtyStr, x + 34, y + 8, R.colors.textDim, R.fonts.sm);
          R.text(ctx, item.name, x + 34, y + 20, R.colors.white, R.fonts.sm);
          R.text(ctx, sellPrice + 'g', x + w - 50, y + 8, R.colors.gold, R.fonts.sm);
          if (item.desc) {
            R.text(ctx, item.desc, x + 34, y + h - 14, R.colors.textDim, R.fonts.xs);
          }
        },
        onClick: function(item, i) {
          const realIdx = G.state.inventory.indexOf(item);
          if (realIdx === -1) return false;
          const sellPrice = Math.floor((getItemCost(item) || 5) * 0.5);
          Economy.removeItem(realIdx);
          Economy.addGold(sellPrice);
          Notify.show('Sold for ' + sellPrice + 'g!', 2);
          bazaarScene.buildBuySellLists();
          Audio.click();
        }
      });
      if (inv.length === 0) {
        const emptyItem = { label: 'Nothing to sell.', name: 'Nothing to sell.', type: '' };
        list.setItems([emptyItem]);
        list.onRenderItem = function(ctx, item, i, x, y, w, h, selected) {
          R.textCenter(ctx, 'Nothing to sell.', x + w / 2, y + h / 2 + 3, R.colors.textDim, R.fonts.sm);
        };
      } else {
        list.setItems(inv);
      }
      this.data.sellList = list;
    }

    const back = isBuy
      ? UI.Button(G.W - 14 - footerButtonW, footerY, footerButtonW, 44, 'Back to Ashram', R.colors.btnGold)
      : UI.Button(G.W / 2 - 100, footerY, 200, 44, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', true, { restoreScroll: true }); };
    this.data.buttons.push(back);
  },

  update: function(dt) {
    if (UI.Modal.active) { UI.Modal.handleInput(); return; }
    UI.updateButtons(this.data.buttons, dt);
    if (this.data.tabBar) this.data.tabBar.handleInput();
    if (this.data.buyList) this.data.buyList.update();
    if (this.data.sellList) this.data.sellList.update();
    if (this.data.buyList) this.data.buyList.handleInput();
    if (this.data.sellList) this.data.sellList.handleInput();
    UI.handleButtons(this.data.buttons);
  },

  render: function(ctx) {
    Scene.drawHeader(ctx, 78);

    R.textCenter(ctx, 'Bazaar', G.W / 2, 24, R.colors.gold, R.fonts.lg);
    R.textCenter(ctx, 'Gold: ' + (G.state.gold || 0) + 'g', G.W / 2, 48, R.colors.gold, R.fonts.sm);
    R.textCenter(ctx, 'Items: ' + (G.state.inventory ? G.state.inventory.length : 0) + '  |  Karma: ' + (G.state.karma || 0), G.W / 2, 66, R.colors.textDim, R.fonts.sm);

    if (this.data.tabBar) this.data.tabBar.render(ctx);
    if (this.data.buyList) this.data.buyList.render(ctx);
    if (this.data.sellList) this.data.sellList.render(ctx);
    for (const b of this.data.buttons) b.render(ctx);
    UI.Modal.render(ctx);
  }
});
