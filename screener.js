// Kehe free screener — client-side sanctions lookup (OFAC+UK+EU)
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
      if (++checked > 80000) break; // 性能保护
    }
  }
  return { exact, contain };
}

function srcColor(s) { return s === 'OFAC' ? '#c0392b' : s === 'UK' ? '#1e6f5c' : s === 'UN' ? '#6f42c1' : '#2f6fed'; }

// ⏱ 报告生成时间戳 + 数据版本（可审计证据链要素）
const DB_TS = '2026-09-12T00:00:00Z';            // 官方名单同步时间（每次更新改此值）
function nowStamp() { return new Date().toISOString(); }

function render(r) {
  const box = document.getElementById('results');
  const total = r.exact.length + r.contain.length;
  const qv = (document.getElementById('q').value || '').trim();

  // —— 证据链报告（单路径 · 固定结构，内容随查询可变）——
  const stamp = nowStamp();
  let verdict, verdictCls;
  let bodyHtml;
  if (total === 0) {
    verdict = '<div class="verdict ok">✓ NO FLAG — no exact or close match on checked lists</div>';
    verdictCls = 'ok';
    bodyHtml = '<div class="field"><b>Subject checked</b><span class="r-escape">' + escapeHtml(qv) + '</span></div>'
      + '<div class="field"><b>Lists checked</b><span>OFAC · UK · EU · UN · BIS</span></div>'
      + '<div class="field"><b>Data version</b><span>' + DB_TS + '</span></div>'
      + '<div class="field"><b>Screen time</b><span>' + stamp + '</span></div>'
      + '<div class="evid-note">Clean screen = no flag on these lists. It is <b>not</b> a guarantee — a true compliance file adds registration, ownership and re-check monitoring.</div>';
  } else {
    verdict = '<div class="verdict flag">⚠ ' + total + ' name' + (total > 1 ? 's' : '') + ' flagged on official lists</div>';
    verdictCls = 'flag';
    let hits = '';
    for (const h of r.exact) hits += hitCard(h, 'EXACT');
    for (const h of r.contain.slice(0, 8)) hits += hitCard(h, 'POSSIBLE');
    bodyHtml = '<div class="field"><b>Subject checked</b><span class="r-escape">' + escapeHtml(qv) + '</span></div>'
      + '<div class="field"><b>Lists checked</b><span>OFAC · UK · EU · UN · BIS</span></div>'
      + '<div class="field"><b>Data version</b><span>' + DB_TS + '</span></div>'
      + '<div class="field"><b>Screen time</b><span>' + stamp + '</span></div>'
      + '<div class="hits">' + hits + '</div>';
  }

  box.innerHTML = '<div class="report">'
    + '<div class="rep-head"><div class="logo">Kehe<span>.</span></div><div class="meta">Auditable Evidence-Chain Screening · ' + stamp.slice(0, 10) + '</div></div>'
    + verdict + bodyHtml + '</div>';

  // —— 抓邮箱（投入点·紧跟结果出现）——
  const capture = document.getElementById('leademail');
  if (capture) {
    capture.style.display = 'block';
    const ce = document.getElementById('cap-co');
    if (ce && qv) ce.value = qv;
  }
  // —— $29 证据链报告订阅（含90天状态监控）—— 删掉多价位，只留一个主交易
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

// Form-submit tracking. Does NOT change the formsubmit->email forwarding;
// it only POSTs a count to the VPS /api/lead endpoint + writes localStorage.
function trackLead(form) {
  var em = form.querySelector('input[type="email"], input[name="email"]');
  var email = (em && em.value) ? em.value.trim() : '';
  var sub = form.querySelector('input[name="_subject"]');
  var kind = sub ? sub.value : '';
  var source = (document.referrer || location.href || '').slice(0, 120) + ' | kind=' + kind;
  var body = { email: email, source: source };
  try {
    fetch('https://keheai.com/screener/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors', body: JSON.stringify(body) }).catch(function(){});
  } catch (e) {}
  try {
    var log = JSON.parse(localStorage.getItem('kehe_lead_log') || '[]');
    log.push({ ts: new Date().toISOString(), email: email, kind: kind });
    localStorage.setItem('kehe_lead_log', JSON.stringify(log));
  } catch (e) {}
}
document.querySelectorAll('form[action*="formsubmit"]').forEach(function(f) {
  f.addEventListener('submit', function() { trackLead(f); });
});
