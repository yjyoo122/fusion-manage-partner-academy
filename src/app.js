(function () {
  'use strict';
  var D = window.ACADEMY, U = D.ui, L = D.meta.lang, KEY = 'fmacad:' + (D.meta.storageVersion || '1') + ':';
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(KEY + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} }
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function md(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[\[([\w-]+)\|(.+?)\]\]/g, '<a href="#m-$1">$2</a>')
      .replace(/\n/g, '<br>');
  }
  function list(items, ordered) { return '<' + (ordered ? 'ol' : 'ul') + ' class="l">' + items.map(function (i) { return '<li>' + md(i) + '</li>'; }).join('') + '</' + (ordered ? 'ol' : 'ul') + '>'; }
  function isNum(v) { return /^[~≈]?[\d.,]+([–\-][\d.,]+)?\s*(h|d|%|w|주|일|시간|週|日|時間|名|명)?$/.test(String(v).trim()); }

  var R = {
    lead: function (b) { return '<p class="lead">' + md(b.text) + '</p>'; },
    p: function (b) { return '<p>' + md(b.text) + '</p>'; },
    h: function (b) { return '<h3>' + md(b.text) + '</h3>'; },
    list: function (b) { return (b.title ? '<h3>' + md(b.title) + '</h3>' : '') + list(b.items, b.ordered); },
    table: function (b) {
      var h = (b.title ? '<h3>' + md(b.title) + '</h3>' : '') + '<div class="twrap"><table class="t' + (b.cls ? ' ' + b.cls : '') + '"><thead><tr>' +
        b.head.map(function (c, i) { return '<th' + (b.num && b.num.indexOf(i) >= 0 ? ' class="num"' : '') + '>' + md(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
      b.rows.forEach(function (r) {
        var tot = r[0] && String(r[0]).indexOf('Σ') === 0;
        h += '<tr' + (tot ? ' class="total"' : '') + '>' + r.map(function (c, i) {
          return '<td' + ((b.num && b.num.indexOf(i) >= 0) ? ' class="num"' : '') + '>' + md(tot && i === 0 ? String(c).slice(1).trim() : c) + '</td>';
        }).join('') + '</tr>';
      });
      return h + '</tbody></table></div>' + (b.note ? '<p class="tnote">' + md(b.note) + '</p>' : '');
    },
    callout: function (b) {
      var tag = U.callout[b.kind || 'tip'] || '';
      return '<div class="callout ' + (b.kind || 'tip') + '"><div class="ct">' + (tag ? '<span class="tag">' + esc(tag) + '</span>' : '') + '<span>' + md(b.title || '') + '</span></div>' +
        (b.text ? '<p>' + md(b.text) + '</p>' : '') + (b.items ? list(b.items) : '') + '</div>';
    },
    steps: function (b) {
      return (b.title ? '<h3>' + md(b.title) + '</h3>' : '') + '<ol class="steps">' + b.items.map(function (i) {
        return '<li><div><div class="st">' + md(i.title) + '</div>' + (i.text ? '<div>' + md(i.text) + '</div>' : '') + (i.meta ? '<div class="sm">' + md(i.meta) + '</div>' : '') + '</div></li>';
      }).join('') + '</ol>';
    },
    stats: function (b) { return '<div class="stats">' + b.items.map(function (i) { return '<div><div class="v">' + esc(i.value) + '</div><div class="k">' + md(i.label) + '</div></div>'; }).join('') + '</div>'; },
    bars: function (b) {
      var max = Math.max.apply(null, b.items.map(function (i) { return i.value; }));
      return '<div class="bars"><div class="bt">' + md(b.title) + '</div>' + (b.subtitle ? '<div class="bs">' + md(b.subtitle) + '</div>' : '') +
        b.items.map(function (i) {
          return '<div class="row"><div><div class="bar' + (i.hi ? ' hi' : '') + '" style="width:' + Math.max(2, i.value / max * 100) + '%"><span>' + md(i.label) + '</span></div></div><div class="val">' + esc(i.value) + ' <small>' + esc(b.unit || '') + '</small></div></div>';
        }).join('') + (b.note ? '<div class="bn">' + md(b.note) + '</div>' : '') + '</div>';
    },
    gantt: function (b) {
      var n = b.cols.length, g = '<div class="gantt"><div class="gt">' + md(b.title) + '</div>' + (b.subtitle ? '<div class="gs">' + md(b.subtitle) + '</div>' : '') +
        '<div class="grid" style="grid-template-columns: 240px repeat(' + n + ', 1fr)"><div class="hd"></div>' + b.cols.map(function (c) { return '<div class="hd">' + esc(c) + '</div>'; }).join('');
      b.rows.forEach(function (r) {
        g += '<div class="lab">' + md(r.label) + '</div>';
        for (var c = 0; c < n; c++) {
          var bar = '';
          if (c === r.start) bar = '<div class="bar k-' + (r.kind || 'std') + '" style="left:2px;width:calc(' + (r.len * 100) + '% + ' + (r.len - 1) + 'px - 4px)" title="' + esc(r.text || '') + '">' + esc(r.text || '') + '</div>';
          g += '<div class="cell">' + bar + '</div>';
        }
      });
      g += '</div>';
      if (b.legend) g += '<div class="legend">' + b.legend.map(function (l) { return '<span><i style="background:' + ({ std: 'var(--ws)', run: 'var(--black)', gate: 'var(--yellow);outline:1px solid var(--black)', opt: 'var(--ws300)' }[l.kind]) + '"></i>' + esc(l.text) + '</span>'; }).join('') + '</div>';
      return g + (b.note ? '<div class="bn small muted" style="margin-top:8px">' + md(b.note) + '</div>' : '') + '</div>';
    },
    flow: function (b) {
      var off = b.start || 0;
      return (b.title ? '<h3>' + md(b.title) + '</h3>' : '') + '<div class="flow" style="--n:' + b.items.length + '">' + b.items.map(function (i, k) {
        var n = k + 1 + off;
        return '<div class="' + (i.hi ? 'hi' : '') + '"><div class="fn">' + (n < 10 ? '0' : '') + n + '</div><div class="ft">' + md(i.title) + '</div><div class="fx">' + md(i.text || '') + '</div></div>';
      }).join('') + '</div>';
    },
    tiles: function (b) {
      return (b.title ? '<h3>' + md(b.title) + '</h3>' : '') + '<div class="tiles">' + b.items.map(function (i) {
        return '<div>' + (i.tag ? '<div class="tg">' + esc(i.tag) + '</div>' : '') + '<div class="tt">' + md(i.title) + '</div><div class="tx">' + (i.text ? md(i.text) : '') + (i.items ? list(i.items) : '') + '</div></div>';
      }).join('') + '</div>';
    },
    checklist: function (b) {
      var st = store.get('ck:' + b.id, {});
      return (b.title ? '<h3>' + md(b.title) + '</h3>' : '') + '<ul class="check" data-ck="' + esc(b.id) + '">' + b.items.map(function (i, k) {
        return '<li><label><input type="checkbox" data-k="' + k + '"' + (st[k] ? ' checked' : '') + '><span>' + md(i) + '</span></label></li>';
      }).join('') + '</ul><div class="check"><div class="cmeta"><span class="ckc" data-for="' + esc(b.id) + '"></span><button type="button" data-reset="' + esc(b.id) + '">' + esc(U.reset) + '</button></div></div>';
    },
    details: function (b) {
      return b.items.map(function (i) { return '<details class="d"><summary>' + md(i.title) + '</summary><div class="db">' + renderBlocks(i.blocks) + '</div></details>'; }).join('');
    },
    template: function (b) {
      var id = 'tpl' + Math.random().toString(36).slice(2, 8);
      return '<div class="tpl"><div class="th"><b>' + md(b.title) + '</b><button type="button" data-copy="' + id + '">' + esc(U.copy) + '</button></div><div class="tb" id="' + id + '">' +
        (b.intro ? '<p>' + md(b.intro) + '</p>' : '') + b.sections.map(function (s, k) { return '<div class="sh">' + (k + 1) + '. ' + md(s.h) + '</div>' + (s.items ? list(s.items) : ''); }).join('') + '</div></div>';
    },
    raci: function (b) {
      return (b.title ? '<h3>' + md(b.title) + '</h3>' : '') + '<div class="twrap"><table class="t raci"><thead><tr><th>' + esc(U.activity) + '</th>' + b.roles.map(function (r) { return '<th style="text-align:center;white-space:normal">' + md(r) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        b.rows.map(function (r) { return '<tr><td>' + md(r[0]) + '</td>' + r.slice(1).map(function (v) { return '<td class="v ' + esc(v.charAt(0)) + '">' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table></div><p class="tnote">' + md(U.raciKey) + '</p>';
    },
    quiz: function (b) {
      var qid = CUR + ':' + (QN++), st = store.get('qz:' + qid, {}), score = 0, answered = 0;
      var body = b.items.map(function (q, k) {
        var pick = st[k], isDone = pick !== undefined && pick !== null;
        if (isDone) { answered++; if (pick === q.answer) score++; }
        return '<div class="q' + (isDone ? ' done' : '') + '" data-a="' + q.answer + '" data-k="' + k + '"><div class="qq">' + (k + 1) + '. ' + md(q.q) + '</div>' + q.options.map(function (o, j) {
          var cls = !isDone ? '' : (j === q.answer ? ' right' : (j === pick ? ' wrong' : ''));
          return '<button type="button" class="o' + cls + '" data-j="' + j + '">' + md(o) + '</button>';
        }).join('') + '<div class="why">' + md(q.why) + '</div></div>';
      }).join('');
      return '<div class="quiz" data-qid="' + esc(qid) + '" data-n="' + b.items.length + '"><div class="qh"><h3>' + esc(U.quizTitle) + '</h3><span class="qs">' + (answered ? esc(U.quizScore.replace('{n}', score).replace('{t}', b.items.length)) : '') + '</span><button type="button" class="btn qr">' + esc(U.quizRetry) + '</button></div><p class="small muted">' + esc(U.quizHint) + '</p>' + body + '</div>';
    },
    estimator: function () { return '<div class="est" id="est"></div>'; },
    builder: function () { return '<div class="bld" id="bld"></div>'; }
  };
  function renderBlocks(blocks) {
    return (blocks || []).map(function (b) {
      if (b.t === 'sec') return '</section><section><h2 class="sec" id="' + esc(b.id || '') + '">' + md(b.text) + '</h2>';
      var f = R[b.t]; return f ? f(b) : '';
    }).join('');
  }

  // ---------- shell ----------
  var mods = D.modules, done = store.get('done', {});
  var totalMin = mods.reduce(function (s, m) { var f = (m.facts || [])[0]; var n = f ? parseInt(String(f[1]).replace(/[^\d]/g, ''), 10) : 0; return s + (isNaN(n) ? 0 : n); }, 0);
  document.getElementById('tottime').textContent = U.totalTime.replace('{h}', Math.floor(totalMin / 60)).replace('{m}', totalMin % 60);
  var side = document.getElementById('side'), main = document.getElementById('main');
  function navHTML() {
    var h = '', g = null;
    mods.forEach(function (m) {
      if (m.group !== g) { g = m.group; h += '<div class="grp">' + esc(D.groups[g] || g) + '</div>'; }
      h += '<a href="#m-' + m.id + '" data-id="' + m.id + '"><span class="n">' + esc(m.num) + '</span><span>' + esc(m.short || m.title.replace(/\*/g, '')) + '</span><span class="ok">' + (done[m.id] ? '✓' : '') + '</span></a>';
    });
    return h;
  }
  function progress() {
    var n = mods.filter(function (m) { return done[m.id]; }).length;
    document.getElementById('progtxt').textContent = U.progress.replace('{n}', n).replace('{t}', mods.length);
    document.getElementById('progfill').style.width = (n / mods.length * 100) + '%';
  }
  document.getElementById('nav').innerHTML = navHTML();
  function title(m) { return esc(m.title).replace(/\*(.+?)\*/g, '<em>$1</em>'); }
  function show(id) {
    var i = mods.findIndex(function (m) { return m.id === id; }); if (i < 0) i = 0;
    var m = mods[i], prev = mods[i - 1], next = mods[i + 1];
    CUR = m.id; QN = 0;
    var DS = D.meta.disclaimer;
    var banner = '<div class="banner" role="note"><span>⚠ ' + esc(DS.banner) + '</span><button type="button" class="lnk" id="showdisc">' + esc(DS.bannerLink) + '</button></div>';
    var last = store.get('last', null), resume = '';
    if (FIRST && last && last.id !== m.id) {
      var lm = mods.filter(function (x) { return x.id === last.id; })[0];
      if (lm) resume = '<div class="resume" id="resume"><span>' + esc(U.resume.replace('{n}', lm.num).replace('{title}', lm.short || '')) + '</span><a class="btn dark" href="#m-' + lm.id + '" id="resumego">' + esc(U.resumeBtn) + '</a><button type="button" class="lnk" id="resumex">' + esc(U.dismiss) + '</button></div>';
    }
    FIRST = false;
    var html = banner + resume + '<article class="module"><header class="hero"><div><div class="kicker">' + esc(U.module) + ' ' + esc(m.num) + ' · ' + esc(D.groups[m.group] || '') + '</div><h1>' + title(m) + '</h1><p class="goal">' + md(m.goal) + '</p></div><div class="facts">' +
      (m.facts || []).map(function (f, k) { var lab = (k === 0 && U.timeLabel) ? U.timeLabel : f[0]; return '<div><span>' + esc(lab) + '</span><b>' + esc(f[1]) + '</b></div>'; }).join('') + '</div></header>' +
      '<div class="content"><section>' + renderBlocks(m.blocks) + '</section></div>' +
      '<div class="pager"><div>' + (prev ? '<a href="#m-' + prev.id + '"><div class="pl">← ' + esc(U.prev) + '</div><div class="pt">' + esc(prev.short || prev.title.replace(/\*/g, '')) + '</div></a>' : '') + '</div>' +
      '<div><button type="button" class="done-btn' + (done[m.id] ? ' is' : '') + '" id="donebtn">' + esc(done[m.id] ? U.completed : U.markDone) + '</button></div>' +
      '<div class="next">' + (next ? '<a href="#m-' + next.id + '"><div class="pl">' + esc(U.next) + ' →</div><div class="pt">' + esc(next.short || next.title.replace(/\*/g, '')) + '</div></a>' : '') + '</div></div>' +
      '<div class="legal">' + md(D.meta.legal) + '</div></article>';
    main.innerHTML = html;
    Array.prototype.forEach.call(document.querySelectorAll('#nav a'), function (a) { a.classList.toggle('on', a.getAttribute('data-id') === m.id); });
    document.getElementById('donebtn').onclick = function () {
      done[m.id] = !done[m.id]; store.set('done', done); document.getElementById('nav').innerHTML = navHTML(); show(m.id);
    };
    wire(); document.body.classList.remove('menu');
    var ly = (last && last.id === m.id && RESTORE) ? last.y : 0; RESTORE = false;
    window.scrollTo(0, ly || 0);
    store.set('last', { id: m.id, y: ly || 0, ts: Date.now() });
    document.getElementById('showdisc').onclick = function () { gate(true); };
    var rx = document.getElementById('resumex'); if (rx) rx.onclick = function () { document.getElementById('resume').remove(); };
    var rg = document.getElementById('resumego'); if (rg) rg.onclick = function () { RESTORE = true; };
    document.title = m.title.replace(/\*/g, '') + ' · ' + D.meta.title;
  }
  var CUR = '', QN = 0, FIRST = true, RESTORE = false;
  // ---------- save / resume ----------
  var scrollT = null;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollT);
    scrollT = setTimeout(function () { if (CUR) store.set('last', { id: CUR, y: window.scrollY, ts: Date.now() }); }, 400);
  });
  function stamp() { var d = new Date(); return d.toLocaleString(); }
  document.getElementById('savebtn').onclick = function () {
    store.set('last', { id: CUR, y: window.scrollY, ts: Date.now() });
    store.set('savedAt', Date.now());
    document.getElementById('savemsg').textContent = U.saved.replace('{t}', stamp());
  };
  (function () { var s = store.get('savedAt', null); if (s) document.getElementById('savemsg').textContent = U.saved.replace('{t}', new Date(s).toLocaleString()); })();
  document.getElementById('expbtn').onclick = function () {
    var o = {}; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf(KEY) === 0) o[k.slice(KEY.length)] = localStorage.getItem(k); }
    var blob = new Blob([JSON.stringify({ app: 'fm-partner-academy', lang: L, v: D.meta.version, data: o })], { type: 'application/json' });
    download(blob, 'fm-academy-progress-' + L + '.json');
  };
  document.getElementById('impfile').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () { try { var j = JSON.parse(r.result); Object.keys(j.data).forEach(function (k) { localStorage.setItem(KEY + k, j.data[k]); }); alert(U.importOk); location.reload(); } catch (x) { alert(U.importErr); } };
    r.readAsText(f);
  };
  document.getElementById('impbtn').onclick = function () { document.getElementById('impfile').click(); };
  function download(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  // ---------- disclaimer gate ----------
  function gate(viewOnly) {
    var DS = D.meta.disclaimer, ov = document.createElement('div');
    ov.className = 'gate'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="gbox"><div class="gk">' + esc(DS.kicker) + '</div><h2>' + esc(DS.title).replace(/\*(.+?)\*/g, '<em>$1</em>') + '</h2><ol>' + DS.items.map(function (t) { return '<li>' + md(t) + '</li>'; }).join('') + '</ol>' +
      (viewOnly ? '<div class="gact"><button type="button" class="gbtn" id="gclose">' + esc(DS.close) + '</button></div>' :
        '<label class="gchk"><input type="checkbox" id="gck"><span>' + esc(DS.check) + '</span></label><div class="gact"><button type="button" class="gbtn" id="genter" disabled>' + esc(DS.enter) + '</button></div>') + '</div>';
    document.body.appendChild(ov); document.body.classList.add('gated');
    function close() { ov.remove(); document.body.classList.remove('gated'); }
    if (viewOnly) { document.getElementById('gclose').onclick = close; ov.addEventListener('click', function (e) { if (e.target === ov) close(); }); }
    else {
      var ck = document.getElementById('gck'), en = document.getElementById('genter');
      ck.onchange = function () { en.disabled = !ck.checked; };
      en.onclick = function () { store.set('ack', { v: D.meta.ackVersion, ts: Date.now() }); close(); };
      ck.focus();
    }
  }
  (function () { var a = store.get('ack', null); if (!a || a.v !== D.meta.ackVersion) gate(false); })();
  function wire() {
    Array.prototype.forEach.call(main.querySelectorAll('ul.check[data-ck]'), function (ul) {
      var id = ul.getAttribute('data-ck');
      function count() { var st = store.get('ck:' + id, {}), n = 0, t = ul.querySelectorAll('input').length; for (var k in st) if (st[k]) n++; var c = main.querySelector('.ckc[data-for="' + id + '"]'); if (c) c.textContent = U.checked.replace('{n}', n).replace('{t}', t); }
      ul.addEventListener('change', function (e) { var st = store.get('ck:' + id, {}); st[e.target.getAttribute('data-k')] = e.target.checked; store.set('ck:' + id, st); count(); });
      count();
    });
    Array.prototype.forEach.call(main.querySelectorAll('[data-reset]'), function (b) { b.onclick = function () { var id = b.getAttribute('data-reset'); store.set('ck:' + id, {}); Array.prototype.forEach.call(main.querySelectorAll('ul.check[data-ck="' + id + '"] input'), function (i) { i.checked = false; }); var c = main.querySelector('.ckc[data-for="' + id + '"]'); if (c) c.textContent = U.checked.replace('{n}', 0).replace('{t}', main.querySelectorAll('ul.check[data-ck="' + id + '"] input').length); }; });
    Array.prototype.forEach.call(main.querySelectorAll('[data-copy]'), function (b) { b.onclick = function () { var el = document.getElementById(b.getAttribute('data-copy')); copyText(el.innerText, b); }; });
    Array.prototype.forEach.call(main.querySelectorAll('.quiz'), function (qz) {
      var qid = qz.getAttribute('data-qid'), n = +qz.getAttribute('data-n');
      function score() {
        var st = store.get('qz:' + qid, {}), s = 0, a = 0;
        Array.prototype.forEach.call(qz.querySelectorAll('.q'), function (q) { var k = q.getAttribute('data-k'); if (st[k] !== undefined && st[k] !== null) { a++; if (st[k] === +q.getAttribute('data-a')) s++; } });
        qz.querySelector('.qs').textContent = a ? U.quizScore.replace('{n}', s).replace('{t}', n) : '';
      }
      Array.prototype.forEach.call(qz.querySelectorAll('.q'), function (q) {
        q.addEventListener('click', function (e) {
          var o = e.target.closest('button.o'); if (!o || q.classList.contains('done')) return;
          var a = +q.getAttribute('data-a'), j = +o.getAttribute('data-j');
          o.classList.add(j === a ? 'right' : 'wrong'); if (j !== a) q.querySelectorAll('button.o')[a].classList.add('right'); q.classList.add('done');
          var st = store.get('qz:' + qid, {}); st[q.getAttribute('data-k')] = j; store.set('qz:' + qid, st); score();
        });
      });
      qz.querySelector('.qr').onclick = function () {
        store.set('qz:' + qid, {});
        Array.prototype.forEach.call(qz.querySelectorAll('.q'), function (q) { q.classList.remove('done'); Array.prototype.forEach.call(q.querySelectorAll('button.o'), function (b) { b.classList.remove('right', 'wrong'); }); });
        score();
      };
    });
    if (document.getElementById('est')) estimator(document.getElementById('est'));
    if (document.getElementById('bld')) builder(document.getElementById('bld'));
  }
  function copyText(t, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = U.copied; setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done); else { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(); }
  }

  // ---------- estimator ----------
  function estimator(el) {
    var E = D.estimator, S = store.get('est', null) || { sel: {}, lvl: {}, sites: 1, users: E.defaults.users, cont: E.defaults.contingency, pm: E.defaults.pm, fte: E.defaults.fte, rate: '', cur: '' };
    E.items.forEach(function (it) { if (S.sel[it.id] === undefined) S.sel[it.id] = !!it.on; if (!S.lvl[it.id]) S.lvl[it.id] = 'M'; });
    function hoursOf(it) {
      var h = it.h[S.lvl[it.id]] || 0;
      if (it.perSite && S.sites > 1) h += h * it.perSite * (S.sites - 1);
      if (it.perUsers) h += Math.ceil(Math.max(0, S.users - it.perUsers.base) / it.perUsers.step) * it.perUsers.add;
      return Math.round(h);
    }
    function draw() {
      var groups = {}, order = [];
      E.items.forEach(function (it) { if (!groups[it.group]) { groups[it.group] = []; order.push(it.group); } groups[it.group].push(it); });
      var h = '<div class="eh">' +
        '<label class="f"><b>' + esc(E.ui.sites) + '</b><input type="number" min="1" max="20" id="e-sites" value="' + S.sites + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.users) + '</b><input type="number" min="5" max="5000" step="5" id="e-users" value="' + S.users + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.pm) + '</b><input type="number" min="0" max="30" id="e-pm" value="' + S.pm + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.cont) + '</b><input type="number" min="0" max="40" id="e-cont" value="' + S.cont + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.fte) + '</b><input type="number" min="0.5" max="6" step="0.5" id="e-fte" value="' + S.fte + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.rate) + '</b><input type="number" min="0" id="e-rate" value="' + esc(S.rate) + '" placeholder="' + esc(E.ui.ratePh) + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.cur) + '</b><input type="text" maxlength="6" id="e-cur" value="' + esc(S.cur) + '" placeholder="' + esc(E.ui.curPh) + '"></label></div>';
      order.forEach(function (g) {
        h += '<div class="eg"><h4>' + esc(E.groups[g] || g) + '</h4>';
        groups[g].forEach(function (it) {
          h += '<div class="ei"><input type="checkbox" data-sel="' + it.id + '"' + (S.sel[it.id] ? ' checked' : '') + '><div><div>' + md(it.label) + '</div>' + (it.desc ? '<div class="desc">' + md(it.desc) + '</div>' : '') + '</div>' +
            '<select class="lvl" data-lvl="' + it.id + '">' + ['S', 'M', 'L'].map(function (k) { return '<option value="' + k + '"' + (S.lvl[it.id] === k ? ' selected' : '') + '>' + esc(E.ui.lvl[k]) + ' · ' + it.h[k] + 'h</option>'; }).join('') + '</select>' +
            '<div class="eh2">' + (S.sel[it.id] ? hoursOf(it) + 'h' : '—') + '</div></div>';
        });
        h += '</div>';
      });
      var base = 0, byPhase = {}, rows = '';
      E.items.forEach(function (it) { if (!S.sel[it.id]) return; var x = hoursOf(it); base += x; byPhase[it.phase] = (byPhase[it.phase] || 0) + x; });
      var pm = Math.round(base * S.pm / 100), sub = base + pm, cont = Math.round(sub * S.cont / 100), tot = sub + cont, days = tot / 8;
      var weeks = Math.ceil(days / (Math.max(0.5, S.fte) * 5) * E.defaults.latency);
      Object.keys(E.phases).forEach(function (p) { if (byPhase[p]) rows += '<tr><td>' + esc(E.phases[p]) + '</td><td class="num">' + byPhase[p] + 'h</td><td class="num">' + (byPhase[p] / 8).toFixed(1) + ' ' + esc(E.ui.d) + '</td></tr>'; });
      rows += '<tr><td>' + esc(E.ui.pmLine) + ' (' + S.pm + '%)</td><td class="num">' + pm + 'h</td><td class="num">' + (pm / 8).toFixed(1) + ' ' + esc(E.ui.d) + '</td></tr>';
      rows += '<tr><td>' + esc(E.ui.contLine) + ' (' + S.cont + '%)</td><td class="num">' + cont + 'h</td><td class="num">' + (cont / 8).toFixed(1) + ' ' + esc(E.ui.d) + '</td></tr>';
      var money = S.rate ? (Math.round(days * S.rate)).toLocaleString() + ' ' + esc(S.cur || '') : '—';
      h += '<div class="out"><div><div class="v">' + tot.toLocaleString() + 'h</div><div class="k">' + esc(E.ui.totH) + '</div></div><div><div class="v">' + days.toFixed(1) + '</div><div class="k">' + esc(E.ui.totD) + '</div></div><div><div class="v">~' + weeks + '</div><div class="k">' + esc(E.ui.weeks) + '</div></div><div><div class="v">' + money + '</div><div class="k">' + esc(E.ui.fee) + '</div></div></div>' +
        '<div class="brk"><table>' + rows + '</table><p class="tnote" style="margin-top:8px">' + md(E.ui.note) + '</p></div>' +
        '<div class="acts"><button type="button" class="btn" id="e-copy">' + esc(E.ui.copy) + '</button><button type="button" class="btn" id="e-reset">' + esc(U.reset) + '</button></div>';
      el.innerHTML = h;
      el.querySelectorAll('[data-sel]').forEach(function (c) { c.onchange = function () { S.sel[c.getAttribute('data-sel')] = c.checked; save(); }; });
      el.querySelectorAll('[data-lvl]').forEach(function (c) { c.onchange = function () { S.lvl[c.getAttribute('data-lvl')] = c.value; save(); }; });
      [['e-sites', 'sites'], ['e-users', 'users'], ['e-pm', 'pm'], ['e-cont', 'cont'], ['e-fte', 'fte'], ['e-rate', 'rate']].forEach(function (p) { var i = document.getElementById(p[0]); i.onchange = function () { S[p[1]] = i.value === '' ? '' : +i.value; save(); }; });
      document.getElementById('e-cur').onchange = function () { S.cur = this.value; save(); };
      document.getElementById('e-reset').onclick = function () { store.set('est', null); S = null; estimator(el); };
      document.getElementById('e-copy').onclick = function () {
        var lines = [E.ui.copyHead];
        E.items.forEach(function (it) { if (S.sel[it.id]) lines.push([E.groups[it.group], it.label.replace(/\*\*/g, ''), E.ui.lvl[S.lvl[it.id]], hoursOf(it)].join('\t')); });
        lines.push(['', E.ui.pmLine, S.pm + '%', pm].join('\t'), ['', E.ui.contLine, S.cont + '%', cont].join('\t'), ['', E.ui.totH, '', tot].join('\t'));
        copyText(lines.join('\n'), this);
      };
    }
    function save() { store.set('est', S); draw(); }
    draw();
  }

  // ---------- SOW / quote builder ----------
  function builder(el) {
    var B = D.builder, E = D.estimator, BU = B.ui;
    var ITEMS = {}; E.items.concat(B.extraItems).forEach(function (it) { ITEMS[it.id] = it; });
    function fresh(tid) {
      var t = B.templates.filter(function (x) { return x.id === tid; })[0] || B.templates[0], sel = {}, lvl = {};
      t.items.forEach(function (p) { sel[p[0]] = true; lvl[p[0]] = p[1]; });
      (t.optional || []).forEach(function (p) { sel[p[0]] = false; lvl[p[0]] = p[1]; });
      return { tid: t.id, sel: sel, lvl: lvl, sites: 1, users: E.defaults.users, months: 3, pm: E.defaults.pm, cont: E.defaults.contingency, fte: E.defaults.fte, rate: '', cur: '', cust: '', part: '', all: '', tab: 'quote' };
    }
    var S = store.get('bld', null) || fresh(B.templates[0].id);
    (function norm() {
      var f = fresh(S.tid); S.tid = f.tid; S.sel = S.sel || {}; S.lvl = S.lvl || {};
      Object.keys(f.sel).forEach(function (k) { if (S.sel[k] === undefined) S.sel[k] = f.sel[k]; if (!S.lvl[k]) S.lvl[k] = f.lvl[k]; });
      Object.keys(f).forEach(function (k) { if (S[k] === undefined) S[k] = f[k]; });
    })();
    function T() { return B.templates.filter(function (x) { return x.id === S.tid; })[0]; }
    function lvlOf(id) { return S.all || S.lvl[id] || 'M'; }
    function hoursOf(id) {
      var it = ITEMS[id], h = it.h[lvlOf(id)] || 0;
      if (it.perSiteFull) h = h * Math.max(1, S.sites);
      else if (it.perSite && S.sites > 1) h += h * it.perSite * (S.sites - 1);
      if (it.perMonth) h = h * Math.max(1, S.months);
      if (it.perUsers) h += Math.ceil(Math.max(0, S.users - it.perUsers.base) / it.perUsers.step) * it.perUsers.add;
      return Math.round(h);
    }
    function lines() {
      var t = T(), ids = t.items.map(function (p) { return p[0]; }).concat((t.optional || []).map(function (p) { return p[0]; }));
      return ids.filter(function (id) { return S.sel[id] && ITEMS[id]; }).map(function (id) { var it = ITEMS[id]; return { id: id, it: it, lvl: lvlOf(id), h: hoursOf(id), phase: E.phases[it.phase] || it.phase }; });
    }
    function calc() {
      var L2 = lines(), base = L2.reduce(function (s, x) { return s + x.h; }, 0);
      var pm = Math.round(base * S.pm / 100), cont = Math.round((base + pm) * S.cont / 100), tot = base + pm + cont, days = tot / 8;
      var weeks = Math.ceil(days / (Math.max(0.5, S.fte) * 5) * E.defaults.latency);
      var byPhase = {}; L2.forEach(function (x) { byPhase[x.phase] = (byPhase[x.phase] || 0) + x.h; });
      return { L: L2, base: base, pm: pm, cont: cont, tot: tot, days: days, weeks: weeks, byPhase: byPhase };
    }
    function money(h) { return S.rate ? Math.round(h / 8 * S.rate).toLocaleString() + ' ' + (S.cur || '') : '—'; }
    function fill(s, c) { return s.replace('{partner}', S.part || BU.partnerPh).replace('{customer}', S.cust || BU.customerPh).replace('{name}', T().name).replace('{tot}', c.tot.toLocaleString()).replace('{days}', c.days.toFixed(1)).replace('{weeks}', c.weeks); }
    function ul(a) { return '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
    function sowHTML(c, forDoc) {
      var t = T(), C = B.common, n = 0, wm = '<p class="wm">' + esc(B.watermark) + '</p>';
      function H(x) { n++; return '<h3>' + n + '. ' + esc(x) + '</h3>'; }
      var rows = c.L.map(function (x) { return '<tr><td>' + esc(x.phase) + '</td><td>' + esc(x.it.label) + '</td><td>' + x.lvl + '</td><td class="num">' + x.h + '</td><td class="num">' + (x.h / 8).toFixed(1) + '</td></tr>'; }).join('');
      rows += '<tr><td></td><td>' + esc(E.ui.pmLine) + ' (' + S.pm + '%)</td><td></td><td class="num">' + c.pm + '</td><td class="num">' + (c.pm / 8).toFixed(1) + '</td></tr>';
      rows += '<tr><td></td><td>' + esc(E.ui.contLine) + ' (' + S.cont + '%)</td><td></td><td class="num">' + c.cont + '</td><td class="num">' + (c.cont / 8).toFixed(1) + '</td></tr>';
      rows += '<tr class="total"><td></td><td>' + esc(E.ui.totH) + '</td><td></td><td class="num">' + c.tot.toLocaleString() + '</td><td class="num">' + c.days.toFixed(1) + '</td></tr>';
      var ms = t.milestones.map(function (m) { return '<tr><td>' + esc(m[0]) + '</td><td class="num">' + m[1] + '%</td><td class="num">' + (S.rate ? money(c.tot * m[1] / 100) : '—') + '</td></tr>'; }).join('');
      var tbl = forDoc ? ' border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;width:100%"' : ' class="t"';
      return wm + '<h2>' + esc(BU.sowTitle) + ' — ' + esc(t.name) + '</h2><p class="small">' + esc(S.part || BU.partnerPh) + ' → ' + esc(S.cust || BU.customerPh) + ' · ' + esc(new Date().toLocaleDateString()) + ' · v0.1</p>' +
        H(BU.secOverview) + '<p>' + esc(fill(BU.overviewTxt, c)) + '</p>' +
        H(BU.secScope) + ul(t.scope) +
        H(BU.secLines) + '<table' + tbl + '><thead><tr><th>' + esc(BU.phase) + '</th><th>' + esc(BU.item) + '</th><th>' + esc(BU.lvl) + '</th><th>' + esc(BU.hours) + '</th><th>' + esc(BU.days) + '</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        H(BU.secDeliv) + ul(t.deliverables) +
        H(BU.secCaps) + ul(t.caps) +
        H(BU.secAssume) + ul(C.assumptions) +
        H(BU.secCust) + ul(C.customerResp) +
        H(BU.secExcl) + ul(t.exclusions.concat(C.exclusions)) +
        H(BU.secChange) + ul(C.changeControl) +
        H(BU.secComm) + '<p>' + esc(BU.model) + ': ' + esc(t.model) + '</p><table' + tbl + '><thead><tr><th>' + esc(BU.milestones) + '</th><th>' + esc(BU.pct) + '</th><th>' + esc(BU.amount) + '</th></tr></thead><tbody>' + ms + '</tbody></table>' + (S.rate ? '' : '<p class="small">' + esc(BU.noRate) + '</p>') +
        H(BU.secSign) + '<p>' + esc(BU.signTxt) + '</p>' + wm;
    }
    function draw() {
      var t = T(), c = calc();
      var h = '<div class="bstep"><h4>' + esc(BU.pick) + '</h4><div class="bpick">' + B.templates.map(function (x) {
        return '<button type="button" class="bt' + (x.id === S.tid ? ' on' : '') + '" data-tid="' + x.id + '"><span class="tg">' + esc(x.tag) + '</span><b>' + esc(x.name) + '</b><span class="bd">' + esc(x.desc) + '</span></button>';
      }).join('') + '</div></div>';
      var hasMonth = t.items.concat(t.optional || []).some(function (p) { return ITEMS[p[0]] && ITEMS[p[0]].perMonth; });
      h += '<div class="bstep"><h4>' + esc(BU.params) + '</h4><div class="eh">' +
        '<label class="f"><b>' + esc(BU.customer) + '</b><input type="text" data-k="cust" value="' + esc(S.cust) + '" placeholder="' + esc(BU.customerPh) + '"></label>' +
        '<label class="f"><b>' + esc(BU.partner) + '</b><input type="text" data-k="part" value="' + esc(S.part) + '" placeholder="' + esc(BU.partnerPh) + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.sites) + '</b><input type="number" min="1" max="50" data-k="sites" data-num="1" value="' + S.sites + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.users) + '</b><input type="number" min="5" max="5000" step="5" data-k="users" data-num="1" value="' + S.users + '"></label>' +
        (hasMonth ? '<label class="f"><b>' + esc(BU.months) + '</b><input type="number" min="1" max="36" data-k="months" data-num="1" value="' + S.months + '"></label>' : '') +
        '<label class="f"><b>' + esc(BU.level) + '</b><select data-k="all"><option value="">' + esc(BU.levelTpl) + '</option>' + ['S', 'M', 'L'].map(function (k) { return '<option value="' + k + '"' + (S.all === k ? ' selected' : '') + '>' + esc(E.ui.lvl[k]) + '</option>'; }).join('') + '</select></label>' +
        '<label class="f"><b>' + esc(E.ui.pm) + '</b><input type="number" min="0" max="30" data-k="pm" data-num="1" value="' + S.pm + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.cont) + '</b><input type="number" min="0" max="40" data-k="cont" data-num="1" value="' + S.cont + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.fte) + '</b><input type="number" min="0.5" max="6" step="0.5" data-k="fte" data-num="1" value="' + S.fte + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.rate) + '</b><input type="number" min="0" data-k="rate" data-num="1" value="' + esc(S.rate) + '" placeholder="' + esc(E.ui.ratePh) + '"></label>' +
        '<label class="f"><b>' + esc(E.ui.cur) + '</b><input type="text" maxlength="6" data-k="cur" value="' + esc(S.cur) + '" placeholder="' + esc(E.ui.curPh) + '"></label></div></div>';
      h += '<div class="bstep"><h4>' + esc(BU.lines) + '</h4>';
      var all = t.items.map(function (p) { return [p[0], false]; }).concat((t.optional || []).map(function (p) { return [p[0], true]; }));
      all.forEach(function (p) {
        var id = p[0], it = ITEMS[id]; if (!it) return;
        h += '<div class="ei"><input type="checkbox" data-bsel="' + id + '"' + (S.sel[id] ? ' checked' : '') + '><div><div>' + md(it.label) + (p[1] ? ' <span class="opt">' + esc(BU.optional) + '</span>' : '') + '</div>' + (it.desc ? '<div class="desc">' + md(it.desc) + '</div>' : '') + '</div>' +
          '<select data-blvl="' + id + '"' + (S.all ? ' disabled' : '') + '>' + ['S', 'M', 'L'].map(function (k) { return '<option value="' + k + '"' + (lvlOf(id) === k ? ' selected' : '') + '>' + esc(E.ui.lvl[k]) + ' · ' + it.h[k] + 'h' + (it.perSiteFull ? '/site' : it.perMonth ? '/mo' : '') + '</option>'; }).join('') + '</select>' +
          '<div class="eh2">' + (S.sel[id] ? hoursOf(id) + 'h' : '—') + '</div></div>';
      });
      h += '</div>';
      h += '<div class="out"><div><div class="v">' + c.tot.toLocaleString() + 'h</div><div class="k">' + esc(E.ui.totH) + '</div></div><div><div class="v">' + c.days.toFixed(1) + '</div><div class="k">' + esc(E.ui.totD) + '</div></div><div><div class="v">~' + c.weeks + '</div><div class="k">' + esc(E.ui.weeks) + '</div></div><div><div class="v">' + money(c.tot) + '</div><div class="k">' + esc(E.ui.fee) + '</div></div></div>';
      h += '<div class="bstep"><h4>' + esc(BU.out) + '</h4><div class="btabs">' + [['quote', BU.tabQuote], ['lines', BU.tabLines], ['sow', BU.tabSow]].map(function (x) { return '<button type="button" class="tb' + (S.tab === x[0] ? ' on' : '') + '" data-tab="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('') + '</div><div class="bout" id="bout">';
      if (S.tab === 'quote') {
        h += '<p class="wm">' + esc(B.watermark) + '</p><table class="t"><thead><tr><th>' + esc(BU.phase) + '</th><th class="num">' + esc(BU.hours) + '</th><th class="num">' + esc(BU.days) + '</th><th class="num">' + esc(BU.amount) + '</th></tr></thead><tbody>' +
          Object.keys(c.byPhase).map(function (p) { return '<tr><td>' + esc(p) + '</td><td class="num">' + c.byPhase[p] + '</td><td class="num">' + (c.byPhase[p] / 8).toFixed(1) + '</td><td class="num">' + money(c.byPhase[p]) + '</td></tr>'; }).join('') +
          '<tr><td>' + esc(E.ui.pmLine) + ' (' + S.pm + '%)</td><td class="num">' + c.pm + '</td><td class="num">' + (c.pm / 8).toFixed(1) + '</td><td class="num">' + money(c.pm) + '</td></tr>' +
          '<tr><td>' + esc(E.ui.contLine) + ' (' + S.cont + '%)</td><td class="num">' + c.cont + '</td><td class="num">' + (c.cont / 8).toFixed(1) + '</td><td class="num">' + money(c.cont) + '</td></tr>' +
          '<tr class="total"><td>' + esc(E.ui.totH) + '</td><td class="num">' + c.tot.toLocaleString() + '</td><td class="num">' + c.days.toFixed(1) + '</td><td class="num">' + money(c.tot) + '</td></tr></tbody></table>' +
          '<p><b>' + esc(BU.model) + ':</b> ' + esc(t.model) + '</p><table class="t"><thead><tr><th>' + esc(BU.milestones) + '</th><th class="num">' + esc(BU.pct) + '</th><th class="num">' + esc(BU.amount) + '</th></tr></thead><tbody>' +
          t.milestones.map(function (m) { return '<tr><td>' + esc(m[0]) + '</td><td class="num">' + m[1] + '%</td><td class="num">' + money(c.tot * m[1] / 100) + '</td></tr>'; }).join('') + '</tbody></table>' +
          '<p class="tnote">' + esc(E.ui.note) + '</p>';
      } else if (S.tab === 'lines') {
        h += '<p class="wm">' + esc(B.watermark) + '</p><table class="t"><thead><tr><th>' + esc(BU.phase) + '</th><th>' + esc(BU.item) + '</th><th>' + esc(BU.lvl) + '</th><th class="num">' + esc(BU.hours) + '</th><th class="num">' + esc(BU.days) + '</th></tr></thead><tbody>' +
          c.L.map(function (x) { return '<tr><td>' + esc(x.phase) + '</td><td>' + esc(x.it.label) + '</td><td>' + x.lvl + '</td><td class="num">' + x.h + '</td><td class="num">' + (x.h / 8).toFixed(1) + '</td></tr>'; }).join('') +
          '<tr class="total"><td></td><td>' + esc(BU.subtotal) + '</td><td></td><td class="num">' + c.base.toLocaleString() + '</td><td class="num">' + (c.base / 8).toFixed(1) + '</td></tr></tbody></table>';
      } else {
        h += '<div class="sowdoc">' + sowHTML(c, false) + '</div>';
      }
      h += '</div><div class="acts"><button type="button" class="btn" id="b-word">' + esc(BU.dlWord) + '</button><button type="button" class="btn" id="b-csv">' + esc(BU.dlCsv) + '</button><button type="button" class="btn" id="b-print">' + esc(BU.print) + '</button><button type="button" class="btn" id="b-reset">' + esc(U.reset) + '</button></div></div>';
      el.innerHTML = h;
      el.querySelectorAll('[data-tid]').forEach(function (b) { b.onclick = function () { var keep = { cust: S.cust, part: S.part, rate: S.rate, cur: S.cur, sites: S.sites, users: S.users }; S = fresh(b.getAttribute('data-tid')); Object.keys(keep).forEach(function (k) { S[k] = keep[k]; }); save(); }; });
      el.querySelectorAll('[data-k]').forEach(function (i) { i.onchange = function () { var k = i.getAttribute('data-k'); S[k] = i.getAttribute('data-num') ? (i.value === '' ? '' : +i.value) : i.value; save(); }; });
      el.querySelectorAll('[data-bsel]').forEach(function (i) { i.onchange = function () { S.sel[i.getAttribute('data-bsel')] = i.checked; save(); }; });
      el.querySelectorAll('[data-blvl]').forEach(function (i) { i.onchange = function () { S.lvl[i.getAttribute('data-blvl')] = i.value; save(); }; });
      el.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { S.tab = b.getAttribute('data-tab'); save(); }; });
      document.getElementById('b-reset').onclick = function () { S = fresh(S.tid); save(); };
      document.getElementById('b-word').onclick = function () {
        var doc = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>SOW</title><style>body{font-family:"Malgun Gothic",Arial,sans-serif;font-size:10.5pt}h2{font-size:16pt}h3{font-size:12pt;margin-top:14pt}.wm{color:#D34621;font-weight:bold;border:1px solid #D34621;padding:4pt}.num{text-align:right}th{background:#E8E8E8}</style></head><body>' + sowHTML(calc(), true) + '</body></html>';
        download(new Blob(['﻿' + doc], { type: 'application/msword' }), 'SOW_draft_' + T().id + '.doc');
      };
      document.getElementById('b-csv').onclick = function () {
        var c2 = calc(), q = function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
        var rows = [[B.watermark], [BU.phase, BU.item, BU.lvl, BU.hours, BU.days, BU.amount]];
        c2.L.forEach(function (x) { rows.push([x.phase, x.it.label, x.lvl, x.h, (x.h / 8).toFixed(1), S.rate ? Math.round(x.h / 8 * S.rate) : '']); });
        rows.push(['', E.ui.pmLine + ' ' + S.pm + '%', '', c2.pm, (c2.pm / 8).toFixed(1), S.rate ? Math.round(c2.pm / 8 * S.rate) : '']);
        rows.push(['', E.ui.contLine + ' ' + S.cont + '%', '', c2.cont, (c2.cont / 8).toFixed(1), S.rate ? Math.round(c2.cont / 8 * S.rate) : '']);
        rows.push(['', E.ui.totH, '', c2.tot, c2.days.toFixed(1), S.rate ? Math.round(c2.days * S.rate) : '']);
        rows.push([]); rows.push([BU.milestones, BU.pct, BU.amount]);
        T().milestones.forEach(function (m) { rows.push([m[0], m[1] + '%', S.rate ? Math.round(c2.days * S.rate * m[1] / 100) : '']); });
        download(new Blob(['﻿' + rows.map(function (r) { return r.map(q).join(','); }).join('\r\n')], { type: 'text/csv' }), 'quote_lines_' + T().id + '.csv');
      };
      document.getElementById('b-print').onclick = function () {
        var w = window.open('', '_blank'); if (!w) return;
        w.document.write('<html lang="' + L + '"><head><meta charset="utf-8"><title>SOW</title><style>body{font-family:"Malgun Gothic","Yu Gothic",Arial,sans-serif;font-size:11pt;max-width:780px;margin:24px auto;line-height:1.5}.wm{color:#D34621;font-weight:bold;border:1px solid #D34621;padding:6px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:4px 6px;font-size:10pt}.num{text-align:right}tr.total td{font-weight:bold}</style></head><body>' + sowHTML(calc(), true) + '</body></html>');
        w.document.close(); w.focus(); setTimeout(function () { w.print(); }, 300);
      };
    }
    function save() { store.set('bld', S); draw(); }
    draw();
  }

  // ---------- search ----------
  var idx = mods.map(function (m) { var d = document.createElement('div'); d.innerHTML = renderBlocks(m.blocks); return { m: m, txt: (m.title + ' ' + m.goal + ' ' + d.textContent).toLowerCase() }; });
  var sInput = document.getElementById('q');
  sInput.addEventListener('input', function () {
    var q = sInput.value.trim().toLowerCase();
    if (q.length < 2) { route(); return; }
    var res = idx.filter(function (x) { return x.txt.indexOf(q) >= 0; });
    main.innerHTML = '<div class="results"><h2 class="sec">' + esc(U.results.replace('{n}', res.length).replace('{q}', sInput.value)) + '</h2>' + res.map(function (x) {
      var p = x.txt.indexOf(q), snip = x.txt.slice(Math.max(0, p - 60), p + 100);
      return '<div class="r"><a href="#m-' + x.m.id + '">' + esc(x.m.num) + ' ' + esc(x.m.title.replace(/\*/g, '')) + '</a><div class="small muted">…' + esc(snip).replace(esc(q), '<span class="hit">' + esc(q) + '</span>') + '…</div></div>';
    }).join('') + '</div>';
  });
  document.getElementById('menubtn').onclick = function () { document.body.classList.toggle('menu'); };
  function route() { var h = location.hash.replace(/^#m-/, ''); show(h || mods[0].id); progress(); }
  window.addEventListener('hashchange', function () { sInput.value = ''; route(); });
  route();
})();
