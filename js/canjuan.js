/* ================================================================
   祖师残卷 · 状态展示 + 朱砂八字逐字解读
   ================================================================ */
const Canjuan = (() => {

  // 八字预言：「七 十 年，三 大 宗，或 为 尘」
  // 每完成一个主线节点 / 触发某 flag，揭一个字
  const RUNES = [
    { ch:"七",  unlock:()=> true,                                                        gloss:"赌约起始 · 卷已自启",                detail:"祖师封藏的赌约：七十年内，定本派三大宗一席。" },
    { ch:"十",  unlock:()=> G.state.storyDone?.includes("c1s1"),                          gloss:"取卷之夜 · 选择已下",                detail:"你已亲手承下这卷。今后的每一夜，都将听见它在等你。" },
    { ch:"年",  unlock:()=> G.state.storyDone?.includes("c1s2"),                          gloss:"血染演武场 · 大弟子陨",              detail:"陈渊死了。你看见的并非雷霆门——卷上字色由朱砂转赤，像被血染过。" },
    { ch:"三",  unlock:()=> G.state.storyDone?.includes("c1s3"),                          gloss:"雷霆叫阵 · 残墟立场已表",            detail:"你今日之选，将决定残卷在江湖中的归属重量。" },
    { ch:"大",  unlock:()=> G.state.storyDone?.includes("c2s1"),                          gloss:"小雨听卷 · 卷开始低吟",              detail:"小雨灵识入卷，卷上隐隐有第二层文字浮现——那是上代二弟子的笔迹。" },
    { ch:"宗",  unlock:()=> G.state.storyDone?.includes("c2s2"),                          gloss:"落霞来访 · 江湖盟约",                 detail:"卷上「宗」字的笔法转柔——你与其他派别已开始有了牵动。" },
    { ch:"或",  unlock:()=> G.state.storyDone?.includes("c2s3"),                          gloss:"凌雪血纹 · 命数显现",                 detail:"血纹与卷上「或」字共鸣。卷开始预言——但「或」之一字，仍意味着一切尚有变数。" },
    { ch:"为",  unlock:()=> G.state.storyDone?.includes("c3s1"),                          gloss:"客卿揭面 · 三百年伏笔",              detail:"无名出现，卷上倒数第二字「为」骤然变浓。这是第二位见过原卷的人。" },
    { ch:"尘",  unlock:()=> G.state.storyDone?.length >= 7 && G.state.battle?.victories && Object.keys(G.state.battle.victories).length >= 3, gloss:"三大宗一席 · 残卷使命达成", detail:"当卷上最后一字「尘」被点亮——便是这门派真正登顶之时。\n你须打败六派中三派以上，主线全数走完。" },
  ];

  // 卷的"形态"：根据玩家做过的选择（path）决定卷整体表现
  function getForm(){
    const f = G.state.flags || {};
    const sd = G.state.storyDone || [];
    // 1) 取卷 path：取/封/议
    let take = "未取";
    if(f.got_canjuan)    take = "已 取";
    else if(f.sealed_canjuan) take = "封 回";
    else if(f.shared_canjuan) take = "众 议";
    // 2) 雷霆门 path
    let thunder = "未 决";
    if(f.war_thunder)        thunder = "决 裂";
    else if(f.secret_invest) thunder = "暗 查";
    else if(f.return_jade)   thunder = "归 还";
    if(f.surrender_canjuan)  thunder = "借 出";
    if(f.accepted_war)       thunder = "应 战";
    if(f.called_heimo)       thunder = "召 客";
    // 3) 落霞 path
    let luoxia = "未 议";
    if(f.ally_luoxia)        luoxia = "结 盟";
    else if(f.polite_refuse) luoxia = "婉 拒";
    else if(f.counter_offer) luoxia = "反 索";
    // 4) 凌雪 path
    let lingxue = "未 渡";
    if(f.prep_lingxue) lingxue = "护 之";
    if(f.fate_lingxue) lingxue = "任 命";
    // 5) 客卿 path
    let heimo = "未 决";
    if(f.heimo_left) heimo = "放 行";
    if(f.heimo_stay) heimo = "留 守";
    // 卷整体形态：按结合判断
    let form = "原 卷";
    let formColor = "#c9a35a";
    let formDesc = "卷面如初。朱砂八字未尽显。";
    if(f.got_canjuan && f.surrender_canjuan){
      form = "残 缺 卷";
      formColor = "#7a5c3a";
      formDesc = "你曾借出三月，此卷已不全。卷边一角，雷霆门暗钉之痕清晰可见。";
    } else if(f.called_heimo && f.heimo_stay){
      form = "血 染 卷";
      formColor = "#a83236";
      formDesc = "客卿以三百年的血煞镇守此卷，朱砂之色更深。卷有杀气，旁人不敢近。";
    } else if(f.heimo_left){
      form = "孤 尘 卷";
      formColor = "#a3c8e0";
      formDesc = "客卿独行去了雷霆门。此卷少一份杀气，但多一份正气——它在等他归来或不归来。";
    } else if(f.ally_luoxia){
      form = "盟 录 卷";
      formColor = "#d4a04a";
      formDesc = "落霞抄录之后，此卷与落霞秘籍已有微妙感应。卷上隐有第二层金线浮现。";
    } else if(f.got_canjuan && sd.length >= 4){
      form = "鸣 卷";
      formColor = "#c9a35a";
      formDesc = "卷已与你共鸣。每过一节主线，朱砂八字便亮一字。";
    } else if(f.sealed_canjuan){
      form = "封 卷";
      formColor = "#5a6b58";
      formDesc = "你选择封回原处。此卷只是这门派的一块石头，沉默地伴你走七十年。";
    } else if(f.shared_canjuan){
      form = "众 议 卷";
      formColor = "#7ec299";
      formDesc = "你选择与弟子共议。此卷上有三人指印——这门派的命数，从此不只是你一个人的。";
    }
    return {
      form, formColor, formDesc,
      paths: [
        { label:"取卷之夜", value:take },
        { label:"雷霆门事", value:thunder },
        { label:"落霞来访", value:luoxia },
        { label:"凌雪血纹", value:lingxue },
        { label:"客卿揭面", value:heimo },
      ],
    };
  }

  function open(){
    const has = G.state.flags?.got_canjuan;
    const sealed = G.state.flags?.sealed_canjuan;
    const shared = G.state.flags?.shared_canjuan;
    if(!has && !sealed && !shared){
      Modal.openHTML(`
        <h3>祖 师 残 卷</h3>
        <div class="cj-empty">
          <div class="cj-empty-mark">？</div>
          <div class="cj-empty-text">「卷尚封藏。\n你尚未在 c1s1 中作出选择。」</div>
        </div>
        <div class="modal-row" style="margin-top:14px"><button class="btn ghost" data-act="modal-close">嗯 →</button></div>
      `);
      return;
    }

    const info = getForm();
    const runesHtml = RUNES.map(r=>{
      const ok = r.unlock();
      return `
        <div class="cj-rune${ok?' on':''}" data-ch="${r.ch}" title="${ok ? r.gloss : '尚未解读'}">
          <div class="cj-rune-ch">${ok ? r.ch : '？'}</div>
          <div class="cj-rune-gloss">${ok ? r.gloss : '——'}</div>
        </div>
      `;
    }).join("");

    const detailsHtml = RUNES.filter(r=>r.unlock()).map(r=>`
      <div class="cj-detail-row">
        <span class="cj-detail-ch">${r.ch}</span>
        <div class="cj-detail-text">
          <div class="cj-detail-gloss">${r.gloss}</div>
          <div class="cj-detail-detail">${r.detail.replace(/\n/g,'<br>')}</div>
        </div>
      </div>
    `).join("");

    const pathsHtml = info.paths.map(p=>`
      <div class="cj-path">
        <span class="cj-path-l">${p.label}</span>
        <span class="cj-path-v">${p.value}</span>
      </div>
    `).join("");

    Modal.openHTML(`
      <h3 style="margin:0;text-align:center">祖 师 残 卷</h3>
      <div class="cj-form" style="border-color:${info.formColor};color:${info.formColor}">
        <div class="cj-form-label">当 前 形 态</div>
        <div class="cj-form-name">${info.form}</div>
        <div class="cj-form-desc">${info.formDesc}</div>
      </div>

      <h4 class="cj-h4">朱 砂 八 字（${RUNES.filter(r=>r.unlock()).length} / ${RUNES.length}）</h4>
      <div class="cj-runes">${runesHtml}</div>

      <h4 class="cj-h4">已 解 读 字 句</h4>
      <div class="cj-details">${detailsHtml || '<div class="cj-empty-text">尚无字句被点亮。</div>'}</div>

      <h4 class="cj-h4">你 已 走 过 的 关 键 决 断</h4>
      <div class="cj-paths">${pathsHtml}</div>

      <div class="modal-row" style="margin-top:16px"><button class="btn ghost" data-act="modal-close">合 卷</button></div>
    `);
  }

  return { open, getForm };
})();
