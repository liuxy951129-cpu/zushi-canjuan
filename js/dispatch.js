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
      G.state.flags.investigated_yard = true; // 任意派遣均算「曾遣弟子查访」
      // 标记新手任务
      if(typeof Tasks !== 'undefined') Tasks.mark('t_first_dispatch');
      Save.persist();
      Main.updateHUD();
      Disciples.renderHall();
      render();
    };
  }

  function settle(p){
    const q = DISPATCHES.find(x => x.id===p.dispatchId);
    if(!q) return;
    const team = G.state.disciples.filter(d => p.disciples.includes(d.id));
    // 成功率：基于队伍资质 vs 难度
    const teamPower = team.reduce((s,d) => s + (d.stats.root + d.stats.spirit + d.stats.mind) * (d.realm + 1), 0);
    const required = q.diff * 30;
    let successRate = Math.min(0.95, Math.max(0.15, teamPower / required * 0.6 + 0.2));
    if(G.state.buildLv.dantang >= 3) successRate += 0.05;
    const success = Math.random() < successRate;
    let bodyHtml = `<div class="lead">${team.map(d=>d.name).join(" · ")} ${success?"凯旋而归":"狼狈而回"}</div>`;
    if(success){
      const r = q.rewards;
      // 派遣 stone 字段实际入铜钱（修为靠 exp）
      if(r.stone) G.state.coin = (G.state.coin||0) + r.stone;
      if(r.herb) G.state.herb += r.herb;
      if(r.pill) G.state.pill = (G.state.pill||0) + r.pill;
      if(r.scroll) G.state.scroll = (G.state.scroll||0) + r.scroll;
      if(r.rep) G.state.rep += r.rep;
      if(r.exp) team.forEach(d => { d.exp += Math.floor(r.exp / team.length); });
      if(r.recruitChance && Math.random() < r.recruitChance) tryRecruit();
      if(r.mindBoost) team.forEach(d => d.stats.mind += 1);
      if(q.storyFlag) G.state.flags[q.storyFlag] = true;
      bodyHtml += `<div class="quote">${rewardSummary(r)}</div>`;
      SFX.play("up");
    } else {
      // 受伤
      if(Math.random() < (q.riskHurt||0.3)){
        const victim = team[Math.floor(Math.random()*team.length)];
        if(victim){
          victim.life -= 5;
          victim.exp = Math.floor(victim.exp * 0.7);
          bodyHtml += `<div class="quote">${victim.name} 受伤，寿元 -5。</div>`;
          if(victim.life <= 0){ victim.flags.dead = true; bodyHtml += `<div class="lead" style="color:var(--vermilion-2)">${victim.name} 伤重不治，殒于路上。</div>`; }
        }
      } else {
        bodyHtml += `<div class="quote">无功而返，但无大碍。</div>`;
      }
      SFX.play("bad");
    }
    Modal.openHTML(`<h3>派遣归来 · ${q.name}</h3>${bodyHtml}<div class="modal-row"><button class="btn primary" data-act="modal-close">合 上 册 子</button></div>`);
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
