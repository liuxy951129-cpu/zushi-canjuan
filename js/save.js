/* 存档 */
const Save = (() => {
  const KEY = "zsc_save_v4"; // v4: 铜钱系统 + 新手浮窗
  function load(){ try{ const s=localStorage.getItem(KEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
  function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(G.state)); }catch(e){} }
  function clear(){
    localStorage.removeItem(KEY);
    localStorage.removeItem("zsc_save_v1");
    localStorage.removeItem("zsc_save_v2");
    localStorage.removeItem("zsc_save_v3");
  }
  function newSave(){
    return {
      day: 1, month: 1,
      sect: "残墟门",
      // 灵石：修为养成（闭关/突破/丹房）；铜钱：买东西/修建筑
      stone: 50, coin: 300, pill: 3, herb: 0, scroll: 0,
      rep: 0,
      flags: {},
      storyDone: [],
      buildLv: { hall:1, dantang:1, yanwu:0, zangjing:0, lingtian:1 },
      disciples: JSON.parse(JSON.stringify(DISCIPLES_INIT)),
      pendingDispatches: [],
      ownedSkins: ["th_classic"],
      passOwned: false,
      monthlyUntil: 0,
      ownedDisciples: [],
      stats: { runs:0, perfects:0, deaths:0 },
      inv: {
        sw_iron: 2,
        pill_ningshen: 1,
        gf_silkfan: 1,
      },
      equip: {
        chenyuan: { sword:"sw_qinglu" },
        lingxue:  { sword:"sw_hanshuang" },
      },
      tasks: {
        t_first_dispatch: false,
        t_first_breakthrough: false,
        t_first_recruit: false,
        t_first_build: false,
        t_visit_world: false,
      },
    };
  }
  return { load, persist, clear, newSave };
})();
