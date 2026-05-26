/* 存档 */
const Save = (() => {
  const KEY = "zsc_save_v1";
  function load(){ try{ const s=localStorage.getItem(KEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
  function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(G.state)); }catch(e){} }
  function clear(){ localStorage.removeItem(KEY); }
  function newSave(){
    return {
      day: 1, month: 1,
      sect: "残墟门",
      stone: 100, pill: 3, herb: 0, scroll: 0,
      rep: 0,
      flags: {},
      storyDone: [],
      buildLv: { hall:1, dantang:1, yanwu:0, zangjing:0, lingtian:1 },
      // 弟子（深拷贝起始）
      disciples: JSON.parse(JSON.stringify(DISCIPLES_INIT)),
      pendingDispatches: [], // {dispatchId, disciples:[id], untilDay}
      ownedSkins: ["th_classic"],
      passOwned: false,
      monthlyUntil: 0,
      ownedDisciples: [],
      stats: { runs:0, perfects:0, deaths:0 },
    };
  }
  return { load, persist, clear, newSave };
})();
