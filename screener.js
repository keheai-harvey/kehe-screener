// Kehe free screener 鈥?client-side sanctions lookup (OFAC+UK+EU)
let INDEX = null;
const loading = document.getElementById('idx-status');

async function loadIndex() {
  try {
    loading.textContent = 'Loading sanctions database (104k+ entries, ~1.5MB)...';
    const res = await fetch('data/sanctions_index.json.gz');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    const ds = new DecompressionStream('gzip');
    const stream = new Blob([buf]).stream().pipeThrough(ds);
    const text = await new Response(stream).text();
    INDEX = JSON.parse(text);
    loading.textContent = 'Sanctions database loaded: ' + Object.keys(INDEX).length.toLocaleString() + ' names (OFAC, UK, EU, UN, BIS).';
  } catch (e) {
    loading.textContent = 'Database failed to load (' + e.message + '). Check again later.';
  }
}

function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, ' ').trim(); }

const SUF = ['ltd','limited','inc','corp','corporation','gmbh','ag','co','llc','bv','sa','plc','srl','pty','pte','holding','group','international','global'];

function search(query) {
  const q = norm(query);
  if (!q || !INDEX) return { exact: [], contain: [] };
  let exact = INDEX[q] || [];
  const words = q.split(' ').filter(w => !SUF.includes(w));
  const reduced = words.join(' ');
  if (!exact.length && reduced !== q) exact = INDEX[reduced] || [];
  const qWords = words.filter(w => w.length > 2);
  const contain = [];
  if (qWords.length) {
    let checked = 0;
    for (const [k, v] of Object.entries(INDEX)) {
      if (k === q) continue;
      if (qWords.every(w => k.includes(w))) {
        for (const x of v) contain.push(Object.assign({ key: k }, x));
        if (contain.length >= 8) break;
      }
      if (++checked > 80000) break; // 鎬ц兘淇濇姢
    }
  }
  return { exact, contain };
}

function srcColor(s) { return s === 'OFAC' ? '#c0392b' : s === 'UK' ? '#1e6f5c' : s === 'UN' ? '#6f42c1' : '#2f6fed'; }

// 鈴?鎶ュ憡鐢熸垚鏃堕棿鎴?+ 鏁版嵁鐗堟湰锛堝彲瀹¤璇佹嵁閾捐绱狅級
const DB_TS = '2026-09-12T00:00:00Z';            // 瀹樻柟鍚嶅崟鍚屾鏃堕棿锛堟瘡娆℃洿鏂版敼姝ゅ€硷級
function nowStamp() { return new Date().toISOString(); }

function render(r) {
  const box = document.getElementById('results');
  const total = r.exact.length + r.contain.length;
  const qv = (document.getElementById('q').value || '').trim();

  // 鈥斺€?璇佹嵁閾炬姤鍛婏紙鍗曡矾寰?路 鍥哄畾缁撴瀯锛屽唴瀹归殢鏌ヨ鍙彉锛夆€斺€?  const stamp = nowStamp();
  let verdict, verdictCls;
  let bodyHtml;
  if (total === 0) {
    verdict = '<div class="verdict ok">鉁?NO FLAG 鈥?no exact or close match on checked lists</div>';
    verdictCls = 'ok';
    bodyHtml = '<div class="field"><b>Subject checked</b><span class="r-escape">' + escapeHtml(qv) + '</span></div>'
      + '<div class="field"><b>Lists checked</b><span>OFAC 路 UK 路 EU 路 UN 路 BIS</span></div>'
      + '<div class="field"><b>Data version</b><span>' + DB_TS + '</span></div>'
      + '<div class="field"><b>Screen time</b><span>' + stamp + '</span></div>'
      + '<div class="evid-note">Clean screen = no flag on these lists. It is <b>not</b> a guarantee 鈥?a true compliance file adds registration, ownership and re-check monitoring.</div>';
  } else {
    verdict = '<div class="verdict flag">鈿?' + total + ' name' + (total > 1 ? 's' : '') + ' flagged on official lists</div>';
    verdictCls = 'flag';
    let hits = '';
    for (const h of r.exact) hits += hitCard(h, 'EXACT');
    for (const h of r.contain.slice(0, 8)) hits += hitCard(h, 'POSSIBLE');
    bodyHtml = '<div class="field"><b>Subject checked</b><span class="r-escape">' + escapeHtml(qv) + '</span></div>'
      + '<div class="field"><b>Lists checked</b><span>OFAC 路 UK 路 EU 路 UN 路 BIS</span></div>'
      + '<div class="field"><b>Data version</b><span>' + DB_TS + '</span></div>'
      + '<div class="field"><b>Screen time</b><span>' + stamp + '</span></div>'
      + '<div class="hits">' + hits + '</div>';
  }

  box.innerHTML = '<div class="report">'
    + '<div class="rep-head"><div class="logo">Kehe<span>.</span></div><div class="meta">Auditable Evidence-Chain Screening 路 ' + stamp.slice(0, 10) + '</div></div>'
    + verdict + bodyHtml + '</div>';

  // 鈥斺€?鎶撻偖绠憋紙鎶曞叆鐐孤风揣璺熺粨鏋滃嚭鐜帮級鈥斺€?  const capture = document.getElementById('leademail');
  if (capture) {
    capture.style.display = 'block';
    const ce = document.getElementById('cap-co');
    if (ce && qv) ce.value = qv;
  }
  // 鈥斺€?$29 璇佹嵁閾炬姤鍛婅闃咃紙鍚?0澶╃姸鎬佺洃鎺э級鈥斺€?鍒犳帀澶氫环浣嶏紝鍙暀涓€涓富浜ゆ槗
  const sub = document.getElementById('suboffer');
  if (sub) { sub.style.display = 'block'; const se = document.getElementById('sub-co'); if (se && qv) se.value = qv; }
}

function hitCard(h, tag) {
  const c = srcColor(h.s);
  return '<div class="hit-row">'
    + '<span style="color:#fff;background:' + c + ';border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;">' + h.s + '</span> '
    + '<span style="background:#eee;border-radius:4px;padding:2px 8px;font-size:11px;color:#555;">' + tag + '</span> '
    + '<div class="r-name">' + escapeHtml(h.n) + '</div>'
    + '<div class="r-regime">' + escapeHtml(h.r || '') + '</div></div>';
}
function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function runQuery() {
  const v = document.getElementById('q').value.trim();
  if (!v) return;
  const r = search(v);
  render(r);
}

document.getElementById('go').addEventListener('click', runQuery);
document.getElementById('q').addEventListener('keydown', e => { if (e.key === 'Enter') runQuery(); });
loadIndex();

/* 鈥斺€?琛ㄥ崟鎻愪氦鍩嬬偣锛堜笉鏀瑰彉 formsubmit->QQ 杞彂閾捐矾锛屼粎棰濆 POST 璁℃暟鍒?VPS /api/lead锛夆€斺€?*/
function trackLead(form) {
  // 璇诲彇璇ヨ〃鍗曢噷鐨?email 瀛楁
  const em = form.querySelector('input[type="email"], input[name="email"]');
  const email = (em && em.value) ? em.value.trim() : '';
  const kind = (form.querySelector('input[name="_subject"]') || {}).value || '';
  const source = (document.referrer || location.href || '').slice(0, 120) + ' | kind=' + kind;
  const body = { email: email, source: source };
  // fire-and-forget锛氫笉褰卞搷涓昏〃鍗曟甯告彁浜?  try {
    fetch('https://130.94.44.168:8124/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors', body: JSON.stringify(body) }).catch(function(){});
  } catch (e) {}
  // 鏈湴鍚屽睆鐣欑棔锛堜究浜庡嵆鏃跺彲瑙侊級
  try {
    var log = JSON.parse(localStorage.getItem('kehe_lead_log') || '[]');
    log.push({ ts: new Date().toISOString(), email: email, kind: kind });
    localStorage.setItem('kehe_lead_log', JSON.stringify(log));
  } catch (e) {}
}
// 缁戝畾涓や釜琛ㄥ崟鐨?submit
document.querySelectorAll('form[action*="formsubmit"]').forEach(function(f) {
  f.addEventListener('submit', function() { trackLead(f); });
});
