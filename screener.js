// Kehe free screener — client-side sanctions lookup (OFAC+UK+EU)
let INDEX = null;
const loading = document.getElementById('idx-status');

async function loadIndex() {
  try {
    loading.textContent = 'Loading sanctions database (100k+ entries, ~1.5MB)...';
    const res = await fetch('data/sanctions_index.json.gz');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    const ds = new DecompressionStream('gzip');
    const stream = new Blob([buf]).stream().pipeThrough(ds);
    const text = await new Response(stream).text();
    INDEX = JSON.parse(text);
    loading.textContent = 'Sanctions database loaded: ' + Object.keys(INDEX).length.toLocaleString() + ' names (OFAC, UK, EU, UN).';
  } catch (e) {
    loading.textContent = 'Database failed to load (' + e.message + '). Check again later.';
  }
}

function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, ' ').trim(); }

function search(query) {
  const q = norm(query);
  if (!q || !INDEX) return { exact: [], contain: [] };
  const exact = INDEX[q] || [];
  const qWords = q.split(' ').filter(w => w.length > 2);
  const contain = [];
  if (qWords.length) {
    let checked = 0;
    for (const [k, v] of Object.entries(INDEX)) {
      if (k === q) continue;
      if (qWords.every(w => k.includes(w))) {
        for (const x of v) contain.push(Object.assign({ key: k }, x));
        if (contain.length >= 8) break;
      }
      if (++checked > 60000) break; // 性能保护
    }
  }
  return { exact, contain };
}

function srcColor(s) { return s === 'OFAC' ? '#c0392b' : s === 'UK' ? '#1e6f5c' : s === 'UN' ? '#6f42c1' : '#2f6fed'; }

function render(r) {
  const box = document.getElementById('results');
  const total = r.exact.length + r.contain.length;
  if (total === 0) {
    box.innerHTML = '<div class="r-clean"><b>No exact hit on OFAC, UK, EU or UN sanctions lists.</b><br><span class="fine2">Heads-up: a clean screen is not a guarantee — verify registration and ownership before you pay. Order the full report for the complete picture.</span></div>';
    return;
  }
  let html = '<div class="r-hit"><b>' + total + ' name' + (total > 1 ? 's' : '') + ' flagged on official sanctions lists:</b></div>';
  for (const h of r.exact) html += hitCard(h, 'EXACT');
  for (const h of r.contain.slice(0, 8)) html += hitCard(h, 'POSSIBLE');
  box.innerHTML = html;
}

function hitCard(h, tag) {
  return '<div class="r-card"><span class="tag" style="background:' + srcColor(h.s) + '">' + h.s + '</span> <span class="tag2">' + tag + '</span> <div class="r-name">' + escapeHtml(h.n) + '</div><div class="r-regime">' + escapeHtml(h.r || '') + '</div></div>';
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
