/* Kids World News 錄音下載：把網頁錄下的跟讀聲音存成音檔。
   錄音只留在這台裝置，不會上傳。
   用法：在每週新聞頁 </body> 前加上 <script src="../rec-save.js"></script> */
(function () {
  var Orig = window.MediaRecorder;
  if (!Orig) return;
  var recs = [], lastLabel = '錄音', n = 0;
  var m = location.pathname.match(/(\d{4}-\d{2}-\d{2})/);
  var WEEK = m ? m[1] : 'news';

  // 記住最後按下的錄音按鈕，用來幫錄音取名（整篇 / 第幾句）
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button');
    if (!b) return;
    var s = (b.id || '').match(/RecSentence-(\d+)/i);
    if (s) lastLabel = '第' + (+s[1] + 1) + '句';
    else if (/Record|Rec/i.test(b.id || '') || /錄音/.test(b.textContent)) lastLabel = /整篇|全篇|Full/i.test((b.id || '') + b.textContent) ? '整篇' : (b.textContent.trim().slice(0, 12) || '錄音');
  }, true);

  function Wrapped(stream, opts) {
    var r = opts ? new Orig(stream, opts) : new Orig(stream);
    var chunks = [], label = lastLabel, start = Date.now();
    r.addEventListener('start', function () { label = lastLabel; start = Date.now(); chunks = []; });
    r.addEventListener('dataavailable', function (e) { if (e.data && e.data.size) chunks.push(e.data); });
    r.addEventListener('stop', function () {
      if (!chunks.length) return;
      var type = r.mimeType || chunks[0].type || 'audio/mp4';
      add(new Blob(chunks, { type: type }), label, Math.round((Date.now() - start) / 1000));
    });
    return r;
  }
  Wrapped.prototype = Orig.prototype;
  Wrapped.isTypeSupported = function (t) { return Orig.isTypeSupported ? Orig.isTypeSupported(t) : false; };
  window.MediaRecorder = Wrapped;

  function ext(type) { return /mp4|m4a|aac/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : /wav/.test(type) ? 'wav' : 'webm'; }
  function pad(x) { return (x < 10 ? '0' : '') + x; }

  function add(blob, label, secs) {
    n++;
    var d = new Date();
    var time = pad(d.getHours()) + pad(d.getMinutes());
    var name = 'KidsNews-' + WEEK + '-' + label + '-' + time + '-' + n + '.' + ext(blob.type);
    recs.unshift({ blob: blob, name: name, label: label, at: pad(d.getHours()) + ':' + pad(d.getMinutes()), secs: secs });
    if (recs.length > 30) recs.pop();
    fab.style.display = 'block';
    render();
  }

  var css = '#krs-fab{position:fixed;right:18px;bottom:18px;z-index:45;display:none;background:#2563C9;color:#fff;border:0;border-radius:999px;padding:14px 20px;font:800 18px/1 "Nunito","Noto Sans TC",system-ui,sans-serif;box-shadow:0 6px 18px rgba(31,42,68,.25);cursor:pointer}' +
    '#krs-panel{position:fixed;right:18px;bottom:82px;z-index:45;width:min(360px,calc(100vw - 36px));max-height:60vh;overflow:auto;background:#F3F7FF;color:#1F2A44;border:3px solid #2563C9;border-radius:22px;padding:16px;font:16px/1.5 "Nunito","Noto Sans TC",system-ui,sans-serif;box-shadow:0 10px 30px rgba(31,42,68,.25);display:none}' +
    '#krs-panel h4{margin:0 0 4px;font-size:19px;font-weight:800}#krs-panel .krs-sub{color:#4A5568;font-size:13px;margin-bottom:10px}' +
    '#krs-panel .krs-row{display:flex;align-items:center;gap:8px;background:#fff;border:2px solid #DCE6FA;border-radius:14px;padding:8px 10px;margin-bottom:8px}' +
    '#krs-panel .krs-t{flex:1;font-weight:700;font-size:15px}#krs-panel .krs-t small{display:block;color:#4A5568;font-weight:600;font-size:12px}' +
    '#krs-panel button{border:0;border-radius:10px;padding:8px 10px;font:800 14px "Nunito","Noto Sans TC",sans-serif;cursor:pointer;white-space:nowrap}' +
    '#krs-panel .krs-p{background:#C6EBD1;color:#1E5B34}#krs-panel .krs-d{background:#2563C9;color:#fff}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var fab = document.createElement('button'); fab.id = 'krs-fab'; fab.type = 'button'; fab.textContent = '💾 我的錄音';
  var panel = document.createElement('div'); panel.id = 'krs-panel';
  document.body.appendChild(panel); document.body.appendChild(fab);
  var player = new Audio();

  function render() {
    fab.textContent = '💾 我的錄音 (' + recs.length + ')';
    var rows = recs.map(function (r, i) {
      return '<div class="krs-row"><span class="krs-t">' + r.label + '<small>' + r.at + ' · ' + r.secs + ' 秒</small></span>' +
        '<button type="button" class="krs-p" data-p="' + i + '">▶</button>' +
        '<button type="button" class="krs-d" data-d="' + i + '">下載</button></div>';
    }).join('');
    panel.innerHTML = '<h4>💾 我的錄音</h4><div class="krs-sub">錄音只存在這台裝置、不會上傳。關掉或重新整理頁面就會消失，想留下來請按「下載」。iPad 上選「儲存到檔案」。</div>' + rows;
  }

  function download(r) {
    var file;
    try { file = new File([r.blob], r.name, { type: r.blob.type }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: r.name }).catch(function () {});
      return;
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(r.blob); a.download = r.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
  }

  fab.addEventListener('click', function () { panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; render(); });
  panel.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button'); if (!b) return;
    var p = b.getAttribute('data-p'), d = b.getAttribute('data-d');
    if (p !== null) { player.src = URL.createObjectURL(recs[+p].blob); player.play(); }
    if (d !== null) download(recs[+d]);
  });
})();
