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
      const ourWin = G.state.battle?.victories?.[sid];
      const danger = leader.realm;
      const dangerColor = danger>=6?"#ff5050":danger>=4?"#ffc864":"#80c898";
      return `
      <div class="battle-sect-card" data-sid="${sid}" style="border-color:${sect.color}">
        <div class="bsc-banner" style="background:linear-gradient(135deg,${sect.color}66,${sect.color}22)">
          <div class="bsc-name">${sect.name}</div>
          <div class="bsc-leader">掌门 · ${leader.name}（${realmText(leader.realm)}）</div>
        </div>
        <div class="bsc-body">
          <div class="bsc-stat"><span>实力评定</span><b style="color:${dangerColor}">${realmText(leader.realm)} ${"★".repeat(Math.min(5,leader.realm))}</b></div>
          <div class="bsc-stat"><span>门下高手</span><b>${sect.members.length} 人</b></div>
          <div class="bsc-stat"><span>本派战绩</span><b style="color:${ourWin?'var(--gold-2)':'var(--ink-3)'}">${ourWin?"已 攻 破 ✓":"尚 未 出 手"}</b></div>
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
    buildBattleUI();
    pushLog(`【宗门战】${sect.name} VS 残墟门，${mode} 论道开始！`);
    nextRound();
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

    panel.innerHTML = `
      <div class="b-panel-head">
        <img src="${unit.portrait}" />
        <div>
          <div class="bph-name">${unit.name} 的回合</div>
          <div class="bph-stat">HP ${unit.hp}/${unit.maxHp} · MP ${unit.mp}/${unit.maxMp} · 速 ${unit.spd}</div>
        </div>
      </div>
      <div class="b-skill-grid">${skBtns}</div>
    `;
    panel.classList.add("active");

    panel.querySelectorAll(".b-skill-btn").forEach(b=>{
      b.onclick = ()=>{
        if(b.classList.contains("off")) return;
        const sid = b.dataset.skill;
        const sk = BATTLE_SKILLS[sid];
        // 目标选择
        if(sk.aoe || sk.kind==='buff' || sk.kind==='recover' || (sk.kind==='heal' && sk.heal?.team)){
          // 无需选目标
          executeSkill(unit, sid, null);
        } else if(sk.kind==='heal'){
          // 选我方
          pickTarget("ally", t=> executeSkill(unit, sid, t));
        } else {
          pickTarget("enemy", t=> executeSkill(unit, sid, t));
        }
      };
    });
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

  function endBattle(won, fled=false){
    if(B.ended) return;
    B.ended = true;
    // 给奖励
    G.state.battle = G.state.battle || { victories:{} };
    if(won){
      G.state.battle.victories = G.state.battle.victories || {};
      G.state.battle.victories[B.sid] = true;
      // 奖励：声望 + 资源
      const lvl = B.enemies.find(u=>u.isLeader).realm;
      const repGain = 80 + lvl*40;
      const coinGain = 300 + lvl*150;
      const stoneGain = 30 + lvl*15;
      G.state.rep = (G.state.rep||0) + repGain;
      G.state.coin = (G.state.coin||0) + coinGain;
      G.state.stone = (G.state.stone||0) + stoneGain;
      Save.persist();
      showEndModal(true, { rep:repGain, coin:coinGain, stone:stoneGain });
    } else {
      // 失败：弟子掉血但不死（剧情容错）
      B.allies.forEach(u=>{
        const d = G.state.disciples.find(x=>x.id===u.id);
        if(d) d.flags = d.flags || {};
      });
      Save.persist();
      showEndModal(false, { fled });
    }
  }

  function showEndModal(won, info){
    const el = document.getElementById("battle");
    if(!el) return;
    const card = document.createElement("div");
    card.className = "b-end-modal";
    if(won){
      card.innerHTML = `
        <div class="b-end-title win">胜 · 攻 破 ${B.sect.name}</div>
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
