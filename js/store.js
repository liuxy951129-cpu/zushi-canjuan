/* 仙缘阁付费 mock */
const Store = (() => {
  let tab = "disciple";
  function switchTab(t){
    tab = t;
    document.querySelectorAll("#screen-store .codex-tabs .tab").forEach(b => b.classList.toggle("active", b.dataset.st===t));
    refresh();
  }
  function refresh(){
    const body = document.getElementById("store-body");
    body.innerHTML = `<div style="text-align:right;color:var(--candle);font-family:Ma Shan Zheng;letter-spacing:.18em;margin-bottom:14px">灵石 ${G.state?.stone||0} · 丹药 ${G.state?.pill||0}</div>`;
    if(tab==="disciple"){
      const grid = document.createElement("div"); grid.className = "store-grid"; body.appendChild(grid);
      STORE_DISCIPLES.forEach(s => {
        const owned = G.state?.ownedDisciples?.includes(s.id);
        const div = document.createElement("div");
        div.className = "store-item" + (owned?" owned":"");
        div.innerHTML = `
          <div class="preview" style="background-image:url(assets/portraits/d_${s.id.replace('sd_','')}.jpg)"></div>
          <h4>${s.name}</h4>
          <div class="desc">${s.desc}</div>
          <div class="price">¥${s.price.toFixed(2)}</div>
        `;
        if(!owned){
          div.addEventListener("click", () => confirmPay(s.name, s.price, () => {
            G.state.ownedDisciples.push(s.id);
            // 加入弟子（用 STORE 风格创建）
            G.state.disciples.push({
              id: s.id, name: s.name.split("·").pop().trim(), title:"限定弟子", gender:"男",
              pic: "d_" + s.id.replace("sd_",""),
              age:24, life:140, realm:1, exp:0,
              stats:{ root:9, wit:8, mind:7, spirit:8, luck:7 },
              bio: s.desc, bonds:[], skill:"限定绝技", flags:{}
            });
            Save.persist(); refresh(); toast("已招入门下", "good");
          }));
        }
        grid.appendChild(div);
      });
    } else if(tab==="theme"){
      const grid = document.createElement("div"); grid.className = "store-grid"; body.appendChild(grid);
      STORE_THEMES.forEach(t => {
        const owned = G.state?.ownedSkins?.includes(t.id) || t.owned;
        const div = document.createElement("div");
        div.className = "store-item" + (owned?" owned":"");
        div.innerHTML = `
          <div class="preview" style="background-image:url(assets/scenes/sc_temple.jpg);filter:hue-rotate(${t.id==='th_blood'?-30:t.id==='th_cloud'?180:0}deg)"></div>
          <h4>${t.name}</h4>
          <div class="desc">改变宗门主题</div>
          <div class="price">${t.price?`¥${t.price.toFixed(2)}`:"默认"}</div>
        `;
        if(!owned && t.price){
          div.addEventListener("click", () => confirmPay(t.name, t.price, () => {
            G.state.ownedSkins.push(t.id);
            Save.persist(); refresh(); toast("已解锁宗门主题", "good");
          }));
        }
        grid.appendChild(div);
      });
    } else if(tab==="pass"){
      STORE_PASSES.forEach(p => {
        const owned = (p.id==="season"&&G.state?.passOwned) || (p.id==="monthly"&&(G.state?.monthlyUntil||0)>Date.now());
        const card = document.createElement("div");
        card.className = "pass-card";
        card.innerHTML = `
          <h3>${p.name}</h3>
          <div class="desc">${p.desc}</div>
          ${p.id==="season"?`<div class="pass-list">
            <div class="it">阶 1 · 宗门旗</div><div class="it">阶 5 · 200 灵石</div><div class="it">阶 10 · 限定皮肤</div><div class="it">阶 15 · 凶刀寒霜</div><div class="it">阶 20 · 外传 · 雷霆篇</div><div class="it">阶 30 · 客卿 · 妖姬</div><div class="it">阶 50 · 限定弟子 · 上代师叔</div>
          </div>`:""}
          <div class="pass-row">
            <div style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:18px;letter-spacing:.16em">¥${p.price.toFixed(2)}</div>
            <button class="btn primary" ${owned?"disabled":""}>${owned?"已 拥 有":"立 即 购 买"}</button>
          </div>
        `;
        if(!owned){
          card.querySelector("button").addEventListener("click", () => confirmPay(p.name, p.price, () => {
            if(p.id==="season") G.state.passOwned = true;
            if(p.id==="monthly") G.state.monthlyUntil = Date.now()+p.duration*24*3600*1000;
            Save.persist(); refresh(); toast("购买成功（演示）", "good");
          }));
        }
        body.appendChild(card);
      });
    }
  }
  function confirmPay(name, price, ok){
    Modal.openHTML(`
      <h3>确 认 支 付</h3>
      <div class="lead">${name}<br><b style="color:var(--candle);font-size:24px;font-family:Ma Shan Zheng">¥${price.toFixed(2)}</b></div>
      <div class="lead" style="font-size:11px;color:var(--ink-3)">这是演示版，不会发生真实支付。</div>
      <div class="modal-row">
        <button class="btn ghost" data-act="modal-close">取 消</button>
        <button class="btn primary" id="pay-ok">确 认 支 付</button>
      </div>
    `);
    document.getElementById("pay-ok").onclick = () => { Modal.close(); ok(); };
  }
  function init(){
    document.querySelectorAll("#screen-store .codex-tabs .tab").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.st)));
  }
  return { init, refresh, switchTab };
})();
