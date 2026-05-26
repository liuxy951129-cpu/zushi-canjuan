/* ================================================================
   主线推进任务 · 常驻右上浮窗
   - 每章主线触发前，必须完成一组前置任务
   - 任务类型：操作类(派遣/招募/建筑/技能)、属性类(某弟子根骨>=N)、收集类(铜钱>=N)
   - 完成一组 → 触发下一节主线
   - 浮窗常驻，可领奖+折叠
   ================================================================ */
const Tasks = (() => {

  // —— 任务定义 ——
  // gate: 阻塞哪个主线 storyId
  // checks: 数组，每项 { id, label, check: () => bool, hint }
  // reward: 完成全部后一次性发放（也可单项发，用 perReward）
  const STAGES = [
    {
      gate: "c1s1",
      title: "新手 · 起步七事",
      desc: "你接任掌门，先把这门派的家底摸一遍。",
      checks: [
        { id:"s0_dispatch",  label:"派一名弟子下山",        hint:"底部「派遣」选个最简单的任务", check:() => G.state.tasks?.t_first_dispatch },
        { id:"s0_build",     label:"修一座建筑",            hint:"底部「修缮」选未建的灰色建筑", check:() => G.state.tasks?.t_first_build },
        { id:"s0_world",     label:"翻一翻七大派情报",      hint:"HUD「界」按钮", check:() => G.state.tasks?.t_visit_world },
        { id:"s0_market",    label:"去一次坊市",            hint:"底部「坊市」",   check:() => G.state.tasks?.t_visit_market },
        { id:"s0_skill",     label:"看一次弟子技能树",      hint:"点弟子 → 技能格", check:() => G.state.tasks?.t_open_skill },
      ],
      reward: { coin:200, stone:50, pill:1 },
      rewardText:"+200 铜钱 / +50 灵石 / +1 丹药",
    },
    {
      gate: "c1s2",
      title: "起 · 蛛丝马迹",
      desc: "残卷既出，江湖上必有动静。\n你得把眼线和家底再筑厚一些。",
      checks: [
        { id:"s1_disp2",      label:"再派遣 1 次任务",            hint:"派遣面板（任意任务）", check:() => (G.state._counters?.dispatchCount||0) >= 2 },
        { id:"s1_lingtian",   label:"灵田升至 Lv.2",               hint:"修缮 → 灵田", check:() => (G.state.buildLv?.lingtian||0) >= 2 },
        { id:"s1_chenyuan",   label:"看一次陈渊详情",              hint:"主屏点陈渊立绘", check:() => G.state.flags?.investigated_jade },
      ],
      reward: { coin:120, stone:30 },
      rewardText:"+120 铜钱 / +30 灵石",
    },
    {
      gate: "c1s3",
      title: "战 · 立威之前",
      desc: "雷霆门要来叫阵。你这宗门——\n至少得让弟子拿得出手。",
      checks: [
        { id:"s2_cultivate",  label:"闭关任意弟子 3 次",          hint:"底部「闭关」", check:() => (G.state._counters?.cultivateCount||0) >= 3 },
        { id:"s2_dantang",    label:"丹房升至 Lv.2",               hint:"修缮 → 丹房", check:() => (G.state.buildLv?.dantang||0) >= 2 },
        { id:"s2_skillEq",    label:"为任意弟子装配 1 个技能",     hint:"弟子 → 技能格 → 点亮的叶子", check:() => {
            const eq = G.state.skillEquip || {};
            return Object.values(eq).some(arr => arr && arr.length > 0);
          } },
      ],
      reward: { coin:200, pill:2 },
      rewardText:"+200 铜钱 / +2 丹药",
    },
    {
      gate: "c2s1",
      title: "灵 · 听风之耳",
      desc: "门派开始有动静。\n你得有人能听见远处的风。",
      checks: [
        { id:"s3_yanwu",      label:"演武场修至 Lv.1",            hint:"修缮 → 演武场", check:() => (G.state.buildLv?.yanwu||0) >= 1 },
        { id:"s3_disc3",      label:"门下活弟子 ≥ 3 人",           hint:"剧情或坊市招募", check:() => G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left && !d.flags?.hidden && !d.flags?.locked).length >= 3 },
        { id:"s3_rep30",      label:"宗门声望 ≥ 30",               hint:"派遣或剧情累计", check:() => (G.state.rep||0) >= 30 },
      ],
      reward: { coin:150, stone:50 },
      rewardText:"+150 铜钱 / +50 灵石",
    },
    {
      gate: "c2s2",
      title: "谊 · 结盟之前",
      desc: "落霞谷主即将上山。\n你得有些家底好让人家看。",
      checks: [
        { id:"s4_zangjing",   label:"藏经阁修至 Lv.1",            hint:"修缮 → 藏经阁", check:() => (G.state.buildLv?.zangjing||0) >= 1 },
        { id:"s4_gift",       label:"赠礼任意弟子 1 次",           hint:"弟子详情 → 赠礼", check:() => (G.state._counters?.giftCount||0) >= 1 },
        { id:"s4_coin500",    label:"持有铜钱 ≥ 500",              hint:"派遣/灵田/坊市", check:() => (G.state.coin||0) >= 500 },
      ],
      reward: { coin:200, scroll:1 },
      rewardText:"+200 铜钱 / +1 卷轴",
    },
    {
      gate: "c2s3",
      title: "劫 · 渡劫将至",
      desc: "凌雪的眉间将有血纹。\n你得为她备好后路。",
      checks: [
        { id:"s5_pill3",      label:"持有丹药 ≥ 3 颗",            hint:"丹房产或坊市买", check:() => (G.state.pill||0) >= 3 },
        { id:"s5_break",      label:"任意弟子突破 1 次",            hint:"闭关凑满后突破", check:() => (G.state._counters?.breakCount||0) >= 1 },
        { id:"s5_interact",   label:"互动任意弟子 1 次",            hint:"弟子详情 → 互动", check:() => (G.state._counters?.interactCount||0) >= 1 },
      ],
      reward: { coin:200, pill:2 },
      rewardText:"+200 铜钱 / +2 丹药",
    },
    {
      gate: "c3s1",
      title: "客 · 客卿现身",
      desc: "客卿无名将要揭面。\n你得让宗门看起来值得他留下。",
      checks: [
        { id:"s6_hall2",      label:"祖师堂修至 Lv.2",            hint:"修缮 → 祖师堂", check:() => (G.state.buildLv?.hall||0) >= 2 },
        { id:"s6_disp5",      label:"累计派遣 ≥ 5 次",             hint:"派遣面板", check:() => (G.state._counters?.dispatchCount||0) >= 5 },
        { id:"s6_rep80",      label:"宗门声望 ≥ 80",               hint:"积累声望", check:() => (G.state.rep||0) >= 80 },
      ],
      reward: { coin:300, pill:3, stone:80 },
      rewardText:"+300 铜钱 / +3 丹药 / +80 灵石",
    },
  ];

  // 当前阶段（按 storyDone 决定）
  function currentStage(){
    for(const s of STAGES){
      if(!G.state.storyDone.includes(s.gate)) return s;
    }
    return null;
  }

  function isAllDone(stage){
    return stage.checks.every(c => c.check());
  }

  // —— 标记任务（外部调用 + 计数器） ——
  function mark(taskId){
    G.state.tasks = G.state.tasks || {};
    G.state.tasks[taskId] = true;
    Save.persist();
    renderFloater();
  }
  function counter(key, delta){
    G.state._counters = G.state._counters || {};
    G.state._counters[key] = (G.state._counters[key]||0) + (delta||1);
    Save.persist();
    renderFloater();
  }

  // —— 浮窗状态（折叠/展开） ——
  let collapsed = false;
  function toggle(){ collapsed = !collapsed; renderFloater(); }

  function renderFloater(){
    let panel = document.getElementById("task-floater");
    const stage = currentStage();
    if(!stage){
      // 全部主线已完成 → 浮窗消失
      if(panel){ panel.classList.add("done-fade"); setTimeout(() => panel?.remove(), 800); }
      return;
    }
    const allDone = isAllDone(stage);
    const claimed = G.state.tasks?.["stage_claimed_" + stage.gate];

    if(!panel){
      panel = document.createElement("div");
      panel.id = "task-floater";
      document.body.appendChild(panel);
    }
    const checksHtml = stage.checks.map(c => {
      const done = c.check();
      return '<div class="tfc-item ' + (done ? 'done' : '') + '">' +
        '<span class="tfc-bullet">' + (done ? '✓' : '○') + '</span>' +
        '<span class="tfc-text">' + c.label + '</span>' +
        (done ? '' : '<span class="tfc-hint" title="' + c.hint.replace(/"/g,'&quot;') + '">?</span>') +
        '</div>';
    }).join("");

    const doneCount = stage.checks.filter(c => c.check()).length;

    panel.innerHTML = '<div class="tf-card ' + (collapsed ? 'collapsed' : '') + '">' +
      '<div class="tf-head">' +
        '<div class="tf-step">前置 · 进度 ' + doneCount + '/' + stage.checks.length + '</div>' +
        '<button class="tf-toggle" title="折叠/展开">' + (collapsed ? '▾' : '▴') + '</button>' +
      '</div>' +
      '<div class="tf-title">' + stage.title + '</div>' +
      (collapsed ? '' : (
        '<div class="tf-desc">' + stage.desc.replace(/\n/g,'<br>') + '</div>' +
        '<div class="tf-checks">' + checksHtml + '</div>' +
        '<div class="tf-foot">' +
          '<span class="tf-reward">奖 ' + stage.rewardText + '</span>' +
          (allDone && !claimed
            ? '<button class="tf-claim ok" id="tf-claim-btn">✓ 领取 · 解锁主线</button>'
            : (claimed ? '<span class="tf-status">已领 · 等待主线</span>' : '<span class="tf-status">未完成</span>')
          ) +
        '</div>'
      )) +
    '</div>';
    panel.querySelector('.tf-toggle')?.addEventListener('click', toggle);
    panel.querySelector('#tf-claim-btn')?.addEventListener('click', () => claim(stage));
  }

  function claim(stage){
    if(!isAllDone(stage)) return;
    const r = stage.reward || {};
    if(r.coin) G.state.coin = (G.state.coin||0) + r.coin;
    if(r.stone) G.state.stone += r.stone;
    if(r.pill) G.state.pill = (G.state.pill||0) + r.pill;
    if(r.scroll) G.state.scroll = (G.state.scroll||0) + r.scroll;
    if(r.rep) G.state.rep += r.rep;
    G.state.tasks = G.state.tasks || {};
    G.state.tasks["stage_claimed_" + stage.gate] = true;
    Save.persist();
    Main.updateHUD();
    SFX && SFX.play && SFX.play('chime');
    // ✓ 动画 + 0.9s 后触发主线
    const panel = document.getElementById("task-floater");
    if(panel){
      panel.classList.add("just-done");
      setTimeout(() => {
        panel.classList.remove("just-done");
        renderFloater();
        // 触发主线
        if(typeof Story !== 'undefined' && Story.tryAdvance) Story.tryAdvance();
      }, 1000);
    }
    toast("领得 " + stage.rewardText + " · 主线开启", "good");
  }

  return { mark, counter, renderFloater, currentStage, isAllDone, STAGES };
})();
