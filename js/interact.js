/* ================================================================
   弟子互动 + 感情线
   - 6 类互动：聊天/切磋/共修/送礼/问道/表白
   - 好感分阶：陌生(0) → 相识(20) → 熟络(50) → 知己(100) → 道侣(200)
   - 师兄妹会自起小事件
   ================================================================ */
const Interact = (() => {

  const STAGES = [
    { min:0,    name:"陌生",  color:"#7a6b58" },
    { min:20,   name:"相识",  color:"#a89678" },
    { min:50,   name:"熟络",  color:"#5b8a72" },
    { min:100,  name:"知己",  color:"#c9a35a" },
    { min:200,  name:"道侣",  color:"#a83236" },
  ];

  function stage(score){
    let s = STAGES[0];
    STAGES.forEach(x => { if(score >= x.min) s = x; });
    return s;
  }

  function getBond(did){
    G.state.bondScores = G.state.bondScores || {};
    return G.state.bondScores[did] || 0;
  }
  function addBond(did, delta){
    G.state.bondScores = G.state.bondScores || {};
    const before = G.state.bondScores[did] || 0;
    const after = Math.max(0, before + delta);
    G.state.bondScores[did] = after;
    // 越阶时触发独立小事件
    const sBefore = stage(before).name;
    const sAfter = stage(after).name;
    if(sBefore !== sAfter && delta > 0) onStageUp(did, sAfter);
    Save.persist();
  }

  function onStageUp(did, name){
    const d = G.state.disciples.find(x => x.id===did);
    if(!d) return;
    setTimeout(() => {
      const lines = ({
        "相识": `「师兄/师姐，多谢你前几日的照拂。」`,
        "熟络": `「你我同门一场，往后我便不再藏私。」`,
        "知己": `「这世道太冷。能遇着你这样的人，已是仙缘。」`,
        "道侣": `「我曾以为，仙路独行才是常理。\n现在才知，与你共渡，便是仙路。」`,
      })[name] || "";
      if(lines) Dialog.show(d.pic, d.name, `（${name}）` + lines);
    }, 400);
  }

  // —— 互动菜单 ——
  function open(did){
    const d = G.state.disciples.find(x => x.id===did);
    if(!d) return;
    if(d.flags?.dead || d.flags?.left || d.flags?.locked){ toast("此人不在山门", "bad"); return; }

    const score = getBond(did);
    const st = stage(score);
    const nextSt = STAGES.find(x => x.min > score);
    const todayKey = "interact_" + did + "_" + G.state.day;
    G.state.flags = G.state.flags || {};
    const usedToday = G.state.flags[todayKey] || 0;

    Modal.openHTML(`
      <div style="display:flex;gap:18px;align-items:flex-start;margin-bottom:14px">
        <div style="width:120px;height:160px;flex-shrink:0;background:url(assets/portraits/${d.pic}.jpg) center/cover;border:1.5px solid var(--gold);box-shadow:0 0 0 2px var(--bg-0), 0 0 0 3px var(--gold-3)"></div>
        <div style="flex:1">
          <div style="display:inline-block;padding:3px 10px;background:${st.color};color:var(--gold-2);font-family:Ma Shan Zheng;font-size:12px;letter-spacing:.2em;margin-bottom:6px">${st.name}</div>
          <h3 style="text-align:left;margin:4px 0 8px;font-family:Ma Shan Zheng;font-size:22px;letter-spacing:.18em;background:linear-gradient(180deg,#f4dba6,#c9a35a);-webkit-background-clip:text;background-clip:text;color:transparent">${d.name} · ${d.title}</h3>
          <div style="font-size:12px;color:var(--ink-3);letter-spacing:.06em">好感 <b style="color:${st.color};font-family:Ma Shan Zheng;font-size:14px">${score}</b>${nextSt?` · 距 <b>${nextSt.name}</b> ${nextSt.min-score}`:" · 已是顶阶"}</div>
          <div style="margin-top:6px;height:8px;background:rgba(20,12,14,.95);border:1px solid var(--line);overflow:hidden">
            <i style="display:block;height:100%;width:${Math.min(100, score/(nextSt?nextSt.min:200)*100)}%;background:linear-gradient(90deg, ${st.color}, var(--gold))"></i>
          </div>
          <div style="font-size:11px;color:var(--ink-3);margin-top:8px;letter-spacing:.06em">今日已互动 ${usedToday}/2 次</div>
        </div>
      </div>
      <div class="modal-row" id="int-row" style="flex-direction:column;align-items:stretch;gap:8px"></div>
    `);

    const row = document.getElementById("int-row");
    const acts = [
      { id:"chat",   name:"闲谈片刻", cost:0, gain:[2,5], hint:"叙茶论道，最是平常" },
      { id:"spar",   name:"演武切磋", cost:0, gain:[3,7], hint:"切磋三招，惺惺相惜（弟子曾受伤者勿)" },
      { id:"cult",   name:"同灯共修", cost:5, gain:[5,10], hint:"耗 5 灵石，互助修为", needStone:5 },
      { id:"gift",   name:"送一件物", cost:30, gain:[10,18], hint:"耗 30 灵石购雅物相赠", needStone:30 },
      { id:"ask",    name:"问道求解", cost:0, gain:[1,3], hint:"听他/她讲一段往事" },
      { id:"vow",    name:"以情相许", cost:0, gain:[20,30], hint:"惟在好感 ≥ 100 时可解锁，将永结道侣", needBond:100 },
    ];
    acts.forEach(a => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      let locked = false, lockMsg = "";
      if(usedToday >= 2){ locked = true; lockMsg = "今日次数已尽（明日再来）"; }
      else if(a.needStone && G.state.stone < a.needStone){ locked = true; lockMsg = `需 ${a.needStone} 灵石`; }
      else if(a.needBond && score < a.needBond){ locked = true; lockMsg = `好感未达 ${a.needBond}`; }
      btn.innerHTML = `<b>${a.name}</b><span>${a.hint}</span>${locked?`<div class="hint" style="color:var(--vermilion-2)">⌑ ${lockMsg}</div>`:""}`;
      if(locked){ btn.style.opacity = .5; btn.style.pointerEvents = "none"; }
      btn.onclick = () => doAction(d, a, () => { Modal.close(); open(did); });
      row.appendChild(btn);
    });
  }

  function doAction(d, a, after){
    const todayKey = "interact_" + d.id + "_" + G.state.day;
    G.state.flags[todayKey] = (G.state.flags[todayKey] || 0) + 1;
    if(a.needStone) G.state.stone -= a.needStone;
    const gain = a.gain[0] + Math.floor(Math.random() * (a.gain[1] - a.gain[0] + 1));
    addBond(d.id, gain);
    SFX.play("chime");

    // 独立小剧情台词池
    const lines = lineFor(d, a.id);
    Modal.openHTML(`
      <div style="display:flex;gap:18px;align-items:flex-start">
        <div style="width:120px;height:160px;flex-shrink:0;background:url(assets/portraits/${d.pic}.jpg) center/cover;border:1.5px solid var(--gold);box-shadow:0 0 0 2px var(--bg-0), 0 0 0 3px var(--gold-3)"></div>
        <div style="flex:1">
          <div class="im-name" style="margin-bottom:8px">${d.name}</div>
          <div style="color:var(--ink);line-height:2.05;font-size:15px;letter-spacing:.04em">${lines.replace(/\n/g,"<br>")}</div>
        </div>
      </div>
      <div class="lead" style="margin-top:14px;color:var(--candle);font-size:13px">好感 +${gain}</div>
      <div class="modal-row"><button class="btn primary" id="int-ok">合 上 心 事</button></div>
    `);
    document.getElementById("int-ok").onclick = () => { Save.persist(); Main.updateHUD(); after(); };
  }

  function lineFor(d, kind){
    const pool = ({
      chat: [
        `「师兄/师姐，今日山下飘细雨。\n   也不知前山的剑兰开了没有。」`,
        `「我前两日做了个怪梦——\n   梦见我在云海上飞，但醒来找不到方向。」`,
        `「人少时听风，便觉得万物有声。」`,
      ],
      spar: [
        `「来。」剑光交错三招，他/她略一退步，眉间见笑：\n「你的手腕，比上次稳了。」`,
        `「这一招若实，我必死。」对方收剑笑道，\n「但同门切磋，本就该留三分情。」`,
      ],
      cult: [
        `两人相对盘膝。烛火静静燃烧。\n半个时辰过去，他/她睁眼：\n「方才你的灵息绕过我的中宫——\n  我能感到你想护着我。\n  谢谢。」`,
      ],
      gift: [
        `「哎呀，这……我便收下了。\n  下次你要什么，与我说。」（眼里有星）`,
        `「这个，我要收一辈子的。」`,
      ],
      ask: [
        `「师兄/师姐，你问的这个——\n   我曾在江南旧家时，听父亲讲过。\n   ……可那已经是另一辈子的事了。」`,
        `「人为什么修仙？\n   我曾以为是为了不死。\n   后来才知，是为了——还能再见到一些人。」`,
      ],
      vow: [
        `他/她沉默良久，目光落在你身上：\n\n「这门派将来如何，我不知。\n但这一生与你共度，我此刻便允了。\n\n  愿与君同坐一炷香，\n  共看千秋一夜霜。」`,
      ],
    })[kind] || [`「……」`];
    return pool[Math.floor(Math.random()*pool.length)];
  }

  return { open, getBond, stage, addBond };
})();
