/* ================================================================
   宗门 · 修缮地图
   - 5 座建筑分布在山门地图，未修缮 lv=0 = 暗色"待修"
   - 点击：未修缮则修缮 modal，已修缮则进入对应场景
   ================================================================ */
const Build = (() => {

  const POS = {
    hall:     { x:0.50, y:0.42, label:"祖师堂", color:"#c9a35a", icon:"⛩", scene:"sc_temple",
                fn:"焚香三柱 · 与祖师爷对话（剧情触发）", action:"祭 拜" },
    zangjing: { x:0.50, y:0.16, label:"藏经阁", color:"#7a5ca0", icon:"经", scene:"sc_temple",
                fn:"卷海无涯 · 悟性高者读之，修为渐长", action:"借 卷" },
    dantang:  { x:0.22, y:0.55, label:"丹房",   color:"#d4554f", icon:"丹", scene:"sc_dantang",
                fn:"每日产丹一枚 · 可于背囊查看", action:"看 炉" },
    yanwu:    { x:0.78, y:0.55, label:"演武场", color:"#a83236", icon:"武", scene:"sc_battle",
                fn:"切磋之地 · 闭关收益加成", action:"观 武" },
    lingtian: { x:0.40, y:0.82, label:"灵田",   color:"#5b8a72", icon:"田", scene:"sc_courtyard",
                fn:"每日产灵石与铜钱 · 可种灵草", action:"巡 田" },
  };

  function render(){
    const bg = document.getElementById("bmap-bg");
    if(bg){
      // 高清地图 + Weather 控制昼夜 filter
      bg.style.backgroundImage = "url(assets/scenes/hi_map_sect.jpg), url(assets/scenes/map_sect_day.jpg)";
      bg.style.backgroundSize = "cover";
      bg.style.backgroundPosition = "center";
    }
    // 触发 weather 重新应用 filter
    if(typeof Weather !== 'undefined' && Weather.apply) Weather.apply();
    const ci = document.getElementById("bmap-coin-info");
    if(ci) ci.textContent = "铜钱：" + (G.state.coin||0);

    renderBuildings();
  }

  function renderBuildings(){
    const wrap = document.getElementById("bmap-buildings");
    if(!wrap) return;
    wrap.innerHTML = "";
    BUILDINGS.forEach(b => {
      const pos = POS[b.id];
      if(!pos) return;
      const lv = G.state.buildLv[b.id] || 0;
      const built = lv > 0;
      const node = document.createElement("div");
      node.className = "bmap-building" + (built ? " built" : " unbuilt");
      node.dataset.bid = b.id;
      node.style.cssText = "position:absolute;left:"+(pos.x*100)+"%;top:"+(pos.y*100)+"%;transform:translate(-50%,-50%);cursor:pointer;z-index:5";
      const frameBg = built
        ? "radial-gradient(circle, "+pos.color+"88, "+pos.color+"22), url(assets/scenes/"+pos.scene+".jpg) center/cover"
        : "radial-gradient(circle, rgba(30,20,18,.9), rgba(8,5,8,.95))";
      const frameStyle = [
        "width:96px;height:96px;border-radius:14px;",
        "background:" + frameBg + ";",
        "border:2px solid " + (built ? pos.color : "#3a3128") + ";",
        built ? ("box-shadow:0 0 18px "+pos.color+"66, inset 0 0 12px rgba(0,0,0,.5);") : "box-shadow:0 4px 12px rgba(0,0,0,.7);",
        !built ? "filter:grayscale(.95) brightness(.4);" : "",
        "display:flex;align-items:center;justify-content:center;",
        "font-family:Ma Shan Zheng;font-size:34px;color:" + (built?"#fff":"#5a4828") + ";",
        "text-shadow:0 0 8px " + (built?pos.color:"#000") + ";",
        "position:relative;transition:all .25s;",
      ].join("");
      node.innerHTML =
        '<div class="bm-frame" style="' + frameStyle + '">' +
          pos.icon +
          (built
            ? '<div style="position:absolute;bottom:-4px;right:-4px;background:var(--gold);color:var(--bg-0);font-family:Cinzel;font-size:10px;font-weight:700;padding:1px 6px;border-radius:6px;letter-spacing:.05em;border:1px solid var(--bg-0)">Lv.' + lv + '</div>'
            : '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);border-radius:14px;font-family:Ma Shan Zheng;font-size:11px;color:#a89678;letter-spacing:.15em">待 修</div>'
          ) +
        '</div>' +
        '<div class="bm-name" style="position:absolute;left:50%;top:calc(100% + 6px);transform:translateX(-50%);font-family:Ma Shan Zheng;font-size:13px;color:' + (built?pos.color:'#7a6b58') + ';letter-spacing:.18em;white-space:nowrap;text-shadow:0 0 8px rgba(0,0,0,.95);pointer-events:none">' + pos.label + '</div>';
      node.addEventListener("mouseenter", function(){ showTip(b, node); });
      node.addEventListener("mouseleave", hideTip);
      node.addEventListener("click", function(){ onClick(b); });
      wrap.appendChild(node);
    });
  }

  function showTip(b, node){
    const tip = document.getElementById("bmap-tooltip");
    if(!tip) return;
    const pos = POS[b.id];
    const lv = G.state.buildLv[b.id] || 0;
    const built = lv > 0;
    const isMax = lv >= b.maxLv;
    const cost = isMax ? null : b.cost[Math.max(0,lv)];
    const nextEffect = isMax ? "已至顶级" : (b.effects[lv] || "未知效果");
    tip.innerHTML =
      '<div style="font-family:Ma Shan Zheng;color:' + pos.color + ';font-size:18px;letter-spacing:.18em;margin-bottom:4px">' + b.name + ' <span style="font-size:11px;color:var(--ink-3);font-family:inherit">Lv.' + lv + '/' + b.maxLv + '</span></div>' +
      '<div style="font-size:11px;color:var(--ink-2);line-height:1.7;margin-bottom:8px">' + b.desc + '</div>' +
      '<div style="font-size:11px;color:var(--candle);font-family:Ma Shan Zheng;letter-spacing:.08em;margin-bottom:4px">↑ 升至 Lv.' + (lv+1) + '：' + nextEffect + '</div>' +
      (!isMax
        ? '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px dashed rgba(201,163,90,.3)"><span style="font-size:11px;color:var(--ink-3)">' + (built?'继续修缮':'初建') + ' · ' + cost + ' 铜钱</span><span style="font-size:10px;color:' + ((G.state.coin||0)>=cost?'var(--jade)':'var(--vermilion-2)') + '">' + ((G.state.coin||0)>=cost?'✓ 铜钱充足':'✗ 铜钱不足') + '</span></div>'
        : '<div style="font-size:11px;color:var(--gold-2);font-family:Ma Shan Zheng;letter-spacing:.18em;text-align:center;padding-top:6px;border-top:1px dashed rgba(201,163,90,.3)">— 圆 满 —</div>'
      ) +
      (built ? '<div style="font-size:10px;color:var(--ink-3);font-style:italic;margin-top:6px;text-align:center">点击 · 进入' + b.name + '</div>' : '<div style="font-size:10px;color:var(--vermilion-2);font-style:italic;margin-top:6px;text-align:center">点击 · 初建</div>');
    const wrap = document.getElementById("build-map-wrap");
    const wRect = wrap.getBoundingClientRect();
    const nRect = node.getBoundingClientRect();
    const tipW = 260, tipH = 180;
    let left = nRect.left - wRect.left + 60;
    let top = nRect.top - wRect.top - 30;
    if(left + tipW > wRect.width) left = nRect.left - wRect.left - tipW - 20;
    if(top + tipH > wRect.height) top = wRect.height - tipH - 10;
    if(top < 10) top = 10;
    tip.style.cssText = "position:absolute;display:block;left:"+left+"px;top:"+top+"px;width:"+tipW+"px;padding:12px;background:linear-gradient(135deg,rgba(30,20,18,.97),rgba(15,8,12,.99));border:1.5px solid var(--gold);border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.8);z-index:50;pointer-events:none";
  }
  function hideTip(){
    const tip = document.getElementById("bmap-tooltip");
    if(tip) tip.style.display = "none";
  }

  function onClick(b){
    const lv = G.state.buildLv[b.id] || 0;
    if(lv === 0) openBuildModal(b);
    else openEnterModal(b);
  }

  function openBuildModal(b){
    const lv = G.state.buildLv[b.id] || 0;
    const isMax = lv >= b.maxLv;
    if(isMax){
      Modal.openHTML('<h3>'+b.name+'</h3><div class="lead">已至顶级，无须再修。</div><div class="modal-row"><button class="btn primary" data-act="modal-close">嗯</button></div>');
      return;
    }
    const cost = b.cost[Math.max(0,lv)];
    const pos = POS[b.id];
    Modal.openHTML(
      '<h3>'+b.name+' · '+(lv===0?'初 建':'修缮至 Lv.'+(lv+1))+'</h3>' +
      '<div style="margin:10px 0 14px 0;height:140px;border-radius:6px;background:url(assets/scenes/'+pos.scene+'.jpg) center/cover #1a1310;border:1px solid var(--gold);position:relative;overflow:hidden">' +
        '<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.85))"></div>' +
        '<div style="position:absolute;left:14px;bottom:10px;font-family:Ma Shan Zheng;color:'+pos.color+';font-size:22px;letter-spacing:.2em;text-shadow:0 0 8px #000">'+b.name+'</div>' +
      '</div>' +
      '<div class="lead" style="font-size:13px;color:var(--ink-2);text-align:left;line-height:1.8">'+b.desc+'<br><br><b style="color:var(--gold-2)">升级效果：</b>'+(b.effects[lv]||'未知')+'</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin:14px 0;padding:10px;background:rgba(199,154,74,.08);border:1px solid var(--candle);border-radius:4px">' +
        '<span style="font-family:Ma Shan Zheng;color:var(--candle);letter-spacing:.1em">需 铜 钱</span>' +
        '<span style="font-family:Ma Shan Zheng;color:var(--gold-2);font-size:22px">'+cost+'</span>' +
      '</div>' +
      '<div class="modal-row">' +
        '<button class="btn ghost" data-act="modal-close">作 罢</button>' +
        '<button class="btn primary" id="btn-do-build" '+((G.state.coin||0)<cost?'disabled':'')+'>'+((G.state.coin||0)<cost?'铜钱不足':(lv===0?'▶ 动 工':'▶ 修 缮'))+'</button>' +
      '</div>'
    );
    const btn = document.getElementById("btn-do-build");
    if(btn && (G.state.coin||0) >= cost){
      btn.onclick = function(){
        G.state.coin -= cost;
        G.state.buildLv[b.id] = lv + 1;
        if(b.id === "dantang") G.state.pill = (G.state.pill||0) + 1;
        SFX.play("up");
        toast(b.name + " 修至 Lv." + (lv+1), "good");
        if(typeof Tasks !== 'undefined') Tasks.mark('t_first_build');
        Save.persist();
        Main.updateHUD();
        Modal.close();
        render();
      };
    }
  }

  function openEnterModal(b){
    const lv = G.state.buildLv[b.id] || 0;
    const pos = POS[b.id];
    const isMax = lv >= b.maxLv;
    const cost = isMax ? null : b.cost[lv];
    Modal.openHTML(
      '<h3>' + b.name + ' · 进 入</h3>' +
      '<div style="margin:10px 0 14px 0;height:180px;border-radius:6px;background:url(assets/scenes/' + pos.scene + '.jpg) center/cover #1a1310;border:1px solid var(--gold);position:relative;overflow:hidden">' +
        '<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.9))"></div>' +
        '<div style="position:absolute;left:14px;bottom:14px">' +
          '<div style="font-family:Ma Shan Zheng;color:' + pos.color + ';font-size:24px;letter-spacing:.18em;text-shadow:0 0 8px #000">' + b.name + ' · Lv.' + lv + '</div>' +
          '<div style="font-size:11px;color:var(--gold-2);margin-top:4px">' + (b.effects[Math.max(0,lv-1)] || '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="lead" style="font-size:13px;color:var(--ink-2);line-height:1.9;text-align:left">' + b.desc + '<br><br><b style="color:var(--candle);font-family:Ma Shan Zheng;letter-spacing:.05em">功用：</b>' + pos.fn + '</div>' +
      '<div class="modal-row" style="margin-top:14px">' +
        '<button class="btn ghost" data-act="modal-close">关 上</button>' +
        (!isMax ? '<button class="btn" id="btn-upgrade">⌬ 修 至 Lv.' + (lv+1) + '（' + cost + ' 铜钱）</button>' : '') +
      '</div>'
    );
    const ub = document.getElementById("btn-upgrade");
    if(ub) ub.onclick = function(){ Modal.close(); openBuildModal(b); };
  }

  return { render };
})();
