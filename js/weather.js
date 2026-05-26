/* ================================================================
   天气 + 昼夜
   - 天气由 day 决定（确定性）：60% 晴 / 25% 雨 / 15% 雪
   - 昼夜：入定后切夜，next day 切昼
   ================================================================ */
const Weather = (() => {

  function current(){
    const day = (G.state && G.state.day) || 1;
    const r = ((day * 113 + 17) % 100) / 100;
    if(r < 0.60) return "sunny";
    if(r < 0.85) return "rain";
    return "snow";
  }
  function phase(){
    return (G.state && G.state._nightMode) ? "night" : "day";
  }
  function setNight(b){
    if(!G.state) return;
    G.state._nightMode = !!b;
    Save.persist();
    apply();
  }
  function toggleNight(){ setNight(!(G.state && G.state._nightMode)); }

  // 应用天气与昼夜到 UI（HUD 时辰 / 主屏背景 / 特效层）
  function apply(){
    const w = current();
    const p = phase();
    // 时辰
    const ti = document.getElementById("ti-icon");
    const tt = document.getElementById("ti-text");
    const ICONS = { sunny:"☀", rain:"☂", snow:"❄" };
    const WORDS = { sunny:"晴", rain:"雨", snow:"雪" };
    if(ti) ti.textContent = (p === "night" ? "🌙" : ICONS[w]);
    if(tt) tt.textContent = (p === "night" ? "戌时" : "辰时") + " · " + WORDS[w];

    // 主屏背景切换
    const bg = document.getElementById("hall-bg");
    if(bg){
      bg.style.backgroundImage = "url(assets/scenes/sc_temple_"+p+".jpg), url(assets/scenes/sc_temple.jpg)";
      bg.style.backgroundSize = "cover";
      bg.style.backgroundPosition = "center";
      bg.style.filter = (p === "night") ? "brightness(.45) saturate(.7)" : "brightness(.85) saturate(.95)";
    }

    // 特效粒子
    renderEffect(w, p);
  }

  function renderEffect(w, p){
    const layer = document.getElementById("weather-layer");
    if(!layer) return;
    layer.innerHTML = "";
    // 夜晚加蓝紫遮罩
    if(p === "night"){
      const n = document.createElement("div");
      n.className = "weather-night-overlay";
      layer.appendChild(n);
    }
    if(w === "rain"){
      for(let i=0;i<60;i++){
        const d = document.createElement("div");
        d.className = "weather-rain";
        d.style.left = (Math.random()*100) + "%";
        const h = 30 + Math.random()*60;
        d.style.height = h + "px";
        d.style.opacity = (0.4 + Math.random()*0.5).toFixed(2);
        d.style.animationDuration = (0.5 + Math.random()*0.7).toFixed(2) + "s";
        d.style.animationDelay = (-Math.random()*2).toFixed(2) + "s";
        layer.appendChild(d);
      }
    } else if(w === "snow"){
      for(let i=0;i<40;i++){
        const d = document.createElement("div");
        d.className = "weather-snow";
        d.style.left = (Math.random()*100) + "%";
        const s = 4 + Math.random()*4;
        d.style.width = s + "px";
        d.style.height = s + "px";
        d.style.opacity = (0.6 + Math.random()*0.4).toFixed(2);
        d.style.setProperty("--dx", (Math.random()*120 - 60) + "px");
        d.style.animationDuration = (6 + Math.random()*8).toFixed(2) + "s";
        d.style.animationDelay = (-Math.random()*5).toFixed(2) + "s";
        layer.appendChild(d);
      }
    }
  }

  return { current, phase, setNight, toggleNight, apply };
})();
