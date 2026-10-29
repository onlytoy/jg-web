(function () {
  'use strict';

  /* ---------- 数字カウントアップ ---------- */
  var UNIT = { K: 1e3, M: 1e6, B: 1e9 };
  function unitFmt(v) {
    var u = v >= 1e9 ? 'B' : v >= 1e6 ? 'M' : v >= 1e3 ? 'K' : '';
    if (!u) return String(Math.round(v));
    var n = v / UNIT[u];
    return (n >= 100 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, '')) + u;
  }
  function countUp(el) {
    if (el.dataset.counted) return;
    var tn = null;
    for (var i = 0; i < el.childNodes.length; i++) { var c = el.childNodes[i]; if (c.nodeType === 3 && /\d/.test(c.nodeValue)) { tn = c; break; } }
    if (!tn) return;
    var orig = tn.nodeValue;
    var m = orig.match(/-?[\d,]+(\.\d+)?([KMB](?![a-z]))?/);
    if (!m) return;
    var raw = m[0].replace(/[KMB]$/, ''), unit = m[2] || '';
    var target = parseFloat(raw.replace(/,/g, '')) * (unit ? UNIT[unit] : 1);
    if (!isFinite(target)) return;
    el.dataset.counted = '1';
    var pre = orig.slice(0, m.index), post = orig.slice(m.index + m[0].length);
    var dec = (raw.split('.')[1] || '').length, hasComma = raw.indexOf(',') > -1;
    function fmt(v) {
      var s;
      if (unit) s = unitFmt(v);
      else { s = dec ? v.toFixed(dec) : String(Math.round(v)); if (hasComma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
      return pre + s + post;
    }
    var dur = 1600, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      tn.nodeValue = fmt(target * e);
      if (p < 1) requestAnimationFrame(step); else tn.nodeValue = orig;
    }
    tn.nodeValue = fmt(0);
    requestAnimationFrame(step);
  }

  var numSel = '.kpi-big b, .cd-kpis b, .el-nums .v, .res-item .v, .case-card .kpi b, .case-mini .v, .case-feat .v, .co-marks b';
  var nums = [].slice.call(document.querySelectorAll(numSel));
  if (nums.length && 'IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); nio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { nio.observe(n); });
  }

  /* ---------- 目次のスクロールスパイ ---------- */
  var anchors = [].slice.call(document.querySelectorAll('.cd-anchors a[href^="#"]:not([href="#"])'));
  if (anchors.length && 'IntersectionObserver' in window) {
    var targets = anchors.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        anchors.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { sio.observe(t); });
  }

  /* ---------- カルーセル：ドラッグ＋矢印 ---------- */
  var rail = document.querySelector('.ind-rail');
  if (rail) {
    var track = rail.querySelector('.ind-track');
    var cards = track ? [].slice.call(track.children) : [];
    var idx = 0;
    var prev = document.querySelector('.ind-nav .ar.prev');
    var next = document.querySelector('.ind-nav .ar.next');
    var cnt = document.querySelector('.ind-nav .cnt b');
    var total = document.querySelector('.ind-nav .cnt .tt');
    if (total) total.textContent = cards.length;

    function step() {
      if (cards.length < 2) return 318;
      return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    }
    function maxIdx() {
      var per = Math.max(1, Math.floor(rail.clientWidth / step()));
      return Math.max(0, cards.length - per);
    }
    function go(i) {
      idx = Math.max(0, Math.min(maxIdx(), i));
      if (track) track.style.transform = 'translateX(' + (-idx * step()) + 'px)';
      if (cnt) cnt.textContent = idx + 1;
      if (prev) prev.classList.toggle('on', idx > 0);
      if (next) next.classList.toggle('on', idx < maxIdx());
    }
    if (track) track.style.transition = 'transform .5s cubic-bezier(.22,.8,.28,1)';
    if (prev) prev.addEventListener('click', function () { go(idx - 1); });
    if (next) next.addEventListener('click', function () { go(idx + 1); });
    window.addEventListener('resize', function () { go(idx); });
    go(0);

    var down = false, sx = 0, si = 0;
    rail.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; si = idx; rail.setPointerCapture(e.pointerId); });
    rail.addEventListener('pointermove', function (e) {
      if (!down) return;
      var d = e.clientX - sx;
      if (Math.abs(d) > 60) { go(si - Math.round(d / step())); down = false; }
    });
    rail.addEventListener('pointerup', function () { down = false; });
    rail.addEventListener('pointercancel', function () { down = false; });
  }
})();

/* 沿革：スクロールで年号を切替 */
(function(){
  var sec = document.querySelector('.co-hist.hs'); if(!sec) return;
  var items = [].slice.call(sec.querySelectorAll('.hs-item'));
  var yr = sec.querySelector('.hs-year'), b = yr.querySelector('.b'), a = yr.querySelector('.a');
  var bar = sec.querySelector('.hs-prog .bar i'), cnt = sec.querySelector('.hs-prog .cnt em');
  var cur = -1;
  function set(i){
    if(i===cur) return; cur=i;
    items.forEach(function(el,k){ el.classList.toggle('on', k===i); });
    var y = items[i].getAttribute('data-y');
    yr.classList.add('flip');
    setTimeout(function(){ a.textContent=y.slice(0,2); b.textContent=y.slice(2); yr.classList.remove('flip'); }, 180);
    bar.style.width = ((i+1)/items.length*100)+'%';
    cnt.textContent = ('0'+(i+1)).slice(-2);
  }
  function onScroll(){
    var mid = window.innerHeight*0.45, best=0, bd=1e9;
    items.forEach(function(el,k){ var r=el.getBoundingClientRect(); var d=Math.abs(r.top+r.height/2-mid); if(d<bd){bd=d;best=k;} });
    set(best);
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
})();

(function(){
  var acc = document.querySelector('.acc'); if (!acc) return;
  var items = acc.querySelectorAll('.acc-item');
  items.forEach(function(it){
    it.addEventListener('mouseenter', function(){ items.forEach(function(x){ x.classList.toggle('on', x === it); }); });
    it.addEventListener('focus', function(){ items.forEach(function(x){ x.classList.toggle('on', x === it); }); });
  });
})();
