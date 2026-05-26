/* ================================================================
   道具系统 · 背包 / 武器 / 丹药 / 礼物
   ================================================================ */
const Items = (() => {

  // 添加到背包
  function add(itemId, n=1){
    G.state.inv = G.state.inv || {};
    G.state.inv[itemId] = (G.state.inv[itemId]||0) + n;
  }
  // 消耗
  function consume(itemId, n=1){
    if(!G.state.inv?.[itemId]) return false;
    if(G.state.inv[itemId] < n) return false;
    G.state.inv[itemId] -= n;
    if(G.state.inv[itemId] <= 0) delete G.state.inv[itemId];
    return true;
  }
  // 数量
  function count(itemId){ return G.state.inv?.[itemId] || 0; }

  // —— 打开背包面板 ——
  function open(){
    const inv = G.state.inv || {};
    const ids = Object.keys(inv).filter(id => inv[id] > 0);

    // 按类型分组
    const groups = { weapon:[], pill:[], gift:[], scroll:[], misc:[] };
    ids.forEach(id => {
      const it = ITEM(id);
      if(!it) return;
      (groups[it.type]||groups.misc).push({...it, count: inv[id]});
    });

    const renderGroup = (title, arr) => {
      if(!arr.length) return `<div style="margin-top:14px"><h4 style="font-family:Ma Shan Zheng;color:var(--gold-2);letter-spacing:.18em;margin:0 0 10px 0">${title}</h4><div style="font-size:11px;color:var(--ink-3);text-align:center;padding:12px 0">— 暂无 —</div></div>`;
      return `<div style="margin-top:14px">
        <h4 style="font-family:Ma Shan Zheng;color:var(--gold-2);letter-spacing:.18em;margin:0 0 10px 0">${title} <span style="font-size:11px;color:var(--ink-3);font-family:inherit;letter-spacing:.05em">${arr.length} 种</span></h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">
          ${arr.map(it => `
            <div class="item-cell rar-${it.rarity}" style="display:flex;gap:10px;padding:8px;background:rgba(20,15,12,.7);border:1px solid rgba(201,163,90,${0.15+it.rarity*0.1});border-radius:6px;cursor:pointer" data-it="${it.id}">
              <div style="width:46px;height:46px;background:url(assets/icons/${it.icon}.png) center/cover #1a1310;border:1px solid var(--gold);border-radius:4px;flex-shrink:0"></div>
              <div style="flex:1;min-width:0">
                <div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:13px;display:flex;justify-content:space-between"><span>${it.name}</span><span style="color:var(--ink-3);font-size:11px;font-family:inherit">×${it.count}</span></div>
                <div style="font-size:10px;color:var(--ink-3);margin-top:2px;line-height:1.4">${it.ability||it.effect||it.lore?.slice(0,28)+'…'||''}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>`;
    };

    Modal.openHTML(`
      <h3>背 囊 · 道 具</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center;margin-bottom:6px">「掌门，今日所拥之物。」</div>
      ${renderGroup("武 器", groups.weapon)}
      ${renderGroup("丹 药", groups.pill)}
      ${renderGroup("礼 物", groups.gift)}
      ${renderGroup("卷 轴", groups.scroll)}
      ${renderGroup("杂 物", groups.misc)}
      <div class="modal-row" style="margin-top:18px">
        <button class="btn ghost" data-act="modal-close">关 上</button>
      </div>
    `);

    // 点击物品看详情
    document.querySelectorAll(".item-cell[data-it]").forEach(cell => {
      cell.onclick = () => openItem(cell.dataset.it);
    });
  }

  // 物品详情
  function openItem(id){
    const it = ITEM(id);
    if(!it) return;
    const c = count(id);
    const useable = it.type === "pill" || it.type === "gift";
    Modal.openHTML(`
      <div style="display:grid;grid-template-columns:140px 1fr;gap:18px;align-items:start">
        <div style="width:140px;height:140px;border-radius:6px;background:url(assets/icons/${it.icon}.png) center/cover #1a1310;border:2px solid var(--gold);box-shadow:0 0 18px rgba(201,163,90,.3)"></div>
        <div>
          <h3 style="margin:0 0 4px 0;color:var(--gold-2)">${it.name}</h3>
          <div style="font-size:11px;color:var(--ink-3);letter-spacing:.18em;margin-bottom:8px">品阶 ${"★".repeat(it.rarity)} · 持有 ×${c}</div>
          <div style="font-size:13px;color:var(--gold);margin-bottom:10px;font-family:Ma Shan Zheng;letter-spacing:.1em">${it.ability||it.effect||"—"}</div>
          <div style="font-size:12px;color:var(--ink-2);line-height:1.8;border-left:2px solid var(--gold);padding-left:12px">${it.lore||""}</div>
        </div>
      </div>
      <div class="modal-row" style="margin-top:18px">
        ${useable && c > 0 ? `<button class="btn primary" id="btn-use-it">${it.type==='pill'?'服 用':'选 弟 子 赠 与'}</button>` : ""}
        <button class="btn ghost" data-act="modal-close">放 回</button>
      </div>
    `);
    if(useable && c > 0){
      document.getElementById("btn-use-it").onclick = () => {
        if(it.type === "pill") openPillUse(id);
        else openGiftPicker(null, id);
      };
    }
  }

  // 服丹：选弟子
  function openPillUse(pillId){
    const pill = ITEM(pillId);
    const list = G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left && !d.flags?.hidden && !d.flags?.locked);
    Modal.openHTML(`
      <h3>${pill.name} · 服 用 于</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3)">「这丹效，由谁先尝？」</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:14px">
        ${list.map(d => `
          <div data-pid="${d.id}" style="padding:8px;background:rgba(20,15,12,.7);border:1px solid var(--gold);border-radius:6px;cursor:pointer;text-align:center">
            <div style="width:80px;height:100px;margin:0 auto;border-radius:4px;background:url(assets/portraits/${d.pic}.jpg) center/cover #1a1310;border:1px solid var(--gold)"></div>
            <div style="font-family:Ma Shan Zheng;color:var(--gold-2);margin-top:6px">${d.name}</div>
            <div style="font-size:10px;color:var(--ink-3)">${REALMS[d.realm]}</div>
          </div>
        `).join("")}
      </div>
      <div class="modal-row" style="margin-top:14px"><button class="btn ghost" data-act="modal-close">作 罢</button></div>
    `);
    document.querySelectorAll("[data-pid]").forEach(el => {
      el.onclick = () => {
        const d = G.state.disciples.find(x => x.id === el.dataset.pid);
        if(!consume(pillId, 1)){ toast("已无此物", "bad"); return; }
        applyPillEffect(d, pill);
        Save.persist();
        Main.updateHUD();
        Modal.close();
      };
    });
  }

  function applyPillEffect(d, pill){
    if(pill.id === "pill_ningshen"){
      d.exp += 30; d.stats.mind += 1;
      toast(`${d.name} 服下 ${pill.name}：修为 +30 / 心境 +1`, "good");
    } else if(pill.id === "pill_huiyuan"){
      d.life += 1;
      toast(`${d.name} 服下 ${pill.name}：寿元 +1`, "good");
    } else if(pill.id === "pill_dagong"){
      if(Math.random() < 0.05){
        d.exp = Math.floor(d.exp*0.5);
        toast(`${d.name} 走火入魔，修为减半`, "bad");
      } else {
        d.exp += 120;
        toast(`${d.name} 服下 ${pill.name}：修为 +120`, "good");
      }
    } else if(pill.id === "pill_dujie"){
      d.flags.dujieBlessed = true;
      toast(`${d.name} 渡劫加持已激活`, "good");
    }
    SFX?.play?.("up");
  }

  // 选礼物送弟子（disId 为空时让用户选弟子）
  function openGiftPicker(disId, giftId){
    if(disId && !giftId){
      // 从弟子详情来的：先选礼物
      const giftIds = Object.keys(G.state.inv||{}).filter(id => {
        const it = ITEM(id);
        return it && it.type === "gift";
      });
      if(!giftIds.length){
        Modal.openHTML(`<h3>赠 礼</h3><div class="lead">背囊里没有可送的礼物。<br>下次去坊市看看？</div><div class="modal-row"><button class="btn ghost" data-act="modal-close">作 罢</button></div>`);
        return;
      }
      Modal.openHTML(`
        <h3>选 一 件 礼 物</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-top:14px">
          ${giftIds.map(gid => {
            const it = ITEM(gid);
            const c = count(gid);
            return `<div data-gpick="${gid}" style="padding:8px;background:rgba(20,15,12,.7);border:1px solid var(--gold);border-radius:6px;cursor:pointer">
              <div style="display:flex;gap:10px;align-items:center">
                <div style="width:46px;height:46px;background:url(assets/icons/${it.icon}.png) center/cover #1a1310;border:1px solid var(--gold);border-radius:4px"></div>
                <div><div style="font-family:Ma Shan Zheng;color:var(--gold-2)">${it.name} ×${c}</div><div style="font-size:10px;color:var(--ink-3)">好感 +${it.bond}</div></div>
              </div>
            </div>`;
          }).join("")}
        </div>
        <div class="modal-row" style="margin-top:14px"><button class="btn ghost" data-act="modal-close">作 罢</button></div>
      `);
      document.querySelectorAll("[data-gpick]").forEach(el => {
        el.onclick = () => giveGift(disId, el.dataset.gpick);
      });
      return;
    }
    if(!disId && giftId){
      // 从背包来的：先选弟子
      const gift = ITEM(giftId);
      const list = G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left && !d.flags?.hidden && !d.flags?.locked && d.id !== "master");
      const targets = gift.target?.includes("all") ? list : list.filter(d => gift.target?.includes(d.id));
      if(!targets.length){
        Modal.openHTML(`<h3>${gift.name}</h3><div class="lead">这礼物没人合用。</div><div class="modal-row"><button class="btn ghost" data-act="modal-close">放 回</button></div>`);
        return;
      }
      Modal.openHTML(`
        <h3>${gift.name} · 赠 与</h3>
        <div class="lead" style="font-size:12px;color:var(--ink-3)">「这礼物 ${gift.target?.includes('all')?'人人合宜':'专合 '+targets.map(t=>t.name).join('/')}」</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:14px">
          ${targets.map(d => `
            <div data-gpick="${d.id}" style="padding:8px;background:rgba(20,15,12,.7);border:1px solid var(--gold);border-radius:6px;cursor:pointer;text-align:center">
              <div style="width:80px;height:100px;margin:0 auto;border-radius:4px;background:url(assets/portraits/${d.pic}.jpg) center/cover #1a1310;border:1px solid var(--gold)"></div>
              <div style="font-family:Ma Shan Zheng;color:var(--gold-2);margin-top:6px">${d.name}</div>
            </div>
          `).join("")}
        </div>
        <div class="modal-row" style="margin-top:14px"><button class="btn ghost" data-act="modal-close">作 罢</button></div>
      `);
      document.querySelectorAll("[data-gpick]").forEach(el => {
        el.onclick = () => giveGift(el.dataset.gpick, giftId);
      });
    }
  }

  function giveGift(disId, giftId){
    const gift = ITEM(giftId);
    const d = G.state.disciples.find(x => x.id === disId);
    if(!gift || !d){ toast("出错了", "bad"); return; }
    if(!consume(giftId, 1)){ toast("已无此物", "bad"); return; }
    // 更新好感
    Interact.addBond?.(disId, gift.bond || 5);
    SFX?.play?.("chime");
    Modal.openHTML(`
      <h3>赠 ${gift.name}</h3>
      <div style="display:grid;grid-template-columns:120px 1fr;gap:18px;align-items:center;margin-top:8px">
        <div style="width:120px;height:150px;border-radius:6px;background:url(assets/portraits/${d.pic}.jpg) center/cover #1a1310;border:1px solid var(--gold)"></div>
        <div>
          <div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:18px;margin-bottom:6px">${d.name} 收下了</div>
          <div style="font-size:13px;color:var(--ink-2);line-height:1.8">${giftReact(d, gift)}</div>
          <div style="font-size:12px;color:var(--candle);margin-top:10px">好 感 +${gift.bond||5}</div>
        </div>
      </div>
      <div class="modal-row" style="margin-top:14px"><button class="btn primary" data-act="modal-close">嗯 →</button></div>
    `);
    Save.persist();
  }

  function giftReact(d, gift){
    const matches = gift.target?.includes(d.id);
    if(matches){
      const reacts = {
        chenyuan:`「……谢掌门。」（他点点头，把礼物收得很慎重）`,
        lingxue:`「掌门有心。」（她抬眼笑了一下，眼角微红）`,
        shixiong:`「哈！这个我喜欢——掌门，干一杯！」`,
        xiaoyu:`「真的可以送给我吗？……我会好好收着。」（她抱着礼物）`,
        heimo:`「……」（他没说话，但收下了）`,
      };
      return reacts[d.id] || `「多谢掌门赐物。」`;
    }
    return `「这……合适吗？」（她/他犹豫地接过）`;
  }

  return { add, consume, count, open, openItem, openGiftPicker, openPillUse };
})();
