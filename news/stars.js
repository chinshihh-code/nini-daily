/* Kids World News 星星集點：每完成一篇 +2⭐，一週三篇都完成再 +2⭐
   星星直接存進打卡網站（魔法時間城堡）的星星銀行（同一個瀏覽器的 localStorage）。
   用法：在每週新聞頁 </body> 前加上 <script src="../stars.js"></script>
   可選：<script>window.KWN_ARTICLES=["篇名1","篇名2","篇名3"]</script> 放在它前面。 */
(function () {
  var KEY = 'magicCastleRoutine_v2_oct';
  var PER = 2, BONUS = 2, N = 3;
  var m = location.pathname.match(/news\/(\d{4}-\d{2}-\d{2})/);
  var WEEK = m ? m[1] : (document.title || 'week');
  var titles = (window.KWN_ARTICLES && window.KWN_ARTICLES.length) ? window.KWN_ARTICLES.slice(0, N) : [];
  while (titles.length < N) titles.push('第 ' + (titles.length + 1) + ' 篇');

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { return null; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
  }
  function rec(s) {
    s.newsRecords = s.newsRecords || {};
    var r = s.newsRecords[WEEK] = s.newsRecords[WEEK] || { done: {}, bonus: false };
    r.done = r.done || {};
    return r;
  }
  function count(r) { var c = 0; for (var i = 1; i <= N; i++) if (r.done[i]) c++; return c; }

  var css = '#kwn-fab{position:fixed;right:18px;bottom:18px;z-index:99999;background:#FFC857;color:#1F2A44;border:0;border-radius:999px;padding:14px 20px;font:800 18px/1 "Nunito","Noto Sans TC",system-ui,sans-serif;box-shadow:0 6px 18px rgba(31,42,68,.25);cursor:pointer}' +
    '#kwn-panel{position:fixed;right:18px;bottom:82px;z-index:99999;width:min(360px,calc(100vw - 36px));background:#FFF8EC;color:#1F2A44;border:3px solid #FFC857;border-radius:22px;padding:18px;font:16px/1.5 "Nunito","Noto Sans TC",system-ui,sans-serif;box-shadow:0 10px 30px rgba(31,42,68,.25);display:none}' +
    '#kwn-panel h4{margin:0 0 4px;font-size:20px;font-weight:800}#kwn-panel .kwn-sub{color:#4A5568;font-size:14px;margin-bottom:12px}' +
    '#kwn-panel .kwn-row{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff;border:2px solid #F0E3CC;border-radius:14px;padding:10px 12px;margin-bottom:8px}' +
    '#kwn-panel .kwn-t{font-weight:700;font-size:15px}#kwn-panel button.kwn-b{border:0;border-radius:12px;padding:8px 12px;font:800 15px "Nunito","Noto Sans TC",sans-serif;cursor:pointer;background:#CFE0FF;color:#1B4A9C;white-space:nowrap}' +
    '#kwn-panel button.kwn-b.on{background:#C6EBD1;color:#1E5B34}#kwn-panel .kwn-bonus{border-radius:14px;padding:10px 12px;margin-top:4px;font-weight:800;background:#EEE;color:#4A5568}#kwn-panel .kwn-bonus.on{background:#FFD36E;color:#1F2A44}' +
    '#kwn-panel .kwn-bank{margin-top:12px;display:flex;justify-content:space-between;align-items:center;font-weight:800}#kwn-panel a{color:#2563C9;font-weight:800;text-decoration:none}' +
    '#kwn-toast{position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:100000;background:#1F2A44;color:#FFF8EC;border-radius:16px;padding:12px 20px;font:800 18px "Nunito","Noto Sans TC",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);display:none;text-align:center}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('button'); fab.id = 'kwn-fab'; fab.type = 'button';
  var panel = document.createElement('div'); panel.id = 'kwn-panel';
  var toast = document.createElement('div'); toast.id = 'kwn-toast';
  document.body.appendChild(panel); document.body.appendChild(fab); document.body.appendChild(toast);

  function showToast(t) {
    toast.textContent = t; toast.style.display = 'block';
    clearTimeout(showToast._t); showToast._t = setTimeout(function () { toast.style.display = 'none'; }, 2600);
  }

  function render() {
    var s = load();
    if (s === null) {
      fab.textContent = '⭐ 集點';
      panel.innerHTML = '<h4>⭐ 本週星星任務</h4><div class="kwn-sub">這個瀏覽器不能存星星（可能是無痕模式）。請用一般模式開啟。</div>';
      return;
    }
    var r = rec(s), c = count(r);
    fab.textContent = '⭐ 集點 ' + c + '/' + N;
    var rows = '';
    for (var i = 1; i <= N; i++) {
      rows += '<div class="kwn-row"><span class="kwn-t">' + esc(titles[i - 1]) + '</span>' +
        '<button type="button" class="kwn-b' + (r.done[i] ? ' on' : '') + '" data-i="' + i + '">' +
        (r.done[i] ? '✅ 已完成 +' + PER + '⭐' : '我完成了！+' + PER + '⭐') + '</button></div>';
    }
    panel.innerHTML = '<h4>⭐ 本週星星任務</h4>' +
      '<div class="kwn-sub">讀完文章、跟讀、做完小測驗，就按「我完成了」。每篇 +' + PER + '⭐，三篇都完成再加 +' + BONUS + '⭐！</div>' + rows +
      '<div class="kwn-bonus' + (r.bonus ? ' on' : '') + '">' + (r.bonus ? '🏆 三篇全部完成！額外 +' + BONUS + '⭐ 已入帳' : '🏆 三篇都完成：額外 +' + BONUS + '⭐（還差 ' + (N - c) + ' 篇）') + '</div>' +
      '<div class="kwn-bank"><span>🏦 我的星星銀行：' + (s.stars || 0) + ' ⭐</span><a href="../../">去打卡城堡 →</a></div>';
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  function toggle(i) {
    var s = load(); if (s === null) return;
    var r = rec(s);
    s.stars = s.stars || 0;
    if (r.done[i]) {
      if (!panel._confirm || panel._confirm !== i) { panel._confirm = i; showToast('再按一次就會取消，並扣回 ' + PER + '⭐'); return; }
      panel._confirm = null;
      delete r.done[i]; s.stars = Math.max(0, s.stars - PER);
      if (r.bonus && count(r) < N) { r.bonus = false; s.stars = Math.max(0, s.stars - BONUS); }
      save(s); render(); showToast('已取消，扣回星星'); return;
    }
    panel._confirm = null;
    r.done[i] = true; s.stars += PER;
    var msg = '太棒了！完成 ' + titles[i - 1] + '，+' + PER + '⭐';
    if (count(r) === N && !r.bonus) { r.bonus = true; s.stars += BONUS; msg = '🏆 三篇全部完成！+' + PER + '⭐，再加碼 +' + BONUS + '⭐！'; }
    if (!save(s)) { showToast('存不進去，請關掉無痕模式'); return; }
    render(); showToast(msg);
  }

  fab.addEventListener('click', function () { panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; render(); });
  panel.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button.kwn-b'); if (b) toggle(+b.getAttribute('data-i'));
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY) render(); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') render(); });
  render();
})();
