/* 主控 */
const G = { state: null, settings: { vol: 0.5 } };

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  const hud = document.getElementById("hud");
  if(id==="screen-title") hud.classList.add("hidden");
  else hud.classList.remove("hidden");
}

function toast(msg, kind){
  const c = document.getElementById("toast");
  const it = document.createElement("div");
  it.className = "toast-item " + (kind||"");
  it.textContent = msg;
  c.appendChild(it);
  setTimeout(()=>it.remove(), 3100);
}

const Modal = (() => {
  function openHTML(html){
    document.getElementById("modal-card").innerHTML = html;
    document.getElementById("modal").classList.add("active");
  }
  function close(){ document.getElementById("modal").classList.remove("active"); }
  return { openHTML, close };
})();

const Dialog = (() => {
  function show(pic, name, text){
    const wrap = document.getElementById("dialog");
    wrap.innerHTML = `
      <div class="dialog-card">
        <div class="dialog-port" style="background-image:url(assets/portraits/${pic}.jpg)"></div>
        <div class="dialog-body">
          <div class="dialog-name">${name}</div>
          <div class="dialog-text">${text}</div>
        </div>
      </div>`;
    wrap.classList.add("active");
    clearTimeout(show._t);
    show._t = setTimeout(() => { wrap.classList.remove("active"); wrap.innerHTML=""; }, 5500);
    wrap.onclick = () => { wrap.classList.remove("active"); wrap.innerHTML=""; };
  }
  return { show };
})();

// 烛火粒子
function spawnSparks(){
  const c = document.getElementById("sparks");
  if(!c) return;
  setInterval(() => {
    if(c.childElementCount > 30) c.firstElementChild?.remove();
    const s = document.createElement("div");
    s.className = "spark";
    s.style.left = Math.random()*100 + "%";
    s.style.bottom = "0";
    s.style.animationDuration = (8 + Math.random()*8) + "s";
    s.style.setProperty("--dx", (Math.random()*60-30)+"px");
    c.appendChild(s);
  }, 1200);
}

const Main = (() => {
  function updateHUD(){
    if(!G.state) return;
    document.getElementById("hud-sect").textContent = G.state.sect;
    document.getElementById("hud-day").textContent = G.state.day;
    document.getElementById("hud-month").textContent = ["春","夏","秋","冬"][Math.floor((G.state.day-1)/30)%4];
    document.getElementById("hud-time").textContent = "辰";
    document.getElementById("hud-field").textContent = G.state.buildLv.lingtian || 0;
    document.getElementById("hud-stone").textContent = G.state.stone;
    document.getElementById("hud-pill").textContent = G.state.pill;
    document.getElementById("hud-disc").textContent = G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left).length;
    document.getElementById("hud-rep").textContent = repName(G.state.rep);
  }
  function repName(rep){
    if(rep < 30) return "无名小派";
    if(rep < 80) return "山野偏宗";
    if(rep < 200) return "江湖小有";
    if(rep < 500) return "一方名宗";
    if(rep < 1000) return "声名远播";
    return "三大宗一";
  }

  function newGame(){
    G.state = Save.newSave();
    Save.persist();
    showScreen("screen-hall");
    Disciples.renderHall();
    updateHUD();
    updateAltar();
    // 跳过 D1 自动剧情，先让祖师爷带新手引导
    setTimeout(() => {
      Tutorial.start();
    }, 700);
    // 引导完成后再触发剧情
    const interval = setInterval(() => {
      if(G.state?.flags?.tut_done){
        clearInterval(interval);
        setTimeout(() => Story.tryAdvance(), 800);
      }
    }, 1000);
  }

  function continueGame(){
    const s = Save.load();
    if(!s) return newGame();
    G.state = s;
    showScreen("screen-hall");
    Disciples.renderHall();
    updateHUD();
    updateAltar();
  }

  function endDay(){
    // 处理派遣
    Disciples.settleDispatches();
    G.state.day++;
    if(G.state.day % 30 === 0){ G.state.month++; Disciples.ageMonthly(); }
    // 灵田被动
    G.state.stone += (G.state.buildLv.lingtian||0) * 30;
    // 月卡
    if((G.state.monthlyUntil||0) > Date.now()){
      G.state.stone += 50; G.state.pill += 1;
    }
    // 季票
    if(G.state.passOwned){ G.state.stone += 20; }
    Save.persist();
    Disciples.renderHall();
    updateHUD();
    SFX.play("bell");
    Modal.openHTML(`
      <h3>入 定 · 第 ${G.state.day-1} 日 终</h3>
      <div class="lead">月落参横，烛火将熄。<br>明日 · 第 ${G.state.day} 日 · 灵田收 ${(G.state.buildLv.lingtian||0)*30} 灵石</div>
      <div class="quote">「一日苦修，胜千日空想。」</div>
      <div class="modal-row"><button class="btn primary" data-act="modal-close">推 开 殿 门</button></div>
    `);
    setTimeout(() => Story.tryAdvance(), 800);
  }

  function updateAltar(node){
    const tag = document.getElementById("altar-tag");
    const title = document.getElementById("altar-title");
    const quote = document.getElementById("altar-quote");
    if(node){
      tag.textContent = `第 ${node.chapter} 章`;
      title.textContent = node.title;
      quote.textContent = node.quote || "";
      return;
    }
    const next = STORIES.find(s => !G.state.storyDone.includes(s.id));
    if(next){
      tag.textContent = `第 ${next.chapter} 章 · 待 启`;
      title.textContent = next.title;
      quote.textContent = G.state.day >= next.day ? "「点 入 定 推 进 剧 情」" : `第 ${next.day} 日 后 启`;
    } else {
      tag.textContent = `残卷已尽`;
      title.textContent = "尚 未 完 篇";
      quote.textContent = "「外 传 · 即 将 上 线」";
    }
  }

  function init(){
    spawnSparks();
    Codex.init();
    Store.init();
    document.body.addEventListener("click", e => {
      const t = e.target.closest("[data-act]");
      if(!t) return;
      const a = t.dataset.act;
      SFX.play("click");
      if(a==="new-game") newGame();
      else if(a==="continue") continueGame();
      else if(a==="open-codex"){ if(!G.state) G.state = Save.newSave(); showScreen("screen-codex"); Codex.refresh(); }
      else if(a==="open-store"){ if(!G.state) G.state = Save.newSave(); showScreen("screen-store"); Store.refresh(); }
      else if(a==="open-settings"){
        Modal.openHTML(`
          <h3>设 置</h3>
          <div class="modal-row">
            <button class="btn ghost" data-act="modal-close">关 闭</button>
            <button class="btn" id="reset-save" style="border-color:var(--vermilion-3);color:#ffaaaa">重 置 进 度</button>
          </div>`);
        document.getElementById("reset-save").onclick = () => {
          if(confirm("重置所有进度？")) { Save.clear(); location.reload(); }
        };
      }
      else if(a==="modal-close") Modal.close();
      else if(a==="back-hall"){ showScreen("screen-hall"); Disciples.renderHall(); updateAltar(); }
      else if(a==="dispatch"){ showScreen("screen-dispatch"); Dispatch.render(); }
      else if(a==="cultivate"){ showScreen("screen-cultivate"); renderCultivate(); }
      else if(a==="build"){ showScreen("screen-build"); Build.render(); }
      else if(a==="story"){ showScreen("screen-story"); Story.renderList(); }
      else if(a==="codex"){ showScreen("screen-codex"); Codex.refresh(); }
      else if(a==="next-day") endDay();
    });
    if(Save.load()) document.getElementById("btn-continue").style.display = "";
    showScreen("screen-title");
  }

  function renderCultivate(){
    const wrap = document.getElementById("cultivate-wrap");
    wrap.innerHTML = "";
    const alive = G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left && !d.flags?.locked);
    if(!alive.length){
      wrap.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--ink-3);padding:40px 0">— 暂 无 可 修 之 人 —</div>`;
      return;
    }
    alive.forEach(d => {
      const expNeed = REALM_EXP[d.realm] || 99999;
      const card = document.createElement("div");
      card.className = "cult-card";
      const busy = Disciples.isBusy(d.id);
      card.innerHTML = `
        <div class="cult-pic" style="background-image:url(${Disciples.picSrc(d.pic)})"></div>
        <div class="cult-info">
          <h4>${d.name}</h4>
          <div class="rl">${REALMS[d.realm]} · ${d.age}岁 · 寿 ${d.life}</div>
          <div class="cult-bars">
            <div class="b exp"><span class="lab">修为</span><div class="bar"><i style="width:${Math.min(100,d.exp/expNeed*100)}%"></i></div><span class="v">${d.exp}/${expNeed}</span></div>
          </div>
          <div style="font-size:11px;color:var(--ink-3);letter-spacing:.1em">根${d.stats.root} 悟${d.stats.wit} 心${d.stats.mind} 灵${d.stats.spirit} 运${d.stats.luck}</div>
          <div class="cult-actions">
            ${busy?'<span style="color:var(--ink-3);letter-spacing:.18em;font-family:Ma Shan Zheng">出门 · 暂不可</span>':`
              <button class="mini-btn primary" data-cu="${d.id}">闭 关 · 30 灵石</button>
              ${d.exp>=expNeed?`<button class="mini-btn" data-bk="${d.id}">突 破</button>`:""}
              <button class="mini-btn" data-dt="${d.id}">详 情</button>
            `}
          </div>
        </div>`;
      wrap.appendChild(card);
    });
    wrap.querySelectorAll("[data-cu]").forEach(b => b.addEventListener("click", () => {
      const d = G.state.disciples.find(x => x.id===b.dataset.cu);
      if(G.state.stone<30){ toast("灵石不足", "bad"); return; }
      G.state.stone -= 30;
      const yan = G.state.buildLv.yanwu||0;
      const gain = 12 + yan*4 + Math.floor(d.stats.wit*1.2);
      d.exp += gain;
      SFX.play("chime");
      toast(`${d.name} 修为 +${gain}`, "good");
      Save.persist(); updateHUD(); renderCultivate();
    }));
    wrap.querySelectorAll("[data-bk]").forEach(b => b.addEventListener("click", () => Disciples.openDetail(b.dataset.bk)));
    wrap.querySelectorAll("[data-dt]").forEach(b => b.addEventListener("click", () => Disciples.openDetail(b.dataset.dt)));
  }

  return { init, updateHUD, newGame, continueGame, endDay, updateAltar };
})();

document.addEventListener("DOMContentLoaded", Main.init);
