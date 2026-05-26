/* ================================================================
   招募系统 · 坊市偶遇
   - 6 张预生成立绘 + 随机名字 + 随机资质
   - 每 3 日刷新一批
   - 招募一人需 100 灵石
   ================================================================ */
const Recruit = (() => {

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

  function rollPool(seed){
    // 每 3 日生成 3 个候选；用 day 做种子保持当批次稳定
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
      "剑侍":[`${name}，前世家弃女。一柄旧剑随她浪迹江湖三载。\n听说本派败落，竟自请归山。`],
      "书生":[`${name}，前科举落第。书读得越多，越觉这世道与圣贤之言相去甚远。`],
      "少年":[`${name}，山下村童。父母早逝，靠着野果充饥长到这年纪。`],
      "祭司":[`${name}，自小在道观长大。月夜里能听见星辰流转的声音。`],
      "刺客":[`${name}，曾为暗门最年轻的执刃者。有一夜她突然封刀，从此不再杀人。`],
      "剑痴":[`${name}，五十岁前是江湖排得上号的剑客，五十岁后醉得连名字都记不清。`],
    })[arch] || [`${name}，散修一名。`];
    return tpl[Math.floor(Math.random()*tpl.length)];
  }
  function rngSkill(arch){
    return ({
      "剑侍":"流光剑诀","书生":"格物心经","少年":"懵懂体术","祭司":"星辰降命","刺客":"无声步","剑痴":"醉八仙剑"
    })[arch] || "无名功法";
  }

  function open(){
    const pool = rollPool();
    const day = G.state.day;
    const refreshIn = 3 - ((day-1) % 3);

    Modal.openHTML(`
      <h3>坊 市 · 偶 遇</h3>
      <div class="lead">山下坊市，每三日有散修流徙。\n本批将于 <b style="color:var(--candle)">${refreshIn}</b> 日后更替。</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin-top:18px" id="rec-grid"></div>
    `);

    const grid = document.getElementById("rec-grid");
    pool.forEach(r => {
      const recruited = G.state.flags?.["recruited_"+r.id];
      const card = document.createElement("div");
      card.className = "rec-card";
      card.innerHTML = `
        <div class="rec-pic" style="background-image:url(assets/portraits/${r.pic}.jpg)"></div>
        <div class="rec-name">${r.name}</div>
        <div class="rec-arch">${r.arch} · ${r.gender} · ${r.age}岁</div>
        <div class="rec-stats">根${r.stats.root} 悟${r.stats.wit} 心${r.stats.mind} 灵${r.stats.spirit} 运${r.stats.luck}</div>
        <div class="rec-bio">${r.bio.replace(/\n/g,"<br>")}</div>
        ${recruited
          ? `<div class="rec-cost" style="color:var(--jade)">已 入 门</div>`
          : `<button class="mini-btn primary rec-btn" style="margin-top:auto">招 入（${r.cost} 灵石）</button>`}
      `;
      const btn = card.querySelector(".rec-btn");
      if(btn){
        btn.onclick = () => {
          if(G.state.stone < r.cost){ toast("灵石不足", "bad"); return; }
          G.state.stone -= r.cost;
          G.state.flags = G.state.flags || {};
          G.state.flags["recruited_"+r.id] = true;
          // 入门
          G.state.disciples.push({
            id: r.id, name: r.name, title: r.arch + " · 入门弟子", gender: r.gender, pic: r.pic,
            age: r.age, life: r.life, realm: r.realm, exp: r.exp,
            stats: { ...r.stats }, bio: r.bio, bonds: [], skill: r.skill, flags: {},
          });
          SFX.play("up");
          toast(`${r.name} 入门下`, "good");
          Save.persist();
          Main.updateHUD();
          open(); // 刷新面板
        };
      }
      grid.appendChild(card);
    });
  }

  return { open };
})();
