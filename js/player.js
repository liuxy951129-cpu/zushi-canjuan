/* ================================================================
   玩家（掌门）·自修系统
   - 玩家 ≠ 任何弟子。这是你自己。
   - 提供：闭关、突破、换武器、五行切换、技能点亮/装配
   ================================================================ */
const Player = (() => {

  const REALMS_LOCAL = ["炼气","筑基","金丹","元婴","化神","合体","大乘","渡劫"];
  const REALM_EXP_LOCAL = [100, 280, 600, 1200, 2400, 4800, 8800, 14000];
  const STATS_LOCAL = ["root","wit","mind","spirit","luck"];
  const STAT_LABEL_LOCAL = { root:"根骨", wit:"悟性", mind:"心境", spirit:"神识", luck:"气运" };
  const ELEM_LABEL = { metal:"金 · 锐", wood:"木 · 生", water:"水 · 柔", fire:"火 · 烈", earth:"土 · 厚" };

  function get(){
    if(!G.state.player){
      // 兼容旧存档
      G.state.player = {
        title:"掌门", name:"你", age:25,
        realm:0, exp:0,
        stats:{ root:7, wit:8, mind:9, spirit:7, luck:6 },
        element:"metal",
        weapon:"sw_iron",
        skillEquipped:[],
        skillUnlocked:[],
      };
      Save.persist();
    }
    return G.state.player;
  }

  // —— 自修主面板 ——
  function open(){
    const p = get();
    const expNeeded = REALM_EXP_LOCAL[p.realm] || 99999;
    const canBreak = p.exp >= expNeeded;
    const weaponItem = p.weapon ? ITEM(p.weapon) : null;

    Modal.openHTML(`
      <h3 style="margin:0;text-align:center">掌 门 · 自 修</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center;margin:6px 0 14px 0">
        「门下弟子是门下的剑——\n你才是这门派的根。」
      </div>

      <div class="player-card">
        <div class="player-portrait">
          <svg viewBox="0 0 80 80" style="width:100%;height:100%">
            <defs>
              <radialGradient id="pgrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#c9a35a"/>
                <stop offset="100%" stop-color="#3a2820"/>
              </radialGradient>
            </defs>
            <circle cx="40" cy="40" r="38" fill="url(#pgrad)" stroke="#c9a35a" stroke-width="1.5"/>
            <text x="40" y="52" text-anchor="middle" font-family="Ma Shan Zheng" font-size="36" fill="#1a1310">掌</text>
          </svg>
        </div>
        <div class="player-info">
          <div class="player-name">${p.name} · ${p.title}</div>
          <div class="player-meta">第十七代 · ${p.age} 岁 · 境界 <b>${REALMS_LOCAL[p.realm]}</b></div>
          <div class="player-exp-bar">
            <div class="player-exp-fill" style="width:${Math.min(100,p.exp/expNeeded*100)}%"></div>
            <span>修为 ${p.exp} / ${expNeeded}</span>
          </div>
        </div>
      </div>

      <div class="player-section">
        <h4 class="player-h4">五 行 根 性</h4>
        <div class="player-stats">
          ${STATS_LOCAL.map(k => `<div class="ps-stat"><span class="l">${STAT_LABEL_LOCAL[k]}</span><span class="v">${p.stats[k]}</span></div>`).join("")}
        </div>
      </div>

      <div class="player-section">
        <h4 class="player-h4">本 命 五 行 <span class="player-h4-sub">点击切换 · 影响战斗技能池</span></h4>
        <div class="player-elem-row">
          ${["metal","wood","water","fire","earth"].map(e => `
            <button class="player-elem-btn ${p.element===e?'on':''}" data-elem="${e}">${ELEM_LABEL[e]}</button>
          `).join("")}
        </div>
      </div>

      <div class="player-section">
        <h4 class="player-h4">佩 兵</h4>
        ${weaponItem ? `
          <div class="player-weapon" id="player-weapon-cell">
            <div class="pw-icon" style="background-image:url(assets/icons/${weaponItem.icon}.png)"></div>
            <div class="pw-info">
              <div class="pw-name">${weaponItem.name}<span class="pw-tip">点击更换 ▸</span></div>
              <div class="pw-stat">${weaponItem.ability||""} · 攻 ${weaponItem.atk||0}</div>
            </div>
          </div>
        ` : `<div class="player-weapon empty" id="player-weapon-cell"><div>未佩兵 · <span class="pw-tip">点击佩戴 ▸</span></div></div>`}
      </div>

      <div class="player-section">
        <h4 class="player-h4">行 动</h4>
        <div class="player-actions">
          ${canBreak ? `<button class="btn primary" id="btn-p-break">▶ 尝 试 突 破</button>` : ""}
          <button class="btn" id="btn-p-cult">⌬ 闭 关 修 炼<span class="btn-sub">（耗 5 灵石 · +20 修为）</span></button>
          <button class="btn ghost" id="btn-p-skill">✦ 我 的 技 能 树</button>
          <button class="btn ghost" id="btn-p-upgrade">↑ 资 质 淬 炼<span class="btn-sub">（耗 1 丹药 · 随机 +1 五行）</span></button>
        </div>
      </div>

      <div class="modal-row" style="margin-top:14px"><button class="btn ghost" data-act="modal-close">退 下</button></div>
    `);

    // 五行切换
    document.querySelectorAll(".player-elem-btn").forEach(b=>{
      b.onclick = ()=>{
        p.element = b.dataset.elem;
        Save.persist();
        open();
      };
    });
    // 武器
    const wc = document.getElementById("player-weapon-cell");
    if(wc) wc.onclick = ()=> openWeaponPicker();
    // 闭关
    document.getElementById("btn-p-cult").onclick = ()=> cultivate();
    // 突破
    if(canBreak){
      document.getElementById("btn-p-break").onclick = ()=> attemptBreakthrough();
    }
    // 技能树
    document.getElementById("btn-p-skill").onclick = ()=> openSkillTree();
    // 资质淬炼
    document.getElementById("btn-p-upgrade").onclick = ()=> upgradeStats();
  }

  // —— 闭关：耗 5 灵石 +20 修为 ——
  function cultivate(){
    const p = get();
    if((G.state.stone||0) < 5){ toast("灵石不足", "bad"); return; }
    G.state.stone -= 5;
    p.exp += 20;
    Save.persist();
    if(typeof Main!=='undefined' && Main.updateHUD) Main.updateHUD();
    toast(`闭关精进 · 修为 +20`, "good");
    open();
  }

  // —— 突破 ——
  function attemptBreakthrough(){
    const p = get();
    const need = REALM_EXP_LOCAL[p.realm] || 99999;
    if(p.exp < need){ toast("修为不足", "bad"); return; }
    // 概率：心境 + 神识，60% 起步
    const succ = 0.6 + (p.stats.mind + p.stats.spirit)/100;
    if(Math.random() < succ){
      p.realm++;
      p.exp = Math.max(0, p.exp - need);
      // 升境 +1 全属性
      Object.keys(p.stats).forEach(k => p.stats[k]++);
      Save.persist();
      toast(`突破成功！晋入 ${REALMS_LOCAL[p.realm]} 期`, "good");
    } else {
      p.exp = Math.floor(p.exp * 0.7);
      Save.persist();
      toast(`突破失败，修为倒退`, "bad");
    }
    if(typeof Main!=='undefined' && Main.updateHUD) Main.updateHUD();
    open();
  }

  // —— 资质淬炼：耗 1 丹药随机 +1 ——
  function upgradeStats(){
    const p = get();
    if((G.state.pill||0) < 1){ toast("丹药不足", "bad"); return; }
    G.state.pill--;
    const k = STATS_LOCAL[Math.floor(Math.random()*STATS_LOCAL.length)];
    p.stats[k]++;
    Save.persist();
    if(typeof Main!=='undefined' && Main.updateHUD) Main.updateHUD();
    toast(`${STAT_LABEL_LOCAL[k]} +1`, "good");
    open();
  }

  // —— 武器选择 ——
  function openWeaponPicker(){
    const p = get();
    const inv = G.state.inv || {};
    const weapons = Object.keys(inv).filter(id => {
      const it = ITEM(id);
      return it && it.type === "weapon" && inv[id] > 0;
    });
    const cur = p.weapon;
    const list = weapons.map(id => {
      const it = ITEM(id);
      return `
        <div class="pw-pick ${id===cur?'sel':''}" data-pick="${id}">
          <div class="pw-pick-icon" style="background-image:url(assets/icons/${it.icon}.png)"></div>
          <div class="pw-pick-info">
            <div class="pw-pick-name">${it.name}</div>
            <div class="pw-pick-stat">攻 ${it.atk||0}</div>
            <div class="pw-pick-ability">${it.ability||""}</div>
          </div>
          ${id===cur ? '<div class="pw-pick-mark">佩</div>':''}
        </div>
      `;
    }).join("");
    Modal.openHTML(`
      <h3>掌 门 佩 兵</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);margin-bottom:10px">「掌门用什么剑，门派就有什么气。」</div>
      <div class="pw-grid">${list || '<div style="text-align:center;padding:30px;color:var(--ink-3)">背包内无武器</div>'}</div>
      <div class="modal-row" style="margin-top:14px"><button class="btn ghost" id="btn-pw-back">返 回</button></div>
    `);
    document.querySelectorAll("[data-pick]").forEach(el=>{
      el.onclick = ()=>{
        p.weapon = el.dataset.pick;
        Save.persist();
        open();
      };
    });
    document.getElementById("btn-pw-back").onclick = ()=> open();
  }

  // —— 玩家技能树（基于元素 + 通用，与弟子分离）——
  function openSkillTree(){
    const p = get();
    // 玩家可以从五元素任意点亮
    const SKILL_POOL = {
      metal:[
        { id:"pmp1", name:"金芒斩",   elem:"metal", req:{root:8},   effect:"战斗中可学：金芒斩（中等物理伤害）" },
        { id:"pmp2", name:"剑域",    elem:"metal", req:{root:14},  effect:"战斗中可学：剑域（连斩两式）" },
      ],
      wood:[
        { id:"pwm1", name:"缚妖藤",  elem:"wood",  req:{wit:8},    effect:"战斗中可学：缚妖藤（控制）" },
        { id:"pwm2", name:"春回术",  elem:"wood",  req:{wit:14},   effect:"战斗中可学：春回术（治疗）" },
      ],
      water:[
        { id:"psm1", name:"寒泉箭",  elem:"water", req:{spirit:8}, effect:"战斗中可学：寒泉箭（破灵防）" },
        { id:"psm2", name:"渊海覆灭",elem:"water", req:{spirit:14},effect:"战斗中可学：渊海覆灭（巨创）" },
      ],
      fire:[
        { id:"pfm1", name:"赤焰诀",  elem:"fire",  req:{spirit:8}, effect:"战斗中可学：赤焰诀（带灼烧）" },
        { id:"pfm2", name:"焚天火域",elem:"fire",  req:{spirit:14},effect:"战斗中可学：焚天火域（群伤）" },
      ],
      earth:[
        { id:"ptp1", name:"金石甲",  elem:"earth", req:{root:8},   effect:"战斗中可学：金石甲（防御）" },
        { id:"ptp2", name:"震地裂",  elem:"earth", req:{root:14},  effect:"战斗中可学：震地裂（群伤）" },
      ],
    };
    const all = Object.values(SKILL_POOL).flat();

    function meets(req){
      return Object.entries(req).every(([k,v]) => (p.stats[k]||0) >= v);
    }

    const groups = Object.entries(SKILL_POOL).map(([elem, leaves])=>{
      const isMain = p.element === elem;
      const cards = leaves.map(lf=>{
        const ok = p.skillUnlocked.includes(lf.id);
        const can = meets(lf.req);
        const equipped = p.skillEquipped.includes(lf.id);
        return `
          <div class="ps-leaf ${ok?'on':can?'avail':'lock'} ${equipped?'eq':''}" data-leaf="${lf.id}">
            <div class="ps-leaf-name">${lf.name} ${equipped?'<span class="ps-leaf-eq">装</span>':''}</div>
            <div class="ps-leaf-req">需求 ${Object.entries(lf.req).map(([k,v])=>STAT_LABEL_LOCAL[k]+'≥'+v).join(' / ')}</div>
            <div class="ps-leaf-eff">${lf.effect}</div>
          </div>
        `;
      }).join("");
      return `
        <div class="ps-group ${isMain?'main':''}">
          <h4 class="ps-group-h">${ELEM_LABEL[elem]} ${isMain?'<span class="ps-group-main">本 命</span>':''}</h4>
          <div class="ps-leaves">${cards}</div>
        </div>
      `;
    }).join("");

    Modal.openHTML(`
      <h3 style="margin:0;text-align:center">掌 门 · 技 能 树</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center;margin:6px 0 12px 0">
        「点亮（耗 1 灵石）→ 装配（最多 3 个，战斗中使用）」
      </div>
      <div class="ps-tree">${groups}</div>
      <div class="ps-equipped">已装配：${p.skillEquipped.length}/3 ${p.skillEquipped.length?'· '+p.skillEquipped.map(id => all.find(l=>l.id===id)?.name).filter(Boolean).join('、'):''}</div>
      <div class="modal-row" style="margin-top:14px;justify-content:flex-end"><button class="btn ghost" id="btn-ps-back">返 回</button></div>
    `);

    document.querySelectorAll(".ps-leaf").forEach(el=>{
      el.onclick = ()=>{
        const id = el.dataset.leaf;
        const lf = all.find(l => l.id===id);
        if(!lf) return;
        const ok = p.skillUnlocked.includes(id);
        const can = meets(lf.req);
        if(!ok && !can){ toast("属性不足", "bad"); return; }
        if(!ok){
          if((G.state.stone||0) < 1){ toast("灵石不足", "bad"); return; }
          G.state.stone--;
          p.skillUnlocked.push(id);
          Save.persist();
          if(typeof Main!=='undefined') Main.updateHUD();
          toast(`点亮 · ${lf.name}`, "good");
          openSkillTree();
          return;
        }
        // 已点亮：toggle 装配
        const eq = p.skillEquipped.includes(id);
        if(eq){
          p.skillEquipped = p.skillEquipped.filter(x => x!==id);
        } else {
          if(p.skillEquipped.length >= 3){ toast("已装配 3 个", "bad"); return; }
          p.skillEquipped.push(id);
        }
        Save.persist();
        openSkillTree();
      };
    });
    document.getElementById("btn-ps-back").onclick = ()=> open();
  }

  // —— 暴露给战斗系统：玩家作为战斗单位 ——
  // 返回与 disciple 同结构的对象，供 battle.js 复用
  function asBattleUnit(){
    const p = get();
    return {
      id: "_player",
      name: "你 · 掌门",
      title: "掌门",
      pic: "_player",        // 特殊标记，战斗 UI 会画掌门徽记
      portrait: null,         // 头像由战斗 UI 单独处理
      isPlayer: true,
      realm: p.realm,
      stats: p.stats,
      element: p.element,
      weapon: p.weapon,
      flags: {},
      skillEquipped: p.skillEquipped,
    };
  }

  return { open, get, asBattleUnit };
})();
