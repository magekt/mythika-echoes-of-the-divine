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
    const listH = G.H - listY - 50;

    if (isBuy) {
      const buyItems = this.data.inventory;
      const list = UI.ScrollList(14, listY, G.W - 28, listH, {
        itemHeight: 36,
        itemGap: 4,
        onRenderItem: function(ctx, item, i, x, y, w, h, selected) {
          const cost = getItemCost(item);
          const canBuy = (G.state.gold || 0) >= cost;
          R.roundRect(ctx, x, y, w, h, 5, selected ? R.colors.gold : (canBuy ? 'rgba(232,160,48,0.12)' : R.colors.btn));
          if (!canBuy) ctx.globalAlpha = 0.45;
          R.roundRect(ctx, x, y, 5, h, 0, R.colors.gold);
          const typeLabel = item.type || '';
          R.text(ctx, typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1), x + 34, y + 14, R.colors.gold, R.fonts.xs);
          R.text(ctx, item.name, x + 34, y + 26, R.colors.white, R.fonts.sm);
          R.text(ctx, cost + 'g', x + w - 50, y + 14, canBuy ? R.colors.gold : R.colors.red, R.fonts.sm);
          if (item.desc) {
            R.text(ctx, item.desc, x + 34, y + h - 6, R.colors.textDim, R.fonts.xs);
          }
          if (item.atk) R.text(ctx, 'ATK+' + item.atk, x + w - 90, y + 26, R.colors.orange, R.fonts.xs);
          if (item.def) R.text(ctx, 'DEF+' + item.def, x + w - 90, y + 26, R.colors.blueLight, R.fonts.xs);
          if (item.mag) R.text(ctx, 'MAG+' + item.mag, x + w - 90, y + 26, R.colors.blueLight, R.fonts.xs);
          ctx.globalAlpha = 1;
        },
        onClick: function(item, i) {
          const cost = getItemCost(item);
          if (Economy.spendGold(cost)) {
            G.state.inventory.push(JSON.parse(JSON.stringify(item)));
            bazaarScene.data.inventory.splice(i, 1);
            Notify.show('Bought ' + item.name + '!', 2);
            bazaarScene.buildBuySellLists();
            Audio.click();
          } else {
            Notify.show('Not enough gold! Need ' + cost + 'g', 2);
          }
        }
      });
      list.setItems(buyItems);
      this.data.buyList = list;

      const refreshBtn = UI.Button(20, G.H - 42, 140, 26, 'Refresh (10g)');
      refreshBtn.onClick = function() {
        if (Economy.spendGold(10)) {
          bazaarScene.generateInventory();
          bazaarScene.buildBuySellLists();
        }
      };
      this.data.buttons.push(refreshBtn);
    } else {
      const inv = G.state.inventory || [];
      const list = UI.ScrollList(14, listY, G.W - 28, listH, {
        itemHeight: 36,
        itemGap: 4,
        onRenderItem: function(ctx, item, i, x, y, w, h, selected) {
          const sellPrice = Math.floor((getItemCost(item) || 5) * 0.5);
          const qtyStr = item.qty && item.qty > 1 ? ' x' + item.qty : '';
          R.roundRect(ctx, x, y, w, h, 5, selected ? R.colors.gold : 'rgba(138,138,160,0.08)');
          R.roundRect(ctx, x, y, 5, h, 0, R.colors.textDim);
          const typeLabel = item.type || '';
          R.text(ctx, typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1) + qtyStr, x + 34, y + 14, R.colors.textDim, R.fonts.sm);
          R.text(ctx, item.name, x + 34, y + 26, R.colors.white, R.fonts.sm);
          R.text(ctx, sellPrice + 'g', x + w - 50, y + 18, R.colors.gold, R.fonts.sm);
        },
        onClick: function(item, i) {
          const realIdx = G.state.inventory.indexOf(item);
          if (realIdx === -1) return;
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

    const back = UI.Button(G.W / 2 - 80, G.H - 12, 160, 26, 'Back to Ashram', R.colors.btnGold);
    back.onClick = function() { gScene('ashram', true); };
    this.data.buttons.push(back);
  },

  update: function(dt) {
    UI.updateButtons(this.data.buttons, dt);
    if (this.data.tabBar) this.data.tabBar.handleInput();
    if (this.data.buyList) this.data.buyList.update();
    if (this.data.sellList) this.data.sellList.update();
    if (this.data.buyList) this.data.buyList.handleInput();
    if (this.data.sellList) this.data.sellList.handleInput();
    UI.handleButtons(this.data.buttons);
    UI.Modal.handleInput();
  },

  render: function(ctx) {
    R.roundRect(ctx, 10, 6, G.W - 20, 78, 8, R.colors.panel);
    ctx.strokeStyle = 'rgba(232,160,48,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10.5, 6.5, G.W - 21, 77);

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
