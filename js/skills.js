/* ================================================================
   技能树系统
   ================================================================ */
const Skills = (() => {

  const ELEM_COLOR = { metal:"#c9a35a", wood:"#5b8a72", water:"#5c8aa8", fire:"#a83236", earth:"#7a5c3a" };
  const ELEM_NAME  = { metal:"金", wood:"木", water:"水", fire:"火", earth:"土" };

  const COMMON = {
    metal_phys: { name:"金 · 物理 · 凿岩诀", element:"metal", type:"phys", leaves:[
      { id:"mp1", name:"裂金一斩", tier:0, req:{root:5},  effect:"攻击 +5% / 破甲 +1",     lore:"剑过处，金石含裂痕。" },
      { id:"mp2", name:"金锋寸劲", tier:1, req:{root:8},  effect:"重击概率 +10%",           lore:"寸劲入骨，骨断金鸣。" },
      { id:"mp3", name:"无相凿天", tier:2, req:{root:11}, effect:"攻击 +12% / 暴伤 +25%",  lore:"以肉身为凿，凿穿天意。" },
      { id:"mp4", name:"金身不坏", tier:3, req:{root:14}, effect:"受伤 -20% / 反弹 5%",     lore:"金不烂，骨不朽。" },
      { id:"mp5", name:"上九天",   tier:4, req:{root:18}, effect:"全伤害 +30% · 终结",      lore:"九重金气贯星河。" },
    ]},
    metal_magic: { name:"金 · 法术 · 锐金诀", element:"metal", type:"magic", leaves:[
      { id:"mm1", name:"金钟初鸣", tier:0, req:{spirit:5},  effect:"法伤 +5% / 心境 +1",   lore:"一念成钟，万法澄明。" },
      { id:"mm2", name:"金针刺心", tier:1, req:{spirit:8},  effect:"沉默 1 回合",           lore:"针入心位，杂念俱断。" },
      { id:"mm3", name:"破阵金光", tier:2, req:{spirit:11}, effect:"穿透阵法 / 法伤 +15%", lore:"光之所向，阵法为尘。" },
      { id:"mm4", name:"金身罩",   tier:3, req:{spirit:14}, effect:"团队减伤 15%",          lore:"金气覆下，万邪不侵。" },
      { id:"mm5", name:"九转金丹", tier:4, req:{spirit:18}, effect:"复活 1 次 · 终结",      lore:"九转之后，命数回旋。" },
    ]},
    wood_phys: { name:"木 · 物理 · 春藤诀", element:"wood", type:"phys", leaves:[
      { id:"wp1", name:"藤鞭缠骨", tier:0, req:{root:5},  effect:"攻击 +3% / 缠绕",       lore:"春藤无声，缚住虎熊。" },
      { id:"wp2", name:"林涛势",   tier:1, req:{root:8},  effect:"群攻概率 +20%",           lore:"林动风随，势如海涛。" },
      { id:"wp3", name:"木兰回春", tier:2, req:{root:11}, effect:"回血 15% / 攻击 +10%",    lore:"花开见骨，骨愈生肉。" },
      { id:"wp4", name:"千木为甲", tier:3, req:{root:14}, effect:"防御 +30%",               lore:"千万木叶皆为我衣。" },
      { id:"wp5", name:"参天",     tier:4, req:{root:18}, effect:"召树灵助战 · 终结",       lore:"一根入地，撼动云霄。" },
    ]},
    wood_magic: { name:"木 · 法术 · 青木诀", element:"wood", type:"magic", leaves:[
      { id:"wm1", name:"青木种心", tier:0, req:{wit:5},  effect:"法伤 +5% / 悟性 +1",      lore:"心中种下一木，万象自知。" },
      { id:"wm2", name:"春雷化雨", tier:1, req:{wit:8},  effect:"群体回血 10%",             lore:"惊雷过后，万物苏生。" },
      { id:"wm3", name:"百花迷魂", tier:2, req:{wit:11}, effect:"魅惑 1 回合 / 法伤 +12%",  lore:"百花一顾，倾国倾城。" },
      { id:"wm4", name:"扶桑神木", tier:3, req:{wit:14}, effect:"团队回血 + 净化",          lore:"扶桑高千丈，可栖凤凰。" },
      { id:"wm5", name:"轮回",     tier:4, req:{wit:18}, effect:"逆转伤害 · 终结",          lore:"花开花落，皆是我意。" },
    ]},
    water_phys: { name:"水 · 物理 · 寒涛诀", element:"water", type:"phys", leaves:[
      { id:"sp1", name:"寒涛初涌", tier:0, req:{spirit:5},  effect:"攻击 +3% / 减速",        lore:"寒涛涌起，气贯长河。" },
      { id:"sp2", name:"逆流斩",   tier:1, req:{spirit:8},  effect:"反击概率 +15%",           lore:"逆其流而斩之，势不可挡。" },
      { id:"sp3", name:"千江入海", tier:2, req:{spirit:11}, effect:"连击 +1 / 攻击 +10%",     lore:"百川归海，势不可阻。" },
      { id:"sp4", name:"鲸吞",     tier:3, req:{spirit:14}, effect:"吞噬伤害转化为修为",      lore:"鲸吞星海，骨亦化海。" },
      { id:"sp5", name:"九渊",     tier:4, req:{spirit:18}, effect:"对方攻击降 30% · 终结",   lore:"渊深无底，终归一处。" },
    ]},
    water_magic: { name:"水 · 法术 · 寒霜诀", element:"water", type:"magic", leaves:[
      { id:"sm1", name:"寒霜起",   tier:0, req:{spirit:5},  effect:"法伤 +5% / 冰封 5%",     lore:"寒霜一夜，江河倒流。" },
      { id:"sm2", name:"凝水成冰", tier:1, req:{spirit:8},  effect:"冰封 1 回合",             lore:"水之极，便是冰之始。" },
      { id:"sm3", name:"潮汐",     tier:2, req:{spirit:11}, effect:"群体减速 / 法伤 +12%",    lore:"潮起潮落，皆是我意。" },
      { id:"sm4", name:"九霄寒月", tier:3, req:{spirit:14}, effect:"冰封 + 法伤 +20%",        lore:"月落寒山，万物皆冻。" },
      { id:"sm5", name:"冰封万古", tier:4, req:{spirit:18}, effect:"全场冰封 · 终结",         lore:"一念成冰，万古不化。" },
    ]},
    fire_phys: { name:"火 · 物理 · 烈炎诀", element:"fire", type:"phys", leaves:[
      { id:"fp1", name:"烈火踏",   tier:0, req:{root:5},  effect:"攻击 +5% / 灼烧",        lore:"踏出一步，皆是焦土。" },
      { id:"fp2", name:"破军刀",   tier:1, req:{root:8},  effect:"破甲 +2 / 暴伤 +20%",    lore:"刀过处，军阵尽破。" },
      { id:"fp3", name:"狂炎舞",   tier:2, req:{root:11}, effect:"连击 +2 / 暴击 +15%",    lore:"狂舞之时，谁与争锋？" },
      { id:"fp4", name:"焚天",     tier:3, req:{root:14}, effect:"群体灼烧 / 攻击 +20%",   lore:"天若焚我，我便焚天。" },
      { id:"fp5", name:"燎原",     tier:4, req:{root:18}, effect:"全场灼烧 · 终结",         lore:"星火一点，可成燎原。" },
    ]},
    fire_magic: { name:"火 · 法术 · 心火诀", element:"fire", type:"magic", leaves:[
      { id:"fm1", name:"心火初炼", tier:0, req:{mind:5},  effect:"法伤 +5% / 心境 +1",     lore:"心头一点火，照尽八方暗。" },
      { id:"fm2", name:"赤焰术",   tier:1, req:{mind:8},  effect:"灼烧 + 法伤 +10%",        lore:"赤焰起时，魂魄尽烧。" },
      { id:"fm3", name:"业火",     tier:2, req:{mind:11}, effect:"对邪派伤害 +30%",          lore:"业火之中，无可遁形。" },
      { id:"fm4", name:"九阳",     tier:3, req:{mind:14}, effect:"光明属性 / 团队加成",      lore:"九阳齐照，邪不可视。" },
      { id:"fm5", name:"凤凰浴",   tier:4, req:{mind:18}, effect:"复活 1 次 · 终结",         lore:"焚尽一身，重铸金骨。" },
    ]},
    earth_phys: { name:"土 · 物理 · 厚土诀", element:"earth", type:"phys", leaves:[
      { id:"ep1", name:"厚土脊", tier:0, req:{root:5},  effect:"防御 +10%",                lore:"脊厚如山，难撼难摇。" },
      { id:"ep2", name:"裂地势", tier:1, req:{root:8},  effect:"群攻 / 减速",                lore:"地为之裂，敌为之颤。" },
      { id:"ep3", name:"山岳压", tier:2, req:{root:11}, effect:"控制 1 回合 / 攻击 +10%",  lore:"以山为躯，以岳为意。" },
      { id:"ep4", name:"金刚体", tier:3, req:{root:14}, effect:"减伤 30% / 反伤 10%",       lore:"金刚之躯，刀剑难入。" },
      { id:"ep5", name:"地心",   tier:4, req:{root:18}, effect:"地心束缚全场 · 终结",       lore:"以一念，召地心之火。" },
    ]},
    earth_magic: { name:"土 · 法术 · 黄庭诀", element:"earth", type:"magic", leaves:[
      { id:"em1", name:"黄庭初定", tier:0, req:{mind:5},  effect:"心境 +1 / 法防 +10%",     lore:"黄庭一定，万邪自退。" },
      { id:"em2", name:"土遁",     tier:1, req:{mind:8},  effect:"闪避 +20%",                lore:"入土三尺，谁能见我？" },
      { id:"em3", name:"地脉",     tier:2, req:{mind:11}, effect:"恢复 + 法伤 +10%",          lore:"地脉之中，藏有大道。" },
      { id:"em4", name:"五行归元", tier:3, req:{mind:14}, effect:"五行抗性 +25%",             lore:"五行归元，万法不侵。" },
      { id:"em5", name:"承天载道", tier:4, req:{mind:18}, effect:"全队加成 · 终结",            lore:"以己身，承天地之道。" },
    ]},
  };

  const SIGNATURE = {
    chenyuan: { name:"长 河 剑 诀", element:"water", type:"signature", leaves:[
      { id:"ch1", name:"涓 流 式", tier:0, req:{root:5},          effect:"剑形流转 / 闪避 +10%",  lore:"我十二岁那年学的第一招。" },
      { id:"ch2", name:"长河一横", tier:1, req:{root:9},          effect:"横扫一片 / 攻击 +12%",  lore:"上代掌门说：剑横处，江河皆退。" },
      { id:"ch3", name:"逝者如斯", tier:2, req:{root:13},         effect:"连击 +3 / 暴伤 +30%",   lore:"——孔子也佩剑。" },
      { id:"ch4", name:"百川入海", tier:3, req:{root:16,mind:10}, effect:"团队加成 / 攻击 +15%",  lore:"我背的不只是这门派，是百川。" },
      { id:"ch5", name:"长河落日", tier:4, req:{root:20,mind:14}, effect:"剑意斩日 · 终结",        lore:"我等这一招，等了十七年。" },
    ]},
    lingxue: { name:"寒 霜 九 诀", element:"water", type:"signature", leaves:[
      { id:"lx1", name:"霜 起",   tier:0, req:{spirit:5},                 effect:"法伤 +8% / 冰封 5%",    lore:"娘说：霜起，便是雪开始。" },
      { id:"lx2", name:"千 雪 落",tier:1, req:{spirit:9},                 effect:"群攻 / 冰封 1 回合",     lore:"千朵雪，化万剑。" },
      { id:"lx3", name:"血 纹 醒",tier:2, req:{spirit:13,luck:8},         effect:"法伤 +25% · 自损血量",  lore:"血纹醒来时，剑亦寒。" },
      { id:"lx4", name:"霜 河 倒",tier:3, req:{spirit:16},                effect:"逆转伤害 / 冰封全场",    lore:"我替自己写一条逃生路。" },
      { id:"lx5", name:"九 诀 终",tier:4, req:{spirit:20,mind:14},        effect:"破劫之招 · 终结",         lore:"上一代崔氏的女子未走完——我要走完。" },
    ]},
    shixiong: { name:"破 军 刀 法", element:"fire", type:"signature", leaves:[
      { id:"sx1", name:"裂 阵",     tier:0, req:{root:6},          effect:"破甲 +2",                lore:"边军第一招——破阵。" },
      { id:"sx2", name:"开 山",     tier:1, req:{root:9},          effect:"重击 +20% / 攻击 +10%",  lore:"开山者，以肉身为山。" },
      { id:"sx3", name:"七 尺 直",  tier:2, req:{root:13},         effect:"暴击 +25% / 直线穿透",   lore:"七尺刀，一寸心。" },
      { id:"sx4", name:"破 阵 子",  tier:3, req:{root:16,mind:8},  effect:"群伤 / 灼烧",             lore:"——这首词俺爹会唱。" },
      { id:"sx5", name:"踏 平",     tier:4, req:{root:20},         effect:"必杀一人 · 终结",         lore:"——雷霆门，俺等你三十年。" },
    ]},
    xiaoyu: { name:"清 音 笛 谱", element:"wood", type:"signature", leaves:[
      { id:"xy1", name:"初 弦",     tier:0, req:{spirit:5},               effect:"魅惑概率 +10%",        lore:"我吹给师姐听的第一支曲。" },
      { id:"xy2", name:"招 魂",     tier:1, req:{spirit:8,wit:8},         effect:"召小灵助战",            lore:"半夜的脚步……听得见的，便能招得来。" },
      { id:"xy3", name:"听 风",     tier:2, req:{spirit:12,wit:11},       effect:"预判敌招 / 闪避 +30%",  lore:"风过竹林，便是十里之外的消息。" },
      { id:"xy4", name:"百鬼听笛",  tier:3, req:{spirit:16,wit:14},       effect:"控场全体 / 治疗",        lore:"——师姐曾说我有病。" },
      { id:"xy5", name:"九重妙音",  tier:4, req:{spirit:20,wit:18},       effect:"超控制 · 终结",          lore:"我的笛子，是为找到唱江南童谣的女子而吹的。" },
    ]},
    heimo: { name:"血 煞 诀", element:"fire", type:"signature", leaves:[
      { id:"hm1", name:"嗜 血", tier:0, req:{spirit:6},          effect:"杀敌后回血 20%",       lore:"——这功法，沾着便难洗。" },
      { id:"hm2", name:"血 影", tier:1, req:{spirit:10,luck:5},  effect:"瞬移 / 闪避 +25%",      lore:"我曾用此招，杀过一个不愿杀的人。" },
      { id:"hm3", name:"血 雾", tier:2, req:{spirit:14},         effect:"群伤 + 致盲",            lore:"雷霆门外那夜的雾——是我布的。" },
      { id:"hm4", name:"九 阴", tier:3, req:{spirit:18},         effect:"反伤 / 法伤 +30%",      lore:"九阴入骨，邪由心生。" },
      { id:"hm5", name:"忘 川", tier:4, req:{spirit:22},         effect:"以命换敌命 · 终结",      lore:"忘川一渡，从此无名。" },
    ]},
    master: { name:"残 卷 掌（祖师秘传）", element:"earth", type:"signature", leaves:[
      { id:"ms1", name:"一 卷",   tier:0, req:{mind:8},          effect:"心境 +2",                  lore:"我闭关前留下的第一招。" },
      { id:"ms2", name:"二 卷",   tier:1, req:{mind:12},         effect:"全属性 +1",                lore:"二卷写的是怎样守得住。" },
      { id:"ms3", name:"三 卷",   tier:2, req:{mind:16,wit:14},  effect:"团队减伤 30%",             lore:"三卷写的是何为门派。" },
      { id:"ms4", name:"四 卷",   tier:3, req:{mind:20,wit:18},  effect:"群伤 / 控场",               lore:"四卷写的是怎样杀人不入轮回。" },
      { id:"ms5", name:"残 卷",   tier:4, req:{mind:25,wit:22},  effect:"逆转命数 · 终结",          lore:"五卷的最后一页是空的——那一页留给你。" },
    ]},
  };

  function getRecruitTreeKey(d){
    const seed = (d.id||"").split("").reduce(function(s,c){return s+c.charCodeAt(0);}, 0);
    const elems = ["metal","wood","water","fire","earth"];
    const types = ["phys","magic"];
    return elems[seed % 5] + "_" + types[Math.floor(seed/5) % 2];
  }

  function getMainTree(disId){
    if(SIGNATURE[disId]) return { key:"sig_"+disId, tree: SIGNATURE[disId], isSignature:true };
    const d = G.state.disciples.find(function(x){return x.id===disId;});
    if(!d) return null;
    const k = getRecruitTreeKey(d);
    return { key:k, tree: COMMON[k], isSignature:false };
  }

  function getAllTreesFor(disId){
    const main = getMainTree(disId);
    if(!main) return [];
    const out = [main];
    Object.keys(COMMON).forEach(function(k){
      if(main.key === k) return;
      out.push({ key:k, tree:COMMON[k], isSignature:false });
    });
    return out;
  }

  function meetsReq(d, req){
    return Object.entries(req||{}).every(function(arr){ const k=arr[0], v=arr[1]; return (d.stats && d.stats[k]||0) >= v; });
  }

  function isUnlocked(d, leaf){ return meetsReq(d, leaf.req); }

  function getEquipped(disId){
    G.state.skillEquip = G.state.skillEquip || {};
    return G.state.skillEquip[disId] || [];
  }
  function setEquipped(disId, arr){
    G.state.skillEquip = G.state.skillEquip || {};
    G.state.skillEquip[disId] = arr;
    Save.persist();
  }

  function summary(disId){
    const d = G.state.disciples.find(function(x){return x.id===disId;});
    if(!d) return { unlocked:0, total:5, equipped:0 };
    const main = getMainTree(disId);
    if(!main) return { unlocked:0, total:5, equipped:0 };
    const total = main.tree.leaves.length;
    const unlocked = main.tree.leaves.filter(function(l){return isUnlocked(d, l);}).length;
    const equipped = getEquipped(disId).length;
    return { unlocked:unlocked, total:total, equipped:equipped };
  }

  const STAT_ABBR = { root:"根", wit:"悟", mind:"心", spirit:"灵", luck:"运" };

  // 树 → AI icon 文件
  function treeIcon(treeKey){
    if(treeKey && treeKey.indexOf("sig_") === 0){
      return "sk_sig_" + treeKey.slice(4) + ".png";
    }
    return "sk_" + treeKey + ".png";
  }

  function openTree(disId){
    const d = G.state.disciples.find(function(x){return x.id===disId;});
    if(!d) return;
    if(typeof Tasks !== 'undefined') Tasks.mark('t_open_skill');
    const trees = getAllTreesFor(disId);
    const equipped = getEquipped(disId).slice();
    let curIdx = 0;

    function renderInner(){
      const cur = trees[curIdx];
      const tree = cur.tree;
      const elemColor = ELEM_COLOR[tree.element] || "#c9a35a";

      const leavesHtml = tree.leaves.map(function(leaf){
        const unlocked = isUnlocked(d, leaf);
        const isEq = equipped.indexOf(leaf.id) > -1;
        const reqText = Object.entries(leaf.req).map(function(arr){ return (STAT_ABBR[arr[0]]||arr[0]) + "≥" + arr[1]; }).join(" · ");
        return [
          '<div class="leaf-card" data-leaf="' + leaf.id + '" data-unlocked="' + unlocked + '" style="',
          'position:relative;padding:14px;margin-bottom:10px;',
          'background:' + (unlocked ? 'linear-gradient(135deg,' + elemColor + '22,' + elemColor + '05)' : 'rgba(20,15,12,.6)') + ';',
          'border:2px solid ' + (unlocked ? elemColor : 'rgba(122,107,88,.4)') + ';',
          'border-radius:8px;',
          'cursor:' + (unlocked ? 'pointer' : 'not-allowed') + ';',
          'opacity:' + (unlocked ? '1' : '0.55') + ';',
          'transition:all .25s;',
          isEq ? ('box-shadow:0 0 18px ' + elemColor + ',inset 0 0 12px ' + elemColor + '44') : '',
          '">',
          '<div style="display:flex;gap:12px;align-items:flex-start">',
          // 左：AI icon
          '<div style="width:48px;height:48px;flex-shrink:0;border-radius:6px;background:url(assets/icons/' + treeIcon(cur.key) + ') center/cover #1a1310;border:1.5px solid ' + (unlocked?elemColor:'rgba(122,107,88,.4)') + ';' + (unlocked?'':'filter:grayscale(.7) brightness(.5);') + '"></div>',
          '<div style="flex:1">',
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">',
          '<span style="font-size:11px;font-family:Ma Shan Zheng;color:' + elemColor + ';letter-spacing:.05em;padding:2px 6px;border:1px solid ' + elemColor + ';border-radius:3px">第 ' + (leaf.tier+1) + ' 阶</span>',
          '<span style="font-family:Ma Shan Zheng;font-size:18px;color:' + (unlocked ? elemColor : 'var(--ink-3)') + ';letter-spacing:.16em">' + leaf.name + '</span>',
          isEq ? '<span style="font-size:11px;color:var(--candle);font-family:Ma Shan Zheng;margin-left:auto">★ 已 装 配</span>' : '',
          '</div>',
          '<div style="font-size:12px;color:' + (unlocked ? 'var(--ink-1)' : 'var(--ink-3)') + ';margin-top:6px;letter-spacing:.05em">' + leaf.effect + '</div>',
          '<div style="font-size:11px;color:var(--ink-3);font-style:italic;margin-top:6px;letter-spacing:.04em">「' + leaf.lore.replace(/\n/g,'<br>') + '」</div>',
          '<div style="font-size:11px;color:' + (unlocked ? 'var(--jade)' : 'var(--vermilion-2)') + ';font-family:Ma Shan Zheng;letter-spacing:.06em;margin-top:4px">条件：' + reqText + '</div>',
          '</div>',
          '</div>',
          '</div>'
        ].join('');
      }).join('');

      const tabsHtml = trees.map(function(t, i){
        const c = ELEM_COLOR[t.tree.element];
        return [
          '<button class="tree-tab" data-tabidx="' + i + '" style="',
          'padding:6px 10px;border:1px solid ' + (i===curIdx ? c : 'var(--line)') + ';',
          'background:' + (i===curIdx ? c+'33' : 'rgba(20,15,12,.6)') + ';',
          'color:' + (i===curIdx ? c : 'var(--ink-3)') + ';',
          'font-family:Ma Shan Zheng;font-size:11px;letter-spacing:.05em;cursor:pointer;border-radius:4px;white-space:nowrap;',
          t.isSignature ? ('box-shadow:0 0 8px ' + c + '66') : '',
          '">' + (t.isSignature ? '★ ' : '') + (ELEM_NAME[t.tree.element]||'') + ' · ' + (t.tree.type==='phys'?'物':t.tree.type==='magic'?'法':'专') + '</button>'
        ].join('');
      }).join('');

      const equippedHtml = equipped.length === 0
        ? '<span style="color:var(--ink-3);font-style:italic;font-size:12px">— 暂未装配技能 —</span>'
        : equipped.map(function(eid){
            for(let i=0;i<trees.length;i++){
              const l = trees[i].tree.leaves.find(function(x){return x.id===eid;});
              if(l){ return '<span style="display:inline-block;padding:3px 9px;margin:0 4px 4px 0;background:'+ELEM_COLOR[trees[i].tree.element]+'33;border:1px solid '+ELEM_COLOR[trees[i].tree.element]+';color:'+ELEM_COLOR[trees[i].tree.element]+';font-family:Ma Shan Zheng;font-size:11px;letter-spacing:.06em;border-radius:3px">'+l.name+'</span>'; }
            }
            return '';
          }).join('');

      Modal.openHTML([
        '<h3>' + d.name + ' · 技 能 树</h3>',
        '<div style="text-align:center;margin:8px 0 12px 0">',
        '<div style="font-family:Ma Shan Zheng;color:' + elemColor + ';font-size:20px;letter-spacing:.2em">' + tree.name + '</div>',
        '<div style="font-size:11px;color:var(--ink-3);margin-top:4px">' + (cur.isSignature ? '★ 弟子专属 · 不可替换' : '通用 · 五行 × 物理/法术 之一') + '</div>',
        '</div>',
        '<div style="padding:10px 12px;background:rgba(91,138,114,.08);border:1px solid var(--jade);border-radius:6px;margin-bottom:14px">',
        '<div style="font-size:11px;color:var(--jade);font-family:Ma Shan Zheng;letter-spacing:.18em;margin-bottom:6px">已 装 配（' + equipped.length + '/3）</div>',
        equippedHtml,
        '</div>',
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' + tabsHtml + '</div>',
        '<div style="max-height:50vh;overflow-y:auto;padding-right:6px">' + leavesHtml + '</div>',
        '<div class="modal-row" style="margin-top:14px">',
        '<button class="btn ghost" data-act="modal-close">关 上</button>',
        '</div>'
      ].join(''));

      // 绑定 tab
      document.querySelectorAll('[data-tabidx]').forEach(function(b){
        b.onclick = function(){ curIdx = parseInt(b.dataset.tabidx); renderInner(); };
      });
      // 绑定 leaf 点击：装配/卸下
      document.querySelectorAll('[data-leaf]').forEach(function(el){
        el.onclick = function(){
          if(el.dataset.unlocked !== 'true'){
            toast('属性未达标，无法装配', 'bad');
            return;
          }
          const lid = el.dataset.leaf;
          const idx = equipped.indexOf(lid);
          if(idx > -1){
            equipped.splice(idx, 1);
            setEquipped(disId, equipped);
            toast('已卸下', 'good');
          } else {
            if(equipped.length >= 3){
              toast('最多同时装配 3 个，先卸下一个', 'bad');
              return;
            }
            equipped.push(lid);
            setEquipped(disId, equipped);
            SFX && SFX.play && SFX.play('chime');
            toast('已装配', 'good');
          }
          renderInner();
        };
      });
    }

    renderInner();
  }

  return { openTree: openTree, summary: summary, getMainTree: getMainTree };
})();
