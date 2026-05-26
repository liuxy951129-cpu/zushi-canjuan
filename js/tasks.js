/* ================================================================
   新手任务 · 守住当前 UIUX，引导玩家熟悉系统
   ================================================================ */
const Tasks = (() => {

  // 任务定义
  const QUESTS = [
    {
      id:"t_first_dispatch",
      title:"派遣 · 试着让弟子下山",
      desc:`点击底部「派遣」，挑一桩任务下达。`,
      hint:"先去最简单的「东山采草」试试。",
      check: () => G.state.tasks?.t_first_dispatch,
      reward: { stone:30 },
      rewardText:"灵石 +30",
    },
    {
      id:"t_visit_world",
      title:"知 · 翻一翻七大派情报",
      desc:`点击右上「世界」，了解七大派与本派的关系。`,
      hint:"知敌方知己。",
      check: () => G.state.tasks?.t_visit_world,
      reward: { rep:5 },
      rewardText:"声望 +5",
    },
    {
      id:"t_first_build",
      title:"修 · 升一级建筑",
      desc:`「修缮」面板里挑一座建筑升级。`,
      hint:"建议先升丹房或灵田。",
      check: () => G.state.tasks?.t_first_build,
      reward: { pill:1 },
      rewardText:"丹药 +1",
    },
    {
      id:"t_first_breakthrough",
      title:"破 · 助一名弟子突破",
      desc:`闭关凑满修为，再尝试突破。`,
      hint:"陈渊或凌雪修为最高，更易先破。",
      check: () => G.state.tasks?.t_first_breakthrough,
      reward: { stone:80, pill:1 },
      rewardText:"灵石 +80 / 丹药 +1",
    },
    {
      id:"t_first_recruit",
      title:"门 · 招进一位剧情弟子",
      desc:`推进主线，让师弟妹回到山门。`,
      hint:"推进主线 c1s1 后，会有人来投。",
      check: () => G.state.tasks?.t_first_recruit,
      reward: { stone:60 },
      rewardText:"灵石 +60",
    },
  ];

  function open(){
    const items = QUESTS.map(q => {
      const done = !!q.check();
      const claimed = G.state.tasks?.[q.id+"_claimed"];
      return `
        <div style="margin-bottom:10px;padding:12px;background:${done && !claimed ? 'rgba(91,138,114,.18)' : 'rgba(20,15,12,.7)'};border:1px solid ${done && !claimed?'var(--jade)':done&&claimed?'var(--ink-3)':'var(--gold)'};border-radius:6px;${claimed?'opacity:0.5':''}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
            <div style="flex:1">
              <div style="font-family:Ma Shan Zheng;color:${done?'var(--jade)':'var(--gold-2)'};font-size:15px">${claimed?'✓ ':''}${q.title}</div>
              <div style="font-size:12px;color:var(--ink-2);margin-top:4px;line-height:1.6">${q.desc}</div>
              <div style="font-size:11px;color:var(--ink-3);margin-top:4px;font-style:italic">※ ${q.hint}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:11px;color:var(--candle);margin-bottom:6px">奖 ${q.rewardText}</div>
              ${claimed ? `<span style="font-size:11px;color:var(--ink-3)">已 领</span>` : done ? `<button class="mini-btn primary" data-claim="${q.id}">领 取</button>` : `<span style="font-size:11px;color:var(--ink-3)">未 完 成</span>`}
            </div>
          </div>
        </div>
      `;
    }).join("");

    const total = QUESTS.length;
    const doneN = QUESTS.filter(q => G.state.tasks?.[q.id+"_claimed"]).length;

    Modal.openHTML(`
      <h3>新 手 · 任 务 卷</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center">「掌门，先把这几桩家务事做了。」</div>
      <div style="text-align:center;font-family:Ma Shan Zheng;color:var(--gold-2);font-size:14px;margin:8px 0 14px 0">已完成 ${doneN} / ${total}</div>
      <div style="max-height:55vh;overflow-y:auto;padding-right:8px">
        ${items}
      </div>
      <div class="modal-row" style="margin-top:14px">
        <button class="btn ghost" data-act="modal-close">关 上</button>
      </div>
    `);

    document.querySelectorAll("[data-claim]").forEach(b => {
      b.onclick = () => {
        const q = QUESTS.find(x => x.id===b.dataset.claim);
        if(!q) return;
        if(q.reward?.stone) G.state.stone += q.reward.stone;
        if(q.reward?.pill) G.state.pill += q.reward.pill;
        if(q.reward?.rep) G.state.rep += q.reward.rep;
        G.state.tasks[q.id+"_claimed"] = true;
        Save.persist();
        Main.updateHUD();
        toast(`领取：${q.rewardText}`, "good");
        SFX?.play?.("chime");
        open(); // 刷新
      };
    });
  }

  // 检查并标记任务完成（被外部调用）
  function mark(taskId){
    if(!G.state.tasks) return;
    G.state.tasks[taskId] = true;
    Save.persist();
    // 通知
    const q = QUESTS.find(x => x.id === taskId);
    if(q && !G.state.tasks[taskId+"_notified"]){
      G.state.tasks[taskId+"_notified"] = true;
      toast(`任务完成 · ${q.title}`, "good");
    }
  }

  return { open, mark, QUESTS };
})();
