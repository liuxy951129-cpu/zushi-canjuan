/* ================================================================
   祖师残卷 · 数据层
   ================================================================ */

// —— 境界八阶 ——
const REALMS = ["练气","筑基","金丹","元婴","化神","渡劫","大乘","飞升"];
// 每阶突破需要的修为
const REALM_EXP = [100, 280, 600, 1200, 2400, 4800, 8800, 14000];

// —— 资质五维：根骨 / 悟性 / 心境 / 灵识 / 气运 ——
const STATS = ["root","wit","mind","spirit","luck"];
const STAT_LABEL = { root:"根骨", wit:"悟性", mind:"心境", spirit:"灵识", luck:"气运" };

// —— 起始弟子（六位）——
// pic 文件名对应 assets/portraits/
const DISCIPLES_INIT = [
  {
    id:"chenyuan", name:"陈渊", title:"大弟子", gender:"男", pic:"d_chenyuan",
    age:24, life:120,
    realm:0, exp:30,
    stats:{ root:8, wit:7, mind:5, spirit:6, luck:4 },
    bio:`前掌门捡来的孤儿。沉默寡言，剑法已得六成真传。\n师弟妹们都叫他大师兄，但他自己说："我不过是早来一日。"`,
    bonds:["lingxue:师妹","master:师徒"],
    skill:"长河剑诀",
    flags:{},
  },
  {
    id:"lingxue", name:"凌雪", title:"二弟子", gender:"女", pic:"d_lingxue",
    age:22, life:130,
    realm:0, exp:40,
    stats:{ root:6, wit:9, mind:7, spirit:8, luck:5 },
    bio:"江南世家流落到本派的女子。修剑之外，最爱抚琴。\n据说她随身的银簪，是娘亲临终之物。",
    bonds:["chenyuan:师兄","xiaoyu:师妹"],
    skill:"寒霜九诀",
    flags:{},
  },
  {
    id:"shixiong", name:"周破军", title:"三弟子", gender:"男", pic:"d_shixiong",
    age:23, life:115,
    realm:0, exp:25,
    stats:{ root:9, wit:5, mind:6, spirit:5, luck:3 },
    bio:`军户之后，性如烈火。本欲投军，被祖师一眼相中。\n他曾发誓："若有一日，必助本派踏平雷霆门。"`,
    bonds:["chenyuan:师兄","master:师徒"],
    skill:"破军刀法",
    flags:{},
  },
  {
    id:"xiaoyu", name:"沈小雨", title:"小师妹", gender:"女", pic:"d_xiaoyu",
    age:16, life:140,
    realm:0, exp:5,
    stats:{ root:4, wit:8, mind:9, spirit:7, luck:8 },
    bio:"被师兄师姐捡来的弃婴。性子温柔，喜欢吹笛。\n灵识异常敏锐——她说，她能听见祖师堂半夜的脚步声。",
    bonds:["lingxue:师姐"],
    skill:"清音笛谱",
    flags:{},
  },
  {
    id:"heimo", name:"无名", title:"客卿", gender:"男", pic:"d_heimo",
    age:30, life:80,
    realm:1, exp:120,
    stats:{ root:7, wit:8, mind:3, spirit:9, luck:2 },
    bio:"前掌门留下的不速之客。脸上有道至深的伤疤，从不解释来历。\n他的修为远胜众师兄妹，却始终不入门下。或许，他在等什么。",
    bonds:[],
    skill:"血煞诀",
    flags:{ unstable:true, secret:true },
  },
  {
    id:"master", name:"祖师", title:"上代祖师", gender:"男", pic:"d_master",
    age:206, life:210,
    realm:5, exp:500,
    stats:{ root:10, wit:10, mind:10, spirit:10, luck:6 },
    bio:`残墟门第十六代掌门。三百年前一战之后，未曾再出闭关室。\n人们说他还在炼最后一口气——也有人说他早已坐化。\n你接任时，他终于开口："你是第十七代。但愿不是最后一代。"`,
    bonds:[],
    skill:"残卷掌",
    flags:{ master:true, locked:true },
  },
];

// —— 派遣任务 ——
// 类型：采药 / 护镖 / 灭妖 / 谈判 / 探秘 / 宗门战
const DISPATCHES = [
  {
    id:"q_001", name:"东山采草", tag:"采药", diff:1,
    needStats:{ spirit:3 },
    days:1,
    desc:`东山有一片野生紫茎草。供丹房用。`,
    rewards:{ stone:30, herb:5, exp:20 },
  },
  {
    id:"q_002", name:"西林狼患", tag:"灭妖", diff:2,
    needStats:{ root:6 },
    days:1,
    desc:`村民来报，西林夜有狼嚎，已伤数人。`,
    rewards:{ stone:60, exp:40 },
    riskHurt:0.2,
  },
  {
    id:"q_003", name:"押镖至落霞", tag:"护镖", diff:2,
    needStats:{ root:5, mind:4 },
    days:2,
    desc:`威远镖局重金请人押一批丹药至落霞谷。`,
    rewards:{ stone:120, exp:35 },
  },
  {
    id:"q_004", name:"调解山民", tag:"谈判", diff:1,
    needStats:{ mind:5, wit:4 },
    days:1,
    desc:`山下两村为水井起争。本派出面，还能落个名声。`,
    rewards:{ stone:20, rep:8, exp:15 },
  },
  {
    id:"q_005", name:"夜探古墓", tag:"探秘", diff:3,
    needStats:{ spirit:6, luck:4 },
    days:3,
    desc:`祖师残卷里画的，是一座七十里外的古墓。\n未开光的护尸符，未必能挡里面的东西。`,
    rewards:{ stone:200, herb:6, scroll:1, exp:80 },
    riskHurt:0.4,
    storyFlag:"explored_tomb",
  },
  {
    id:"q_006", name:"集市买药", tag:"采药", diff:1,
    needStats:{ wit:3, luck:3 },
    days:1,
    desc:`灵草市集开了。老贾说今日有便宜货，但要会还价。`,
    rewards:{ stone:0, herb:8, exp:10 },
    storyFlag:"met_merchant",
  },
  {
    id:"q_007", name:"剿灭山贼", tag:"灭妖", diff:3,
    needStats:{ root:8 },
    days:2,
    desc:`东南山口有一伙山贼，藏在地洞里。剿之，恩泽方圆三十里。`,
    rewards:{ stone:300, rep:25, exp:90 },
    riskHurt:0.5,
  },
  {
    id:"q_008", name:"求医邻派", tag:"谈判", diff:2,
    needStats:{ mind:6, wit:5 },
    days:1,
    desc:`本派老祖咳嗽不止。落霞谷的清虚丹师据说有方。`,
    rewards:{ pill:2, exp:30 },
    needGold:80,
  },
  {
    id:"q_009", name:"雷霆挑衅", tag:"宗门战", diff:5,
    needStats:{ root:10, mind:8 },
    days:1,
    desc:`雷霆门遣使来"借"残卷。对方派来的是他们二弟子。\n这是宗门战的前奏——一战定威名。`,
    rewards:{ stone:600, rep:80, exp:200 },
    riskHurt:0.6,
    storyOnly:"c1s3",
    minDay:3,
  },
  {
    id:"q_010", name:"接引散修", tag:"谈判", diff:2,
    needStats:{ mind:7, luck:5 },
    days:2,
    desc:`江湖传言，有散修愿意投奔小派。但来者多狡，须得辨真伪。`,
    rewards:{ stone:50, recruitChance:0.55, exp:25 },
  },
  {
    id:"q_011", name:"丹药试验", tag:"探秘", diff:2,
    needStats:{ wit:7, spirit:5 },
    days:1,
    desc:`丹房新出的"凝神丸"需有人试用。心境过低者慎入。`,
    rewards:{ exp:55, mindBoost:1 },
    riskHurt:0.25,
  },
  {
    id:"q_012", name:"妖兽巡山", tag:"灭妖", diff:4,
    needStats:{ root:9, spirit:6 },
    days:3,
    desc:`南山妖气复发。一只蛇形大妖在巡。狩之有利，惧之失土。`,
    rewards:{ stone:450, herb:10, exp:140 },
    riskHurt:0.5,
  },
];

// —— 建筑 ——
const BUILDINGS = [
  {
    id:"hall", name:"祖师堂", maxLv:5,
    cost:[0, 200, 500, 1000, 2000],
    desc:`宗门核心。每升一级解锁一名可招募的客卿弟子。`,
    pic:"sc_temple",
    effects:["客卿名额 +1","弟子上限 +1","声望 +5"],
  },
  {
    id:"dantang", name:"丹房", maxLv:5,
    cost:[150, 400, 900, 1800, 3600],
    desc:`炼丹之所。每日产出丹药，提升资质丹效。`,
    pic:"sc_dantang",
    effects:["每日丹药 +1","炼丹品质升一档","派遣减伤 5%"],
  },
  {
    id:"yanwu", name:"演武场", maxLv:4,
    cost:[120, 320, 720, 1500],
    desc:`切磋之地。提升弟子修炼速度与根骨成长。`,
    pic:"sc_battle",
    effects:["闭关收益 +20%","根骨成长加成","解锁宗门战"],
  },
  {
    id:"zangjing", name:"藏经阁", maxLv:4,
    cost:[200, 500, 1000, 2000],
    desc:`残卷与功法存放处。每升一级解锁新功法。`,
    pic:"sc_temple",
    effects:["功法 +2","悟性提升","主线提示"],
  },
  {
    id:"lingtian", name:"灵田", maxLv:5,
    cost:[80, 200, 500, 1100, 2300],
    desc:`种植灵草，自给自足。`,
    pic:"sc_courtyard",
    effects:["每日灵石 +30","药材自给","稀有灵草"],
  },
];

// —— 剧情 ——
const STORIES = [
  {
    id:"c1s1", chapter:1, day:1, title:"地窖之兆",
    body:`夜深时，祖师堂地窖里传来轻微的窸窣声。\n第三阶台阶下，本应封死的暗格被掀开了一指——\n一个泛黄羊皮卷的边缘，露在你的烛火下。\n\n上面用朱砂写着八个字：\n\n「七十年，三大宗，或为尘。」`,
    quote:`七十年，足够一只蝼蚁成龙，也足够一座宫殿成灰。`,
    choices:[
      { label:"取出残卷研读", b:"留心查看，但暂不公开", r:{ flag:"got_canjuan", exp:30 } },
      { label:"封回原处不动", b:"假装从未发生过", r:{ flag:"sealed_canjuan", mind:1 } },
      { label:"召集三大弟子彻夜商议", b:"分析谁可能动过", r:{ flag:"shared_canjuan", rep:5, exp:10 } },
    ],
  },
  {
    id:"c1s2", chapter:1, day:2, title:"大弟子之死",
    body:`清晨，演武场。\n陈渊倒在血泊里，胸口一道整齐的剑伤。\n手心紧攥着——一片不属于本派的玉碎。\n\n玉碎上有半个"雷"字。\n\n在场弟子无一人听见昨夜的搏斗。`,
    quote:`他若死了，下一个就是我们。`,
    choices:[
      { label:"立刻报官，与雷霆门决裂", b:"激进 · 但确立正派姿态", r:{ flag:"war_thunder", rep:30 },
        requireFlag:"investigated_jade", lockHint:"先去名录翻陈渊档案，再细看玉碎来历" },
      { label:"假意不知，秘密追查", b:"暗查 · 隐忍数月", r:{ flag:"secret_invest", exp:50 },
        requireFlag:"investigated_yard", lockHint:"先派一人探演武场，可寻得线索" },
      { label:"将玉碎送回雷霆门", b:"以礼还礼，赌对方的真意", r:{ flag:"return_jade", luck:2 } },
    ],
  },
  {
    id:"c1s3", chapter:1, day:3, title:"雷霆门挑衅",
    body:`雷霆门遣使到山下叫阵。\n来者自称二弟子叶千岭，金丹中期。\n他不要赔偿，不要道歉——\n他要"借"祖师残卷，三日为期。\n\n站在祖师堂前，你能听见弟子们急促的呼吸。\n这是你接任以来的第一场宗门战。`,
    quote:`借？借出去的东西，从不会原样回来。`,
    choices:[
      { label:"接战。派周破军应敌", b:"破军根骨最强，胜算 60%", r:{ unlock:"q_009", flag:"accepted_war" },
        requireFlag:"strong_team", lockHint:"门下需有人达至筑基境（修为满 100 后突破）" },
      { label:"暗中召回客卿无名", b:"强力 · 但他要价你不可控", r:{ unlock:"q_009", flag:"called_heimo", heimoMood:-2 },
        requireFlag:"got_canjuan", lockHint:"先在 D1 取出残卷，方能联络无名" },
      { label:"借出残卷换三月平安", b:"屈辱 · 但保门户暂安", r:{ flag:"surrender_canjuan", rep:-50 } },
    ],
  },
  {
    id:"c2s1", chapter:2, day:5, title:"小雨的笛声",
    body:`雨夜，藏经阁。\n你听见笛声从最深处的暗格传来——\n那地方，理论上没人能进。\n\n你推开门，沈小雨抱着竹笛坐在祖师残骸前。\n她转头看你，眼中有月光：\n\n"师兄……我又听见了。半夜走路的，不是祖师。"`,
    quote:`她的灵识，比这门派的任何人都强。`,
    choices:[
      { label:"让她继续听下去", b:"利用她的天赋追查地窖", r:{ flag:"xiaoyu_listen", spirit:1 } },
      { label:"严令她不许再来", b:"保护她免于卷入", r:{ flag:"protect_xiaoyu", mind:2 } },
    ],
  },
  {
    id:"c2s2", chapter:2, day:7, title:"邻派来访",
    body:`落霞谷主清虚老人亲自上山。\n他说："小派若立得住，本谷愿结盟。"\n但条件是——你要把残卷副本抄一份给他过目。\n\n这是一只伸出去的手，也是一根伸出去的针。`,
    quote:`结盟？江湖上的盟，从来都是单方面的。`,
    choices:[
      { label:"答应抄录副本", b:"得盟友 · 但泄密风险高", r:{ flag:"ally_luoxia", rep:40, scroll:-1 } },
      { label:"婉拒并赠丹药", b:"礼数全 · 不立盟", r:{ flag:"polite_refuse", pill:-1, rep:10 } },
      { label:"反向要求落霞抄录他们的", b:"硬气 · 但可能失去盟友", r:{ flag:"counter_offer", rep:5 } },
    ],
  },
  {
    id:"c2s3", chapter:2, day:9, title:"渡劫预兆",
    body:`凌雪在闭关三日后突破至筑基。\n但她的眉间，有一缕不属于此世的血纹。\n\n祖师爷叹道："血纹现，五年内必渡心魔劫。"\n\n你看着她苍白的脸，忽然明白：\n仙路没有易途。`,
    quote:`每一次突破，都是一次与天争命。`,
    choices:[
      { label:"备好丹药，全力护她", b:"消耗 4 丹药 · 提前布阵", r:{ pill:-4, flag:"prep_lingxue", rep:5 }, requirePill:4 },
      { label:"任其自然，劫由命定", b:"她若过不去，是她的命数", r:{ flag:"fate_lingxue" } },
    ],
  },
  {
    id:"c3s1", chapter:3, day:12, title:"客卿的真名",
    body:`无名出现在你面前，褪下了兜帽。\n那张脸，你曾在本派的旧画像里见过——\n他是上代二弟子，本应在三百年前的那一战里死透。\n\n"我没死。我只是被祖师爷封了一口气。\n他闭关，是在守我。\n现在，他要走了，我也想走了。"`,
    quote:`我不是来助你的。我是来告别的。`,
    choices:[
      { label:"放他走", b:"承担因果，宗门失一强援", r:{ flag:"heimo_left", rep:-20 } },
      { label:"求他再留三年", b:"换三场宗门战的胜机", r:{ flag:"heimo_stay", heimoMood:5 } },
    ],
  },
];

// —— 仙缘阁付费 ——
const STORE_DISCIPLES = [
  { id:"sd_yaonv", name:"妖女 · 红蝶", desc:`赤焰宗叛徒。心境极低，但根骨与气运双满。`, price:48 },
  { id:"sd_dishou", name:"霸刀 · 顾长风", desc:`南唐国师之子。携十万雷霆诀残卷而来。`, price:88 },
  { id:"sd_xiaoshimei", name:"萝师妹 · 苏沁", desc:`林中收养的奇女子。能听懂百兽语。`, price:32 },
];
const STORE_THEMES = [
  { id:"th_classic", name:"残墟门（默认）", price:0, owned:true },
  { id:"th_blood",   name:"血煞门",         price:128 },
  { id:"th_cloud",   name:"云海仙宗",       price:188 },
];
const STORE_PASSES = [
  { id:"monthly", name:"清虚月卡", price:18, desc:`30 日，每日 +50 灵石、+1 丹药、+1 体力`, duration:30 },
  { id:"season",  name:"残卷外传 · 季票", price:88, desc:"50 阶奖励：限定弟子皮肤、3 段外传剧情、限定客卿、独家凶刀「寒霜」" },
];
