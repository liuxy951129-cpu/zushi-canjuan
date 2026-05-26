/* 主线 */
const Story = (() => {
  function tryAdvance(){
    const next = STORIES.find(s => !G.state.storyDone.includes(s.id) && G.state.day >= s.day);
    if(next) open(next);
  }

  function open(node){
    const speakerPic = node.id==="c1s1" ? "d_master" : node.id==="c1s2" ? "d_chenyuan" : node.id==="c1s3" ? "d_shixiong" : node.id==="c2s1" ? "d_xiaoyu" : node.id==="c2s2" ? "d_master" : node.id==="c2s3" ? "d_lingxue" : "d_heimo";
    Modal.openHTML(`
      <div style="display:flex;gap:18px;align-items:flex-start;margin-bottom:14px">
        <div style="width:120px;height:160px;flex-shrink:0;background:url(assets/portraits/${speakerPic}.jpg) center/cover;border:1.5px solid var(--gold);box-shadow:0 0 0 2px var(--bg-0), 0 0 0 3px var(--gold-3)"></div>
        <div style="flex:1">
          <div style="display:inline-block;padding:3px 10px;background:var(--vermilion);color:var(--gold-2);font-family:Ma Shan Zheng;font-size:12px;letter-spacing:.2em;margin-bottom:6px">第 ${node.chapter} 章 · 第 ${STORIES.findIndex(s=>s.id===node.id)+1} 节</div>
          <h3 style="text-align:left;margin:4px 0 8px;font-family:Ma Shan Zheng;font-size:24px;letter-spacing:.18em;background:linear-gradient(180deg,#f4dba6,#c9a35a);-webkit-background-clip:text;background-clip:text;color:transparent">${node.title}</h3>
          <div style="color:var(--ink);line-height:1.95;font-size:14px;letter-spacing:.04em;white-space:pre-line">${node.body}</div>
        </div>
      </div>
      ${node.quote ? `<div class="quote" style="text-align:center">${node.quote}</div>` : ""}
      <div class="modal-row" id="story-choices" style="flex-direction:column;align-items:stretch;gap:10px"></div>
    `);
    const row = document.getElementById("story-choices");
    node.choices.forEach(c => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.innerHTML = `<b>${c.label}</b><span>${c.b||""}</span>${c.requirePill?`<div class="hint">需 ${c.requirePill} 丹药</div>`:""}`;
      if(c.requirePill && (G.state.pill||0) < c.requirePill) btn.style.opacity = .55;
      btn.onclick = () => {
        if(c.requirePill && (G.state.pill||0) < c.requirePill){ toast("丹药不足", "bad"); return; }
        applyChoice(c.r||{});
        G.state.storyDone.push(node.id);
        Modal.close();
        Save.persist();
        Main.updateHUD();
        // 更新祖师堂的中央事件
        Main.updateAltar(node);
        SFX.play("chime");
      };
      row.appendChild(btn);
    });
  }

  function applyChoice(r){
    if(r.flag) G.state.flags[r.flag] = true;
    if(r.exp){
      // 大弟子加经验，否则给所有人
      G.state.disciples.forEach(d => { if(!d.flags?.dead && !d.flags?.locked) d.exp += Math.floor(r.exp / G.state.disciples.length); });
    }
    if(r.rep) G.state.rep += r.rep;
    if(r.mind) G.state.disciples.forEach(d => { d.stats.mind += r.mind; });
    if(r.spirit) G.state.disciples.forEach(d => { d.stats.spirit += r.spirit; });
    if(r.luck) G.state.disciples.forEach(d => { d.stats.luck += r.luck; });
    if(r.pill) G.state.pill = (G.state.pill||0) + r.pill;
    if(r.scroll) G.state.scroll = (G.state.scroll||0) + r.scroll;
    if(r.unlock) G.state.flags[`unlocked_${r.unlock}`] = true;
    if(r.heimoMood) {
      const h = G.state.disciples.find(d => d.id==="heimo");
      if(h && r.heimoMood>0){ h.flags.locked = false; }
    }
  }

  function renderList(){
    const wrap = document.getElementById("story-wrap");
    wrap.innerHTML = "";
    STORIES.forEach(s => {
      const done = G.state.storyDone.includes(s.id);
      const reachable = G.state.day >= s.day;
      const card = document.createElement("div");
      card.className = "story-card" + (!done && !reachable ? " locked" : "");
      card.innerHTML = `
        <div class="story-tag ${done?'tag-finished':''}">第 ${s.chapter} 章 · 第 ${STORIES.indexOf(s)+1} 节</div>
        <h3>${s.title}</h3>
        <div class="body">${(done||reachable)?s.body:"（尚未到达）"}</div>
        ${(done||reachable)&&s.quote ? `<div class="quote">${s.quote}</div>` : ""}
        <div class="story-actions">
          ${done ? `<span style="color:var(--jade);letter-spacing:.2em">✓ 已 抉 择</span>`
                 : reachable ? `<button class="btn primary" data-open="${s.id}">推 进 剧 情</button>`
                 : `<span style="color:var(--ink-3);letter-spacing:.18em">第 ${s.day} 日 触 发</span>`}
        </div>
      `;
      wrap.appendChild(card);
    });
    wrap.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => {
      const node = STORIES.find(s => s.id === b.dataset.open);
      if(node) open(node);
    }));
  }

  return { tryAdvance, open, renderList };
})();
