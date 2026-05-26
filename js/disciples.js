/* ================================================================
   弟子系统：渲染、详情、修炼、突破、寿命
   ================================================================ */
const Disciples = (() => {

  function picSrc(pic){ return `assets/portraits/${pic}.jpg`; }

  function renderHall(){
    const row = document.getElementById("disciples-row");
    row.innerHTML = "";
    const alive = G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left);
    alive.forEach(d => {
      const fig = document.createElement("div");
      fig.className = "disciple-fig";
      fig.dataset.id = d.id;
      const busy = isBusy(d.id);
      fig.innerHTML = `
        <div class="df-aura"></div>
        <div class="df-portrait" style="background-image:url(${picSrc(d.pic)})"></div>
        ${busy ? `<div class="df-state" title="出门历练">遣</div>` : (d.flags?.locked ? `<div class="df-state" style="background:#3a3128">封</div>` : "")}
        <div class="df-realm">${REALMS[d.realm]}</div>
        <div class="df-name">${d.name}</div>
      `;
      fig.addEventListener("click", () => openDetail(d.id));
      row.appendChild(fig);
    });
  }

  function isBusy(did){
    return G.state.pendingDispatches.some(p => p.disciples.includes(did));
  }

  function openDetail(did){
    const d = G.state.disciples.find(x => x.id===did);
    if(!d) return;
    showScreen("screen-disciple");
    document.getElementById("disc-title").textContent = `${d.name} · ${d.title}`;
    const detail = document.getElementById("disciple-detail");
    const expNeeded = REALM_EXP[d.realm] || 99999;
    const canBreak = d.exp >= expNeeded && !d.flags?.locked;
    detail.innerHTML = `
      <div class="dd-portrait-wrap">
        <div class="dd-portrait" style="background-image:url(${picSrc(d.pic)})"></div>
        <div class="dd-name-plate">${d.name} · ${d.title}</div>
      </div>
      <div class="dd-info">
        <div class="dd-meta">
          <div class="it">${d.gender}</div>
          <div class="it">${d.age} 岁 · 寿 ${d.life}</div>
          <div class="it">境界 · ${REALMS[d.realm]}</div>
          <div class="it">绝技 · ${d.skill}</div>
        </div>
        <div class="dd-stats">
          ${STATS.map(k => `<div class="dd-stat"><span class="l">${STAT_LABEL[k]}</span><span class="v">${d.stats[k]}</span></div>`).join("")}
          <div class="dd-stat"><span class="l">修为</span><span class="v">${d.exp}/${expNeeded}</span></div>
          <div class="dd-stat"><span class="l">状态</span><span class="v">${isBusy(d.id)?"出门":d.flags?.locked?"封印":"在山"}</span></div>
        </div>
        <div class="dd-bio">${d.bio.replace(/\n/g,"<br>")}</div>
        ${d.bonds?.length ? `<div class="dd-bonds"><h4>羁 绊</h4>${d.bonds.map(b => {
          const [tid, rel] = b.split(":");
          const t = G.state.disciples.find(x => x.id===tid);
          return `<div class="dd-bond"><b>${rel}</b>${t?t.name:tid}</div>`;
        }).join("")}</div>` : ""}
        <div class="dd-bonds" style="margin-top:18px">
          <h4>行 动</h4>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
            ${canBreak ? `<button class="btn primary" id="btn-breakthrough">▶ 尝 试 突 破</button>` : ""}
            ${!d.flags?.locked && !isBusy(d.id) ? `<button class="btn ghost" id="btn-cultivate">⌬ 闭 关 修 炼</button>` : ""}
            ${d.flags?.locked ? `<button class="btn ghost" id="btn-unlock">⚯ 启 用</button>` : ""}
          </div>
        </div>
      </div>
    `;
    if(canBreak) document.getElementById("btn-breakthrough").onclick = () => attemptBreakthrough(d);
    const cb = document.getElementById("btn-cultivate"); if(cb) cb.onclick = () => quickCultivate(d);
    const ub = document.getElementById("btn-unlock"); if(ub) ub.onclick = () => {
      if(d.flags.locked && d.id==="master"){ toast("祖师爷只有在 c3s1 后才会出关。", "bad"); return; }
      if(d.id==="heimo" && !G.state.flags.called_heimo && !G.state.flags.heimo_stay){ toast("需先在剧情中触发", "bad"); return; }
      d.flags.locked = false;
      toast(`${d.name} 已入门下`, "good");
      Save.persist();
      openDetail(d.id);
    };
  }

  function quickCultivate(d){
    if(G.state.stone < 30){ toast("灵石不足（30）", "bad"); return; }
    G.state.stone -= 30;
    const yanwuLv = G.state.buildLv.yanwu || 0;
    const gain = 12 + Math.floor(yanwuLv * 4) + Math.floor(d.stats.wit * 1.2);
    d.exp += gain;
    SFX.play("chime");
    toast(`${d.name} 修为 +${gain}`, "good");
    Save.persist();
    Main.updateHUD();
    openDetail(d.id);
  }

  function attemptBreakthrough(d){
    const expNeeded = REALM_EXP[d.realm];
    if(d.exp < expNeeded){ toast("修为未足", "bad"); return; }
    if(d.flags?.locked){ toast("此弟子被封印", "bad"); return; }
    // 渡劫小游戏
    BreakthroughMini.start(d, (success, drained) => {
      if(success){
        d.realm++;
        d.exp = Math.max(0, d.exp - expNeeded);
        d.life += [10,15,25,40,60,100,150,300][d.realm] || 0;
        // 资质涨
        const k = STATS[Math.floor(Math.random()*STATS.length)];
        d.stats[k]++;
        SFX.play("up");
        toast(`${d.name} 突破至 ${REALMS[d.realm]}！`, "good");
        Modal.openHTML(`
          <h3>境 界 突 破</h3>
          <div class="lead">${d.name} 已突破至 <b style="color:var(--gold-2)">${REALMS[d.realm]}</b>。<br>资质 <b>${STAT_LABEL[k]}</b> +1，寿元增长。</div>
          <div class="quote">「劫云自心生，破劫者，破心也。」</div>
          <div class="modal-row"><button class="btn primary" data-act="modal-close">谢 师 恩</button></div>
        `);
      } else {
        if(drained){
          d.flags.dead = true;
          G.state.stats.deaths = (G.state.stats.deaths||0)+1;
          SFX.play("break");
          Modal.openHTML(`
            <h3>渡 劫 失 败</h3>
            <div class="lead">${d.name} 心魔反噬，气海尽毁。<br>祖师堂多了一块无字牌位。</div>
            <div class="quote">「未渡之人，不入轮回。」</div>
            <div class="modal-row"><button class="btn" data-act="modal-close">合 葬 师 门</button></div>
          `);
        } else {
          d.exp = Math.floor(d.exp * 0.5);
          toast(`${d.name} 渡劫未果，修为减半`, "bad");
        }
      }
      Save.persist();
      setTimeout(() => { renderHall(); Main.updateHUD(); }, 300);
    });
  }

  // —— 处理派遣回归 ——
  function settleDispatches(){
    const now = G.state.day;
    const remain = [];
    G.state.pendingDispatches.forEach(p => {
      if(now < p.untilDay){ remain.push(p); return; }
      Dispatch.settle(p);
    });
    G.state.pendingDispatches = remain;
  }

  // —— 月底涨年龄/寿命 ——
  function ageMonthly(){
    G.state.disciples.forEach(d => {
      if(d.flags?.dead || d.flags?.left) return;
      d.age = +(d.age + 1/12).toFixed(2);
      if(d.age >= d.life){
        d.flags.dead = true;
        toast(`${d.name} 寿元已尽，坐化山门`, "bad");
        G.state.stats.deaths = (G.state.stats.deaths||0)+1;
      }
    });
  }

  return { picSrc, renderHall, isBusy, openDetail, settleDispatches, ageMonthly };
})();

// —— 渡劫小游戏：3 次心魔轮，玩家点击在恰当时机停止 ——
const BreakthroughMini = (() => {
  function start(d, onDone){
    let round = 0, success = 0, drained = false;
    Modal.openHTML(`
      <h3>渡 劫 · ${d.name} 突破至 ${REALMS[d.realm+1]}</h3>
      <div class="lead">心魔三轮。每轮指针扫过红色危险区时，于 <b style="color:var(--gold-2)">绿色心境带</b> 内点击定格。</div>
      <div id="bt-arena" style="margin:20px auto;max-width:520px"></div>
      <div class="lead" id="bt-tip" style="font-size:13px;color:var(--ink-2)">第 1 轮 · 心魔降临</div>
      <div class="modal-row"><button class="btn ghost" data-act="modal-close" id="bt-give">逃 避（修为 -50%）</button></div>
    `);
    const arena = document.getElementById("bt-arena");

    function nextRound(){
      if(round >= 3){
        const ok = success >= 2;
        Modal.close();
        onDone(ok, !ok && Math.random() < 0.18);
        return;
      }
      round++;
      document.getElementById("bt-tip").textContent = `第 ${round} 轮 · 心魔 · 已成 ${success}/3`;
      const tol = 18 - round * 3 + Math.floor(d.stats.mind/2);
      const target = 30 + Math.random()*40;
      arena.innerHTML = `
        <div style="position:relative;height:36px;background:linear-gradient(90deg, rgba(168,50,54,.55), rgba(168,50,54,.18) 40%, rgba(168,50,54,.55) 60%, rgba(168,50,54,.55));border:1px solid var(--gold);overflow:hidden;cursor:pointer">
          <div style="position:absolute;left:${target-tol}%;width:${tol*2}%;top:0;bottom:0;background:linear-gradient(180deg, rgba(91,138,114,.5), rgba(91,138,114,.18));border-left:1px dashed var(--jade);border-right:1px dashed var(--jade)"></div>
          <div id="bt-needle" style="position:absolute;left:0;top:-4px;bottom:-4px;width:4px;background:var(--candle);box-shadow:0 0 14px var(--candle)"></div>
        </div>
      `;
      const bar = arena.firstElementChild;
      const needle = document.getElementById("bt-needle");
      let pos = 0, dir = 1, stopped = false;
      function tick(){
        if(stopped) return;
        pos += dir * (1.4 + round*0.5);
        if(pos >= 100){ pos = 100; dir = -1; }
        if(pos <= 0){ pos = 0; dir = 1; }
        needle.style.left = pos + "%";
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      bar.onclick = () => {
        if(stopped) return; stopped = true;
        const dist = Math.abs(pos - target);
        if(dist <= tol){ success++; SFX.play("chime"); }
        else { SFX.play("bad"); }
        setTimeout(nextRound, 500);
      };
    }
    document.getElementById("bt-give").onclick = () => { Modal.close(); onDone(false, false); d.exp = Math.floor(d.exp*0.5); };
    nextRound();
  }
  return { start };
})();
