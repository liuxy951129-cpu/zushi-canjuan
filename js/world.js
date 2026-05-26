/* ================================================================
   世界面板 · 七大派情报 + 宗门等级
   ================================================================ */
const World = (() => {

  // —— 七大派情报 ——
  function openSects(){
    G.state.flags = G.state.flags || {};
    G.state.flags.visited_world = true;
    if(G.state.tasks){ G.state.tasks.t_visit_world = true; }
    Save.persist();

    const list = SECTS_WORLD.map(s => {
      const me = s.id === "sect_us";
      const dangerBars = "▌".repeat(s.danger||0) + "▏".repeat(10-(s.danger||0));
      const powerBars  = "▌".repeat(s.power||0)  + "▏".repeat(10-(s.power||0));
      return `
        <div class="sect-card ${me?'self':''}" data-sid="${s.id}" style="margin-bottom:12px;padding:14px;background:${me?'rgba(168,50,54,.12)':'rgba(20,15,12,.7)'};border:1px solid ${me?'var(--vermilion-2)':'var(--gold)'};border-radius:6px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
            <div style="flex:1">
              <div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:18px;letter-spacing:.18em">${s.name} <span style="font-size:11px;color:var(--ink-3);font-family:inherit;letter-spacing:.05em">· ${s.role}</span></div>
              <div style="font-size:11px;color:var(--ink-3);margin-top:4px">${s.align} · 离我们 ${s.distance===0?'本山':s.distance+'山'} · 关系：<b style="color:var(--candle)">${s.relation}</b></div>
            </div>
            <div style="text-align:right">
              <div style="font-size:10px;color:var(--ink-3);letter-spacing:.05em">实力 ${s.power}/10</div>
              <div style="font-family:'Courier New',monospace;font-size:12px;color:var(--gold)">${powerBars}</div>
              <div style="font-size:10px;color:var(--ink-3);letter-spacing:.05em;margin-top:4px">威胁 ${s.danger}/10</div>
              <div style="font-family:'Courier New',monospace;font-size:12px;color:${s.danger>=8?'var(--vermilion-3)':'var(--candle)'}">${dangerBars}</div>
            </div>
          </div>
          <div style="margin-top:10px;font-size:11px;color:var(--ink-2);letter-spacing:.05em">掌门 · ${s.leader} · 派别 · ${s.style}</div>
          <div style="margin-top:10px;font-size:13px;color:var(--ink-1);line-height:2;white-space:pre-line;border-left:2px solid ${me?'var(--vermilion-2)':'var(--gold)'};padding-left:12px">${s.note}</div>
        </div>
      `;
    }).join("");

    Modal.openHTML(`
      <h3>七 大 派 · 情 报</h3>
      <div class="lead" style="font-size:12px;color:var(--ink-3);text-align:center;margin-bottom:14px">「掌门，知敌方知己，方能立足七十年。」</div>
      <div style="max-height:60vh;overflow-y:auto;padding-right:8px">
        ${list}
      </div>
      <div class="modal-row" style="margin-top:18px">
        <button class="btn ghost" data-act="modal-close">合 上 卷 宗</button>
      </div>
    `);
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
