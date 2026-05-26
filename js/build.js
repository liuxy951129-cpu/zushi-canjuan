/* 修缮 */
const Build = (() => {
  function render(){
    const grid = document.getElementById("build-grid");
    grid.innerHTML = "";
    BUILDINGS.forEach(b => {
      const lv = G.state.buildLv[b.id] || 0;
      const isMax = lv >= b.maxLv;
      const cost = isMax ? null : b.cost[lv];
      const next = isMax ? "已至顶级" : (b.effects[lv] || "未知效果");
      const card = document.createElement("div");
      card.className = "build-card";
      card.innerHTML = `
        <div class="build-art" style="background-image:url(assets/scenes/${b.pic}.jpg)"></div>
        <div class="build-info">
          <h3>${b.name} <span style="font-size:11px;color:var(--ink-3);letter-spacing:.18em;margin-left:6px">Lv.${lv}/${b.maxLv}</span></h3>
          <p>${b.desc}</p>
          <p style="color:var(--candle);font-size:12px;letter-spacing:.16em;font-family:Ma Shan Zheng">↑ ${next}</p>
          <div class="build-row">
            <div class="build-lvl">${isMax?"圆 满":`修 缮 至 Lv.${lv+1}`}</div>
            <div class="build-cost">${isMax?"":`${cost} 灵石`}</div>
          </div>
        </div>
      `;
      if(!isMax){
        card.addEventListener("click", () => {
          if(G.state.stone < cost){ toast("灵石不足", "bad"); return; }
          G.state.stone -= cost;
          G.state.buildLv[b.id] = lv + 1;
          // 应用效果
          if(b.id==="lingtian"){ /* 灵田自动每日产出由 endDay 处理 */ }
          if(b.id==="dantang"){ G.state.pill += 1; }
          SFX.play("up");
          toast(`${b.name} 修至 Lv.${lv+1}`, "good");
          if(typeof Tasks !== 'undefined') Tasks.mark('t_first_build');
          Save.persist();
          Main.updateHUD();
          render();
        });
      }
      grid.appendChild(card);
    });
  }
  return { render };
})();
