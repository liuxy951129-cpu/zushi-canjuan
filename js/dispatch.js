/* ================================================================
   派遣系统 · 分类 tab + 卡片列表
   ================================================================ */
const Dispatch = (() => {

  // 派遣分类
  const CATEGORIES = [
    { tag:"全部", icon:"ic_dispatch", color:"#c9a35a" },
    { tag:"采药", icon:"ic_disp_herb", color:"#5b8a72" },
    { tag:"护镖", icon:"ic_disp_escort", color:"#c79a4a" },
    { tag:"灭妖", icon:"ic_disp_hunt", color:"#a83236" },
    { tag:"谈判", icon:"ic_disp_negotiate", color:"#5c8aa8" },
    { tag:"探秘", icon:"ic_disp_explore", color:"#7a5c3a" },
    { tag:"宗门战", icon:"ic_disp_war", color:"#d4554f" },
  ];
  let curCat = "全部";

  function render(){
    const root = document.getElementById("dispatch-grid");
    root.innerHTML = "";
    // 渲染外层 layout
    root.style.display = "flex";
    root.style.gap = "16px";
    root.style.padding = "0 24px";
    root.style.alignItems = "flex-start";
    root.innerHTML = `
      <aside id="disp-cats" style="
        width:120px;flex-shrink:0;display:flex;flex-direction:column;gap:8px;
        position:sticky;top:90px;
      "></aside>
      <div id="disp-list" style="flex:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px"></div>
    `;
    renderCats();
    renderList();
  }

  function renderCats(){
    const wrap = document.getElementById("disp-cats");
    wrap.innerHTML = "";
    CATEGORIES.forEach(c => {
      const cnt = c.tag === "全部"
        ? DISPATCHES.filter(visible).length
        : DISPATCHES.filter(q => visible(q) && q.tag === c.tag).length;
      const btn = document.createElement("div");
      btn.className = "disp-cat" + (curCat === c.tag ? " active" : "");
      btn.dataset.cat = c.tag;
      btn.style.cssText = `
        position:relative;padding:10px 8px;text-align:center;cursor:pointer;
        background:${curCat===c.tag ? 'linear-gradient(180deg,'+c.color+'44,'+c.color+'11)' : 'rgba(20,15,12,.7)'};
        border:1.5px solid ${curCat===c.tag ? c.color : 'var(--line)'};
        border-radius:6px;transition:all .25s;
      `;
      btn.innerHTML = `
        <div style="width:42px;height:42px;margin:0 auto 4px;background:url(assets/icons/${c.icon}.png) center/cover #1a1310;border:1px solid ${c.color};border-radius:6px"></div>
        <div style="font-family:Ma Shan Zheng;color:${curCat===c.tag?c.color:'var(--gold-2)'};font-size:13px;letter-spacing:.12em">${c.tag}</div>
        <div style="font-size:10px;color:var(--ink-3);margin-top:2px">${cnt} 项</div>
      `;
      btn.onclick = () => { curCat = c.tag; renderCats(); renderList(); };
      wrap.appendChild(btn);
    });
  }

  function visible(q){
    if(q.storyOnly && !G.state.flags?.[`unlocked_${q.id}`] && !G.state.flags[q.storyOnly]) return false;
    if(q.minDay && G.state.day < q.minDay) return false;
    return true;
  }

  function renderList(){
    const list = document.getElementById("disp-list");
    list.innerHTML = "";
    const filtered = DISPATCHES.filter(q => visible(q) && (curCat === "全部" || q.tag === curCat));
    if(filtered.length === 0){
      list.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--ink-3);padding:60px 0;font-family:Ma Shan Zheng;letter-spacing:.3em">— 此 类 暂 无 任 务 —</div>`;
      return;
    }
    const haveAvailableDisc = G.state.disciples.filter(d => !Disciples.isBusy(d.id) && !d.flags?.dead && !d.flags?.locked && !d.flags?.hidden).length > 0;
    filtered.forEach(q => {
      const cat = CATEGORIES.find(c => c.tag === q.tag) || CATEGORIES[0];
      const card = document.createElement("div");
      card.className = "dispatch-card" + (haveAvailableDisc ? "" : " locked");
      const tagCls = q.diff>=4 ? "tag-boss" : q.diff>=3 ? "tag-elite" : "";
      const diffStars = "★".repeat(q.diff) + "☆".repeat(5-q.diff);
      card.innerHTML = `
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="width:54px;height:54px;background:url(assets/icons/${cat.icon}.png) center/cover #1a1310;border:1.5px solid ${cat.color};border-radius:6px;flex-shrink:0;box-shadow:0 0 10px ${cat.color}33"></div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
              <h3 class="dc-name" style="margin:0;font-size:16px">${q.name}</h3>
              <span style="font-size:11px;color:${cat.color};font-family:Ma Shan Zheng;letter-spacing:.05em">${q.tag}</span>
            </div>
            <div style="font-size:11px;color:var(--candle);letter-spacing:.05em;margin:3px 0 6px 0">难度 ${diffStars} · ${q.days} 日</div>
          </div>
        </div>
        <p class="dc-desc" style="margin:10px 0 8px 0;font-size:12px;color:var(--ink-2);line-height:1.7">${q.desc.replace(/\n/g,"<br>")}</p>
        <div class="dc-stats" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">
          ${Object.entries(q.needStats||{}).map(([k,v]) => `<span style="padding:2px 7px;font-size:11px;background:rgba(91,138,114,.15);border:1px solid var(--jade);color:var(--jade);border-radius:3px">${STAT_LABEL[k]}≥${v}</span>`).join("")}
          ${q.needGold ? `<span style="padding:2px 7px;font-size:11px;background:rgba(199,154,74,.15);border:1px solid var(--candle);color:var(--candle);border-radius:3px">需 ${q.needGold} 铜钱</span>` : ""}
        </div>
        <div class="dc-reward" style="padding-top:8px;border-top:1px dashed rgba(201,163,90,.3);display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:10px;color:var(--ink-3);letter-spacing:.18em">回报</span>
          <b style="color:var(--gold-2);font-size:12px">${rewardSummary(q.rewards)}</b>
        </div>
      `;
      card.addEventListener("click", () => openPick(q));
      list.appendChild(card);
    });
  }

  function rewardSummary(r){
    const arr = [];
    if(r.stone) arr.push(r.stone+"铜钱");
    if(r.exp) arr.push(r.exp+"修为");
    if(r.herb) arr.push(r.herb+"药");
    if(r.pill) arr.push(r.pill+"丹");
    if(r.scroll) arr.push(r.scroll+"卷");
    if(r.rep) arr.push(r.rep+"声望");
    if(r.recruitChance) arr.push("有缘招新");
    return arr.join(" · ") || "—";
  }

  function openPick(q){
    if(q.needGold && (G.state.coin||0) < q.needGold){
      toast(`需 ${q.needGold} 铜钱`, "bad"); return;
    }
    Modal.openHTML(`
      <h3>派 遣 · ${q.name}</h3>
      <div class="lead" style="text-align:left;font-size:13px;color:var(--ink-2);line-height:1.9">${q.desc.replace(/\n/g,"<br>")}<br><br>
        <b style="color:var(--gold-2)">资质要求：</b>${Object.entries(q.needStats||{}).map(([k,v]) => `${STAT_LABEL[k]}≥${v}`).join(" · ")||"无"}<br>
        <b style="color:var(--gold-2)">耗时：</b>${q.days} 日 · <b style="color:var(--gold-2)">回报：</b>${rewardSummary(q.rewards)}
      </div>
      <h4 style="text-align:center;color:var(--gold-2);font-family:Ma Shan Zheng;letter-spacing:.18em;margin:18px 0 10px">— 选 择 弟 子（可多选 1~3）—</h4>
      <div class="disc-pick-grid" id="pick-grid"></div>
      <div class="modal-row" style="margin-top:18px">
        <button class="btn ghost" data-act="modal-close">取 消</button>
        <button class="btn primary" id="btn-confirm-dispatch">▷ 确 认 出 山</button>
      </div>
    `);
    const picked = new Set();
    const grid = document.getElementById("pick-grid");
    G.state.disciples.forEach(d => {
      if(d.flags?.dead || d.flags?.left || d.flags?.locked) return;
      if(Disciples.isBusy(d.id)) return;
      const div = document.createElement("div");
      div.className = "disc-pick";
      div.innerHTML = `
        <img src="${Disciples.picSrc(d.pic)}" alt="${d.name}"/>
        <div class="nm">${d.name}</div>
        <div class="rl">${REALMS[d.realm]}</div>
      `;
      div.addEventListener("click", () => {
        if(picked.has(d.id)){ picked.delete(d.id); div.classList.remove("sel"); }
        else { if(picked.size>=3){ toast("最多 3 人", "bad"); return; } picked.add(d.id); div.classList.add("sel"); }
      });
      grid.appendChild(div);
    });
    document.getElementById("btn-confirm-dispatch").onclick = () => {
      if(picked.size===0){ toast("请至少选一人", "bad"); return; }
      // 校验合并资质
      const team = G.state.disciples.filter(d => picked.has(d.id));
      const sumStats = {};
      STATS.forEach(k => sumStats[k] = team.reduce((s,d) => s + (d.stats[k]||0), 0));
      const ok = Object.entries(q.needStats||{}).every(([k,v]) => (sumStats[k]||0) >= v);
      if(!ok){ toast("队伍资质不足", "bad"); return; }
      if(q.needGold) G.state.coin = (G.state.coin||0) - q.needGold;
      G.state.pendingDispatches.push({
        dispatchId: q.id,
        disciples: [...picked],
        untilDay: G.state.day + q.days,
      });
      Modal.close();
      toast(`${team.map(d=>d.name).join(" · ")} 启程`, "good");
      SFX.play("chime");
      G.state.flags = G.state.flags || {};
      G.state.flags.tut_dispatched = true;
      G.state.flags.investigated_yard = true;
      if(typeof Tasks !== 'undefined'){
        Tasks.mark('t_first_dispatch');
        Tasks.counter('dispatchCount', 1);
      }
      Save.persist();
      Main.updateHUD();
      Disciples.renderHall();
      render();
    };
  }

  // 派遣分类报告台词（按 tag + success/fail）
  function reportLine(d, q, success, special){
    const TAG_LINES = {
      "采药": {
        ok: [
          `「掌门，这一筐紫茎草——\n东山潮湿，根上都还带着泥。\n夜里下了场雨，我们抢在第二日清晨挖的，怕被山猪拱了。」`,
          `「弟子按图索骥，多采了一倍。\n半路遇见个老药农，他说见我们手稳，又赠了几粒灵草籽。」`,
        ],
        fail: [`「……这趟空手了。\n东山那片药圃被人捷足先登。\n看脚印，不是本派的人。」`],
      },
      "护镖": {
        ok: [
          `「镖押到了。\n落霞谷外那道关卡盘问得紧，但见着本派的剑就放行了。\n看来「残墟门」三字还能镇住几个人。」`,
          `「半路遇上拦路的散修，三招便打发了。\n他临走丢下一句「七十年劫」——\n掌门，江湖里这话现在传得很广。」`,
        ],
        fail: [`「镖丢了。\n（${d.name} 抱拳低头）\n弟子甘领责罚。」`],
      },
      "灭妖": {
        ok: [
          `「狼患平了。\n那群妖兽窝在西林深处，咬死了七户人家的牲口。\n弟子一剑封了头狼的喉。」`,
          `「妖已斩。\n但林中还有更深的气息——\n像是有更大的东西，在远处看着我。」`,
        ],
        fail: [`「妖兽比预想凶。\n弟子腿上挨了一爪，所幸性命无虞。\n（${d.name} 卷起裤管，露出一道未愈的血痕）」`],
      },
      "谈判": {
        ok: [
          `「对方收了礼，应了。\n清虚老人还托我转告掌门——\n说本派"骨头硬，但底子薄"。\n他建议先修丹房。」`,
          `「事成了。\n但席间他试探了三次残卷的事——\n弟子一概以"不知"应之。」`,
        ],
        fail: [`「不欢而散。\n对方根本没想真谈，他要的，是看我们的虚实。」`],
      },
      "探秘": {
        ok: [
          `「古墓深处有一座石碑。\n碑上的字……与祖师堂地窖那卷上的笔迹相同。\n（${d.name} 把拓本递上）」`,
          `「探到了。\n但我在里面看见一具未腐的尸体——\n他穿的是本派三百年前的旧袍。」`,
        ],
        fail: [`「不行了，那地方有东西。\n我们没敢深入，先退回来禀报。」`],
      },
      "宗门战": {
        ok: [`「赢了！\n（${d.name} 满身是血，但眼睛发亮）\n雷霆门那位二弟子认栽了，我留了他一命。\n但这梁子，是结下了。」`],
        fail: [`「败了……\n（${d.name} 单膝跪地）\n弟子负伤而退。\n请掌门责罚。」`],
      },
    };
    const block = TAG_LINES[q.tag] || TAG_LINES["采药"];
    const arr = success ? block.ok : block.fail;
    let line = arr[Math.floor(Math.random()*arr.length)];
    if(special) line = line + "\n\n（" + special + "）";
    return line;
  }

  function settle(p){
    const q = DISPATCHES.find(x => x.id===p.dispatchId);
    if(!q) return;
    const team = G.state.disciples.filter(d => p.disciples.includes(d.id));
    if(team.length === 0) return;
    const teamPower = team.reduce((s,d) => s + (d.stats.root + d.stats.spirit + d.stats.mind) * (d.realm + 1), 0);
    const required = q.diff * 30;
    let successRate = Math.min(0.95, Math.max(0.15, teamPower / required * 0.6 + 0.2));
    if(G.state.buildLv.dantang >= 3) successRate += 0.05;
    const success = Math.random() < successRate;

    // 奖励/惩罚结算
    let specialNote = "";
    let rewardLines = [];
    if(success){
      const r = q.rewards;
      if(r.stone){ G.state.coin = (G.state.coin||0) + r.stone; rewardLines.push("+ " + r.stone + " 铜钱"); }
      if(r.herb){ G.state.herb += r.herb; rewardLines.push("+ " + r.herb + " 药材"); }
      if(r.pill){ G.state.pill = (G.state.pill||0) + r.pill; rewardLines.push("+ " + r.pill + " 丹药"); }
      if(r.scroll){ G.state.scroll = (G.state.scroll||0) + r.scroll; rewardLines.push("+ " + r.scroll + " 卷轴"); }
      if(r.rep){ G.state.rep += r.rep; rewardLines.push("+ " + r.rep + " 声望"); }
      if(r.exp){ team.forEach(d => { d.exp += Math.floor(r.exp / team.length); }); rewardLines.push("全队 + " + Math.floor(r.exp/team.length) + " 修为"); }
      if(r.recruitChance && Math.random() < r.recruitChance){ tryRecruit(); specialNote = "途中收得一名散修，已入门下。"; }
      if(r.mindBoost){ team.forEach(d => d.stats.mind += 1); specialNote = (specialNote ? specialNote+"  " : "") + "心境 +1。"; }
      if(q.storyFlag) G.state.flags[q.storyFlag] = true;
      SFX.play("up");
    } else {
      if(Math.random() < (q.riskHurt||0.3)){
        const victim = team[Math.floor(Math.random()*team.length)];
        if(victim){
          victim.life -= 5;
          victim.exp = Math.floor(victim.exp * 0.7);
          specialNote = victim.name + " 寿元 -5，修为略损。";
          if(victim.life <= 0){
            victim.flags.dead = true;
            specialNote = victim.name + " 伤重不治，殒于路上。";
          }
        }
      }
      SFX.play("bad");
    }

    // 第一视角剧情 modal
    const speaker = team[0];
    const line = reportLine(speaker, q, success, specialNote);
    Save.persist();
    Main.updateHUD();

    // 用沉浸式剧情 modal（speaker 立绘 + 对白 + 奖励行）
    Modal.openHTML(
      '<div style="display:grid;grid-template-columns:130px 1fr;gap:18px;align-items:center;margin-bottom:14px">' +
        '<div style="width:130px;height:170px;border-radius:6px;background:url(assets/portraits/'+speaker.pic+'.jpg) center/cover #1a1310;border:1.5px solid '+(success?'var(--gold)':'var(--vermilion)')+';box-shadow:0 0 16px '+(success?'rgba(201,163,90,.45)':'rgba(168,50,54,.45)')+'"></div>' +
        '<div>' +
          '<h3 style="margin:0 0 4px 0;color:'+(success?'var(--gold-2)':'var(--vermilion-2)')+'">' + q.name + ' · ' + (success?'凯旋':'败归') + '</h3>' +
          '<div style="font-size:11px;color:var(--ink-3);letter-spacing:.18em;margin-bottom:8px">' + speaker.name + ' · ' + q.tag + ' · 难度 ' + q.diff + '</div>' +
          '<div style="font-size:11px;color:var(--candle);font-family:Ma Shan Zheng;letter-spacing:.12em">— ' + (success?'第一视角报告':'败归交差') + ' —</div>' +
        '</div>' +
      '</div>' +
      '<div class="lead" style="white-space:pre-line;font-size:14px;line-height:2;text-align:left;border-left:2px solid '+(success?'var(--gold)':'var(--vermilion)')+';padding-left:18px;color:var(--ink-1);font-style:normal">'+line+'</div>' +
      (rewardLines.length ? '<div style="margin-top:14px;padding:10px;background:rgba(91,138,114,.1);border:1px solid var(--jade);border-radius:4px"><div style="font-size:11px;color:var(--jade);font-family:Ma Shan Zheng;letter-spacing:.18em;margin-bottom:6px">所 得</div>'+rewardLines.map(l => '<div style="font-size:13px;color:var(--gold-2);font-family:Ma Shan Zheng;letter-spacing:.05em">'+l+'</div>').join('')+'</div>' : '') +
      '<div class="modal-row" style="margin-top:16px"><button class="btn primary" data-act="modal-close">嗯，知道了 →</button></div>'
    );
  }

  function tryRecruit(){
    // 招新弟子（从 STORE_DISCIPLES 取一个未拥有的）
    const candidates = STORE_DISCIPLES.filter(s => !G.state.ownedDisciples.includes(s.id));
    if(!candidates.length) return;
    const ns = candidates[Math.floor(Math.random()*candidates.length)];
    const name = ns.name.split("·").pop().trim();
    const newDisc = {
      id: "rec_"+Math.random().toString(36).slice(2,7),
      name, title:"新弟子", gender:"未详",
      pic: G.state.disciples[Math.floor(Math.random()*Math.min(4, G.state.disciples.length))].pic,
      age: 18+Math.floor(Math.random()*8), life: 100+Math.floor(Math.random()*50),
      realm:0, exp:Math.floor(Math.random()*30),
      stats:{ root:3+Math.floor(Math.random()*7), wit:3+Math.floor(Math.random()*7), mind:3+Math.floor(Math.random()*7), spirit:3+Math.floor(Math.random()*7), luck:3+Math.floor(Math.random()*5) },
      bio: "派遣途中相遇的散修，愿意试入门下。",
      bonds:[], skill:"未传", flags:{},
    };
    G.state.disciples.push(newDisc);
    toast(`收得新弟子：${name}`, "good");
  }

  return { render, settle };
})();
