/* v4 首页本体の動き：inline style のマークアップに後付け */
(function () {
  var root = document.querySelector('.v4-body');
  if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = document.createElement('style');
  css.textContent = [
    '.v4m-rv{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}',
    '.v4m-rv.in{opacity:1;transform:none}',
    '.v4m-card{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}',
    '.v4m-card:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(16,42,94,.12)}',
    '.v4m-ph img{transition:transform .9s cubic-bezier(.2,.7,.2,1)}',
    '.v4m-ph:hover img{transform:scale(1.045)}',
    '.v4m-acc{transition:flex-basis .6s cubic-bezier(.2,.7,.2,1),flex-grow .6s cubic-bezier(.2,.7,.2,1);cursor:pointer}',
    '.v4m-acc .v4m-dim{transition:opacity .5s}',
    '.v4m-acc .v4m-txt{transition:opacity .4s .1s}',
    '.v4m-row{transition:background .3s,padding-left .3s}',
    '.v4m-row:hover{background:rgba(40,71,252,.04)}',
    '.v4m-arrow{transition:transform .3s}',
    '.v4m-row:hover .v4m-arrow,.v4m-ph:hover .v4m-arrow,.v4m-card:hover .v4m-arrow{transform:translateX(4px)}',
    '.v4m-btn{transition:transform .25s,box-shadow .25s,background .25s}',
    '.v4m-btn:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(40,71,252,.22)}',
    '.v4m-pname{transition:color .25s}',
    '.v4m-tc{opacity:0;transform:translateY(14px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}',
    '.v4m-tc.in{opacity:1;transform:none}',
    '.v4m-ntitle{transition:color .25s}',
    '.v4m-nrow:hover .v4m-ntitle{color:#2847fc}',
    '.v4m-nrow{position:relative}',
    '.v4m-nrow::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:#2847fc;transform:scaleX(0);transform-origin:left;transition:transform .5s cubic-bezier(.2,.7,.2,1);pointer-events:none}',
    '.v4m-nrow:hover::after{transform:scaleX(1)}',
    '.v4m-narr{transition:transform .3s,color .25s}',
    '.v4m-nrow:hover .v4m-narr{color:#2847fc}',
    '.v4m-prow:hover .v4m-pname{color:#2847fc}',
    '.v4m-pic{transition:transform .3s cubic-bezier(.2,.7,.2,1)}',
    '.v4m-prow:hover .v4m-pic{transform:translateY(-2px)}',
    '.v4m-pbtn{transition:background .25s,color .25s,border-color .25s}',
    '.v4m-prow:hover .v4m-pbtn{background:#2847fc !important;border-color:#2847fc !important;color:#fff !important}',
    '.v4a-row{height:440px;display:flex;gap:8px}',
    '.v4a{position:relative;flex:1 1 0;min-width:0;border-radius:24px;overflow:hidden;color:#fff;text-decoration:none;transition:flex-grow .6s cubic-bezier(.2,.7,.2,1)}',
    '.v4a.on{flex-grow:6.4}',
    '.v4a img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}',
    '.v4a.on img{transform:scale(1.03)}',
    '.v4a-shade{position:absolute;inset:0;background:rgba(10,19,36,.5);transition:background .5s}',
    '.v4a.on .v4a-shade{background:linear-gradient(180deg,rgba(10,19,36,0) 40%,rgba(10,19,36,.72) 100%)}',
    '.v4a-v{position:absolute;left:0;right:0;bottom:28px;display:flex;flex-direction:column;align-items:center;gap:14px;transition:opacity .3s}',
    '.v4a-v b{writing-mode:vertical-rl;font-size:16px;font-weight:700;letter-spacing:.18em}',
    '.v4a-v em{font-style:normal;font-family:Poppins,sans-serif;font-size:11px;letter-spacing:.14em;opacity:.7}',
    '.v4a.on .v4a-v{opacity:0;visibility:hidden}',
    '.v4a-h{position:absolute;left:36px;right:36px;bottom:32px;max-width:520px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;opacity:0;transform:translateY(10px);visibility:hidden;transition:opacity .35s,transform .45s,visibility 0s .45s;pointer-events:none}',
    '.v4a.on .v4a-h{opacity:1;transform:none;visibility:visible;transition:opacity .35s .22s,transform .45s .22s,visibility 0s}',
    '.v4a-h em{display:block;font-style:normal;font-family:Poppins,sans-serif;font-size:12px;letter-spacing:.16em;opacity:.7}',
    '.v4a-h b{display:block;margin-top:8px;font-size:24px;font-weight:700}',
    '.v4a-h small{display:block;margin-top:8px;font-size:14px;line-height:1.8;opacity:.85}',
    '.v4a-h i{flex:none;width:44px;height:44px;border-radius:50%;background:#fff;color:#0a1324;display:flex;align-items:center;justify-content:center;font-style:normal;transition:transform .3s}',
    '.v4a:hover .v4a-h i{transform:translateX(4px)}',
    '.v4a:focus-visible{outline:2px solid #2847fc;outline-offset:3px}',
    '.v4a-dots{display:flex;gap:6px}',
    '.v4a-dots i{width:6px;height:6px;border-radius:50%;background:#d3d6dd;transition:width .3s,background .3s}',
    '.v4a-dots i.on{width:18px;border-radius:3px;background:#2847fc}'
  ].join('\n');
  document.head.appendChild(css);

  var sections = [].slice.call(root.children).filter(function (el) { return el.tagName === 'DIV'; });

  /* 1. スクロール出現：各セクションの直下ブロックを順に */
  var rv = [];
  sections.forEach(function (sec) {
    [].slice.call(sec.children).forEach(function (el, i) {
      el.classList.add('v4m-rv');
      el.style.transitionDelay = (i * 0.08) + 's';
      rv.push(el);
      var kids = el.children;
      var gcs = getComputedStyle(el), gp = parseFloat(gcs.rowGap) || 0;
      if (kids.length >= 3 && kids.length <= 8 && gcs.display.indexOf('grid') > -1 && gp > 2) {
        [].slice.call(kids).forEach(function (k, j) { k.classList.add('v4m-rv'); k.style.transitionDelay = (0.1 + j * 0.08) + 's'; rv.push(k); });
      }
    });
  });
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e) { io.observe(e); });
  }

  /* 技術と信頼性：4マスの中身を順にフェード（背景セルは動かさない） */
  (function () {
    var t = document.getElementById('technology'); if (!t) return;
    var g = [].slice.call(t.querySelectorAll('div')).find(function (d) { return /grid-template-columns/.test(d.getAttribute('style') || '') && d.children.length === 4; });
    if (!g) return;
    var items = [];
    [].slice.call(g.children).forEach(function (cell, i) {
      [].slice.call(cell.children).forEach(function (c) { c.classList.add('v4m-tc'); c.style.transitionDelay = (0.15 + i * 0.12) + 's'; items.push(c); });
    });
    if (reduce || !('IntersectionObserver' in window)) { items.forEach(function (c) { c.classList.add('in'); }); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { items.forEach(function (c) { c.classList.add('in'); }); o.disconnect(); } }, { threshold: .3 });
    o.observe(g);
  })();

  /* 2. 数字カウントアップ（Poppins の大きい数字のみ） */
  var nums = [].slice.call(root.querySelectorAll('div')).filter(function (d) {
    var s = d.getAttribute('style') || '';
    return !d.closest('#technology') && /Poppins/.test(s) && /font-size:\s*(3[2-9]|[4-9]\d)px/.test(s) && /^\s*[\d.,]+/.test(d.textContent) && !/→/.test(d.textContent);
  });
  nums.forEach(function (el) {
    var tn = el.firstChild; if (!tn || tn.nodeType !== 3) return;
    var m = tn.nodeValue.match(/^(\s*)([\d.,]+)(.*)$/); if (!m) return;
    var raw = m[2], val = parseFloat(raw.replace(/,/g, '')), dec = (raw.split('.')[1] || '').length, comma = raw.indexOf(',') > -1;
    function fmt(x) { var s = x.toFixed(dec); if (comma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); return m[1] + s + m[3]; }
    if (reduce || !('IntersectionObserver' in window)) return;
    tn.nodeValue = fmt(0);
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = null;
      function step(ts) { if (t0 === null) t0 = ts; var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3); tn.nodeValue = fmt(val * e); if (p < 1) requestAnimationFrame(step); else tn.nodeValue = m[1] + raw + m[3]; }
      requestAnimationFrame(step);
    }, { threshold: .6 });
    o.observe(el);
  });

  /* 3. 写真ブロック：ホバーでゆっくりズーム */
  [].slice.call(root.querySelectorAll('img')).forEach(function (img) {
    var box = img.parentElement;
    if (!box || !/overflow:\s*hidden/.test(box.getAttribute('style') || '')) return;
    if (/customers/.test(img.src) || img.closest('.v4a')) return;
    box.classList.add('v4m-ph');
  });

  /* 4. 業界別アコーディオン */
  var accs = [].slice.call(root.querySelectorAll('.v4a'));
  var dots = root.querySelector('.v4a-dots');
  if (dots) accs.forEach(function (_, j) { var b = document.createElement('i'); dots.appendChild(b); });
  function openAcc(it) {
    accs.forEach(function (x, j) { var on = x === it; x.classList.toggle('on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); if (dots) dots.children[j].classList.toggle('on', on); });
  }
  accs.forEach(function (it, k) {
    it.setAttribute('role', 'tab');
    it.addEventListener('mouseenter', function () { openAcc(it); });
    it.addEventListener('focus', function () { openAcc(it); });
    it.addEventListener('click', function (e) { if (!it.classList.contains('on')) { e.preventDefault(); openAcc(it); } });
    it.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); var n = accs[(k + (e.key === 'ArrowRight' ? 1 : accs.length - 1)) % accs.length]; n.focus();
    });
  });
  var cur = accs.filter(function (x) { return x.classList.contains('on'); })[0] || accs[0]; if (cur) openAcc(cur);

  /* 5. リスト行・カード・ボタン */
  [].slice.call(root.querySelectorAll('*')).forEach(function (el) {
    var s = el.getAttribute('style') || '';
    if (/border-radius:\s*(40|999|100)px/.test(s) && /(^|;)\s*height:\s*(4[4-9]|5\d)px/.test(s)) { el.classList.add('v4m-btn'); el.style.cursor = 'pointer'; return; }
    if (/background(-color)?:\s*(#fff(fff)?\b|rgb\(255,\s*255,\s*255\))/.test(s) && /border-radius:\s*(16|20|24)px/.test(s) && !/position:\s*absolute/.test(s) && !el.classList.contains('v4m-ph')) el.classList.add('v4m-card');
  });
  [].slice.call(root.querySelectorAll('span')).forEach(function (sp) { if (sp.textContent.trim() === '→') { sp.classList.add('v4m-arrow'); } });
  /* Products 行：底色なし、名前・矢印ボタンで反応 */
  (function () {
    var sec = document.getElementById('products'); if (!sec) return;
    [].slice.call(sec.querySelectorAll('div')).forEach(function (d) {
      var s = d.getAttribute('style') || '';
      if (!(/border-(top|bottom):\s*1px/.test(s) && /display:\s*(grid|flex)/.test(s) && d.children.length >= 3)) return;
      d.classList.add('v4m-prow'); d.style.cursor = 'pointer';
      var img = d.querySelector('img'); if (img && img.parentElement) img.parentElement.classList.add('v4m-pic');
      var name = [].slice.call(d.querySelectorAll('b, div')).find(function (x) { return /font-size:\s*(1[89]|2\d|3\d)px/.test(x.getAttribute('style') || '') && x.children.length === 0; });
      if (name) name.classList.add('v4m-pname');
      var arr = [].slice.call(d.querySelectorAll('span, div')).filter(function (x) { return x.textContent.trim() === '→'; }).pop();
      if (arr) { arr.classList.remove('v4m-arrow'); arr.classList.add('v4m-pbtn'); }
    });
  })();
  /* News 行：底色なし、タイトルを青＋下線、矢印だけ右へ */
  (function () {
    var sec = document.getElementById('resources'); if (!sec) return;
    [].slice.call(sec.querySelectorAll('div, a')).forEach(function (d) {
      var s = d.getAttribute('style') || '';
      if (!(/border-(top|bottom):\s*1px/.test(s) && /display:\s*(grid|flex)/.test(s) && d.children.length >= 3)) return;
      d.classList.add('v4m-nrow'); d.style.cursor = 'pointer';
      var kids = [].slice.call(d.children);
      var arr = kids.filter(function (x) { return x.textContent.trim() === '→'; }).pop();
      if (arr) { arr.classList.remove('v4m-arrow'); arr.classList.add('v4m-narr'); }
      var title = kids.filter(function (x) { return x !== arr; }).sort(function (a, b) { return b.textContent.length - a.textContent.length; })[0];
      if (title) title.classList.add('v4m-ntitle');
    });
  })();
  [].forEach(function (id) {
    var sec = document.getElementById(id); if (!sec) return;
    [].slice.call(sec.querySelectorAll('div')).forEach(function (d) {
      var s = d.getAttribute('style') || '';
      if (/border-(top|bottom):\s*1px/.test(s) && /display:\s*(grid|flex)/.test(s) && d.children.length >= 3) { d.classList.add('v4m-row'); d.style.cursor = 'pointer'; }
    });
  });
})();
