/* 存档 */
const Save = (() => {
  const KEY = "zsc_save_v2"; // v2: 加入背包系统
  function load(){ try{ const s=localStorage.getItem(KEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
  function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(G.state)); }catch(e){} }
  function clear(){
    localStorage.removeItem(KEY);
    localStorage.removeItem("zsc_save_v1"); // 清旧存档
  }
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
      // —— v2 新增：背包 ——
      // inv: { itemId: count }
      inv: {
        sw_iron: 2,
        pill_ningshen: 1,
        gf_silkfan: 1,
      },
      // 弟子装备：{ disId: { sword: itemId, ... } }
      // 起始装备已在弟子 weapon 字段中预设，此处用于交换装备
      equip: {
        chenyuan: { sword:"sw_qinglu" },
        lingxue:  { sword:"sw_hanshuang" },
      },
      // 任务进度
      tasks: {
        t_first_dispatch: false, // 派遣第一次
        t_first_breakthrough: false, // 第一次突破
        t_first_recruit: false, // 招到第一名新弟子
        t_first_build: false, // 第一次升级建筑
        t_visit_world: false, // 看一次七大派
      },
    };
  }
  return { load, persist, clear, newSave };
})();
