/* ================================================================
   新手引导 · 祖师爷带走一遍（v2 · 第一视角）
   - 前段：纯对白，建立世界观，玩家做第一个选择（是否取残卷）
   - 后段：以祖师"我带你看一眼"的口气介绍功能
   - 全程第一人称
   ================================================================ */
const Tutorial = (() => {

  // 步骤定义
  // text 必须是祖师爷亲口说的话（"我"自称）；功能介绍也是"我带你看……"
  const STEPS = [
    // —— 序：世界观对白 ——
    {
      id:"open", center:true,
      text:`「孩子，过来。\n\n我等你已经等了三百年。」`,
      next:"click",
    },
    {
      id:"who_we_are", center:true,
      text:`「这地方叫「残墟门」。\n\n它本是七大派之外的一座小山门，三百年前还能名列「九派十宗」。\n\n后来一战，弟子死光，殿宇焚尽。我封住一口气坐在这里——\n等一个能接它下去的人。」`,
      next:"click",
    },
    {
      id:"who_you_are", center:true,
      text:`「我没有问过你的来历。\n你是谁、从何而来——都不重要。\n\n重要的是：从今夜起，你是残墟门第十七代掌门。\n这门派往后的命数，全在你一念之间。」`,
      next:"click",
    },
    {
      id:"the_world", center:true,
      text:`「告诉你一个数：七十年。\n\n这是世人推算的「下一次大劫」。\n七十年内，三大宗中将有一座殒落，新的三大宗将在残骸里立起。\n\n我们这等小派，要么趁势而起、跻身其列——\n要么被劫云抹去，连一炷香都没人替我们续。」`,
      next:"click",
    },
    {
      id:"the_seven", center:true,
      text:`「七大对头我先与你交代：\n\n  · 雷霆门 —— 离我们最近，最凶；\n  · 落霞谷 —— 八面玲珑，最难猜；\n  · 玄阴宗 —— 邪派挂名，实则操盘者；\n  · 紫薇阁 —— 朝廷的爪牙；\n\n余下三家暂时不会找上你。但只要你成长得够快，他们都会盯上你。」`,
      next:"click",
    },
    {
      id:"the_canjuan", center:true,
      text:`「再有一桩。\n\n我闭关前，把上代未尽的修行写成了一卷《祖师残卷》，藏在地窖第三阶。\n\n它不是什么大法宝——\n但有了它，你才能听见这门派真正的心跳。\n\n今夜，你打不打开它，我都不会拦你。」`,
      next:"click",
    },
    // —— 玩家的第一个选择 ——
    {
      id:"first_choice", center:true,
      text:`「孩子。\n\n看着我的眼睛，给我一个回答——\n\n你打算如何接下这个门派？」`,
      next:"choice",
      choices:[
        { label:"取出残卷，从今夜起重振门户", b:"激进 · 但走得最远", flag:"open_canjuan", grant:{ exp:30, flag:"got_canjuan" } },
        { label:"封回原处，先看清局势再说", b:"沉稳 · 一切徐徐图之", flag:"sealed_canjuan", grant:{ flag:"sealed_canjuan", mind:1 } },
        { label:"召集众弟子彻夜商议", b:"谨慎 · 凡事众议", flag:"shared_canjuan", grant:{ flag:"shared_canjuan", rep:5, exp:10 } },
      ],
    },
    {
      id:"after_choice", center:true,
      textFn: () => {
        const f = G.state.flags || {};
        if(f.got_canjuan) return `「你倒是不犹豫。\n\n好。残卷既然已在你手里，我便放心了一半。\n\n往后的路上你会发现——\n这卷上的字，会随你做事的方式而变。」`;
        if(f.sealed_canjuan) return `「不轻举妄动，是好事。\n\n你不像是十七岁的人。\n\n但记住：有些卷轴，封得住一时，封不住七十年。\n它会自己出来找你的。」`;
        return `「弟子们的心声你听得懂，便比独断好。\n\n但孩子，这门派往后会有许多事——\n来不及召集的事，比来得及召集的，多。」`;
      },
      next:"click",
    },
    {
      id:"transition", center:true,
      text:`「好了，世道我说完了。\n剩下的，我带你看一眼这门派的家当——\n\n你跟我走。」`,
      next:"click",
    },

    // —— 功能介绍（祖师"我带你看"第一人称） ——
    {
      id:"hud_disciple", target:".stat-pill:nth-child(3)", side:"bottom",
      text:`「先看你头上这一栏——这数字，是你眼下还活着的弟子数。\n\n我们这一脉的根本，全在这几个孩子身上。」`,
      next:"click",
    },
    {
      id:"hud_stone", target:".stat-pill:nth-child(1)", side:"bottom",
      text:`「这是灵石——你做任何事的本钱。\n\n派遣他们要它、闭关要它、修缮要它。\n\n莫要小看灵石，小派穷，灵石是命。」`,
      next:"click",
    },
    {
      id:"disciples", target:".disciples-row", side:"top",
      text:`「这便是你的众弟子了。\n\n点他们的画像，便能看出资质、寿元、师兄妹羁绊——\n你将来的每一步，都要从他们身上算起。\n\n（你随后可亲自试一次。）」`,
      next:"click",
    },
    {
      id:"action_dispatch", target:'[data-tut="dispatch"]', side:"top",
      text:`「灵石不会从天上掉下来。\n\n你得派他们下山——\n采草、护镖、灭妖、查访……\n\n这「派遣」按钮，你引导后亲自试试。」`,
      next:"click",
    },
    {
      id:"action_recruit", target:'[data-act="recruit"]', side:"top",
      text:`「这「坊市」是我后来给你加的——\n\n山下的散修偶尔会过路，每三日换一批。\n\n灵石够，便可招他们入门。\n人多力多——但人多，故事也多。」`,
      next:"click",
    },
    {
      id:"action_cultivate", target:'[data-tut="cultivate"]', side:"top",
      text:`「不愿出门的弟子，便让他们闭关。\n\n这「闭关」一次三十灵石，加修为。\n\n修为满了，便可尝试突破——\n但每一次突破，都有渡劫之险。\n你那位凌雪，眉间已隐有血纹，五年内必有一劫。」`,
      next:"click",
    },
    {
      id:"action_story", target:'[data-tut="story"]', side:"top",
      text:`「这「主线」里记着你与这门派的命数。\n\n但你听好——\n大事从来不会写在簿册上。\n它会自己来敲你的门。\n\n你能在这里看到的，多半已经成了往事。」`,
      next:"click",
    },
    {
      id:"action_next_day", target:'[data-tut="next-day"]', side:"top",
      text:`「这「入定」便是过一日。\n\n弟子归来、灵田收成、当夜的事，都在你按下它的那一瞬发生。\n\n要谨慎——有些日子，你按下去就回不到从前了。」`,
      next:"click",
    },
    {
      id:"end", center:true,
      text:`「好了，孩子。\n\n你眼前这条路，我陪不了你太久。\n\n若有疑虑，回这祖师堂来——\n我虽闭关，仍会听见你叫一声。\n\n弟子们已等不及要拜见新掌门——\n我先退下。」`,
      next:"click",
      isLast:true,
    },
  ];

  let idx = 0;
  let active = false;
  let overlay;

  function start(){
    if(G.state?.flags?.tut_done) return;
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
          <div class="tut-choices" id="tut-choices"></div>
          <div class="tut-foot">
            <button id="tut-skip">跳 过 引 导</button>
            <button id="tut-next">继 续 ▷</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector("#tut-port").style.backgroundImage = "url(assets/portraits/d_master.jpg)";
    overlay.querySelector("#tut-skip").onclick = () => finish();
    overlay.querySelector("#tut-next").onclick = () => next();
  }

  function showStep(){
    const step = STEPS[idx];
    if(!step){ finish(); return; }
    const txt = step.textFn ? step.textFn() : step.text;
    typeText(document.getElementById("tut-text"), txt);
    placeBubble(step);
    setupNext(step);
  }

  let typeTimer = null;
  let typeAbort = false;
  function typeText(el, txt){
    if(typeTimer){ clearTimeout(typeTimer); }
    typeAbort = false;
    el.innerHTML = "";
    const arr = [...txt]; let p = 0;
    function step(){
      if(typeAbort){ el.innerHTML = txt.replace(/\n/g,"<br>"); return; }
      if(p>=arr.length) return;
      const ch = arr[p++];
      if(ch === "\n") el.innerHTML += "<br>";
      else el.innerHTML += ch;
      typeTimer = setTimeout(step, ch==="\n"?180:34);
    }
    step();
  }
  function skipTyping(){ typeAbort = true; }

  function placeBubble(step){
    const sp = document.getElementById("tut-spotlight");
    const bubble = document.getElementById("tut-bubble");
    const layer = document.getElementById("tutorial-layer");
    sp.style.display = "none";
    layer.classList.remove("has-spotlight");
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
    // 关键修复：开启 has-spotlight 后 mask 不挡点击；spotlight 内 box-shadow 当遮罩
    layer.classList.add("has-spotlight");

    bubble.className = "side-" + (step.side || "top");
    if(step.side === "bottom"){
      bubble.style.left = Math.max(20, Math.min(window.innerWidth-460, r.left + r.width/2 - 230)) + "px";
      bubble.style.top = (r.bottom + 22) + "px";
    } else {
      bubble.style.left = Math.max(20, Math.min(window.innerWidth-460, r.left + r.width/2 - 230)) + "px";
      bubble.style.top = Math.max(20, r.top - 240) + "px";
    }
  }

  function setupNext(step){
    const nextBtn = document.getElementById("tut-next");
    const choicesBox = document.getElementById("tut-choices");
    choicesBox.innerHTML = "";
    nextBtn.style.display = "none";

    if(step.next === "click"){
      nextBtn.style.display = "";
      nextBtn.textContent = step.isLast ? "结 束 引 导 ▷" : "继 续 ▷";
    }
    if(step.next === "choice" && step.choices){
      step.choices.forEach(c => {
        const b = document.createElement("button");
        b.className = "tut-choice";
        b.innerHTML = `<b>${c.label}</b><span>${c.b||""}</span>`;
        b.onclick = () => {
          // 应用 grant
          if(c.grant){
            G.state.flags = G.state.flags || {};
            if(c.grant.flag) G.state.flags[c.grant.flag] = true;
            if(c.grant.exp){
              G.state.disciples.forEach(d => { if(!d.flags?.dead && !d.flags?.locked) d.exp += Math.floor(c.grant.exp / G.state.disciples.length); });
            }
            if(c.grant.rep) G.state.rep += c.grant.rep;
            if(c.grant.mind) G.state.disciples.forEach(d => { d.stats.mind += c.grant.mind; });
            // 标 c1s1 已完成（避免再次触发地窖之兆）
            if(!G.state.storyDone.includes("c1s1")) G.state.storyDone.push("c1s1");
            Save.persist();
            Main.updateHUD();
            Main.updateAltar();
          }
          next();
        };
        choicesBox.appendChild(b);
      });
    }
    if(step.next?.startsWith("act-")){
      // 等用户操作目标
    }
    if(step.next?.startsWith("flag:")){
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
