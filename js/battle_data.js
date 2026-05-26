/* ================================================================
   战斗数据 · 七大派敌方阵容 + 战斗技能
   ================================================================ */

// —— 通用战斗技能池（按元素/类型分配，平A自动给）——
// id, name, mp, power(基础威力), kind: phys/magic/heal/buff, element, hits, desc
const BATTLE_SKILLS = {
  // 金系
  bs_jin_zhan:   { name:"金芒斩",    mp:8,  power:42, kind:"phys",  element:"metal", desc:"金气化锋，一刀破甲。" },
  bs_jin_yu:     { name:"剑域",      mp:18, power:60, kind:"phys",  element:"metal", desc:"无形剑域，连斩三式。", hits:2 },
  bs_jin_qiang:  { name:"金身术",    mp:12, power:0,  kind:"buff",  element:"metal", desc:"防御 +25%，持续 3 回合。", buff:{def:0.25, turns:3} },
  // 木系
  bs_mu_teng:    { name:"缚妖藤",    mp:10, power:30, kind:"magic", element:"wood",  desc:"妖藤束敌，命中率高。" },
  bs_mu_chunhui: { name:"春回术",    mp:14, power:55, kind:"heal",  element:"wood",  desc:"恢复体力，回 50% HP。" },
  bs_mu_shengji: { name:"生机灌注",  mp:12, power:0,  kind:"buff",  element:"wood",  desc:"我方全队 HP 缓慢回复，3 回合。", buff:{regen:0.08, turns:3, team:true} },
  // 水系
  bs_shui_jian:  { name:"寒泉箭",    mp:8,  power:38, kind:"magic", element:"water", desc:"水箭穿心，破灵防。" },
  bs_shui_yun:   { name:"渊海覆灭",  mp:22, power:80, kind:"magic", element:"water", desc:"水龙翻涌，巨创单体。" },
  bs_shui_huan:  { name:"幻形术",    mp:12, power:0,  kind:"buff",  element:"water", desc:"闪避 +30%，持续 3 回合。", buff:{eva:0.30, turns:3} },
  // 火系
  bs_huo_yan:    { name:"赤焰诀",    mp:10, power:48, kind:"magic", element:"fire",  desc:"焚身赤炎，附加灼烧。", dot:{dmg:8, turns:2} },
  bs_huo_yu:     { name:"焚天火域",  mp:24, power:90, kind:"magic", element:"fire",  desc:"火域降临，群伤巨创。", aoe:true },
  bs_huo_kuang:  { name:"狂焰附身",  mp:14, power:0,  kind:"buff",  element:"fire",  desc:"攻击 +30%，持续 3 回合。", buff:{atk:0.30, turns:3} },
  // 土系
  bs_tu_jia:     { name:"金石甲",    mp:10, power:0,  kind:"buff",  element:"earth", desc:"防御 +40%，持续 2 回合。", buff:{def:0.40, turns:2} },
  bs_tu_chui:    { name:"山岳锤",    mp:14, power:62, kind:"phys",  element:"earth", desc:"山岳之力，重击单体。" },
  bs_tu_zhen:    { name:"震地裂",    mp:18, power:55, kind:"phys",  element:"earth", desc:"地裂袭敌，群伤减速。", aoe:true },
  // 通用
  bs_pingA:      { name:"平 A",      mp:0,  power:18, kind:"phys",  element:"none",  desc:"普通攻击。" },
  bs_recover:    { name:"运 气 法",  mp:0,  power:0,  kind:"recover", element:"none", desc:"调息回复，恢复 12 MP。", recover:{mp:12} },

  // —— BOSS 专属 ——
  bs_boss_thunder:  { name:"九 天 雷 罚",  mp:30, power:110, kind:"magic", element:"fire",  desc:"雷霆门主绝技，群伤巨创。", aoe:true, dot:{dmg:10, turns:2} },
  bs_boss_xueyue:   { name:"血 月 噬 魂",  mp:28, power:95,  kind:"magic", element:"water", desc:"血月教主邪术，吸血 50%。", lifesteal:0.5 },
  bs_boss_xuanyin:  { name:"鬼 域 缠 身",  mp:26, power:85,  kind:"magic", element:"water", desc:"玄阴宗主诅咒，必命中 + 减攻。", debuff:{atk:-0.25, turns:3} },
  bs_boss_xuxian:   { name:"白 鹿 渡 厄",  mp:32, power:0,   kind:"heal",  element:"wood",  desc:"虚仙宗主神术，全队回 70% HP。", heal:{ratio:0.7, team:true} },
  bs_boss_ziwei:    { name:"星 河 万 卷",  mp:28, power:88,  kind:"magic", element:"metal", desc:"紫薇阁主仙文，破防群伤。", aoe:true, defIgnore:0.4 },
  bs_boss_luoxia:   { name:"九 转 还 魂",  mp:24, power:75,  kind:"magic", element:"fire",  desc:"落霞谷主炼丹术，群伤+回 30% HP。", aoe:true, lifesteal:0.3 },
};

// —— 七大派敌方阵容 ——
// 每派 5 人：leader（帮主，必须打败才胜）+ 4 名长老/护法
// portrait 对应 assets/portraits/{key}.jpg
// realm 0..7（炼气/筑基/金丹/元婴/化神/合体/大乘/渡劫）
// element/skills 决定战斗手感
const ENEMY_SECTS = {
  sect_thunder: {
    name: "雷 霆 门",
    color: "#a83236",
    bg: "bg_battle_thunder",
    members: [
      { id:"thunder_leader", portrait:"e_thunder_leader", name:"雷无极", title:"雷霆门主", isLeader:true,
        realm:5, stats:{root:18, wit:8, mind:10, spirit:12, luck:6}, element:"fire",
        skills:["bs_boss_thunder","bs_jin_yu","bs_huo_kuang","bs_recover"] },
      { id:"thunder_a", portrait:"e_thunder_a", name:"雷 焰",  realm:3, stats:{root:14, wit:6, mind:7, spirit:9, luck:5}, element:"fire", skills:["bs_huo_yan","bs_jin_zhan","bs_recover"] },
      { id:"thunder_b", portrait:"e_thunder_b", name:"赤 蛇",  realm:3, stats:{root:13, wit:7, mind:6, spirit:8, luck:6}, element:"fire", skills:["bs_huo_kuang","bs_jin_zhan","bs_recover"] },
      { id:"thunder_c", portrait:"e_thunder_c", name:"猛 虎",  realm:2, stats:{root:15, wit:5, mind:6, spirit:6, luck:5}, element:"earth", skills:["bs_tu_chui","bs_jin_qiang","bs_recover"] },
      { id:"thunder_d", portrait:"e_thunder_d", name:"老 雷",  realm:4, stats:{root:11, wit:9, mind:8, spirit:11, luck:7}, element:"fire", skills:["bs_huo_yu","bs_jin_zhan","bs_recover"] },
    ]
  },
  sect_luoxia: {
    name: "落 霞 谷",
    color: "#d4554f",
    bg: "bg_battle_luoxia",
    members: [
      { id:"luoxia_leader", portrait:"e_luoxia_leader", name:"霞 仙 子", title:"落霞谷主", isLeader:true,
        realm:4, stats:{root:9, wit:13, mind:14, spirit:15, luck:10}, element:"fire",
        skills:["bs_boss_luoxia","bs_huo_yu","bs_mu_chunhui","bs_recover"] },
      { id:"luoxia_a", portrait:"e_luoxia_a", name:"丹 衣",  realm:2, stats:{root:7, wit:11, mind:10, spirit:12, luck:8}, element:"wood", skills:["bs_mu_chunhui","bs_mu_teng","bs_recover"] },
      { id:"luoxia_b", portrait:"e_luoxia_b", name:"百 草",  realm:3, stats:{root:8, wit:12, mind:11, spirit:13, luck:7}, element:"wood", skills:["bs_mu_shengji","bs_mu_teng","bs_recover"] },
      { id:"luoxia_c", portrait:"e_luoxia_c", name:"晚 霞",  realm:2, stats:{root:7, wit:10, mind:9, spirit:11, luck:8}, element:"fire", skills:["bs_huo_yan","bs_jin_zhan","bs_recover"] },
      { id:"luoxia_d", portrait:"e_luoxia_d", name:"草 童",  realm:1, stats:{root:6, wit:9, mind:8, spirit:9, luck:7}, element:"wood", skills:["bs_mu_teng","bs_pingA","bs_recover"] },
    ]
  },
  sect_xuanyin: {
    name: "玄 阴 宗",
    color: "#7a4ca0",
    bg: "bg_battle_xuanyin",
    members: [
      { id:"xuanyin_leader", portrait:"e_xuanyin_leader", name:"玄阴老祖", title:"玄阴宗主", isLeader:true,
        realm:6, stats:{root:14, wit:14, mind:13, spirit:18, luck:5}, element:"water",
        skills:["bs_boss_xuanyin","bs_shui_yun","bs_shui_huan","bs_recover"] },
      { id:"xuanyin_a", portrait:"e_xuanyin_a", name:"幽 鬼", realm:4, stats:{root:9, wit:11, mind:11, spirit:14, luck:5}, element:"water", skills:["bs_shui_jian","bs_shui_huan","bs_recover"] },
      { id:"xuanyin_b", portrait:"e_xuanyin_b", name:"骨 王", realm:5, stats:{root:13, wit:9, mind:10, spirit:15, luck:4}, element:"water", skills:["bs_shui_yun","bs_jin_zhan","bs_recover"] },
      { id:"xuanyin_c", portrait:"e_xuanyin_c", name:"暗 影", realm:4, stats:{root:11, wit:10, mind:9, spirit:13, luck:7}, element:"water", skills:["bs_shui_huan","bs_jin_zhan","bs_recover"] },
      { id:"xuanyin_d", portrait:"e_xuanyin_d", name:"咒 师", realm:5, stats:{root:8, wit:13, mind:12, spirit:16, luck:5}, element:"water", skills:["bs_shui_yun","bs_shui_jian","bs_recover"] },
    ]
  },
  sect_ziwei: {
    name: "紫 薇 阁",
    color: "#7a5ca0",
    bg: "bg_battle_ziwei",
    members: [
      { id:"ziwei_leader", portrait:"e_ziwei_leader", name:"紫薇真人", title:"紫薇阁主", isLeader:true,
        realm:6, stats:{root:11, wit:18, mind:17, spirit:16, luck:9}, element:"metal",
        skills:["bs_boss_ziwei","bs_jin_yu","bs_jin_qiang","bs_recover"] },
      { id:"ziwei_a", portrait:"e_ziwei_a", name:"文 渊", realm:4, stats:{root:8, wit:14, mind:13, spirit:13, luck:8}, element:"metal", skills:["bs_jin_zhan","bs_jin_qiang","bs_recover"] },
      { id:"ziwei_b", portrait:"e_ziwei_b", name:"墨 痕", realm:4, stats:{root:9, wit:13, mind:14, spirit:12, luck:8}, element:"metal", skills:["bs_jin_yu","bs_jin_zhan","bs_recover"] },
      { id:"ziwei_c", portrait:"e_ziwei_c", name:"星 罗", realm:5, stats:{root:10, wit:15, mind:14, spirit:14, luck:9}, element:"metal", skills:["bs_jin_yu","bs_jin_qiang","bs_recover"] },
      { id:"ziwei_d", portrait:"e_ziwei_d", name:"玉 笺", realm:3, stats:{root:9, wit:12, mind:11, spirit:11, luck:8}, element:"metal", skills:["bs_jin_zhan","bs_pingA","bs_recover"] },
    ]
  },
  sect_xueyue: {
    name: "血 月 教",
    color: "#a83236",
    bg: "bg_battle_xueyue",
    members: [
      { id:"xueyue_leader", portrait:"e_xueyue_leader", name:"血月魔尊", title:"血月教主", isLeader:true,
        realm:7, stats:{root:18, wit:11, mind:9, spirit:18, luck:3}, element:"water",
        skills:["bs_boss_xueyue","bs_shui_yun","bs_huo_kuang","bs_recover"] },
      { id:"xueyue_a", portrait:"e_xueyue_a", name:"血 姬", realm:5, stats:{root:13, wit:9, mind:8, spirit:14, luck:4}, element:"water", skills:["bs_shui_jian","bs_huo_yan","bs_recover"] },
      { id:"xueyue_b", portrait:"e_xueyue_b", name:"魔 刃", realm:5, stats:{root:16, wit:7, mind:7, spirit:11, luck:4}, element:"earth", skills:["bs_tu_chui","bs_jin_zhan","bs_recover"] },
      { id:"xueyue_c", portrait:"e_xueyue_c", name:"巫 女", realm:4, stats:{root:9, wit:11, mind:9, spirit:14, luck:5}, element:"water", skills:["bs_shui_huan","bs_shui_jian","bs_recover"] },
      { id:"xueyue_d", portrait:"e_xueyue_d", name:"血 师", realm:5, stats:{root:11, wit:11, mind:8, spirit:15, luck:4}, element:"fire", skills:["bs_huo_yu","bs_huo_yan","bs_recover"] },
    ]
  },
  sect_xuxian: {
    name: "虚 仙 宗",
    color: "#a3c8e0",
    bg: "bg_battle_xuxian",
    members: [
      { id:"xuxian_leader", portrait:"e_xuxian_leader", name:"长虚真君", title:"虚仙宗主", isLeader:true,
        realm:7, stats:{root:14, wit:18, mind:18, spirit:18, luck:14}, element:"wood",
        skills:["bs_boss_xuxian","bs_jin_yu","bs_mu_shengji","bs_recover"] },
      { id:"xuxian_a", portrait:"e_xuxian_a", name:"清 露", realm:5, stats:{root:10, wit:14, mind:13, spirit:15, luck:11}, element:"wood", skills:["bs_mu_chunhui","bs_mu_shengji","bs_recover"] },
      { id:"xuxian_b", portrait:"e_xuxian_b", name:"白 衣", realm:6, stats:{root:13, wit:13, mind:14, spirit:15, luck:11}, element:"metal", skills:["bs_jin_yu","bs_jin_qiang","bs_recover"] },
      { id:"xuxian_c", portrait:"e_xuxian_c", name:"莲 仙", realm:5, stats:{root:9, wit:14, mind:14, spirit:15, luck:12}, element:"water", skills:["bs_shui_yun","bs_shui_huan","bs_recover"] },
      { id:"xuxian_d", portrait:"e_xuxian_d", name:"白 鹿", realm:6, stats:{root:11, wit:15, mind:15, spirit:16, luck:12}, element:"wood", skills:["bs_mu_shengji","bs_mu_chunhui","bs_recover"] },
    ]
  },
};

// —— 我方弟子的战斗技能映射（从 skills 树主修取 1-3 个）——
function mapDiscipleBattleSkills(d){
  const out = ["bs_pingA"];
  // 元素映射
  const treeKey = (typeof Skills !== 'undefined' && Skills.getMainTree) ? Skills.getMainTree(d.id) : null;
  let elem = treeKey?.tree?.element || "metal";
  // 主元素技能 2 个 + 通用 1 个
  const ELEM_SKILLS = {
    metal:["bs_jin_zhan","bs_jin_yu","bs_jin_qiang"],
    wood: ["bs_mu_teng","bs_mu_chunhui","bs_mu_shengji"],
    water:["bs_shui_jian","bs_shui_yun","bs_shui_huan"],
    fire: ["bs_huo_yan","bs_huo_yu","bs_huo_kuang"],
    earth:["bs_tu_chui","bs_tu_jia","bs_tu_zhen"],
  };
  const pool = ELEM_SKILLS[elem] || ELEM_SKILLS.metal;
  // 根据境界给等级数量：>=2 给两个高级，否则给两个低级
  out.push(pool[0]);
  if((d.realm||0) >= 2) out.push(pool[1]);
  if((d.realm||0) >= 4) out.push(pool[2]);
  out.push("bs_recover");
  return out;
}

// —— 战斗属性派生 ——
// realm 0..7
function deriveBattleStats(unit){
  const r = unit.realm || 0;
  const s = unit.stats || {};
  const maxHp  = 80 + r*55 + (s.root||5)*7;
  const maxMp  = 25 + r*12 + (s.spirit||5)*4;
  const atk    = 12 + r*7  + (s.root||5)*1.4;
  const mag    = 10 + r*7  + (s.mind||5)*1.6;
  const def    = 8  + r*4  + (s.root||5)*0.7;
  const mdef   = 8  + r*4  + (s.spirit||5)*0.8;
  const spd    = 10 + r*2  + (s.wit||5)*1.2 + (s.luck||5)*0.5;
  return {
    maxHp:Math.round(maxHp), maxMp:Math.round(maxMp),
    atk:Math.round(atk), mag:Math.round(mag),
    def:Math.round(def), mdef:Math.round(mdef),
    spd:Math.round(spd)
  };
}
