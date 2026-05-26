/* 名录 */
const Codex = (() => {
  let tab = "alive";
  function switchTab(t){
    tab = t;
    document.querySelectorAll("#screen-codex .codex-tabs .tab").forEach(b => b.classList.toggle("active", b.dataset.tab===t));
    refresh();
  }
  function refresh(){
    const body = document.getElementById("codex-body");
    body.innerHTML = "";
    const grid = document.createElement("div"); grid.className = "codex-grid"; body.appendChild(grid);
    let list = G.state.disciples;
    if(tab==="alive") list = list.filter(d => !d.flags?.dead && !d.flags?.left);
    if(tab==="dead") list = list.filter(d => d.flags?.dead);
    if(tab==="met") list = list.filter(d => d.flags?.left || d.flags?.locked);
    if(list.length===0){
      body.innerHTML = `<div style="text-align:center;color:var(--ink-3);padding:60px 0;font-family:Ma Shan Zheng;letter-spacing:.3em">— 暂 无 —</div>`;
      return;
    }
    list.forEach(d => {
      const card = document.createElement("div");
      card.className = "codex-card" + (d.flags?.dead?" dead":"") + (d.flags?.locked?" locked":"");
      card.innerHTML = `
        <div class="codex-pic" style="background-image:url(${Disciples.picSrc(d.pic)})">
          <div class="codex-name">${d.name}</div>
        </div>
        <div class="codex-info">
          <div class="meta">${d.title} · ${d.gender} · ${d.age}岁</div>
          <div class="meta">境界 <b>${REALMS[d.realm]}</b> · 寿元 <b>${d.life}</b></div>
          <div class="meta">绝技 · ${d.skill}</div>
        </div>
      `;
      card.addEventListener("click", () => Disciples.openDetail(d.id));
      grid.appendChild(card);
    });
  }
  function init(){
    document.querySelectorAll("#screen-codex .codex-tabs .tab").forEach(b =>
      b.addEventListener("click", () => switchTab(b.dataset.tab))
    );
  }
  return { init, refresh, switchTab };
})();
