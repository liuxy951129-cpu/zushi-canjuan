/* ================================================================
   世界面板 · 七大派情报地图 + 宗门等级
   ================================================================ */
const World = (() => {

  // 七大派在地图上的归一化坐标（0-1）
  // 用相对坐标，UI 自适应
  const POS = {
    sect_us:      { x:0.45, y:0.50, label:"残墟门（我）", color:"#c9a35a" },
    sect_thunder: { x:0.62, y:0.32, label:"雷霆门", color:"#a83236" },
    sect_luoxia:  { x:0.30, y:0.65, label:"落霞谷", color:"#d4554f" },
    sect_xuanyin: { x:0.78, y:0.55, label:"玄阴宗", color:"#3a1530" },
    sect_ziwei:   { x:0.50, y:0.18, label:"紫薇阁", color:"#7a5ca0" },
    sect_xueyue:  { x:0.18, y:0.30, label:"血月教", color:"#a83236" },
    sect_xuxian:  { x:0.85, y:0.15, label:"虚仙宗", color:"#a3c8e0" },
  };

  function openSects(){
    G.state.flags = G.state.flags || {};
    G.state.flags.visited_world = true;
    if(G.state.tasks){ G.state.tasks.t_visit_world = true; }
    Save.persist();
    if(typeof Tasks !== 'undefined') Tasks.renderFloater();

    // 构造地图 HTML
    const markersHtml = SECTS_WORLD.map(s => {
      const pos = POS[s.id];
      if(!pos) return "";
      const isMe = s.id === "sect_us";
      const dangerColor = s.danger >= 8 ? "#ff5050" : s.danger >= 5 ? "#ffc864" : "#80c898";
      return `
        <div class="sect-marker ${isMe?'self':''}" data-sid="${s.id}" style="
          position:absolute;left:${pos.x*100}%;top:${pos.y*100}%;
          transform:translate(-50%,-50%);
          cursor:pointer;
        ">
          <div class="sm-pin" style="
            width:${isMe?32:24}px;height:${isMe?32:24}px;
            background:radial-gradient(circle, ${pos.color}, ${pos.color}66);
            border:2px solid ${isMe?'var(--gold-2)':pos.color};
            border-radius:50%;
            box-shadow:0 0 ${isMe?20:12}px ${pos.color},inset 0 0 6px rgba(0,0,0,.4);
            position:relative;
            animation:${isMe?'selfPulse 2s ease-in-out infinite':'pinPulse 3s ease-in-out infinite'};
          ">
            ${isMe ? '<div style="position:absolute;inset:-6px;border:1px dashed var(--gold-2);border-radius:50%;animation:selfRot 8s linear infinite"></div>' : ''}
          </div>
          <div class="sm-name" style="
            position:absolute;left:50%;top:calc(100% + 4px);transform:translateX(-50%);
            font-family:Ma Shan Zheng;font-size:12px;color:${pos.color};
            letter-spacing:.12em;white-space:nowrap;
            text-shadow:0 0 8px rgba(0,0,0,.95), 1px 1px 2px rgba(0,0,0,.95);
            pointer-events:none;
          ">${s.name}</div>
        </div>
      `;
    }).join("");

    Modal.openHTML(`
      <h3 style="margin:0 0 6px 0;text-align:center">七 大 派 · 江 湖 地 图</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center;margin-bottom:14px">「掌门，悬浮各派图钉，可见详情。」</div>
      <div id="world-map-wrap" style="
        position:relative;width:100%;aspect-ratio:1/1;max-height:60vh;
        background:url(assets/scenes/world_map.jpg) center/cover #1a1310;
        border:2px solid var(--gold);border-radius:8px;
        box-shadow:inset 0 0 60px rgba(0,0,0,.7), 0 0 24px rgba(0,0,0,.5);
        overflow:hidden;
      ">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at center, transparent 30%, rgba(0,0,0,.4) 100%);pointer-events:none"></div>
        ${markersHtml}
        <div id="world-tooltip" style="
          position:absolute;display:none;
          width:280px;padding:12px;
          background:linear-gradient(135deg,rgba(30,20,18,.97),rgba(15,8,12,.99));
          border:1.5px solid var(--gold);border-radius:6px;
          box-shadow:0 8px 24px rgba(0,0,0,.8), 0 0 16px rgba(201,163,90,.3);
          pointer-events:none;z-index:50;
        "></div>
      </div>
      <div style="margin-top:10px;padding:8px 12px;background:rgba(20,15,12,.5);border:1px solid var(--line);border-radius:4px;font-size:11px;color:var(--ink-3);letter-spacing:.05em;text-align:center">
        <span style="color:#80c898">●</span> 低威胁 &nbsp; <span style="color:#ffc864">●</span> 中威胁 &nbsp; <span style="color:#ff5050">●</span> 高威胁 &nbsp;|&nbsp; <span style="color:var(--gold-2)">●</span> 本派
      </div>
      <div class="modal-row" style="margin-top:14px"><button class="btn ghost" data-act="modal-close">合 上 卷 宗</button></div>
    `);

    const tip = document.getElementById("world-tooltip");
    const wrap = document.getElementById("world-map-wrap");
    document.querySelectorAll(".sect-marker").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const s = SECTS_WORLD.find(x => x.id === el.dataset.sid);
        if(!s) return;
        const pos = POS[s.id];
        const dangerBars = "▌".repeat(s.danger||0) + "▏".repeat(10-(s.danger||0));
        const powerBars  = "▌".repeat(s.power||0)  + "▏".repeat(10-(s.power||0));
        tip.innerHTML = `
          <div style="font-family:Ma Shan Zheng;color:${pos.color};font-size:16px;letter-spacing:.16em;margin-bottom:4px">${s.name}</div>
          <div style="font-size:10px;color:var(--ink-3);margin-bottom:6px">${s.role} · ${s.align} · 关系：<b style="color:var(--candle)">${s.relation}</b></div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--ink-3);margin-bottom:2px"><span>实力 ${s.power}/10</span><span>威胁 ${s.danger}/10</span></div>
          <div style="display:flex;justify-content:space-between;font-family:'Courier New',monospace;font-size:11px;margin-bottom:8px">
            <span style="color:var(--gold)">${powerBars}</span>
            <span style="color:${s.danger>=8?'var(--vermilion-3)':'var(--candle)'}">${dangerBars}</span>
          </div>
          <div style="font-size:11px;color:var(--ink-2);line-height:1.7;border-left:2px solid ${pos.color};padding-left:8px;white-space:pre-line;max-height:130px;overflow:hidden">${s.note.slice(0,140)}${s.note.length>140?'…':''}</div>
          <div style="font-size:10px;color:var(--ink-3);margin-top:6px;font-style:italic">掌门 · ${s.leader}</div>
        `;
        // 位置
        const rect = el.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const tipW = 280, tipH = 220;
        let left = rect.left - wrapRect.left + 30;
        let top = rect.top - wrapRect.top - 60;
        if(left + tipW > wrapRect.width) left = rect.left - wrapRect.left - tipW - 20;
        if(top < 10) top = rect.top - wrapRect.top + 40;
        if(top + tipH > wrapRect.height) top = wrapRect.height - tipH - 10;
        tip.style.left = left + "px";
        tip.style.top = top + "px";
        tip.style.display = "block";
      });
      el.addEventListener("mouseleave", () => { tip.style.display = "none"; });
      el.addEventListener("click", () => {
        // 点击：弹完整详情（沿用旧 list view）
        const s = SECTS_WORLD.find(x => x.id === el.dataset.sid);
        if(s) openSectDetail(s);
      });
    });
  }

  function openSectDetail(s){
    const pos = POS[s.id] || { color:"#c9a35a" };
    const me = s.id === "sect_us";
    const dangerBars = "▌".repeat(s.danger||0) + "▏".repeat(10-(s.danger||0));
    const powerBars  = "▌".repeat(s.power||0)  + "▏".repeat(10-(s.power||0));
    Modal.openHTML(`
      <h3>${s.name} · ${s.role}</h3>
      <div style="display:flex;gap:14px;align-items:center;margin:10px 0">
        <div style="width:60px;height:60px;border-radius:50%;background:radial-gradient(circle, ${pos.color}, ${pos.color}66);border:2px solid ${pos.color};box-shadow:0 0 18px ${pos.color}"></div>
        <div style="flex:1">
          <div style="font-size:11px;color:var(--ink-3);letter-spacing:.05em">${s.align} · 关系：<b style="color:var(--candle)">${s.relation}</b></div>
          <div style="font-size:11px;color:var(--ink-3);margin-top:4px">掌门 · ${s.leader} · 派别 · ${s.style}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-3);margin-bottom:4px"><span>实力 ${s.power}/10</span><span>威胁 ${s.danger}/10</span></div>
      <div style="display:flex;justify-content:space-between;font-family:'Courier New',monospace;font-size:14px;margin-bottom:12px">
        <span style="color:var(--gold)">${powerBars}</span>
        <span style="color:${s.danger>=8?'var(--vermilion-3)':'var(--candle)'}">${dangerBars}</span>
      </div>
      <div style="font-size:13px;color:var(--ink-1);line-height:2;white-space:pre-line;border-left:2px solid ${pos.color};padding-left:12px">${s.note}</div>
      <div class="modal-row" style="margin-top:14px">
        <button class="btn ghost" id="btn-back-map">← 回 地 图</button>
      </div>
    `);
    document.getElementById("btn-back-map").onclick = () => openSects();
  }

  // —— 宗门等级面板 ——
  function openSectStatus(){
    const rep = G.state.rep || 0;
    let cur = SECT_LEVELS[0], next = null;
    for(let i=0;i<SECT_LEVELS.length;i++){
      if(rep >= SECT_LEVELS[i].rep){ cur = SECT_LEVELS[i]; next = SECT_LEVELS[i+1]||null; }
    }
    const aliveCount = G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left && !d.flags?.hidden && !d.flags?.locked).length;
    const totalCount = G.state.disciples.filter(d => !d.flags?.dead && !d.flags?.left).length;

    const progressBar = next ? `
      <div style="margin-top:14px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-3);margin-bottom:4px">
          <span>${cur.name}</span>
          <span>${rep} / ${next.rep}</span>
          <span>${next.name}</span>
        </div>
        <div style="height:10px;background:rgba(0,0,0,.4);border:1px solid var(--gold);border-radius:5px;overflow:hidden">
          <div style="height:100%;width:${Math.min(100,(rep-cur.rep)/(next.rep-cur.rep)*100)}%;background:linear-gradient(90deg,var(--gold),var(--candle))"></div>
        </div>
      </div>
    ` : `<div style="margin-top:14px;text-align:center;font-family:Ma Shan Zheng;color:var(--gold-2);letter-spacing:.3em;font-size:18px">— 三 大 宗 之 一 —</div>`;

    Modal.openHTML(`
      <h3>${G.state.sect} · 宗 门 录</h3>
      <div style="text-align:center;margin:10px 0 14px 0">
        <div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:32px;letter-spacing:.3em">${cur.name}</div>
        <div style="font-size:12px;color:var(--ink-3);letter-spacing:.18em;margin-top:4px">声 望 · ${rep}</div>
      </div>
      ${progressBar}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:18px">
        <div style="padding:10px;background:rgba(20,15,12,.7);border:1px solid var(--gold);border-radius:6px;text-align:center">
          <div style="font-size:11px;color:var(--ink-3)">弟 子</div>
          <div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:24px">${aliveCount} / ${totalCount}</div>
        </div>
        <div style="padding:10px;background:rgba(20,15,12,.7);border:1px solid var(--gold);border-radius:6px;text-align:center">
          <div style="font-size:11px;color:var(--ink-3)">第几日</div>
          <div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:24px">D ${G.state.day}</div>
        </div>
        <div style="padding:10px;background:rgba(20,15,12,.7);border:1px solid var(--gold);border-radius:6px;text-align:center">
          <div style="font-size:11px;color:var(--ink-3)">主 线</div>
          <div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:24px">${G.state.storyDone?.length||0} / 7</div>
        </div>
      </div>

      <div style="margin-top:18px">
        <h4 style="font-family:Ma Shan Zheng;color:var(--gold-2);letter-spacing:.18em;margin:0 0 8px 0">当 前 等 级 福 利</h4>
        <ul style="margin:0;padding:0 0 0 20px;color:var(--ink-2);font-size:13px;line-height:2">
          ${cur.perks.map(p => `<li>${p}</li>`).join("")}
        </ul>
      </div>

      ${next ? `<div style="margin-top:14px">
        <h4 style="font-family:Ma Shan Zheng;color:var(--ink-3);letter-spacing:.18em;margin:0 0 8px 0">下 一 阶 · ${next.name} <span style="font-size:11px;font-family:inherit;color:var(--ink-3)">还需声望 ${next.rep-rep}</span></h4>
        <ul style="margin:0;padding:0 0 0 20px;color:var(--ink-3);font-size:12px;line-height:1.8;font-style:italic">
          ${next.perks.map(p => `<li>${p}</li>`).join("")}
        </ul>
      </div>` : ""}

      <div class="modal-row" style="margin-top:18px">
        <button class="btn ghost" data-act="modal-close">嗯 →</button>
      </div>
    `);
  }

  return { openSects, openSectStatus };
})();
