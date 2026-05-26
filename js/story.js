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
    if(!next) return;
    // c1s1 额外门槛：需先完成新手任务前 3 个（强制养成期）
    if(next.id === "c1s1"){
      const t = G.state.tasks || {};
      const passed = [t.t_first_dispatch, t.t_first_build, t.t_visit_world].filter(Boolean).length;
      if(passed < 3 && G.state.day < 3){
        return; // 还没攒够，等下一日
      }
    }
    openImmersive(next);
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
      if(h && r.heimoMood>0){ h.flags.locked = false; h.flags.hidden = false; }
    }
    // —— 道具发放 ——
    if(r.giveItem && typeof Items !== 'undefined'){
      const arr = Array.isArray(r.giveItem) ? r.giveItem : [r.giveItem];
      arr.forEach(it => Items.add(it.id || it, it.n || 1));
      toast(`获得：${arr.map(it=>ITEM(it.id||it)?.name||it).join(' · ')}`, "good");
    }
    // —— 剧情解锁弟子 ——
    if(r.recruitDisciple && typeof Disciples !== 'undefined'){
      const arr = Array.isArray(r.recruitDisciple) ? r.recruitDisciple : [r.recruitDisciple];
      arr.forEach(id => {
        const d = G.state.disciples.find(x => x.id===id);
        if(d && d.flags?.locked){
          d.flags.locked = false;
          d.flags.hidden = false;
          if(typeof Tasks !== 'undefined') Tasks.mark('t_first_recruit');
        }
      });
    }
  }

  // —— 主线列表（仅显示已通过的剧情，绝不剧透未来）——
  function renderList(){
    const wrap = document.getElementById("story-wrap");
    wrap.innerHTML = "";
    const done = STORIES.filter(s => G.state.storyDone.includes(s.id));
    const total = STORIES.length;

    // 卷首：本派编年（不告诉你将来有什么，只告诉你已经走了几页）
    const head = document.createElement("div");
    head.className = "story-card";
    head.innerHTML = `
      <div class="story-tag" style="background:var(--gold-3)">本 派 编 年</div>
      <h3>残 卷 · 已 历 ${done.length} / ${total} 页</h3>
      <div class="body" style="color:var(--ink-2)">这本卷，记的是已经发生的事。\n往后的页码，由你与天数共同写。\n\n卷首未着的字——\n它们不会写在纸上，只会自己来寻你。</div>
    `;
    wrap.appendChild(head);

    if(done.length === 0){
      const empty = document.createElement("div");
      empty.className = "story-card locked";
      empty.style.textAlign = "center";
      empty.innerHTML = `
        <div class="body" style="font-style:italic;color:var(--ink-3);font-family:'Long Cang',serif;font-size:18px;letter-spacing:.16em;line-height:2">未 着 一 字</div>
      `;
      wrap.appendChild(empty);
      return;
    }

    done.forEach(s => {
      const card = document.createElement("div");
      card.className = "story-card";
      card.innerHTML = `
        <div class="story-tag tag-finished">已 历</div>
        <h3>${s.title}</h3>
        <div class="body">${s.body.replace(/\n/g,"<br>")}</div>
        ${s.quote ? `<div class="quote">${s.quote}</div>` : ""}
        <div class="story-actions">
          <span style="color:var(--jade);letter-spacing:.2em">✓ 此页已成往事</span>
          <button class="btn ghost" data-replay="${s.id}">⥁ 重 阅</button>
        </div>
      `;
      wrap.appendChild(card);
    });

    wrap.querySelectorAll("[data-replay]").forEach(b => b.addEventListener("click", () => {
      const node = STORIES.find(s => s.id === b.dataset.replay);
      if(node) replay(node);
    }));
  }

  function replay(node){
    const fakeNode = { ...node, choices: [{ label:"合 上 卷 轴", b:"", r:{} }] };
    openImmersive(fakeNode);
  }

  // —— 弟子自我介绍：沉浸式串行播放（一个个 ID）——
  function playIntroSeries(disciple_ids, onAllDone){
    const ids = disciple_ids.slice();
    function next(){
      if(ids.length === 0){ onAllDone && onAllDone(); return; }
      const did = ids.shift();
      const d = G.state.disciples.find(x => x.id === did);
      if(!d || !d.introScenes){ next(); return; }
      // 标记已见
      G.state.flags = G.state.flags || {};
      G.state.flags[`met_${did}`] = true;
      Save.persist();
      // 构造一个临时剧情节点，无选项（仅一句"嗯，记下了"）
      const scenes = d.introScenes.map(sc => ({
        bg: sc.bg || "sc_temple",
        speaker: d.pic,
        name: d.name,
        text: sc.text,
        quote: sc.quote || "",
      }));
      const node = {
        id:`intro_${did}`,
        chapter:0,
        title:`${d.name} · 拜 见 掌 门`,
        body:"",
        scenes,
        choices:[
          { label:"嗯，记下了", b:"", r:{} }
        ],
      };
      openImmersive(node);
      // 监听关闭后跳下一位
      const watcher = setInterval(() => {
        const ov = document.getElementById("immersive");
        if(!ov || !ov.classList.contains("active")){
          clearInterval(watcher);
          setTimeout(next, 400);
        }
      }, 200);
    }
    next();
  }

  return { tryAdvance, open: openImmersive, renderList, closeImmersive, playIntroSeries };
})();
