/* 简单 WebAudio 音效 */
const SFX = (() => {
  let ctx;
  function ensure(){ if(!ctx) try{ ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} return ctx; }
  function tone(f,d,t,v){
    const c = ensure(); if(!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type=t||"sine"; o.frequency.value=f;
    g.gain.setValueAtTime((v||0.1)*(G.settings?.vol??0.5), c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime+d);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+d+0.05);
  }
  function play(name){
    if(name==="click") tone(620,0.06,"sine",0.06);
    if(name==="chime"){ tone(880,0.4,"sine",0.12); setTimeout(()=>tone(660,0.5,"sine",0.1),120);}
    if(name==="bell") tone(220,0.6,"sine",0.18);
    if(name==="sword"){ tone(1320,0.04,"sawtooth",0.08); setTimeout(()=>tone(880,0.06,"sawtooth",0.06),40);}
    if(name==="break"){ tone(160,0.4,"sawtooth",0.1); }
    if(name==="up"){ tone(660,0.1,"sine",0.1); setTimeout(()=>tone(990,0.15,"sine",0.1),100); }
    if(name==="bad") tone(120,0.45,"sawtooth",0.1);
  }
  return { play };
})();
