/* ================================================================
   新手引导 · 祖师爷带走一遍
   - 仅新存档触发
   - 高亮目标元素 + 祖师爷立绘 + 对话气泡
   - 完成步骤验证后才能进下一步
   ================================================================ */
const Tutorial = (() => {

  // 步骤序列。每步：highlight 选择器 / 文本 / 完成条件（点击/数据 flag）
  const STEPS = [
    {
      id:"intro", center:true,
      text:`「这便是残墟门 · 第十七代。」\n\n站在祖师堂中央，我有几桩事要交代你。\n\n点击右下角继续——我会带你走过这门派的每一处。`,
      next:"click",
    },
    {
      id:"hud_disciple", target:".stat-pill:nth-child(3)", side:"bottom",
      text:`这是你弟子的总数。门派之本，在于人。\n你眼下只有六人，半数尚是练气境。`,
      next:"click",
    },
    {
      id:"hud_stone", target:".stat-pill:nth-child(1)", side:"bottom",
      text:`这是灵石——支应一切的本钱。\n派遣、闭关、修缮，都要它。`,
      next:"click",
    },
    {
      id:"disciples", target:".disciples-row", side:"top",
      text:`这是你的众弟子。点他们的画像，可看资质、寿元、师兄妹羁绊。\n\n（你随后可亲自试一次。）`,
      next:"click",
    },
    {
      id:"action_dispatch", target:'[data-tut="dispatch"]', side:"top",
      text:`想要灵石和经验，须派他们下山历练。\n\n点这"派遣"——选一桩任务给他们。`,
      next:"act-dispatch",
    },
    {
      id:"on_dispatch", center:true,
      text:`选一桩你看中的任务（建议从「东山采草」开始，最易），\n点开后选 1~2 个弟子，确认出山即可。\n\n选完任务后请回到祖师堂。`,
      next:"flag:tut_dispatched",
    },
    {
      id:"action_cultivate", target:'[data-tut="cultivate"]', side:"top",
      text:`不愿出门的弟子，可让他们闭关修炼。\n\n这"闭关"按钮，每次 30 灵石加修为。\n修为满了便能尝试突破——\n但每一次突破，都有渡劫之险。`,
      next:"click",
    },
    {
      id:"action_story", target:'[data-tut="story"]', side:"top",
      text:`这"主线"里记着你与门派的命数。\n\n但请记住——主线大多不会写在纸上。\n它们会在某一夜，自己来敲你的门。`,
      next:"click",
    },
    {
      id:"action_next_day", target:'[data-tut="next-day"]', side:"top",
      text:`时辰流逝在你手中。\n点这"入定"，便是推一日——\n弟子归来、灵田收成、剧情发生，皆在此时。`,
      next:"click",
    },
    {
      id:"end", center:true,
      text:`好了。\n\n往后的路怎么走，全凭你定夺。\n\n——若有疑虑，点祖师堂中央的牌位，我会再开口。`,
      next:"click",
    },
  ];

  let idx = 0;
  let active = false;
  let overlay, mask, bubble, port;

  function start(){
    if(G.state.flags?.tut_done) return;
    active = true;
    idx = 0;
    buildUI();
    setTimeout(showStep, 500);
  }

  function buildUI(){
    overlay = document.createElement("div");
    overlay.id = "tutorial-layer";
    overlay.innerHTML = `
      <div id="tut-mask"></div>
      <div id="tut-spotlight"></div>
      <div id="tut-bubble">
        <div id="tut-port"></div>
        <div class="tut-body">
          <div class="tut-name">祖 师</div>
          <div class="tut-text" id="tut-text"></div>
          <div class="tut-foot">
            <button id="tut-skip">跳 过 引 导</button>
            <button id="tut-next">继 续 ▷</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    mask = overlay.querySelector("#tut-mask");
    bubble = overlay.querySelector("#tut-bubble");
    port = overlay.querySelector("#tut-port");
    overlay.querySelector("#tut-skip").onclick = () => finish();
    overlay.querySelector("#tut-next").onclick = () => next();
    port.style.backgroundImage = "url(assets/portraits/d_master.jpg)";
  }

  function showStep(){
    const step = STEPS[idx];
    if(!step){ finish(); return; }
    document.getElementById("tut-text").textContent = "";
    typeText(document.getElementById("tut-text"), step.text);
    placeBubble(step);
    setupNext(step);
  }

  function typeText(el, txt){
    el.innerHTML = "";
    const arr = [...txt]; let p = 0;
    function step(){
      if(p>=arr.length) return;
      const ch = arr[p++];
      if(ch === "\n") el.innerHTML += "<br>";
      else el.innerHTML += ch;
      setTimeout(step, ch==="\n"?180:32);
    }
    step();
  }

  function placeBubble(step){
    const sp = document.getElementById("tut-spotlight");
    sp.style.display = "none";
    if(step.center){
      bubble.className = "center";
      bubble.style.left = ""; bubble.style.top = "";
      return;
    }
    const t = document.querySelector(step.target);
    if(!t){ bubble.className = "center"; return; }
    const r = t.getBoundingClientRect();
    sp.style.display = "block";
    sp.style.left = (r.left - 8) + "px";
    sp.style.top = (r.top - 8) + "px";
    sp.style.width = (r.width + 16) + "px";
    sp.style.height = (r.height + 16) + "px";

    bubble.className = "side-" + (step.side || "top");
    if(step.side === "bottom"){
      bubble.style.left = Math.max(20, Math.min(window.innerWidth-440, r.left + r.width/2 - 220)) + "px";
      bubble.style.top = (r.bottom + 22) + "px";
    } else {
      bubble.style.left = Math.max(20, Math.min(window.innerWidth-440, r.left + r.width/2 - 220)) + "px";
      bubble.style.top = Math.max(20, r.top - 220) + "px";
    }
  }

  function setupNext(step){
    const nextBtn = overlay.querySelector("#tut-next");
    nextBtn.style.display = (step.next === "click") ? "" : "none";
    if(step.next?.startsWith("act-")){
      // 拦截 + 等待用户操作目标
      nextBtn.style.display = "none";
    }
    if(step.next?.startsWith("flag:")){
      // 等待 flag
      nextBtn.style.display = "none";
      const flag = step.next.slice(5);
      const interval = setInterval(() => {
        if(G.state.flags?.[flag]){
          clearInterval(interval);
          if(active) next();
        }
      }, 500);
    }
  }

  function next(){
    idx++;
    if(idx >= STEPS.length){ finish(); return; }
    showStep();
  }

  function finish(){
    active = false;
    overlay?.remove();
    if(G.state){ G.state.flags = G.state.flags || {}; G.state.flags.tut_done = true; Save.persist(); }
  }

  // 监听全局点击：若引导步骤需 click 目标
  function onGlobalClick(e){
    if(!active) return;
    const step = STEPS[idx];
    if(!step) return;
    if(step.next === "act-dispatch"){
      const t = e.target.closest('[data-act="dispatch"]');
      if(t) setTimeout(next, 350);
    }
  }

  return { start, finish, onGlobalClick, isActive: () => active };
})();
