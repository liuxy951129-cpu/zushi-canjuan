/* ================================================================
   新手任务 · 右上角浮窗（不入 HUD）
   - 完成则 √ 动画 + 自动消失
   - 全部完成后浮窗自动隐藏，第一次主线剧情才会触发
   ================================================================ */
const Tasks = (() => {

  // 顺序任务（按 step 推进，一次只显示一个）
  const QUESTS = [
    { id:"t_first_dispatch", title:"派 · 试着派弟子下山",  hint:"点击底部「派遣」", reward:{ coin:80 }, rewardText:"+80 铜钱", check:() => G.state.tasks?.t_first_dispatch },
    { id:"t_first_build",    title:"建 · 修一座建筑",      hint:"点击底部「修缮」",  reward:{ stone:20 }, rewardText:"+20 灵石", check:() => G.state.tasks?.t_first_build },
    { id:"t_visit_world",    title:"知 · 翻七大派情报",    hint:"点击右上「界」",   reward:{ coin:60 }, rewardText:"+60 铜钱", check:() => G.state.tasks?.t_visit_world },
    { id:"t_first_recruit",  title:"市 · 去坊市看看",      hint:"点击「坊市」",     reward:{ coin:50, pill:1 }, rewardText:"+50 铜钱 / +1 丹药", check:() => G.state.tasks?.t_visit_market },
    { id:"t_open_skill",     title:"技 · 看一次技能树",    hint:"点弟子 → 技能格", reward:{ stone:30 }, rewardText:"+30 灵石", check:() => G.state.tasks?.t_open_skill },
  ];

  // 当前显示的任务 idx
  function currentIdx(){
    for(let i=0; i<QUESTS.length; i++){
      const q = QUESTS[i];
      // 已领取 → 跳过
      if(G.state.tasks?.[q.id+"_claimed"]) continue;
      return i;
    }
    return -1; // 全完成
  }

  // 右上角浮窗渲染
  function renderFloater(){
    let panel = document.getElementById("task-floater");
    const idx = currentIdx();
    if(idx === -1){
      // 全完成：移除浮窗
      if(panel){
        panel.classList.add("done-fade");
        setTimeout(() => panel?.remove(), 800);
      }
      return;
    }
    const q = QUESTS[idx];
    const done = !!q.check();

    if(!panel){
      panel = document.createElement("div");
      panel.id = "task-floater";
      document.body.appendChild(panel);
    }
    panel.innerHTML = [
      '<div class="tf-card">',
      '<div class="tf-step">新手 · 第 ' + (idx+1) + ' / ' + QUESTS.length + ' 步</div>',
      '<div class="tf-title">' + q.title + '</div>',
      '<div class="tf-hint">' + q.hint + '</div>',
      '<div class="tf-foot">',
      '<span class="tf-reward">奖 ' + q.rewardText + '</span>',
      done
        ? '<button class="tf-claim ok" data-tfclaim="' + q.id + '">✓ 领取</button>'
        : '<span class="tf-status">未 完 成</span>',
      '</div>',
      '</div>'
    ].join('');
    const btn = panel.querySelector('[data-tfclaim]');
    if(btn){
      btn.onclick = () => claim(q.id);
    }
  }

  function claim(qid){
    const q = QUESTS.find(x => x.id === qid);
    if(!q) return;
    if(!q.check()){ return; }
    // 发奖
    if(q.reward.coin) G.state.coin = (G.state.coin||0) + q.reward.coin;
    if(q.reward.stone) G.state.stone += q.reward.stone;
    if(q.reward.pill) G.state.pill = (G.state.pill||0) + q.reward.pill;
    if(q.reward.rep) G.state.rep += q.reward.rep;
    G.state.tasks = G.state.tasks || {};
    G.state.tasks[qid+"_claimed"] = true;
    Save.persist();
    SFX && SFX.play && SFX.play("chime");
    // 打勾动画
    const panel = document.getElementById("task-floater");
    if(panel){
      panel.classList.add("just-done");
      setTimeout(() => {
        panel.classList.remove("just-done");
        Main.updateHUD();
        renderFloater();
      }, 900);
    } else {
      Main.updateHUD();
      renderFloater();
    }
    toast("奖励 " + q.rewardText, "good");
  }

  // 外部触发：标某个任务完成（不立即领取）
  function mark(taskId){
    G.state.tasks = G.state.tasks || {};
    G.state.tasks[taskId] = true;
    Save.persist();
    renderFloater();
  }

  return { renderFloater, mark, QUESTS };
})();
