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

// —— 起始弟子（3 + 隐藏祖师）+ 剧情可解锁弟子（locked，藏在名册中） ——
// pic 文件名对应 assets/portraits/
// active=true：当下站在祖师堂；locked=true：剧情解锁
// introScenes：沉浸式自我介绍（多段对白 · 出身/与你关系/愿望/性格瑕疵）
const DISCIPLES_INIT = [
  // —— 起始 3 位（祖师爷 + 2 嫡传 + 你为掌门）——
  {
    id:"chenyuan", name:"陈渊", title:"大弟子", gender:"男", pic:"d_chenyuan",
    age:24, life:120,
    realm:0, exp:30,
    stats:{ root:8, wit:7, mind:5, spirit:6, luck:4 },
    bio:`前掌门捡来的孤儿。沉默寡言，剑法已得六成真传。\n师弟妹们都叫他大师兄，但他自己说："我不过是早来一日。"`,
    bonds:["lingxue:师妹","master:师徒"],
    skill:"长河剑诀",
    weapon:"sw_qinglu",
    intro:`「师父叫我陈渊。\n我七岁那年逃荒到山下，前掌门在雨里把我背了上来。」`,
    introScenes:[
      { bg:"sc_temple", text:`（一个高瘦的青年走上前\n他的剑鞘上挂着一缕褪色的红绸）\n\n「掌门——\n弟子陈渊，二十四岁。\n上代掌门捡我那年，我七岁。」` },
      { bg:"sc_temple", text:`「我没有姓。\n父母死在七荒之乱，连尸体都没找到。\n是上代掌门在山下的雨地里把我背回来的。\n他只问了我一句话：\n\n「孩子，你想活下去吗？」\n我点了头。」`, quote:"——这一点头，便是十七年。" },
      { bg:"sc_courtyard", text:`「师妹凌雪是我亲手教的剑。\n她比我有天赋。\n师父走后，这一脉只剩我和她——\n以及您。\n\n这一脉，是我的家。\n我没别的家了。」` },
      { bg:"sc_temple", text:`「掌门，您不必叫我大师兄。\n我不过是早来一日的孤儿。\n\n但本派的剑\n本派的牌位\n本派的弟子——\n您若信我\n这些事，您交我便是。」`, quote:"——他抱拳，但没下跪。" },
      { bg:"sc_temple", text:`「我有一个夙愿——\n找出杀我父母的那群人。\n但这事，我等了十七年。\n再等几年，也无妨。\n\n本派的事，先于此事。」`, quote:"沉默的人，背的最重。" },
    ],
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
    weapon:"sw_hanshuang",
    intro:`「掌门。\n我叫凌雪。江南崔氏没了之后，我一个人走了三千里路上的山。」`,
    introScenes:[
      { bg:"sc_courtyard", text:`（一个白衣少女走上前\n她耳后别着一支银簪\n簪头有一滴未磨平的旧血）\n\n「掌门——\n崔凌雪，二十二岁。\n江南崔氏的最后一人。」` },
      { bg:"sc_courtyard", text:`「崔氏没的那一年，我十三岁。\n是黑衣人翻进我家后院。\n我娘把我塞进米缸，让我数到一千再出来。\n\n我数到了一千二百。\n出来的时候——\n（她声音很平）\n家里没人了。」`, quote:"——这一支银簪，是娘的最后一件物。" },
      { bg:"sc_battle", text:`「我修的是寒霜九诀。\n（她拔出剑，剑身寒气立时凝出薄霜）\n\n这剑名「寒霜」，是我娘留的。\n我学剑，不为复仇——\n复仇追不回来人。\n\n我学剑，是为了下次再有人来\n我能让那个孩子\n（她顿了一下）\n不必躲在米缸里。」` },
      { bg:"sc_temple", text:`「我与师兄是十四岁那年遇见的。\n他正在演武场练剑——\n练得满手是血。\n他没说什么，只把他的水壶递给我。\n\n那时我才知道——\n人世间还有这种人。」`, quote:"她说这话的时候，没看陈渊。" },
      { bg:"sc_dantang", text:`「掌门，我有一个秘密\n趁现在告诉您——\n\n我突破筑基那一日\n我眉间会浮一缕血纹。\n（她抬眼）\n那是崔氏的家传印记。\n上一代里——\n所有起血纹的女子\n都没活过三十岁。\n\n我希望我能是第一个。」` },
    ],
    flags:{},
  },

  // —— 剧情解锁弟子（初始 locked = true，剧情触发后 active）——
  {
    id:"shixiong", name:"周破军", title:"三弟子", gender:"男", pic:"d_shixiong",
    age:23, life:115,
    realm:0, exp:25,
    stats:{ root:9, wit:5, mind:6, spirit:5, luck:3 },
    bio:`军户之后，性如烈火。本欲投军，被祖师一眼相中。\n他曾发誓："若有一日，必助本派踏平雷霆门。"`,
    bonds:["chenyuan:师兄","master:师徒"],
    skill:"破军刀法",
    weapon:"sw_pojun",
    intro:`「掌门好。\n周破军，军户出身——」`,
    introScenes:[
      { bg:"sc_battle", text:`（一个粗壮的青年抱刀走上前\n他的眉骨上有一道未愈的疤）\n\n「掌门，俺周破军，二十三岁。\n陇西军户的人。」` },
      { bg:"sc_battle", text:`「俺爹是边军，死在雷霆门那帮假道士的剑下。\n那年俺十四。\n娘把家里仅剩的银钱缝在俺褡裢里，\n说："去投军，替爹报仇。"\n\n俺走到一半——\n被祖师爷一眼看穿了俺脸上的杀气。\n他说："孩子，杀气太重，先来这门里压三年。"\n\n俺压了九年。」`, quote:"压住的是杀气，没压住的是仇。" },
      { bg:"sc_temple", text:`「俺这刀，名「破军」。\n是俺爹留的。\n刀身有一道豁口——\n那是当年砍在雷霆门弟子骨头上没挑出来的。\n\n您要打谁——\n指一指就行。\n这刀不闲着。」` },
      { bg:"sc_courtyard", text:`「大师兄是俺最敬的人。\n二师姐是俺最不敢吵的人。\n小师妹——\n（他挠了挠头）\n反正俺谁都不敢欺负。\n\n这一脉，俺当家来护。」` },
    ],
    unlockHint:"剧情 c1s1 之后，途中相遇",
    flags:{ locked:true, hidden:true },
  },
  {
    id:"xiaoyu", name:"沈小雨", title:"小师妹", gender:"女", pic:"d_xiaoyu",
    age:16, life:140,
    realm:0, exp:5,
    stats:{ root:4, wit:8, mind:9, spirit:7, luck:8 },
    bio:"被师兄师姐捡来的弃婴。性子温柔，喜欢吹笛。\n灵识异常敏锐——她说，她能听见祖师堂半夜的脚步声。",
    bonds:["lingxue:师姐"],
    skill:"清音笛谱",
    weapon:"sw_qingyin",
    intro:`「……掌门？\n师姐说我可以叫您师兄……」`,
    introScenes:[
      { bg:"sc_temple", text:`（一个抱竹笛的少女从凌雪身后探出头\n她耳朵很大，像在认真听什么）\n\n「……掌门？\n沈小雨，十六岁。\n大师兄从破庙里把我捡回来的。」` },
      { bg:"sc_temple", text:`「我从七岁开始——\n就听得见别人听不见的东西。\n半夜祖师堂的脚步、藏经阁里的低语、\n甚至演武场上飞过的蜻蜓翅膀。\n\n师姐说我有病，让我吃了五年的安神药。」`, quote:"——但药压不住声音。" },
      { bg:"sc_courtyard", text:`「我不会剑、不会刀。\n大师兄教我的时候我老是分神——\n因为我能听见剑在哭。\n（她抱紧竹笛）\n\n但我会吹笛。\n这支笛，是大师兄给的。\n他说我的笛声——\n能让走神的鬼魂找到回家的路。」` },
      { bg:"sc_temple", text:`「掌门，我有一个心愿——\n\n我想知道我是谁。\n大师兄说我是从破庙捡的。\n但我七岁那年第一次听见的声音，\n是一个女人的——\n她唱着一首江南的童谣。\n\n我想找她。」` },
      { bg:"sc_temple", text:`「您不会嫌我麻烦吧？\n我答应师姐——\n以后只在白天说话\n半夜听见的事，我自己写下来\n不打扰任何人。」`, quote:"她笑了一下，但没看任何人。" },
    ],
    unlockHint:"剧情 c2s1，藏经阁夜话",
    flags:{ locked:true, hidden:true },
  },
  {
    id:"heimo", name:"无名", title:"客卿", gender:"男", pic:"d_heimo",
    age:30, life:80,
    realm:1, exp:120,
    stats:{ root:7, wit:8, mind:3, spirit:9, luck:2 },
    bio:"前掌门留下的不速之客。脸上有道至深的伤疤，从不解释来历。\n他的修为远胜众师兄妹，却始终不入门下。或许，他在等什么。",
    bonds:[],
    skill:"血煞诀",
    weapon:"sw_xueyu",
    intro:`「……\n你不必问我名字。」`,
    introScenes:[
      { bg:"sc_temple", text:`（一个戴兜帽的男子站在堂角\n他不近也不远\n你能看见他脸侧露出的一道深疤）\n\n「……\n你不必问我名字。\n我等的不是你。」`, quote:"他说话的时候，香炉里的烟无故倒卷。" },
      { bg:"sc_temple", text:`「但既然祖师爷把这门派交了出去——\n我可以留几年。\n做你的客卿。\n\n条件是\n你不得问我从哪儿来\n不得问我走过哪些路\n不得在弟子面前提我的名字。」` },
      { bg:"sc_battle", text:`「我修的是血煞诀。\n（他抬起手，掌心有一道未愈的旧血痕）\n\n这功法……\n沾着便难洗。\n所以你们的弟子，最好不要靠我太近。\n小心他们也染上。」` },
      { bg:"sc_temple", text:`「至于愿望——\n（他笑了一下，但眼里没有笑）\n\n我没有什么愿望了。\n上一个有愿望的人\n死在三百年前那一战里。\n\n我留下来\n只是为了亲眼看一眼\n这门派——\n究竟会不会真的死。」`, quote:"他说完，便又退回了堂角。" },
    ],
    unlockHint:"剧情 c3s1，客卿现身",
    flags:{ locked:true, hidden:true, unstable:true, secret:true },
  },
  {
    id:"master", name:"祖师", title:"上代祖师", gender:"男", pic:"d_master",
    age:206, life:210,
    realm:5, exp:500,
    stats:{ root:10, wit:10, mind:10, spirit:10, luck:6 },
    bio:`残墟门第十六代掌门。三百年前一战之后，未曾再出闭关室。\n人们说他还在炼最后一口气——也有人说他早已坐化。\n你接任时，他终于开口："你是第十七代。但愿不是最后一代。"`,
    bonds:[],
    skill:"残卷掌",
    weapon:"sw_canjuan",
    intro:`「孩子，我已三百岁了。」`,
    flags:{ master:true, locked:true, hidden:false },
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

// —— 剧情（7 章 · 每章扩展为多 scene 沉浸式）——
// 每节用 scenes 数组承载多段对白；最后一段附带 choices
// scenes[i]: { bg, speaker, name, text, quote? }
const STORIES = [
  // ============ 第一章 第一节：地窖之兆 ============
  {
    id:"c1s1", chapter:1, day:1, title:"地 窖 之 兆",
    body:"夜深时，祖师堂地窖里传来轻微的窸窣声。",
    quote:"七十年，足够一只蝼蚁成龙，也足够一座宫殿成灰。",
    scenes:[
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`夜，三更。\n\n你接任已是第一日。\n这间祖师堂，三百年没有点亮过这么多烛火。`, },
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`「孩子，你听见了吗？\n\n地窖第三阶的下面——\n有东西在响。」`, },
      { bg:"sc_temple", speaker:"d_chenyuan", name:"陈 渊",
        text:`「掌门，弟子方才巡值，确实听见了。\n\n是从封死的暗格里。\n听上去……像是纸张在动。」`, },
      { bg:"sc_temple", speaker:"d_lingxue", name:"凌 雪",
        text:`「师兄，那暗格三百年没人开过。\n上代师祖闭关前亲自封的。\n\n如今为何会有响动？」`, },
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`「不是别的——\n\n是我封进去的那一卷《祖师残卷》，\n它在等今夜的人去取。」`,
        quote:"卷已自启，问的是你的心。", },
      { bg:"sc_courtyard", speaker:"d_master", name:"祖 师",
        text:`「孩子，你听好——\n\n这卷里写着的，不是什么仙法神通。\n是上一代我没能完成的事，\n是这门派接下来七十年的命数。」`, },
      { bg:"sc_courtyard", speaker:"d_master", name:"祖 师",
        text:`「卷上有八个字，朱砂写的：\n\n「七 十 年，三 大 宗，或 为 尘」\n\n世人都以为是预言。\n我告诉你——它是赌约。」`, },
      { bg:"sc_temple", speaker:"d_chenyuan", name:"陈 渊",
        text:`「掌门……\n\n这一卷取出来，恐怕就回不去了。\n我这两日已在四方之外见过陌生人影。\n\n他们也在找它。」`, },
      { bg:"sc_temple", speaker:"d_lingxue", name:"凌 雪",
        text:`「掌门，听我一句——\n\n要么取，要么不取。\n但今夜你做的决定，整个江湖都会听见。\n\n我与师兄……都听您的。」`, },
      // 最终选项
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`「我已替你将话说尽了。\n\n孩子——\n你打算如何接下这卷，\n以及，这门派？\n\n（取卷之夜过后，山下或将有人闻讯来投——那是你的第三个弟子）」`,
        quote:"取，是赌一回；封，是缓一时；议，是分一份责。", },
    ],
    choices:[
      { label:"取出残卷研读", b:"激进 · 但走得最远", r:{ flag:"got_canjuan", exp:30, giveItem:"sc_canjuan", recruitDisciple:"shixiong" } },
      { label:"封回原处不动", b:"沉稳 · 一切徐徐图之", r:{ flag:"sealed_canjuan", mind:1, recruitDisciple:"shixiong" } },
      { label:"召集弟子彻夜商议", b:"谨慎 · 凡事众议", r:{ flag:"shared_canjuan", rep:5, exp:10, recruitDisciple:"shixiong" } },
    ],
  },

  // ============ 第一章 第二节：大弟子之死 ============
  {
    id:"c1s2", chapter:1, day:1, title:"血 染 演 武 场",
    body:"清晨，演武场。陈渊倒在血泊里。",
    quote:"他若死了，下一个就是我们。",
    scenes:[
      { bg:"sc_battle", speaker:"d_chenyuan", name:"残 影",
        text:`卯时三刻，演武场。\n\n薄雾。\n你是被周破军的吼声惊醒的。`, },
      { bg:"sc_battle", speaker:"d_shixiong", name:"周 破 军",
        text:`「师兄死了！\n\n师……师兄！\n胸口一道剑伤，整整齐齐——\n是高手干的！」`, },
      { bg:"sc_battle", speaker:"d_lingxue", name:"凌 雪",
        text:`「……师兄。\n\n（她跪了下去）\n\n你说过会陪我看完这个春天的。」`, },
      { bg:"sc_battle", speaker:"d_master", name:"祖 师",
        text:`「掌门，看他手里。\n\n他攥得很紧——\n那是一片玉碎。」`, },
      { bg:"sc_battle", speaker:"d_master", name:"祖 师",
        text:`「玉上有半个「雷」字。\n\n是雷霆门的徽记。\n但——\n这玉碎得太整齐，像是故意留的。」`,
        quote:"留得太整齐的线索，往往不是线索。", },
      { bg:"sc_battle", speaker:"d_shixiong", name:"周 破 军",
        text:`「掌门！\n这分明就是雷霆门干的！\n\n给我三天——\n我提刀下山，杀进雷霆门门主的卧房！\n替师兄报仇！」`, },
      { bg:"sc_battle", speaker:"d_lingxue", name:"凌 雪",
        text:`「师弟你冷静些。\n\n（她抹了一把脸上的泪）\n师兄从不会让外人靠近演武场。\n昨夜的人——\n是认识他的人。」`, },
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`「掌门，你听她的。\n\n陈渊不是被杀的——\n他是先放进了凶手，再被凶手所杀。\n\n这就是说……\n咱们这门派里，有内应。」`,
        quote:"敌在外，不可怕；敌在内，先要让你自己怀疑自己。", },
      { bg:"sc_battle", speaker:"d_chenyuan", name:"陈 渊（遗 物）",
        text:`你蹲下身，从陈渊的怀里搜出一封半写完的信。\n\n上面只有一行墨：\n\n「师妹，今夜若我未归——\n请将那封我藏在藏经阁的信，烧了。」`, },
      { bg:"sc_temple", speaker:"d_lingxue", name:"凌 雪",
        text:`「藏经阁……\n（她声音很轻）\n他死前最后一句，是写给我的。\n\n掌门，让我自己去找那封信。\n请允许我一夜不眠。」`, },
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`「孩子。\n\n这一桩，怎么处置都是错。\n但其中有一条，错得最少——\n选哪条，看你的眼光。」`, },
    ],
    choices:[
      { label:"立刻报官，与雷霆门决裂", b:"激进 · 但确立正派姿态", r:{ flag:"war_thunder", rep:30 },
        requireFlag:"investigated_jade", lockHint:"先去名录翻陈渊档案，再细看玉碎来历" },
      { label:"假意不知，秘密追查", b:"暗查 · 隐忍数月", r:{ flag:"secret_invest", exp:50 },
        requireFlag:"investigated_yard", lockHint:"先派一人探演武场，可寻得线索" },
      { label:"将玉碎送回雷霆门", b:"以礼还礼，赌对方的真意", r:{ flag:"return_jade", luck:2, giveItem:"sc_thunder" } },
    ],
  },

  // ============ 第一章 第三节：雷霆门挑衅 ============
  {
    id:"c1s3", chapter:1, day:2, title:"雷 霆 门 叫 阵",
    body:"雷霆门遣使到山下叫阵。",
    quote:"借？借出去的东西，从不会原样回来。",
    scenes:[
      { bg:"sc_courtyard", speaker:"d_shixiong", name:"周 破 军",
        text:`「掌门——\n\n山门下来人了！\n旗号是「雷」字！\n\n是雷霆门的二弟子，叶千岭！\n金丹中期！\n带了三十骑！」`, },
      { bg:"sc_courtyard", speaker:"d_lingxue", name:"凌 雪",
        text:`「他们这是把师兄的死，\n摆在我们脸上来羞辱我们。\n\n（她握紧了寒霜剑）\n师弟，备战。」`, },
      { bg:"sc_battle", speaker:"d_master", name:"祖 师",
        text:`「掌门，你随我下山。\n\n他若是真心吊唁，我便给他三炷香；\n他若是来索物——\n那就让他知道，残墟门虽小，骨头还硬。」`, },
      { bg:"sc_battle", speaker:"d_chenyuan", name:"叶 千 岭",
        text:`（一个白衣男子在山门外抱拳）\n\n「在下雷霆门叶千岭。\n上代家师有一桩旧事，要请贵派归还一物。\n\n那物名「祖师残卷」。」`,
        quote:"旧事？三百年的旧事，是债，不是请。", },
      { bg:"sc_battle", speaker:"d_master", name:"祖 师",
        text:`「叶 二 弟 子。\n\n那卷，是我亲手封的。\n你师爷的「旧事」我比你清楚。\n\n但你既然来了——\n我倒想问：\n你打算如何「请」？」`, },
      { bg:"sc_battle", speaker:"d_chenyuan", name:"叶 千 岭",
        text:`「三日为期。\n借三月，原物奉还。\n\n若不允——\n（他抽出剑）\n请贵派与雷霆门，\n以一战定残卷归属。」`, },
      { bg:"sc_battle", speaker:"d_shixiong", name:"周 破 军",
        text:`「来！\n\n我周破军今日就替师兄收你这条命！\n（他抢上一步）\n掌门——给我一战的机会！」`, },
      { bg:"sc_battle", speaker:"d_lingxue", name:"凌 雪",
        text:`「师弟先退。\n\n（她拉住周破军的衣角）\n这一战的人选，由掌门定。\n\n（她转向你）\n但若你信我——\n请让师弟去。\n他的根骨，是我们之中最强的。」`, },
      { bg:"sc_battle", speaker:"d_master", name:"祖 师",
        text:`「掌门，孩子——\n\n这一战只有三种打法：\n一是凭血气：让破军应战，胜则名声立；\n二是凭暗手：召回三百年前的故人，那个无名；\n三是凭让步：把残卷给他，换三月平安。\n\n选哪条，你自己决。」`, },
      { bg:"sc_battle", speaker:"d_chenyuan", name:"叶 千 岭",
        text:`「贵派若仍在犹豫——\n\n那便让在下问一句：\n陈大弟子的剑伤，\n是否已经查清？」`,
        quote:"他这一句，是赤裸裸的挑衅，也是赤裸裸的提示。", },
    ],
    choices:[
      { label:"接战 · 派周破军应敌", b:"破军根骨最强，胜算 60%", r:{ unlock:"q_009", flag:"accepted_war" },
        requireFlag:"strong_team", lockHint:"门下需有人达至筑基境（修为满 100 后突破）" },
      { label:"暗中召回客卿无名", b:"强力 · 但他要价你不可控", r:{ unlock:"q_009", flag:"called_heimo", heimoMood:-2, recruitDisciple:"heimo" },
        requireFlag:"got_canjuan", lockHint:"先在 D1 取出残卷，方能联络无名" },
      { label:"借出残卷换三月平安", b:"屈辱 · 但保门户暂安", r:{ flag:"surrender_canjuan", rep:-50 } },
    ],
  },

  // ============ 第二章 第一节：小雨的笛声 ============
  {
    id:"c2s1", chapter:2, day:3, title:"藏 经 阁 笛 声",
    body:"雨夜，藏经阁。",
    quote:"她的灵识，比这门派的任何人都强。",
    scenes:[
      { bg:"sc_courtyard", speaker:"d_master", name:"祖 师",
        text:`雨夜，亥时。\n\n藏经阁外的雨下了三个时辰。\n你正翻阅这一日的账册——\n忽听阁中深处传来笛声。`, },
      { bg:"sc_courtyard", speaker:"d_master", name:"祖 师",
        text:`「孩子，那是清音笛。\n\n本派只有一支——\n小雨随身带着，不许任何人碰。\n\n她此刻不该在阁里。\n那地方藏着前几代的禁书。」`, },
      { bg:"sc_temple", speaker:"d_xiaoyu", name:"沈 小 雨",
        text:`（你推开藏经阁的门——\n月光从破窗洒下\n一个抱着竹笛的少女背影坐在祖师残骸前）\n\n「师兄……\n是你吗？」`, },
      { bg:"sc_temple", speaker:"d_xiaoyu", name:"沈 小 雨",
        text:`（她转过头，眼里是月光也是水光）\n\n「掌门——\n我又听见了。\n半夜里走路的，不是祖师爷。\n\n我能数出他的脚步。\n一共一百零八步。」`,
        quote:"她数的不是脚步，是节拍——是某种诀法的节拍。", },
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`「孩子……\n（你从未听过她的声音这样苍老）\n\n小雨能听见的，\n是三百年前那一战的回响。\n\n她不是在说鬼故事——\n她是在告诉我们：\n那一战还没结束。」`, },
      { bg:"sc_temple", speaker:"d_xiaoyu", name:"沈 小 雨",
        text:`「掌门……\n我有一个秘密。\n\n我从七岁起，就听见这些声音。\n师姐说我有病，让我吃了五年安神药。\n\n但今夜——\n我把药扔了。\n因为我听见了\n上一代师兄留给您的话。」`, },
      { bg:"sc_temple", speaker:"d_xiaoyu", name:"沈 小 雨",
        text:`「他说……\n\n「让她听。\n听完一百零八步，\n这门派的命，便有了第二条出路。」」`,
        quote:"她在说自己是谁——而你刚刚才知道她姓什么。", },
      { bg:"sc_temple", speaker:"d_lingxue", name:"凌 雪",
        text:`（凌雪带着雨闯进来）\n\n「掌门！\n小雨怎么自己进了藏经阁？！\n\n她体质弱，半夜听这些会损寿元的——\n请掌门下令，让她回房。」`, },
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`「孩子，难处来了——\n\n顺着她的灵识，让她继续听，\n你能在三个月内查清地窖那卷的真伪。\n但她损寿。\n\n护住她，让她断了听，\n她安全，但这个门派少了一双能听见死人话的耳朵。」`, },
      { bg:"sc_temple", speaker:"d_xiaoyu", name:"沈 小 雨",
        text:`「掌门——\n我自己愿意听下去的。\n\n（她抱着笛子站起来）\n我从来没有过\n能让师兄们以我为骄傲的机会。\n\n请……\n让我做这一回。」`, },
    ],
    choices:[
      { label:"让她继续听", b:"利用她的天赋追查地窖", r:{ flag:"xiaoyu_listen", spirit:1, recruitDisciple:"xiaoyu" } },
      { label:"严令她不许再来", b:"保护她免于卷入", r:{ flag:"protect_xiaoyu", mind:2, recruitDisciple:"xiaoyu" } },
    ],
  },

  // ============ 第二章 第二节：邻派来访 ============
  {
    id:"c2s2", chapter:2, day:4, title:"落 霞 谷 主 来 访",
    body:"落霞谷主清虚老人亲自上山。",
    quote:"江湖上的盟，从来都是单方面的。",
    scenes:[
      { bg:"sc_courtyard", speaker:"d_master", name:"祖 师",
        text:`第七日，巳时。\n\n落霞谷遣信前一日。\n今日清虚老人亲来——\n带了三车丹药，半队随从。`, },
      { bg:"sc_courtyard", speaker:"d_lingxue", name:"凌 雪",
        text:`「掌门，他这副阵仗。\n（她低声）\n\n要么是真要结盟，\n要么……\n是来摸我们的底。」`, },
      { bg:"sc_courtyard", speaker:"d_master", name:"清 虚 老 人",
        text:`「掌门——\n\n（一个白须老者拱手）\n落霞谷主清虚，前来道贺。\n听闻贵派新接 第十七 代——\n这是落霞谷的薄礼。\n三车回元丹，每一颗都能延寿一年。」`, },
      { bg:"sc_courtyard", speaker:"d_master", name:"清 虚 老 人",
        text:`「贵派若有意——\n落霞愿与残墟门结永世之盟。\n\n条件嘛……\n（他笑了笑）\n微薄。\n只请贵派将那卷《祖师残卷》\n抄一份副本，借老朽过目三日。\n仅此而已。」`,
        quote:"白须越白，话越甜，刀越快。", },
      { bg:"sc_courtyard", speaker:"d_master", name:"祖 师",
        text:`「孩子，他这一句「过目三日」——\n\n就是要把残卷抄走。\n副本一旦出门，便不再是残卷。\n落霞谷的人，能从一字推到一卷。」`, },
      { bg:"sc_courtyard", speaker:"d_shixiong", name:"周 破 军",
        text:`「掌门！\n这老儿明摆着是来揩油的！\n\n（他声音压得不太低）\n回三车丹药？\n那三车丹药我们用三十年都用不完！\n但我们的命脉——\n就这一卷！」`, },
      { bg:"sc_courtyard", speaker:"d_lingxue", name:"凌 雪",
        text:`「师弟，话不能这么说。\n（她拉住周破军）\n\n落霞谷与雷霆门隔着五十里。\n他们若与我们结盟——\n至少能让叶千岭三月不敢上山。」`, },
      { bg:"sc_courtyard", speaker:"d_master", name:"清 虚 老 人",
        text:`「掌门可以慢慢想。\n（他端起茶）\n\n但有一句话老朽要先说在前——\n这门派若想七十年内活下来，\n仅凭你们这几个孩子\n（他扫了一眼周凌二人）\n是远远不够的。\n你们需要朋友。」`, },
      { bg:"sc_courtyard", speaker:"d_master", name:"祖 师",
        text:`「孩子，三条路——\n\n答应抄录：得盟友，泄密风险高，但暂安；\n婉拒赠丹：礼数全，不立盟，落霞谷将冷淡；\n反向要求：硬气，让他抄落霞秘籍给你看，可能撕破脸。\n\n落霞谷主在等你。」`, },
    ],
    choices:[
      { label:"答应抄录副本", b:"得盟友 · 但泄密风险高", r:{ flag:"ally_luoxia", rep:40, scroll:-1, giveItem:[{id:"pill_huiyuan",n:3}] } },
      { label:"婉拒并赠丹药", b:"礼数全 · 不立盟", r:{ flag:"polite_refuse", pill:-1, rep:10 } },
      { label:"反向要求落霞抄录他们的", b:"硬气 · 但可能失去盟友", r:{ flag:"counter_offer", rep:5, giveItem:"sc_xuanyin" } },
    ],
  },

  // ============ 第二章 第三节：渡劫预兆 ============
  {
    id:"c2s3", chapter:2, day:5, title:"凌 雪 的 血 纹",
    body:"凌雪在闭关三日后突破至筑基。",
    quote:"每一次突破，都是一次与天争命。",
    scenes:[
      { bg:"sc_dantang", speaker:"d_lingxue", name:"凌 雪",
        text:`第九日，凌晨。\n\n丹房。\n你被丹炉的轰鸣惊醒——\n推开门，凌雪坐在炉前，\n眉间一丝血纹缓缓浮起。`, },
      { bg:"sc_dantang", speaker:"d_lingxue", name:"凌 雪",
        text:`「师兄……\n（她睁开眼）\n\n我突破了。\n筑基期，初阶。\n\n但……\n我的眉间，有东西在动。\n我看不见自己，但我感觉得到。」`, },
      { bg:"sc_dantang", speaker:"d_master", name:"祖 师",
        text:`（你疾步上前——\n那血纹细得像一缕红丝\n却分明在她眉骨下流动）\n\n「孩子！\n（祖师声音从墙后传来）\n血纹现，五年内必渡心魔劫！」`,
        quote:"心魔劫——三大宗里活下来的，每十人不过两人。", },
      { bg:"sc_dantang", speaker:"d_xiaoyu", name:"沈 小 雨",
        text:`（小雨抱着笛子赶来）\n\n「师姐！\n你眉间的纹……\n师姐你不要怕。\n我替你听过了——\n那一丝纹里，有上一代师母的声音。」`, },
      { bg:"sc_dantang", speaker:"d_lingxue", name:"凌 雪",
        text:`（她笑了一下，很疲惫）\n\n「上代师母……\n小雨，你听见的真是她？\n她说什么了？」`, },
      { bg:"sc_dantang", speaker:"d_xiaoyu", name:"沈 小 雨",
        text:`「师母说——\n\n「五年。\n五年里，你必须把寒霜剑\n练到第三重。\n否则那一劫，\n你便要陪我下去。」」`,
        quote:"上一代师母，便是渡劫失败而殁的。", },
      { bg:"sc_dantang", speaker:"d_shixiong", name:"周 破 军",
        text:`「师姐！\n（他冲进来）\n你师姐怎么样了？\n\n（看见血纹）\n……\n（他沉默了一会儿）\n\n这一道纹，是我父亲死前也起过的。\n我父亲就死在心魔上。」`, },
      { bg:"sc_dantang", speaker:"d_master", name:"祖 师",
        text:`「掌门，听好——\n\n护她，需四颗渡劫丹，提前布阵。\n那是本派全部丹药家底。\n用了，三个月内任何派遣都吃不消。\n\n不护她——\n她未必死，\n但若死，便是我们这门派一笔重账。」`, },
      { bg:"sc_dantang", speaker:"d_lingxue", name:"凌 雪",
        text:`「掌门——\n\n（她拉住你的衣角）\n您不必为我去赌门派。\n我是江南崔氏的女儿。\n我从小就知道：\n命数这种东西，赌不赢的。\n\n该来的，让它来吧。」`, },
    ],
    choices:[
      { label:"备好丹药，全力护她", b:"消耗 4 丹药 · 提前布阵", r:{ pill:-4, flag:"prep_lingxue", rep:5 }, requirePill:4 },
      { label:"任其自然，劫由命定", b:"她若过不去，是她的命数", r:{ flag:"fate_lingxue" } },
    ],
  },

  // ============ 第三章 第一节：客卿真名 ============
  {
    id:"c3s1", chapter:3, day:6, title:"客 卿 揭 面",
    body:"无名出现在你面前，褪下兜帽。",
    quote:"我不是来助你的。我是来告别的。",
    scenes:[
      { bg:"sc_temple", speaker:"d_heimo", name:"无 名",
        text:`第十二日，子时。\n\n祖师堂。\n你独自坐在祖师残骸前焚香——\n忽然背后一阵冷风。`, },
      { bg:"sc_temple", speaker:"d_heimo", name:"无 名",
        text:`「掌门。\n（一个低沉的声音）\n\n我等这一夜，等了三百年。\n\n（他从香烟里走出，褪下兜帽）」`, },
      { bg:"sc_temple", speaker:"d_heimo", name:"无 名",
        text:`（你看着他的脸——\n那是一张你只在本派旧画像里见过的脸\n本应在三百年前殒命的人）\n\n「我是上一代二弟子。\n我没死。\n祖师爷封了我一口气，\n让我替他守着这门派——\n直到第十七代出现。」`,
        quote:"三百年前那一战，门派表面只有祖师爷活下来——其实活下来两个人。", },
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`（祖师爷的声音从闭关室深处传来）\n\n「孩子……\n是该让他出来了。\n\n这门派的事，他比我清楚。\n我封他，是怕他再走那一条路。\n\n如今你来了——\n他可以走了。」`, },
      { bg:"sc_temple", speaker:"d_heimo", name:"无 名",
        text:`「我曾是这门派的二弟子。\n大师兄死于雷霆门主之手——\n那一战之后，我成了门派最后一名男弟子。\n\n我提刀屠尽了雷霆门半座山。\n但我留下了门主——\n因为他对我说了一句话。」`, },
      { bg:"sc_temple", speaker:"d_chenyuan", name:"雷 门 主",
        text:`（无名的回忆里，那个白发男子说）\n\n「孩子，三百年后，\n这世间将再有一卷残卷。\n那时若你不愿守，\n来雷霆门——\n我教你忘记一切。」`, },
      { bg:"sc_temple", speaker:"d_heimo", name:"无 名",
        text:`「我没去。\n我让祖师封了我。\n\n但今夜——\n我感受到了那卷的气息。\n它已被取出——\n（他看了你一眼）\n\n这意味着，三百年前那个赌约，\n生效了。」`,
        quote:"那个赌约——是上一代的两位掌门，用三百年的时间，赌一个人能不能成全门派。", },
      { bg:"sc_temple", speaker:"d_lingxue", name:"凌 雪",
        text:`（凌雪与小雨闯进来）\n\n「掌门！\n这人……他是谁？\n\n（她警觉地拔剑）\n小雨说半夜走路的，就是他！」`, },
      { bg:"sc_temple", speaker:"d_xiaoyu", name:"沈 小 雨",
        text:`「师姐——\n（她轻声）\n他不是坏人。\n他走路的节拍\n是上代师兄的节拍。\n\n他……是回家。」`, },
      { bg:"sc_temple", speaker:"d_heimo", name:"无 名",
        text:`「掌门——\n\n我可以走，也可以留。\n走，我去找雷霆门主，了三百年的债；\n留，我陪你走过下一个三年，\n替你打三场宗门战。\n\n但留下来\n我会拖累你的弟子\n（他看了凌雪一眼）\n血煞之气，沾着便难洗。」`, },
      { bg:"sc_temple", speaker:"d_master", name:"祖 师",
        text:`「孩子，这是个最难的选择。\n\n放他走——\n你失一强援，得一份正气。\n\n求他留——\n你多三场胜局，背一份债。\n\n你听他说，也听门里弟子说。\n然后你决定。」`, },
    ],
    choices:[
      { label:"放他走，自寻雷霆门主", b:"承担因果，宗门失一强援", r:{ flag:"heimo_left", rep:-20, giveItem:"sw_xueyu" } },
      { label:"求他再留三年", b:"换三场宗门战的胜机", r:{ flag:"heimo_stay", heimoMood:5, recruitDisciple:"heimo" } },
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

// ============================================================
// —— 七大派情报（世界观面板）——
// ============================================================
const SECTS_WORLD = [
  {
    id:"sect_us", name:"残墟门", role:"本派",
    align:"中立", power:1, danger:0, distance:0,
    leader:"第十七代掌门（你）",
    style:"剑修 · 旧派遗法",
    note:`三百年前的九派十宗之一。一战之后，弟子尽殁，殿宇焚尽。\n上代祖师爷封一口气坐镇至今。\n如今由你接任，第十七代。\n眼下声望「无名小派」，但残卷在手——\n七十年内，要么三大宗，要么尘。`,
    relation:"自家",
  },
  {
    id:"sect_thunder", name:"雷霆门", role:"主敌",
    align:"正派偏霸道", power:8, danger:9, distance:1,
    leader:"门主 · 叶崇山（金丹后期）",
    style:"雷诀 · 正面碾压",
    note:`离我们最近的大派，剑走极端。\n三百年前那一战，雷霆门是站在残墟门对面的。\n他们对残卷觊觎已久——眼下二弟子叶千岭已下山。\n首要威胁。`,
    relation:"宿敌 · 现敌",
  },
  {
    id:"sect_luoxia", name:"落霞谷", role:"中立 · 商盟",
    align:"中立偏圆滑", power:6, danger:5, distance:2,
    leader:"谷主 · 清虚老人（化神初期）",
    style:"丹道 · 商旅",
    note:`西南落霞谷。最圆滑的一派——\n谁强他们结谁，谁弱他们卖谁。\n但他们的丹药真材实料，且能让你的人活得更久。\n值得交，但不可深交。`,
    relation:"中立 · 待结盟",
  },
  {
    id:"sect_xuanyin", name:"玄阴宗", role:"暗手",
    align:"邪派 / 操盘者", power:9, danger:10, distance:3,
    leader:"宗主 · 不知姓名（疑似元婴）",
    style:"血煞 · 操控",
    note:`挂着邪派之名，实则没人见过他们正面出手。\n外传当年残墟门那场祸，是他们布的局——\n但你眼下没有证据。\n小心：他们最爱「无名小派」这种棋子。`,
    relation:"幕后 · 危险",
  },
  {
    id:"sect_ziwei", name:"紫薇阁", role:"朝廷之鞭",
    align:"正派 / 朝廷牵线", power:7, danger:6, distance:4,
    leader:"阁主 · 沈鸾衣（化神中期）",
    style:"符箓 · 朝廷令牌",
    note:`朝廷的爪牙，专管正邪两道。\n如果你成长得太快，他们会先来「问询」。\n他们能给你正名，也能让你一夜消失。\n规矩：永远别在他们面前说「乱世」二字。`,
    relation:"中立 · 监视",
  },
  {
    id:"sect_xueyue", name:"血月教", role:"边塞乱党",
    align:"邪派", power:5, danger:7, distance:5,
    leader:"教主 · 红裳婆婆（金丹巅峰）",
    style:"血祭 · 蛊毒",
    note:`西北边塞的乱党。教众多为流民、女修。\n手段狠，但人少。\n眼下不会找你——除非你声望涨到了让她们眼红。`,
    relation:"潜在 · 暂未交锋",
  },
  {
    id:"sect_xuxian", name:"虚仙宗", role:"远方仙派",
    align:"正派 · 隐世", power:10, danger:3, distance:9,
    leader:"宗主 · 不肯露面",
    style:"飞升一脉",
    note:`七十年大劫的另一道传言：虚仙宗或将下山。\n他们三百年没出过一个弟子——\n但每一个出山的，都是大乘之上。\n眼下与你无关。\n但若七十年内你走到了三大宗——\n他们会请你喝一杯茶。`,
    relation:"高远 · 仰望",
  },
];

// —— 宗门等级（点击宗名可查看）——
const SECT_LEVELS = [
  { rep:0,    name:"无名小派",  perks:["眼下：弟子上限 3"] },
  { rep:30,   name:"山野偏宗",  perks:["弟子上限 +1","可派遣 ≤ diff 3 任务"] },
  { rep:80,   name:"江湖小有",  perks:["弟子上限 +1","坊市散修概率 +20%","解锁 c2 章节"] },
  { rep:200,  name:"一方名宗",  perks:["弟子上限 +1","解锁宗门战","邻派来访概率上升"] },
  { rep:500,  name:"声名远播",  perks:["弟子上限 +2","可挑战雷霆门","解锁 c3 章节"] },
  { rep:1000, name:"三大宗一",  perks:["七十年大劫胜机大开","解锁 c5+ 章节","可邀请客卿入门"] },
];

// ============================================================
// —— 道具系统：武器 / 丹药 / 礼物 / 杂物 ——
// ============================================================
// type: weapon / pill / gift / scroll / misc
// rarity: 1-5（决定底色）
// icon: assets/icons/it_xxx.png
const ITEMS = [
  // —— 武器（为后续战斗系统埋点） ——
  { id:"sw_qinglu",   type:"weapon", rarity:3, name:"青庐剑",      icon:"it_sw_qinglu",   slot:"sword", atk:18, ability:"长河之势 · 攻击带破甲",       lore:`陈渊随身佩剑。剑鞘上「青庐」二字是前掌门亲题。` },
  { id:"sw_hanshuang",type:"weapon", rarity:4, name:"寒霜剑",      icon:"it_sw_hanshuang",slot:"sword", atk:22, ability:"寒霜 · 命中后冰封 1 回合",     lore:`凌雪母亲遗物。江南崔氏家传。` },
  { id:"sw_pojun",    type:"weapon", rarity:3, name:"破军刀",      icon:"it_sw_pojun",    slot:"sabre", atk:24, ability:"破军 · 重击概率 +25%",         lore:`军户传家刀。刀身有一道未磨平的豁口。` },
  { id:"sw_qingyin",  type:"weapon", rarity:4, name:"清音笛",      icon:"it_sw_qingyin",  slot:"music", atk:12, ability:"清音 · 抚琴回血 + 减伤",       lore:`小雨随身竹笛。一节断过，用银丝绕过。` },
  { id:"sw_xueyu",    type:"weapon", rarity:5, name:"血煞匕",      icon:"it_sw_xueyu",    slot:"dagger",atk:30, ability:"血煞 · 杀敌后回血 30%",         lore:`无名所携。从不见出鞘——出鞘必见血。` },
  { id:"sw_canjuan",  type:"weapon", rarity:5, name:"残卷",        icon:"it_sw_canjuan",  slot:"scroll",atk:0,  ability:"祖师残卷 · 提升全员悟性",       lore:`祖师爷留给第十七代的最后一卷。` },
  { id:"sw_iron",     type:"weapon", rarity:1, name:"铁剑",        icon:"it_sw_iron",     slot:"sword", atk:6,  ability:"普通铁剑",                       lore:`新弟子入门首发。` },
  { id:"sw_sunmoon",  type:"weapon", rarity:5, name:"日月双轮",    icon:"it_sw_sunmoon",  slot:"twin",  atk:34, ability:"双轮 · 双击 / 暴击 +30%",       lore:`传闻虚仙宗弟子佩物。眼下你只能从幻境中见过。` },

  // —— 丹药 ——
  { id:"pill_ningshen",type:"pill",   rarity:2, name:"凝神丹",     icon:"it_pill_ningshen",effect:`修为 +30 / 心境 +1`, lore:`本派丹房产物。` },
  { id:"pill_huiyuan", type:"pill",   rarity:3, name:"回元丹",     icon:"it_pill_huiyuan", effect:`恢复全部体力 / 寿元 +1`, lore:`落霞谷流传。` },
  { id:"pill_dagong",  type:"pill",   rarity:4, name:"大功丹",     icon:"it_pill_dagong",  effect:`修为 +120 / 概率走火 5%`, lore:`不可常服。` },
  { id:"pill_dujie",   type:"pill",   rarity:5, name:"渡劫丹",     icon:"it_pill_dujie",   effect:`渡劫成功率 +25%`, lore:`万金难求。` },

  // —— 礼物（送弟子用，提升好感） ——
  { id:"gf_silkfan",   type:"gift",   rarity:2, name:"绢面扇",     icon:"it_gf_silkfan",   target:["lingxue","xiaoyu"], bond:6, lore:`江南绣坊货色。` },
  { id:"gf_armor",     type:"gift",   rarity:3, name:"软甲",       icon:"it_gf_armor",     target:["chenyuan","shixiong"],bond:5,lore:`雷霆门外贸的次品。` },
  { id:"gf_inkstone",  type:"gift",   rarity:3, name:"古砚",       icon:"it_gf_inkstone",  target:["all"], bond:4, lore:`紫薇阁退下来的旧物。` },
  { id:"gf_winejar",   type:"gift",   rarity:2, name:"竹叶酒",     icon:"it_gf_winejar",   target:["heimo","shixiong"], bond:7, lore:`蜀地竹林酿。` },
  { id:"gf_silvercomb",type:"gift",   rarity:4, name:"银梳",       icon:"it_gf_silvercomb",target:["lingxue","xiaoyu"], bond:9, lore:`描金有「平安」二字。` },

  // —— 杂物 ——
  { id:"sc_canjuan",   type:"scroll", rarity:5, name:"祖师残卷",   icon:"it_sc_canjuan",   effect:`关键道具 · 主线必需`, lore:`地窖第三阶下取出。` },
  { id:"sc_thunder",   type:"scroll", rarity:4, name:"雷霆决残页", icon:"it_sc_thunder",   effect:`习之可减雷劫伤害`, lore:`从雷霆门挑衅者手中夺得。` },
  { id:"sc_xuanyin",   type:"scroll", rarity:5, name:"玄阴卷",     icon:"it_sc_xuanyin",   effect:`习之可入邪 / 增血煞`, lore:`无名留下的半卷。` },
];

// 按 type 分组（背包用）
function ITEMS_BY_TYPE(type){ return ITEMS.filter(i => i.type===type); }
function ITEM(id){ return ITEMS.find(i => i.id===id); }
