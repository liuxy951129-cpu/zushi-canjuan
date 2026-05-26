/* ================================================================
   坊市 · 买卖 + 招募 双 tab
   ================================================================ */
const Recruit = (() => {

  // —— 招募散修立绘 ——
  const PORTRAITS = [
    { pic:"r_swordmaiden", arch:"剑侍", base:{root:7,wit:5,mind:6,spirit:6,luck:5} },
    { pic:"r_scholar",     arch:"书生", base:{root:3,wit:9,mind:7,spirit:7,luck:5} },
    { pic:"r_youth",       arch:"少年", base:{root:5,wit:6,mind:5,spirit:5,luck:8} },
    { pic:"r_priestess",   arch:"祭司", base:{root:4,wit:7,mind:9,spirit:8,luck:5} },
    { pic:"r_assassin",    arch:"刺客", base:{root:6,wit:7,mind:4,spirit:7,luck:6} },
    { pic:"r_drunk",       arch:"剑痴", base:{root:8,wit:6,mind:3,spirit:5,luck:4} },
  ];

  const SURNAMES = ["陆","萧","顾","柳","沈","云","白","裴","封","薛","明","姬","苏","卓","季","步"];
  const GIVEN_M = ["十一","清远","昭","知秋","见雪","归海","无尘","凌川","羡夜","承墨","南风","怀璧"];
  const GIVEN_F = ["十一","怀玉","清晚","若雪","知夏","南音","抚风","拾月","执棠","辞渊","观沧","映白"];

  function rngName(gender){
    const s = SURNAMES[Math.floor(Math.random()*SURNAMES.length)];
    const g = (gender==="女") ? GIVEN_F : GIVEN_M;
    return s + g[Math.floor(Math.random()*g.length)];
  }

  function rollPool(){
    const day = G.state.day;
    const baseDay = Math.floor((day-1)/3) * 3;
    const cacheKey = "recruit_pool_" + baseDay;
    G.state[cacheKey] = G.state[cacheKey] || generatePool(baseDay);
    return G.state[cacheKey];
  }
  function generatePool(seed){
    const out = [];
    const used = new Set();
    for(let i=0;i<3;i++){
      let pi;
      do { pi = Math.floor(Math.random()*PORTRAITS.length); } while(used.has(pi) && used.size<PORTRAITS.length);
      used.add(pi);
      const tpl = PORTRAITS[pi];
      const gender = (tpl.pic==="r_swordmaiden"||tpl.pic==="r_priestess"||tpl.pic==="r_assassin") ? "女" : "男";
      const name = rngName(gender);
      const stats = {};
      Object.keys(tpl.base).forEach(k => { stats[k] = Math.max(1, tpl.base[k] + (Math.random()<0.5?-1:1)*Math.floor(Math.random()*2)); });
      const realm = Math.random()<0.2 ? 1 : 0;
      out.push({
        id: "r_"+Math.random().toString(36).slice(2,8),
        name, title: tpl.arch, gender,
        pic: tpl.pic, arch: tpl.arch,
        age: 16 + Math.floor(Math.random()*16),
        life: 100 + Math.floor(Math.random()*60),
        realm, exp: Math.floor(Math.random()*40),
        stats,
        bio: rngBio(tpl.arch, name),
        skill: rngSkill(tpl.arch),
        cost: 80 + Math.floor(Math.random()*60),
      });
    }
    return out;
  }
  function rngBio(arch, name){
    const tpl = ({
      "剑侍":[name+"，前世家弃女。一柄旧剑随她浪迹江湖三载。\n听说本派败落，竟自请归山。"],
      "书生":[name+"，前科举落第。书读得越多，越觉这世道与圣贤之言相去甚远。"],
      "少年":[name+"，山下村童。父母早逝，靠着野果充饥长到这年纪。"],
      "祭司":[name+"，自小在道观长大。月夜里能听见星辰流转的声音。"],
      "刺客":[name+"，曾为暗门最年轻的执刃者。有一夜她突然封刀，从此不再杀人。"],
      "剑痴":[name+"，五十岁前是江湖排得上号的剑客，五十岁后醉得连名字都记不清。"],
    })[arch] || [name+"，散修一名。"];
    return tpl[Math.floor(Math.random()*tpl.length)];
  }
  function rngSkill(arch){
    return ({
      "剑侍":"流光剑诀","书生":"格物心经","少年":"懵懂体术","祭司":"星辰降命","刺客":"无声步","剑痴":"醉八仙剑"
    })[arch] || "无名功法";
  }

  // —— 坊市商品 ——
  // 按天数轮换；每批 6 件（武器 2 + 丹药 2 + 礼物 2）
  function shopPool(){
    const baseDay = Math.floor((G.state.day-1)/3) * 3;
    const cacheKey = "shop_pool_" + baseDay;
    if(G.state[cacheKey]) return G.state[cacheKey];
    // 随机选 6 件
    const allIds = ITEMS.filter(i => i.type === "weapon" || i.type === "pill" || i.type === "gift").map(i => i.id);
    const shuffled = allIds.slice().sort(() => Math.random()-0.5);
    const pick = shuffled.slice(0, 6);
    const stock = pick.map(id => ({
      id,
      price: priceOf(id),
      left: 1 + Math.floor(Math.random()*2),
    }));
    G.state[cacheKey] = stock;
    return stock;
  }
  function priceOf(id){
    const it = ITEM(id);
    if(!it) return 200;
    const base = ({pill:80, gift:60, weapon:180, scroll:200})[it.type] || 100;
    return base * (it.rarity || 1);
  }

  // —— 主打开：双 tab ——
  let curTab = "recruit"; // 默认招募（保留旧体验）

  function open(){
    Modal.openHTML(`
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px">
        <button class="bz-tab" data-bz="recruit" style="padding:8px 22px;border:1px solid var(--gold);background:rgba(20,15,12,.6);color:var(--gold-2);font-family:Ma Shan Zheng;font-size:14px;letter-spacing:.18em;cursor:pointer;border-radius:4px">◇ 招 募</button>
        <button class="bz-tab" data-bz="shop" style="padding:8px 22px;border:1px solid var(--gold);background:rgba(20,15,12,.6);color:var(--gold-2);font-family:Ma Shan Zheng;font-size:14px;letter-spacing:.18em;cursor:pointer;border-radius:4px">◈ 买 卖</button>
      </div>
      <div id="bz-body"></div>
    `);
    document.querySelectorAll('.bz-tab').forEach(b => {
      b.onclick = () => { curTab = b.dataset.bz; renderTab(); };
    });
    renderTab();
  }

  function renderTab(){
    document.querySelectorAll('.bz-tab').forEach(b => {
      if(b.dataset.bz === curTab){
        b.style.background = 'linear-gradient(180deg, rgba(168,50,54,.55), rgba(60,12,16,.95))';
        b.style.color = '#fff';
      } else {
        b.style.background = 'rgba(20,15,12,.6)';
        b.style.color = 'var(--gold-2)';
      }
    });
    if(curTab === "recruit") renderRecruit();
    else renderShop();
  }

  function renderRecruit(){
    const pool = rollPool();
    const refreshIn = 3 - ((G.state.day-1) % 3);
    const body = document.getElementById("bz-body");
    body.innerHTML = `
      <h3 style="text-align:center;margin:0 0 6px 0">坊 市 · 招 募</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center;margin-bottom:14px">山下散修流徙。本批将于 <b style="color:var(--candle)">${refreshIn}</b> 日后更替。</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px" id="rec-grid"></div>
      <div class="modal-row" style="margin-top:14px"><button class="btn ghost" data-act="modal-close">关 上</button></div>
    `;
    const grid = document.getElementById("rec-grid");
    pool.forEach(r => {
      const recruited = G.state.flags?.["recruited_"+r.id];
      const card = document.createElement("div");
      card.className = "rec-card";
      card.innerHTML = [
        '<div class="rec-pic" style="background-image:url(assets/portraits/' + r.pic + '.jpg)"></div>',
        '<div class="rec-name">' + r.name + '</div>',
        '<div class="rec-arch">' + r.arch + ' · ' + r.gender + ' · ' + r.age + '岁</div>',
        '<div class="rec-stats">根' + r.stats.root + ' 悟' + r.stats.wit + ' 心' + r.stats.mind + ' 灵' + r.stats.spirit + ' 运' + r.stats.luck + '</div>',
        '<div class="rec-bio">' + r.bio.replace(/\n/g,"<br>") + '</div>',
        recruited
          ? '<div class="rec-cost" style="color:var(--jade)">已 入 门</div>'
          : '<button class="mini-btn primary rec-btn" style="margin-top:auto">招 入（' + r.cost + ' 铜钱）</button>',
      ].join('');
      const btn = card.querySelector(".rec-btn");
      if(btn){
        btn.onclick = () => {
          if((G.state.coin||0) < r.cost){ toast("铜钱不足", "bad"); return; }
          G.state.coin -= r.cost;
          G.state.flags = G.state.flags || {};
          G.state.flags["recruited_"+r.id] = true;
          G.state.disciples.push({
            id: r.id, name: r.name, title: r.arch + " · 入门弟子", gender: r.gender, pic: r.pic,
            age: r.age, life: r.life, realm: r.realm, exp: r.exp,
            stats: { ...r.stats }, bio: r.bio, bonds: [], skill: r.skill, flags: {},
          });
          SFX.play("up");
          toast(r.name + " 入门下", "good");
          if(typeof Tasks !== 'undefined') Tasks.mark('t_first_recruit');
          Save.persist();
          Main.updateHUD();
          renderRecruit();
        };
      }
      grid.appendChild(card);
    });
  }

  function renderShop(){
    const stock = shopPool();
    const refreshIn = 3 - ((G.state.day-1) % 3);
    const body = document.getElementById("bz-body");
    body.innerHTML = `
      <h3 style="text-align:center;margin:0 0 6px 0">坊 市 · 买 卖</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center;margin-bottom:14px">坊市货郎。本批将于 <b style="color:var(--candle)">${refreshIn}</b> 日后更替。</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px" id="shop-grid"></div>
      <div style="margin-top:14px;padding:10px;background:rgba(91,138,114,.08);border:1px solid var(--jade);border-radius:6px;font-size:11px;color:var(--ink-3);line-height:1.7;text-align:center">「掌门若想卖货，可去背囊面板。这是后续版本要做的事。」</div>
      <div class="modal-row" style="margin-top:10px"><button class="btn ghost" data-act="modal-close">关 上</button></div>
    `;
    const grid = document.getElementById("shop-grid");
    stock.forEach(s => {
      const it = ITEM(s.id);
      if(!it) return;
      const card = document.createElement("div");
      card.className = "item-cell rar-" + (it.rarity||1);
      card.style.cssText = "display:flex;gap:10px;padding:10px;background:rgba(20,15,12,.7);border:1px solid var(--gold);border-radius:6px;align-items:center";
      card.innerHTML = [
        '<div style="width:56px;height:56px;background:url(assets/icons/' + it.icon + '.png) center/cover #1a1310;border:1px solid var(--gold);border-radius:4px;flex-shrink:0"></div>',
        '<div style="flex:1;min-width:0">',
        '<div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:14px">' + it.name + ' <span style="font-size:10px;color:var(--ink-3);font-family:inherit">×' + s.left + '</span></div>',
        '<div style="font-size:11px;color:var(--ink-3);margin-top:2px">' + (it.ability||it.effect||it.lore.slice(0,18)+"…") + '</div>',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">',
        '<span style="font-size:12px;color:var(--candle);font-family:Ma Shan Zheng;letter-spacing:.06em">' + s.price + ' 铜钱</span>',
        (s.left <= 0)
          ? '<span style="font-size:11px;color:var(--ink-3)">已 售 罄</span>'
          : '<button class="mini-btn primary buy-btn" data-buyid="' + s.id + '">买 入</button>',
        '</div>',
        '</div>'
      ].join('');
      grid.appendChild(card);
    });
    document.querySelectorAll('.buy-btn').forEach(b => {
      b.onclick = () => {
        const sid = b.dataset.buyid;
        const sk = stock.find(x => x.id === sid);
        if(!sk || sk.left <= 0){ toast("已售罄", "bad"); return; }
        if((G.state.coin||0) < sk.price){ toast("铜钱不足", "bad"); return; }
        G.state.coin -= sk.price;
        sk.left -= 1;
        Items.add(sid, 1);
        SFX.play("chime");
        toast("已购 " + ITEM(sid).name, "good");
        Save.persist();
        Main.updateHUD();
        renderShop();
      };
    });
  }

  return { open };
})();
