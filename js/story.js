/* ================================================================
   主线 · 沉浸式剧情模式
   - 自动触发：到当天第一次进入大堂时强制全屏触发
   - 逐字显现 + 背景图切换 + 立绘居中 + 选项浮现
   - 已通过的剧情可在「主线」回看
   - 未触发的显示 ???，给模糊触发条件提示
   ================================================================ */
const Story = (() => {

  // 每节剧情的"沉浸式"扩展：背景图 + 立绘 + 多段
  // 兼容老格式：若 STORIES 节点没有 scenes 字段，则降级为单段
  function getScenes(node){
    if(node.scenes && node.scenes.length) return node.scenes;
    // 默认单段：speakerPic + body + quote
    const speakerPic = pickPic(node);
    const bg = pickBg(node);
    return [
      { bg, speaker: speakerPic, name: speakerName(node), text: node.body, quote: node.quote || "" }
    ];
  }
  function pickPic(node){
    return ({c1s1:"d_master",c1s2:"d_chenyuan",c1s3:"d_shixiong",c2s1:"d_xiaoyu",c2s2:"d_master",c2s3:"d_lingxue",c3s1:"d_heimo"})[node.id] || "d_master";
  }
  function speakerName(node){
    const map = {c1s1:"祖师",c1s2:"周破军",c1s3:"凌霜",c2s1:"沈小雨",c2s2:"清虚老人",c2s3:"凌雪",c3s1:"无名"};
    return map[node.id] || "—";
  }
  function pickBg(node){
    return ({c1s1:"sc_temple",c1s2:"sc_battle",c1s3:"sc_courtyard",c2s1:"sc_temple",c2s2:"sc_courtyard",c2s3:"sc_dantang",c3s1:"sc_temple"})[node.id] || "sc_temple";
  }

  function tryAdvance(){
    const next = STORIES.find(s => !G.state.storyDone.includes(s.id) && G.state.day >= s.day);
    if(next) openImmersive(next);
  }

  // —— 沉浸式播放 ——
  function openImmersive(node){
    const scenes = getScenes(node);
    let idx = 0;

    // 全屏覆盖容器
    document.body.classList.add("immersive-on");
    let overlay = document.getElementById("immersive");
    if(!overlay){
      overlay = document.createElement("div");
      overlay.id = "immersive";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="im-bg"></div>
      <div class="im-vignette"></div>
      <div class="im-portrait" id="im-portrait"></div>
      <div class="im-frame">
        <div class="im-tag" id="im-tag">第 ${node.chapter} 章 · 第 ${STORIES.findIndex(s=>s.id===node.id)+1} 节</div>
        <h2 id="im-title">${node.title}</h2>
        <div class="im-name" id="im-name"></div>
        <div class="im-text" id="im-text"></div>
        <div class="im-quote" id="im-quote"></div>
        <div class="im-choices" id="im-choices"></div>
        <div class="im-next" id="im-next">▾ 点 击 继 续</div>
      </div>
    `;
    overlay.classList.add("active");
    SFX.play("bell");

    let typing = false, cancelType = false;
    function showScene(i){
      const sc = scenes[i];
      // 切换背景
      const bg = overlay.querySelector(".im-bg");
      bg.style.backgroundImage = `url(assets/scenes/${sc.bg||pickBg(node)}.jpg)`;
      // 立绘
      const port = document.getElementById("im-portrait");
      port.style.backgroundImage = `url(assets/portraits/${sc.speaker||pickPic(node)}.jpg)`;
      port.classList.remove("im-fade-in"); void port.offsetWidth; port.classList.add("im-fade-in");
      // 名字
      document.getElementById("im-name").textContent = sc.name || speakerName(node);
      // 文本逐字
      const textEl = document.getElementById("im-text");
      const text = sc.text || "";
      typeText(textEl, text, () => {
        // 逐字结束后显示 quote 与 next
        const q = document.getElementById("im-quote");
        if(sc.quote){ q.textContent = sc.quote; q.classList.add("show"); }
        else { q.textContent = ""; q.classList.remove("show"); }
        // 最后一段：显示选项；中间段：显示"点击继续"
        if(i === scenes.length - 1){
          showChoices();
        } else {
          document.getElementById("im-next").style.display = "";
        }
      });
    }
    function typeText(el, text, done){
      typing = true; cancelType = false;
      el.innerHTML = "";
      el.classList.add("typing");
      const arr = [...text];
      let pos = 0;
      function step(){
        if(cancelType){
          el.innerHTML = text.replace(/\n/g, "<br>");
          typing = false;
          done && done();
          return;
        }
        if(pos >= arr.length){
          typing = false;
          el.classList.remove("typing");
          done && done();
          return;
        }
        const ch = arr[pos++];
        if(ch === "\n") el.innerHTML += "<br>";
        else el.innerHTML += ch;
        setTimeout(step, ch === "\n" ? 200 : 38);
      }
      step();
    }
    function showChoices(){
      document.getElementById("im-next").style.display = "none";
      const cont = document.getElementById("im-choices");
      cont.innerHTML = "";
      // 调查式分支：检查 requireFlag
      node.choices.forEach(c => {
        const btn = document.createElement("button");
        btn.className = "im-choice";
        // 检查锁定条件
        let locked = false, lockMsg = "";
        if(c.requireFlag){
          if(c.requireFlag === "strong_team"){
            const hasJiandan = G.state.disciples.some(d => !d.flags?.dead && d.realm >= 1);
            if(!hasJiandan){ locked = true; lockMsg = c.lockHint || "未达成条件"; }
          } else if(!G.state.flags?.[c.requireFlag]){
            locked = true; lockMsg = c.lockHint || "未达成条件";
          }
        }
        if(c.requirePill && (G.state.pill||0) < c.requirePill){ locked = true; lockMsg = `需 ${c.requirePill} 丹药`; }
        btn.innerHTML = `<b>${c.label}</b><span>${c.b||""}</span>${locked?`<div class="hint" style="color:var(--vermilion-2)">⌑ ${lockMsg}</div>`:""}`;
        if(locked) btn.classList.add("disabled");
        btn.onclick = () => {
          if(locked){ toast(lockMsg, "bad"); return; }
          applyChoice(c.r||{});
          G.state.storyDone.push(node.id);
          Save.persist();
          Main.updateHUD();
          closeImmersive();
          SFX.play("chime");
          Main.updateAltar();
        };
        cont.appendChild(btn);
      });
      cont.classList.add("show");
    }

    // 整个 overlay 点击：跳过打字 / 进入下一段
    overlay.onclick = (ev) => {
      if(ev.target.closest(".im-choice")) return;
      if(typing){ cancelType = true; return; }
      if(idx < scenes.length - 1){
        idx++;
        document.getElementById("im-next").style.display = "none";
        document.getElementById("im-quote").classList.remove("show");
        showScene(idx);
      }
    };

    showScene(0);
  }

  function closeImmersive(){
    const ov = document.getElementById("immersive");
    if(!ov) return;
    ov.classList.remove("active");
    document.body.classList.remove("immersive-on");
    setTimeout(() => { ov.remove(); }, 600);
  }

  function applyChoice(r){
    if(r.flag) G.state.flags[r.flag] = true;
    if(r.exp){
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

  // —— 主线列表（已通过 + 模糊提示 ???）——
  function renderList(){
    const wrap = document.getElementById("story-wrap");
    wrap.innerHTML = "";
    STORIES.forEach((s, i) => {
      const done = G.state.storyDone.includes(s.id);
      const reachable = G.state.day >= s.day;
      const card = document.createElement("div");
      card.className = "story-card" + (!done ? " locked" : "");

      if(done){
        card.innerHTML = `
          <div class="story-tag tag-finished">第 ${s.chapter} 章 · 第 ${i+1} 节</div>
          <h3>${s.title}</h3>
          <div class="body">${s.body.replace(/\n/g,"<br>")}</div>
          ${s.quote ? `<div class="quote">${s.quote}</div>` : ""}
          <div class="story-actions">
            <span style="color:var(--jade);letter-spacing:.2em">✓ 已 历 经</span>
            <button class="btn ghost" data-replay="${s.id}">⥁ 重 阅</button>
          </div>
        `;
      } else {
        // 未触发：???
        const hint = hintFor(s, reachable);
        card.innerHTML = `
          <div class="story-tag" style="background:var(--ink-4)">第 ${s.chapter} 章 · ???</div>
          <h3 style="font-family:'Ma Shan Zheng';color:var(--ink-3);letter-spacing:.4em">— ？ ？ ？ —</h3>
          <div class="body" style="color:var(--ink-3);font-style:italic">${hint}</div>
          <div class="story-actions">
            <span style="color:var(--ink-3);letter-spacing:.18em;font-size:11px">${reachable?"未 探 寻":"未 至 时 日"}</span>
          </div>
        `;
      }
      wrap.appendChild(card);
    });
    wrap.querySelectorAll("[data-replay]").forEach(b => b.addEventListener("click", () => {
      const node = STORIES.find(s => s.id === b.dataset.replay);
      if(node){
        // 重阅：临时移出 storyDone 以触发，但不应用 effect
        replay(node);
      }
    }));
  }

  function hintFor(s, reachable){
    if(!reachable) return `传闻 · 第 ${s.day} 日前后将有大事。`;
    return ({
      c1s1: "传闻 · 祖师堂地窖 · 夜半有声。",
      c1s2: "传闻 · 大弟子近日寝食不安，演武场可有蹊跷？",
      c1s3: "传闻 · 雷霆门遣使叩门 · 须有应敌之力。",
      c2s1: "传闻 · 藏经阁深处 · 有人闻得笛声。",
      c2s2: "传闻 · 落霞谷主似有心结盟。",
      c2s3: "传闻 · 凌雪闭关已三日 · 血纹将现。",
      c3s1: "传闻 · 客卿无名隐瞒身份 · 真名将露。",
    })[s.id] || "传闻 · 时机未至。";
  }

  function replay(node){
    // 暂存 / 进入沉浸 / 完成不重复应用
    const fakeNode = { ...node, choices: [{ label:"合 上 卷 轴", b:"", r:{} }] };
    openImmersive(fakeNode);
  }

  return { tryAdvance, open: openImmersive, renderList, closeImmersive };
})();
