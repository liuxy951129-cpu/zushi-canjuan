/* ================================================================
   战斗系统 · 宝可梦式回合制 1v1 / 3v3
   ================================================================ */
const Battle = (() => {

  let B = null; // 当前战斗 state

  const REALM_NAMES = ["炼气","筑基","金丹","元婴","化神","合体","大乘","渡劫"];
  function realmText(r){ return REALM_NAMES[r||0] || "炼气"; }

  // —— 入口：江湖论道（选派 → 选模式 → 选阵容 → 开打）——
  function openHub(){
    const meRealm = (G.state.disciples.find(d => d.id==="chenyuan") || {realm:0}).realm;
    const cards = Object.entries(ENEMY_SECTS).map(([sid, sect])=>{
      const leader = sect.members.find(m => m.isLeader);
      const winCount = G.state.battle?.victories?.[sid] || 0;
      const danger = leader.realm;
      const dangerColor = danger>=6?"#ff5050":danger>=4?"#ffc864":"#80c898";
      const winText = winCount>=3 ? "宿 敌 已 平（×"+winCount+"）" : winCount>0 ? "已 攻 破 ✓ ×"+winCount : "尚 未 出 手";
      const winColor = winCount>=3 ? "var(--candle)" : winCount>0 ? "var(--gold-2)" : "var(--ink-3)";
      return `
      <div class="battle-sect-card" data-sid="${sid}" style="border-color:${sect.color}">
        <div class="bsc-banner" style="background:linear-gradient(135deg,${sect.color}66,${sect.color}22)">
          <div class="bsc-name">${sect.name}</div>
          <div class="bsc-leader">掌门 · ${leader.name}（${realmText(leader.realm)}）</div>
        </div>
        <div class="bsc-body">
          <div class="bsc-stat"><span>实力评定</span><b style="color:${dangerColor}">${realmText(leader.realm)} ${"★".repeat(Math.min(5,leader.realm))}</b></div>
          <div class="bsc-stat"><span>门下高手</span><b>${sect.members.length} 人</b></div>
          <div class="bsc-stat"><span>本派战绩</span><b style="color:${winColor}">${winText}</b></div>
          <div class="bsc-actions">
            <button class="btn small primary" data-act-battle="prep" data-sid="${sid}">入 阵 论 道</button>
          </div>
        </div>
      </div>`;
    }).join("");

    Modal.openHTML(`
      <h3 style="margin:0;text-align:center">江 湖 论 道</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center;margin:6px 0 14px 0">
        「掌门，江湖六派各有掌门坐镇。要打败一派，须先击溃其帮主。」
      </div>
      <div class="battle-sect-grid">${cards}</div>
      <div class="modal-row" style="margin-top:14px"><button class="btn ghost" data-act="modal-close">改 日 再 论</button></div>
    `);

    document.querySelectorAll("[data-act-battle=\"prep\"]").forEach(b=>{
      b.onclick = () => openPrep(b.dataset.sid);
    });
  }

  // —— 备战界面：选模式 + 选我方阵容 ——
  function openPrep(sid){
    const sect = ENEMY_SECTS[sid];
    const ours = G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left && !d.flags?.hidden && !d.flags?.locked);
    const mode = (G.state.battle?.lastMode) || "3v3";
    const selected = (G.state.battle?.lastTeam || []).filter(id => ours.find(o=>o.id===id));

    const enemyList = sect.members.map(m=>{
      const tag = m.isLeader ? '<span class="enemy-leader-tag">帮主</span>' : '';
      return `
        <div class="enemy-row${m.isLeader?' is-leader':''}">
          <img src="assets/portraits/${m.portrait}.jpg" onerror="this.style.background='#3a2820'" />
          <div class="enemy-row-info">
            <div class="enemy-row-name">${m.name} ${tag}</div>
            <div class="enemy-row-realm">${realmText(m.realm)}</div>
          </div>
        </div>`;
    }).join("");

    const ourList = ours.map(d=>{
      const sel = selected.includes(d.id);
      return `
        <div class="our-row ${sel?'sel':''}" data-did="${d.id}">
          <img src="assets/portraits/${d.pic}.jpg" />
          <div class="our-row-info">
            <div class="our-row-name">${d.name} <span class="our-row-realm">${realmText(d.realm)}</span></div>
            <div class="our-row-bar">
              <div class="orb-tag">根 ${d.stats.root}</div>
              <div class="orb-tag">智 ${d.stats.wit}</div>
              <div class="orb-tag">神 ${d.stats.spirit}</div>
            </div>
          </div>
          <div class="our-check">${sel?"✓":""}</div>
        </div>`;
    }).join("");

    Modal.openHTML(`
      <h3 style="margin:0;text-align:center">备 战 · ${sect.name}</h3>
      <div class="prep-mode-row">
        <button class="mode-btn ${mode==='1v1'?'on':''}" data-mode="1v1">1 v 1 · 个 人 切 磋</button>
        <button class="mode-btn ${mode==='3v3'?'on':''}" data-mode="3v3">3 v 3 · 联 阵 大 战</button>
      </div>
      <div class="prep-cols">
        <div class="prep-col">
          <h4 class="prep-h4">敌 · ${sect.name}</h4>
          <div class="enemy-list">${enemyList}</div>
        </div>
        <div class="prep-col">
          <h4 class="prep-h4">我 · 残 墟 门 <span class="prep-sub">已选 <b id="sel-count">${selected.length}</b> / <b id="sel-max">${mode==='1v1'?1:3}</b></span></h4>
          <div class="our-list" id="our-list">${ourList}</div>
        </div>
      </div>
      <div class="modal-row" style="margin-top:12px;justify-content:flex-end;gap:8px">
        <button class="btn ghost" data-act-battle="back">返 回</button>
        <button class="btn primary" id="btn-start-battle">开 战 →</button>
      </div>
    `);

    let cur = { sid, mode, team:selected.slice() };

    function refreshSel(){
      const max = cur.mode==='1v1'?1:3;
      document.getElementById("sel-count").textContent = cur.team.length;
      document.getElementById("sel-max").textContent = max;
      document.querySelectorAll(".our-row").forEach(r=>{
        const did = r.dataset.did;
        const sel = cur.team.includes(did);
        r.classList.toggle("sel", sel);
        r.querySelector(".our-check").textContent = sel?"✓":"";
      });
    }

    document.querySelectorAll(".mode-btn").forEach(b=>{
      b.onclick = ()=>{
        cur.mode = b.dataset.mode;
        document.querySelectorAll(".mode-btn").forEach(x=>x.classList.remove("on"));
        b.classList.add("on");
        const max = cur.mode==='1v1'?1:3;
        if(cur.team.length > max) cur.team = cur.team.slice(0,max);
        refreshSel();
      };
    });

    document.querySelectorAll(".our-row").forEach(r=>{
      r.onclick = ()=>{
        const did = r.dataset.did;
        const max = cur.mode==='1v1'?1:3;
        const idx = cur.team.indexOf(did);
        if(idx>=0) cur.team.splice(idx,1);
        else if(cur.team.length < max) cur.team.push(did);
        refreshSel();
      };
    });

    document.querySelector('[data-act-battle="back"]').onclick = ()=> openHub();
    document.getElementById("btn-start-battle").onclick = ()=>{
      if(cur.team.length === 0){ alert("至少选一名弟子出阵。"); return; }
      const need = cur.mode==='1v1'?1:3;
      if(cur.team.length < need){ if(!confirm(`${cur.mode} 建议出 ${need} 人，确定以 ${cur.team.length} 人迎战？`)) return; }
      G.state.battle = G.state.battle || { victories:{} };
      G.state.battle.lastMode = cur.mode;
      G.state.battle.lastTeam = cur.team.slice();
      Save.persist();
      startBattle(cur.sid, cur.mode, cur.team);
    };
  }

  // —— 战斗开始 ——
  function startBattle(sid, mode, ourTeamIds){
    const sect = ENEMY_SECTS[sid];
    const ours = ourTeamIds.map(id => G.state.disciples.find(d=>d.id===id));

    // 敌方根据 mode 取人：1v1 → 帮主；3v3 → 帮主 + 2 长老
    let enemies = [];
    if(mode === "1v1"){
      enemies = [sect.members.find(m => m.isLeader)];
    } else {
      const leader = sect.members.find(m => m.isLeader);
      const others = sect.members.filter(m => !m.isLeader).slice(0,2);
      enemies = [leader, ...others];
    }

    // 包装战斗单位
    function pack(unit, side){
      const isOurs = side === "ally";
      const battleSkills = isOurs ? mapDiscipleBattleSkills(unit) : unit.skills;
      const ds = deriveBattleStats(unit);
      return {
        side,
        id: unit.id,
        name: unit.name,
        title: unit.title || "",
        isLeader: !!unit.isLeader,
        portrait: isOurs ? `assets/portraits/${unit.pic}.jpg` : `assets/portraits/${unit.portrait}.jpg`,
        realm: unit.realm,
        element: (isOurs ? (Skills?.getMainTree?.(unit.id)?.tree?.element || "metal") : unit.element),
        stats: unit.stats,
        skills: battleSkills,
        hp: ds.maxHp, maxHp: ds.maxHp,
        mp: ds.maxMp, maxMp: ds.maxMp,
        atk: ds.atk, mag: ds.mag, def: ds.def, mdef: ds.mdef, spd: ds.spd,
        buffs: [], dots: [], dead: false,
      };
    }

    B = {
      sid, mode,
      sect,
      bg: sect.bg,
      allies: ours.map(d=>pack(d, "ally")),
      enemies: enemies.map(e=>pack(e, "enemy")),
      turn: 1,
      log: [],
      activeIdx: 0,         // 当前我方行动者下标
      activeSide: "ally",   // 当前回合谁动
      order: [],            // 本回合速度顺序
      orderIdx: 0,
      ui: null,
      waiting: false,
      ended: false,
    };

    Modal.close();
    // 开战转场：黑屏剑光 1.4s + 战前喊话
    playOpeningTransition(sect, ()=>{
      buildBattleUI();
      pushLog(`【宗门战】${sect.name} VS 残墟门，${mode} 论道开始！`);
      nextRound();
    });
  }

  // —— 开战转场 ——
  const OPENING_LINES = {
    sect_thunder: { ally:"「雷霆门，欺人太甚——还剑！」", enemy:"「残墟小辈，敢闯雷霆？！」" },
    sect_luoxia:  { ally:"「谷主，今日只论高下，不伤性命。」", enemy:"「年轻人，本谷的丹房可不是练剑场。」" },
    sect_xuanyin: { ally:"「玄阴邪术，今日斩之。」", enemy:"「呵呵呵……新的祭品来了。」" },
    sect_ziwei:   { ally:"「阁主，论道一场。」", enemy:"「来吧。星河流转，自有定数。」" },
    sect_xueyue:  { ally:"「血月教，不死不休。」", enemy:"「血月之下，无人能逃！」" },
    sect_xuxian:  { ally:"「真君，请！」", enemy:"「贫道恭候多时。」" },
  };
  function playOpeningTransition(sect, onDone){
    let el = document.getElementById("battle-opening");
    if(el) el.remove();
    el = document.createElement("div");
    el.id = "battle-opening";
    el.className = "battle-opening";
    const allyD = G.state.disciples.find(d => d.id==="chenyuan" && !d.flags?.dead)
                || G.state.disciples.find(d => !d.flags?.dead && !d.flags?.locked);
    const allyPic = allyD ? `assets/portraits/${allyD.pic}.jpg` : "assets/portraits/d_chenyuan.jpg";
    const enemyL = sect.members.find(m=>m.isLeader);
    const enemyPic = `assets/portraits/${enemyL.portrait}.jpg`;
    const lines = OPENING_LINES[sect.bg ? Object.keys(ENEMY_SECTS).find(k=>ENEMY_SECTS[k]===sect) : ""] || OPENING_LINES.sect_thunder;
    const sid = Object.keys(ENEMY_SECTS).find(k=>ENEMY_SECTS[k]===sect);
    const realLines = OPENING_LINES[sid] || OPENING_LINES.sect_thunder;
    el.innerHTML = `
      <div class="bo-flash"></div>
      <div class="bo-sword"></div>
      <div class="bo-vs">
        <div class="bo-side bo-ally">
          <img src="${allyPic}" />
          <div class="bo-name">${allyD?.name || '陈渊'}</div>
          <div class="bo-quote">${realLines.ally}</div>
        </div>
        <div class="bo-vs-mark">VS</div>
        <div class="bo-side bo-enemy">
          <img src="${enemyPic}" />
          <div class="bo-name">${enemyL.name}</div>
          <div class="bo-quote">${realLines.enemy}</div>
        </div>
      </div>
      <div class="bo-title">${sect.name} · ${B.mode} 论 道</div>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add("active"));
    setTimeout(()=>{
      el.classList.add("fade-out");
      setTimeout(()=>{ el.remove(); onDone(); }, 500);
    }, 2200);
  }

  // —— UI 构建 ——
  function buildBattleUI(){
    let el = document.getElementById("battle");
    if(el) el.remove();
    el = document.createElement("div");
    el.id = "battle";
    el.className = "battle-screen";
    el.innerHTML = `
      <div class="battle-bg" id="battle-bg" style="background-image:url(assets/scenes/${B.bg}.jpg), url(assets/scenes/bg_battle_arena.jpg), url(assets/scenes/hi_sc_temple.jpg)"></div>
      <div class="battle-mask"></div>
      <div class="battle-arena">
        <div class="battle-team battle-team-enemy" id="team-enemy"></div>
        <div class="battle-divider"></div>
        <div class="battle-team battle-team-ally" id="team-ally"></div>
      </div>
      <div class="battle-log" id="battle-log"></div>
      <div class="battle-panel" id="battle-panel"></div>
      <button class="battle-flee" id="btn-battle-flee">逃 离 战 场</button>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add("active"));

    document.getElementById("btn-battle-flee").onclick = ()=>{
      if(confirm("撤出战斗将判输本场，确定？")) endBattle(false, true);
    };
    renderTeams();
  }

  function renderTeams(){
    document.getElementById("team-ally").innerHTML = B.allies.map((u,i)=>unitCard(u, i, "ally")).join("");
    document.getElementById("team-enemy").innerHTML = B.enemies.map((u,i)=>unitCard(u, i, "enemy")).join("");
  }

  function unitCard(u, idx, side){
    const dead = u.dead ? " dead" : "";
    const active = (B.activeSide === side && B.order[B.orderIdx]?.idx === idx) ? " active-turn" : "";
    const target = (B.waiting && B.waiting.type === "selectTarget" && side === "enemy" && !u.dead) ? " targetable" : "";
    return `
      <div class="b-unit-card ${side}${dead}${active}${target}" data-side="${side}" data-idx="${idx}">
        <div class="bu-portrait" style="background-image:url(${u.portrait})">
          ${u.isLeader ? '<div class="bu-leader-mark">★ 帮主</div>' : ''}
          ${u.dead ? '<div class="bu-dead-mask">x</div>' : ''}
        </div>
        <div class="bu-info">
          <div class="bu-name-row">
            <span class="bu-name">${u.name}</span>
            <span class="bu-realm">${realmText(u.realm)}</span>
          </div>
          <div class="bu-bar hp">
            <div class="bu-bar-fill" style="width:${Math.max(0,u.hp/u.maxHp*100)}%"></div>
            <span>HP ${Math.max(0,u.hp)} / ${u.maxHp}</span>
          </div>
          <div class="bu-bar mp">
            <div class="bu-bar-fill" style="width:${Math.max(0,u.mp/u.maxMp*100)}%"></div>
            <span>MP ${Math.max(0,u.mp)} / ${u.maxMp}</span>
          </div>
          ${u.buffs.length?`<div class="bu-buffs">${u.buffs.map(b=>`<span class="bu-buff">${b.icon||'●'} ${b.name} ${b.turns}</span>`).join('')}</div>`:''}
        </div>
      </div>
    `;
  }

  function pushLog(text){
    B.log.push(text);
    if(B.log.length > 50) B.log.shift();
    const el = document.getElementById("battle-log");
    if(el){
      el.innerHTML = B.log.slice(-6).map(t=>`<div>${t}</div>`).join("");
      el.scrollTop = el.scrollHeight;
    }
  }

  // —— 回合调度 ——
  function nextRound(){
    if(B.ended) return;
    // 触发 buff/dot 衰减（每个新回合开始时）
    if(B.orderIdx === 0 || B.order.length === 0){
      // 计算速度顺序
      const all = [...B.allies.map((u,i)=>({u,side:"ally",idx:i})), ...B.enemies.map((u,i)=>({u,side:"enemy",idx:i}))]
        .filter(o=>!o.u.dead);
      all.sort((a,b)=> (b.u.spd + Math.random()*2) - (a.u.spd + Math.random()*2));
      B.order = all;
      B.orderIdx = 0;
      pushLog(`—— 第 ${B.turn} 回合 ——`);
    }
    nextActor();
  }

  function nextActor(){
    if(B.ended) return;
    // 找下一个未死亡的角色
    while(B.orderIdx < B.order.length){
      const e = B.order[B.orderIdx];
      const unit = (e.side==="ally"?B.allies:B.enemies)[e.idx];
      if(unit.dead){ B.orderIdx++; continue; }
      // 冻结：跳过本回合
      const fz = unit.buffs.find(b=>b.frozen);
      if(fz){
        pushLog(`${unit.name} 被冻结，无法行动`);
        flashFx(unit, "miss");
        B.orderIdx++;
        setTimeout(nextActor, 500);
        return;
      }
      B.activeSide = e.side;
      B.activeIdx = e.idx;
      renderTeams();
      if(e.side === "ally"){
        showActionPanel(unit);
      } else {
        setTimeout(()=>enemyAct(unit), 700);
      }
      return;
    }
    // 回合结束：处理 DoT + Buff 减层
    endOfTurnTick();
    if(B.ended) return;
    B.turn++;
    B.order = [];
    setTimeout(nextRound, 500);
  }

  function endOfTurnTick(){
    [...B.allies, ...B.enemies].forEach(u=>{
      if(u.dead) return;
      // DoT
      u.dots = u.dots.filter(d=>{
        u.hp -= d.dmg;
        pushLog(`${u.name} 受 ${d.name||"灼伤"} ${d.dmg} 伤害`);
        d.turns--;
        if(u.hp <= 0){ u.hp = 0; u.dead = true; pushLog(`${u.name} 倒下`); }
        return d.turns > 0;
      });
      // Buff/Regen
      u.buffs = u.buffs.filter(b=>{
        if(b.regen){
          const heal = Math.round(u.maxHp * b.regen);
          u.hp = Math.min(u.maxHp, u.hp + heal);
          pushLog(`${u.name} 因 ${b.name} 回复 ${heal} HP`);
        }
        b.turns--;
        return b.turns > 0;
      });
    });
    renderTeams();
    checkEnd();
  }

  // —— 我方行动面板 ——
  function showActionPanel(unit){
    const panel = document.getElementById("battle-panel");
    const tab = (B.panelTab || "skills");
    const skBtns = unit.skills.map(sid=>{
      const sk = BATTLE_SKILLS[sid];
      if(!sk) return "";
      const disabled = unit.mp < sk.mp;
      return `
        <button class="b-skill-btn${disabled?' off':''}" data-skill="${sid}">
          <div class="bsk-name">${sk.name}</div>
          <div class="bsk-meta">
            <span class="bsk-mp">MP ${sk.mp}</span>
            <span class="bsk-kind">${sk.kind==='phys'?'物理':sk.kind==='magic'?'法术':sk.kind==='heal'?'治疗':sk.kind==='buff'?'增益':sk.kind==='recover'?'调息':'-'}</span>
            ${sk.power?`<span class="bsk-pow">威 ${sk.power}</span>`:''}
            ${sk.aoe?'<span class="bsk-aoe">群</span>':''}
          </div>
          <div class="bsk-desc">${sk.desc}</div>
        </button>
      `;
    }).join("");

    // 物品 tab：从 G.state.inv 取所有 battle 字段
    const battleItems = Object.entries(G.state.inv||{})
      .map(([id,n])=>{ const it = (typeof ITEM==='function')?ITEM(id):null; return (it && it.battle && n>0) ? {id, n, item:it} : null; })
      .filter(Boolean);
    const itemBtns = battleItems.length ? battleItems.map(({id,n,item})=>{
      const b = item.battle;
      const tags = [];
      if(b.hpRatio) tags.push(`<span class="bsk-pow">回 ${Math.round(b.hpRatio*100)}% HP</span>`);
      if(b.mp)      tags.push(`<span class="bsk-mp">+${b.mp} MP</span>`);
      if(b.magic)   tags.push(`<span class="bsk-pow">威 ${b.magic} 法</span>`);
      if(b.aoe)     tags.push('<span class="bsk-aoe">群</span>');
      if(b.freeze)  tags.push('<span class="bsk-aoe">冻 结</span>');
      if(b.revive)  tags.push('<span class="bsk-aoe">复 活</span>');
      return `
        <button class="b-skill-btn b-item-btn" data-item="${id}">
          <div class="bsk-name">${item.name} <span class="bsk-stock">×${n}</span></div>
          <div class="bsk-meta">${tags.join('')}</div>
          <div class="bsk-desc">${b.desc}</div>
        </button>
      `;
    }).join("") : '<div class="b-empty">背包内无可用战斗道具。</div>';

    panel.innerHTML = `
      <div class="b-panel-head">
        <img src="${unit.portrait}" />
        <div>
          <div class="bph-name">${unit.name} 的回合</div>
          <div class="bph-stat">HP ${unit.hp}/${unit.maxHp} · MP ${unit.mp}/${unit.maxMp} · 速 ${unit.spd}</div>
        </div>
        <div class="b-tabs">
          <button class="b-tab ${tab==='skills'?'on':''}" data-tab="skills">技 能</button>
          <button class="b-tab ${tab==='items'?'on':''}" data-tab="items">物 品</button>
        </div>
      </div>
      <div class="b-skill-grid" id="b-tab-content">
        ${tab==='skills' ? skBtns : itemBtns}
      </div>
    `;
    panel.classList.add("active");

    panel.querySelectorAll(".b-tab").forEach(t=>{
      t.onclick = ()=>{
        B.panelTab = t.dataset.tab;
        showActionPanel(unit);
      };
    });

    panel.querySelectorAll(".b-skill-btn[data-skill]").forEach(b=>{
      b.onclick = ()=>{
        if(b.classList.contains("off")) return;
        const sid = b.dataset.skill;
        const sk = BATTLE_SKILLS[sid];
        // 目标选择
        if(sk.aoe || sk.kind==='buff' || sk.kind==='recover' || (sk.kind==='heal' && sk.heal?.team)){
          executeSkill(unit, sid, null);
        } else if(sk.kind==='heal'){
          pickTarget("ally", t=> executeSkill(unit, sid, t));
        } else {
          pickTarget("enemy", t=> executeSkill(unit, sid, t));
        }
      };
    });
    panel.querySelectorAll(".b-item-btn[data-item]").forEach(b=>{
      b.onclick = ()=>{
        const id = b.dataset.item;
        const it = ITEM(id);
        const eff = it.battle;
        // 目标选择
        if(eff.aoe || eff.buff?.team || eff.revive){
          useItem(unit, id, null);
        } else if(eff.hpRatio || eff.mp || eff.buff && !eff.buff.team){
          pickTarget("ally", t=> useItem(unit, id, t));
        } else {
          pickTarget("enemy", t=> useItem(unit, id, t));
        }
      };
    });
  }

  // —— 物品使用 ——
  function useItem(actor, id, target){
    const it = ITEM(id);
    const eff = it.battle;
    // 扣库存
    G.state.inv[id] = Math.max(0, (G.state.inv[id]||0) - 1);
    Save.persist();
    pushLog(`<b>${actor.name}</b> 使用 <b>${it.name}</b>！`);
    const panel = document.getElementById("battle-panel");
    if(panel) panel.classList.remove("active");

    // HP 恢复
    if(eff.hpRatio){
      const t = target || actor;
      const heal = Math.round(t.maxHp * eff.hpRatio);
      t.hp = Math.min(t.maxHp, t.hp + heal);
      pushLog(`${t.name} 回复 ${heal} HP`);
      flashFx(t, "heal");
      spawnFloating(t, "+"+heal, "#7ed957");
    }
    // MP 恢复
    if(eff.mp){
      const t = target || actor;
      t.mp = Math.min(t.maxMp, t.mp + eff.mp);
      pushLog(`${t.name} 回复 ${eff.mp} MP`);
      flashFx(t, "buff");
      spawnFloating(t, "+"+eff.mp+"MP", "#7cb5e8");
    }
    // 法术伤害
    if(eff.magic){
      const targets = eff.aoe ? B.enemies.filter(u=>!u.dead) : [target];
      targets.forEach(t=>{
        const elemMul = elementMultiplier("fire", t.element);
        const raw = (eff.magic + actor.mag*0.5) * (1 - t.mdef/(t.mdef+50));
        const dmg = Math.max(1, Math.round(raw * (0.9+Math.random()*0.2) * elemMul));
        t.hp -= dmg;
        spawnFloating(t, "-"+dmg, "#ff5544");
        pushLog(`${t.name} 受 <b style="color:#ff8060">${dmg}</b> 法术伤害`);
        flashFx(t, "dmg");
        if(eff.dot){ t.dots.push({...eff.dot}); }
        if(t.hp<=0){ t.hp=0; t.dead=true; pushLog(`<b style="color:#ffc864">${t.name}</b> 倒下！`); }
      });
    }
    // 冻结（debuff turn=N，敌方失去回合：用 buff 标记 frozen）
    if(eff.freeze){
      target.buffs.push({ name:"冰封", icon:"❄", frozen:true, turns:eff.freeze });
      pushLog(`${target.name} 被冰封 ${eff.freeze} 回合`);
      flashFx(target, "buff");
    }
    // Buff
    if(eff.buff){
      const team = eff.buff.team ? B.allies.filter(u=>!u.dead) : [actor];
      team.forEach(u=>{
        u.buffs.push({ name:it.name, ...eff.buff, icon:"✦" });
        pushLog(`${u.name} 获得 ${it.name}`);
        flashFx(u, "buff");
      });
    }
    // 渡劫丹：满血满蓝 + 复活
    if(eff.revive){
      B.allies.forEach(u=>{
        u.dead = false;
        u.hp = u.maxHp; u.mp = u.maxMp;
        flashFx(u, "heal");
      });
      pushLog(`<b style="color:var(--candle)">渡劫丹光芒大盛！全军复活！</b>`);
    }
    renderTeams();
    setTimeout(()=>{ checkEnd(); if(!B.ended) advanceAfterAction(); }, 500);
  }

  function pickTarget(side, cb){
    B.waiting = { type:"selectTarget", side };
    renderTeams();
    pushLog(`选择${side==='enemy'?'敌方':'我方'}目标…`);
    const arr = side==='enemy'?B.enemies:B.allies;
    document.querySelectorAll(`.b-unit-card.${side}`).forEach(card=>{
      card.onclick = ()=>{
        const idx = +card.dataset.idx;
        const t = arr[idx];
        if(t.dead) return;
        B.waiting = false;
        cb(t);
      };
    });
  }

  // —— 技能执行 ——
  function executeSkill(actor, sid, target){
    const sk = BATTLE_SKILLS[sid];
    actor.mp -= sk.mp;
    pushLog(`<b>${actor.name}</b> 施展 <b>${sk.name}</b>！`);
    const panel = document.getElementById("battle-panel");
    if(panel) panel.classList.remove("active");

    // 调息回复
    if(sk.recover?.mp){
      actor.mp = Math.min(actor.maxMp, actor.mp + sk.recover.mp);
      pushLog(`${actor.name} 调息回复 ${sk.recover.mp} MP`);
      renderTeams();
      advanceAfterAction();
      return;
    }

    // 增益
    if(sk.kind === "buff"){
      const team = sk.buff.team ? (actor.side==="ally"?B.allies:B.enemies).filter(u=>!u.dead) : [actor];
      team.forEach(u=>{
        u.buffs.push({ name:sk.name, ...sk.buff, icon:"✦" });
        pushLog(`${u.name} 获得 ${sk.name}`);
      });
      flashFx(actor, "buff");
      renderTeams();
      advanceAfterAction();
      return;
    }

    // 治疗
    if(sk.kind === "heal"){
      if(sk.heal?.team){
        const team = (actor.side==="ally"?B.allies:B.enemies).filter(u=>!u.dead);
        team.forEach(u=>{
          const heal = Math.round(u.maxHp * (sk.heal?.ratio || 0.5));
          u.hp = Math.min(u.maxHp, u.hp + heal);
          pushLog(`${u.name} 回复 ${heal} HP`);
          flashFx(u, "heal");
        });
      } else {
        const heal = Math.round(target.maxHp * (sk.power/100 || 0.5));
        target.hp = Math.min(target.maxHp, target.hp + heal);
        pushLog(`${target.name} 回复 ${heal} HP`);
        flashFx(target, "heal");
      }
      renderTeams();
      advanceAfterAction();
      return;
    }

    // 攻击型
    const targets = sk.aoe ? (actor.side==="ally"?B.enemies:B.allies).filter(u=>!u.dead) : [target];
    targets.forEach(t=>{
      dealDamage(actor, t, sk);
    });
    renderTeams();
    setTimeout(()=>{
      checkEnd();
      if(B.ended) return;
      advanceAfterAction();
    }, 500);
  }

  function dealDamage(actor, target, sk){
    // 闪避
    const evaBuff = target.buffs.find(b=>b.eva);
    if(evaBuff && Math.random() < evaBuff.eva){
      pushLog(`${target.name} 闪 避！`);
      flashFx(target, "miss");
      return;
    }
    const atkStat = sk.kind === "phys" ? actor.atk : actor.mag;
    const defStat = sk.kind === "phys" ? target.def : target.mdef;
    const atkBuff = actor.buffs.filter(b=>b.atk).reduce((s,b)=>s+b.atk,0);
    const defBuff = target.buffs.filter(b=>b.def).reduce((s,b)=>s+b.def,0);
    const ignore  = sk.defIgnore || 0;
    const efAtk = atkStat * (1 + atkBuff);
    const efDef = defStat * (1 + defBuff) * (1 - ignore);
    const elemMul = elementMultiplier(sk.element, target.element);
    const hits = sk.hits || 1;
    let total = 0;
    for(let i=0;i<hits;i++){
      let raw = (sk.power + efAtk) * (efAtk / (efAtk + efDef + 20));
      raw *= elemMul;
      raw *= (0.9 + Math.random()*0.2);
      const dmg = Math.max(1, Math.round(raw));
      target.hp -= dmg;
      total += dmg;
    }
    let elemTxt = elemMul>1?` 克 制 +`:elemMul<1?` 被 抗 -`:"";
    pushLog(`${target.name} 受 <b style="color:#ff8060">${total}</b> 伤害${elemTxt}`);
    flashFx(target, "dmg");
    spawnFloating(target, "-"+total, "#ff5544");

    if(sk.dot){ target.dots.push({...sk.dot, name:sk.name}); }
    if(sk.lifesteal){
      const ls = Math.round(total * sk.lifesteal);
      actor.hp = Math.min(actor.maxHp, actor.hp + ls);
      pushLog(`${actor.name} 吸取 ${ls} HP`);
      spawnFloating(actor, "+"+ls, "#7ed957");
    }
    if(sk.debuff){
      target.buffs.push({ name:sk.name, ...sk.debuff, icon:"☠" });
    }
    if(target.hp <= 0){
      target.hp = 0; target.dead = true;
      pushLog(`<b style="color:#ffc864">${target.name}</b> 倒下！`);
    }
  }

  function elementMultiplier(atkE, defE){
    if(!atkE || atkE === "none" || !defE) return 1;
    // 五行：金克木、木克土、土克水、水克火、火克金
    const cycle = { metal:"wood", wood:"earth", earth:"water", water:"fire", fire:"metal" };
    if(cycle[atkE] === defE) return 1.3;
    if(cycle[defE] === atkE) return 0.8;
    return 1;
  }

  function flashFx(unit, type){
    const idx = unit.side==="ally"?B.allies.indexOf(unit):B.enemies.indexOf(unit);
    const card = document.querySelector(`.b-unit-card.${unit.side}[data-idx="${idx}"]`);
    if(!card) return;
    card.classList.remove("fx-dmg","fx-heal","fx-buff","fx-miss");
    void card.offsetWidth;
    card.classList.add("fx-"+type);
    setTimeout(()=>card.classList.remove("fx-"+type), 600);
  }

  function spawnFloating(unit, text, color){
    const idx = unit.side==="ally"?B.allies.indexOf(unit):B.enemies.indexOf(unit);
    const card = document.querySelector(`.b-unit-card.${unit.side}[data-idx="${idx}"]`);
    if(!card) return;
    const f = document.createElement("div");
    f.className = "b-float";
    f.textContent = text;
    f.style.color = color;
    card.appendChild(f);
    setTimeout(()=>f.remove(), 1200);
  }

  // —— 敌方 AI ——
  function enemyAct(unit){
    if(B.ended) return;
    // 选技能：优先大招（mp 够），按概率决定平A/技能/调息
    const avail = unit.skills.map(sid => ({sid, sk:BATTLE_SKILLS[sid]})).filter(s=>s.sk && unit.mp >= s.sk.mp);
    let pick = avail[0];
    if(unit.mp < 5){
      pick = avail.find(s=>s.sid==="bs_recover") || avail[0];
    } else {
      // 70% 用第一个非平A非调息，30% 平A
      const offensive = avail.filter(s=>s.sid !== "bs_pingA" && s.sid !== "bs_recover");
      if(offensive.length && Math.random() < 0.75) pick = offensive[Math.floor(Math.random()*offensive.length)];
      else pick = avail.find(s=>s.sid==="bs_pingA") || avail[0];
    }
    // 自疗判断
    if(unit.hp < unit.maxHp * 0.35){
      const heal = avail.find(s=>s.sk.kind==="heal" || s.sk.kind==="buff" && s.sk.buff?.regen);
      if(heal && Math.random()<0.7) pick = heal;
    }
    const sk = pick.sk;
    // 目标
    let target = null;
    if(sk.kind === "heal" && !sk.heal?.team){
      const allies = B.enemies.filter(u=>!u.dead).sort((a,b)=>a.hp/a.maxHp - b.hp/b.maxHp);
      target = allies[0];
    } else if(sk.aoe || sk.kind==='buff' || sk.kind==='recover' || (sk.kind==='heal' && sk.heal?.team)){
      target = null;
    } else {
      const opps = B.allies.filter(u=>!u.dead).sort((a,b)=>a.hp/a.maxHp - b.hp/b.maxHp);
      target = opps[0];
    }
    executeSkill(unit, pick.sid, target);
  }

  function advanceAfterAction(){
    if(B.ended) return;
    B.orderIdx++;
    setTimeout(nextActor, 700);
  }

  // —— 胜负判定 ——
  function checkEnd(){
    if(B.ended) return;
    const allyAlive = B.allies.some(u=>!u.dead);
    // 胜利条件：1v1 只看对面唯一帮主；3v3 必须打死帮主
    const enemyLeader = B.enemies.find(u=>u.isLeader);
    const leaderDead = enemyLeader.dead;
    const enemyAllDead = B.enemies.every(u=>u.dead);

    if(!allyAlive){
      endBattle(false);
      return;
    }
    // 帮主死了 → 胜
    if(leaderDead){
      endBattle(true);
      return;
    }
    // 全死也算胜（兜底）
    if(enemyAllDead){
      endBattle(true);
      return;
    }
  }

  // —— 战后对白库（胜负各有，按派别个性化）——
  const ENDING_LINES = {
    sect_thunder: {
      win:[
        { who:"enemy", text:"「呃……雷某……竟败给残墟门……」" },
        { who:"ally",  text:"「雷门主，胜负有时。今日只为正名，并无杀心。」" },
        { who:"enemy", text:"「……此恩，雷某记下了。来日若再相逢，必以诚意奉茶。」" },
      ],
      lose:[
        { who:"enemy", text:"「哈哈哈！残墟门？连山都下不了，还想撼我雷霆门？」" },
        { who:"ally",  text:"「……记下了。下次再来。」" },
      ]
    },
    sect_luoxia: {
      win:[
        { who:"enemy", text:"「霞儿一时疏忽……竟在自家谷中败北。」" },
        { who:"ally",  text:"「谷主丹术天下闻名，今日之战，是剑赢了药。」" },
        { who:"enemy", text:"「呵，会说话。来日若有疾，可入谷取药。」" },
      ],
      lose:[
        { who:"enemy", text:"「年轻人，剑还没磨利就来谷里撒野？」" },
        { who:"ally",  text:"「……失礼了。」" },
      ]
    },
    sect_xuanyin: {
      win:[
        { who:"enemy", text:"「鬼……鬼气竟被你斩断……」" },
        { who:"ally",  text:"「玄阴宗主，邪术终归不敌正心。我们走。」" },
      ],
      lose:[
        { who:"enemy", text:"「嘶嘶……活人的血最是甘甜……再来啊。」" },
        { who:"ally",  text:"「……此地不可久留，撤！」" },
      ]
    },
    sect_ziwei: {
      win:[
        { who:"enemy", text:"「星河流转，竟有此变。残墟门——名不虚传。」" },
        { who:"ally",  text:"「阁主谬赞。改日若有疑难，还望指点。」" },
        { who:"enemy", text:"「君子之争，自当如此。」" },
      ],
      lose:[
        { who:"enemy", text:"「学问未成便来论道？回去多读三年书。」" },
        { who:"ally",  text:"「……领教了。」" },
      ]
    },
    sect_xueyue: {
      win:[
        { who:"enemy", text:"「血月……竟被一缕剑光斩开……不可能……」" },
        { who:"ally",  text:"「血月教魔头，今日先饶你一命。再敢南下，定取尔首。」" },
      ],
      lose:[
        { who:"enemy", text:"「嘿嘿，新血新血——拿去献给血月吧！」" },
        { who:"ally",  text:"「……快撤！别让师妹们看见！」" },
      ]
    },
    sect_xuxian: {
      win:[
        { who:"enemy", text:"「白鹿渡厄，亦渡不过这一剑。残墟门……已非昔日模样。」" },
        { who:"ally",  text:"「真君过誉。本派不过是想在三大宗里，留一席位。」" },
        { who:"enemy", text:"「贫道为你证之。三大宗——必有残墟门一席。」" },
      ],
      lose:[
        { who:"enemy", text:"「年轻人，红尘仍多，不必急于一时。」" },
        { who:"ally",  text:"「……晚辈受教。」" },
      ]
    },
  };

  function showEndingDialog(won, sid, onDone){
    const sect = ENEMY_SECTS[sid];
    const lines = (ENDING_LINES[sid] || {})[won?"win":"lose"];
    if(!lines || !lines.length){ onDone(); return; }
    // 我方代表：陈渊（若死 → 凌雪）
    let speaker_ally = G.state.disciples.find(d => d.id==="chenyuan" && !d.flags?.dead);
    if(!speaker_ally) speaker_ally = G.state.disciples.find(d => d.id==="lingxue" && !d.flags?.dead);
    if(!speaker_ally) speaker_ally = G.state.disciples.find(d => !d.flags?.dead && !d.flags?.locked);
    const allyPic = speaker_ally ? `assets/portraits/${speaker_ally.pic}.jpg` : "assets/portraits/d_chenyuan.jpg";
    const allyName = speaker_ally?.name || "陈 渊";
    const enemyLeader = sect.members.find(m => m.isLeader);
    const enemyPic = `assets/portraits/${enemyLeader.portrait}.jpg`;
    const enemyName = enemyLeader.name;
    const bg = `assets/scenes/${sect.bg}.jpg`;

    const el = document.getElementById("battle");
    if(!el){ onDone(); return; }
    const dlg = document.createElement("div");
    dlg.className = "b-ending-dialog";
    dlg.innerHTML = `
      <div class="bed-bg" style="background-image:url(${bg})"></div>
      <div class="bed-mask"></div>
      <div class="bed-portraits">
        <div class="bed-port enemy${won?' loser':' winner'}">
          <img src="${enemyPic}" />
          <div class="bed-name">${enemyName}</div>
        </div>
        <div class="bed-port ally${won?' winner':' loser'}">
          <img src="${allyPic}" />
          <div class="bed-name">${allyName}</div>
        </div>
      </div>
      <div class="bed-textbox">
        <div class="bed-spk" id="bed-spk"></div>
        <div class="bed-text" id="bed-text"></div>
        <div class="bed-tip">▾ 点 击 继 续</div>
      </div>
    `;
    el.appendChild(dlg);
    requestAnimationFrame(()=>dlg.classList.add("active"));

    let i = 0;
    function showLine(){
      if(i >= lines.length){
        dlg.classList.remove("active");
        setTimeout(()=>{ dlg.remove(); onDone(); }, 400);
        return;
      }
      const l = lines[i];
      const isAlly = l.who === "ally";
      document.getElementById("bed-spk").textContent = isAlly ? allyName : enemyName;
      document.getElementById("bed-text").textContent = l.text;
      // 高亮当前发言者
      dlg.querySelectorAll(".bed-port").forEach(p=>p.classList.remove("speaking"));
      dlg.querySelector(`.bed-port.${isAlly?'ally':'enemy'}`).classList.add("speaking");
      i++;
    }
    dlg.onclick = showLine;
    showLine();
  }

  function endBattle(won, fled=false){
    if(B.ended) return;
    B.ended = true;
    const sid = B.sid;
    // 给奖励（仅胜利结算后）
    G.state.battle = G.state.battle || { victories:{} };
    let info = {};
    if(won){
      G.state.battle.victories = G.state.battle.victories || {};
      const isFirstWin = !G.state.battle.victories[sid];
      G.state.battle.victories[sid] = (G.state.battle.victories[sid]||0) + 1;
      const lvl = B.enemies.find(u=>u.isLeader).realm;
      // 首胜全奖，重复 30%
      const m = isFirstWin ? 1 : 0.3;
      info = {
        rep:   Math.round((80 + lvl*40)*m),
        coin:  Math.round((300+ lvl*150)*m),
        stone: Math.round((30 + lvl*15)*m),
        firstWin: isFirstWin,
      };
      G.state.rep   = (G.state.rep||0)   + info.rep;
      G.state.coin  = (G.state.coin||0)  + info.coin;
      G.state.stone = (G.state.stone||0) + info.stone;
      // 战后回血保护：所有未死者回 50% HP，死者降 1 阶 exp（不真死）
      B.allies.forEach(u=>{
        const d = G.state.disciples.find(x=>x.id===u.id);
        if(!d) return;
        if(u.dead){ d.exp = Math.max(0, (d.exp||0) - 50); }
      });
      Save.persist();
    } else {
      info = { fled };
      Save.persist();
    }
    // 先放战后对话，结束再弹结算
    showEndingDialog(won, sid, ()=> showEndModal(won, info));
  }

  function showEndModal(won, info){
    const el = document.getElementById("battle");
    if(!el) return;
    const card = document.createElement("div");
    card.className = "b-end-modal";
    if(won){
      const firstTag = info.firstWin
        ? '<div class="b-end-firstwin">★ 初 次 攻 破 ★</div>'
        : '<div class="b-end-repeat">（重复挑战 · 奖励削减 70%）</div>';
      card.innerHTML = `
        <div class="b-end-title win">胜 · 攻 破 ${B.sect.name}</div>
        ${firstTag}
        <div class="b-end-sub">「${B.sect.name} 帮主已败，残墟门威名远扬。」</div>
        <div class="b-end-rewards">
          <div class="b-end-rwd"><span>声 望</span><b>+${info.rep}</b></div>
          <div class="b-end-rwd"><span>铜 钱</span><b>+${info.coin}</b></div>
          <div class="b-end-rwd"><span>灵 石</span><b>+${info.stone}</b></div>
        </div>
        <button class="btn primary" id="btn-end-back">收 兵 回 山</button>
      `;
    } else {
      card.innerHTML = `
        <div class="b-end-title lose">败 · ${info.fled?"撤 离 战 场":"全 军 覆 没"}</div>
        <div class="b-end-sub">「掌门，今日不敌，归山再练吧。」</div>
        <button class="btn ghost" id="btn-end-back">默 默 退 出</button>
      `;
    }
    el.appendChild(card);
    setTimeout(()=>card.classList.add("active"), 50);
    document.getElementById("btn-end-back").onclick = ()=> closeBattle();
  }

  function closeBattle(){
    const el = document.getElementById("battle");
    if(!el) return;
    el.classList.remove("active");
    setTimeout(()=>el.remove(), 350);
    B = null;
    // HUD 刷新
    if(typeof renderHUD === "function") renderHUD();
    document.getElementById("hud-rep").textContent = G.state.rep || 0;
    document.getElementById("hud-coin").textContent = G.state.coin || 0;
    document.getElementById("hud-stone").textContent = G.state.stone || 0;
  }

  return { openHub, openPrep };
})();
