// Kehe free screener — client-side sanctions lookup (OFAC+UK+EU)
// I18N: dynamic report text switches on <html lang>. Static page copy lives in each lang's index.html.
const I18N = {
  en: {
    loading: 'Loading sanctions database (65,337 entries)...',
    loaded: 'Sanctions database loaded: {n} names (OFAC, UK, EU, UN, BIS).',
    failed: 'Database failed to load ({m}). Check again later.',
    verdictNoHit: 'No exact or close match on checked lists',
    verdictHit: '{n} name{s} flagged on official lists',
    verdictSummary: 'Risk check complete — free summary below. Full verified report (with close-match aliases, source links, data version and 90-day monitoring) arrives by email.',
    fieldSubject: 'Subject checked', fieldLists: 'Lists checked',
    fieldVersion: 'Data version', fieldTime: 'Screen time',
    evidNote: 'Clean screen = no flag on these lists. It is <b>not</b> a guarantee — a true compliance file adds registration, ownership and re-check monitoring.',
    meta: 'Auditable Evidence-Chain Screening',
    tagExact: 'EXACT', tagPossible: 'POSSIBLE'
  },
  es: {
    loading: 'Cargando la base de datos de sanciones (65,337 registros)...',
    loaded: 'Base de datos cargada: {n} nombres (OFAC, UK, UE, ONU, BIS).',
    failed: 'No se pudo cargar la base de datos ({m}). Inténtalo de nuevo más tarde.',
    verdictNoHit: 'Sin coincidencias exactas ni cercanas en las listas consultadas',
    verdictHit: '{n} nombre{s} marcado{s} en listas oficiales',
    verdictSummary: 'Chequeo de riesgo completado — resumen gratuito abajo. El informe verificado completo (con alias de coincidencia cercana, enlaces a fuentes, versión de datos y seguimiento de 90 días) llega por correo.',
    fieldSubject: 'Entidad verificada', fieldLists: 'Listas consultadas',
    fieldVersion: 'Versión de datos', fieldTime: 'Fecha y hora del chequeo',
    evidNote: 'Pantalla limpia = sin alerta en estas listas. <b>No</b> es una garantía — un expediente de cumplimiento real añade registro, titularidad y seguimiento continuo.',
    meta: 'Chequeo de cadena de evidencia auditable',
    tagExact: 'COINCIDENCIA EXACTA', tagPossible: 'POSIBLE'
  },
  pt: {
    loading: 'Carregando banco de dados de sanções (65,337 registros)...',
    loaded: 'Banco de dados carregado: {n} nomes (OFAC, Reino Unido, UE, ONU, BIS).',
    failed: 'Não foi possível carregar o banco de dados ({m}). Tente novamente mais tarde.',
    verdictNoHit: 'Sem correspondência exata ou aproximada nas listas consultadas',
    verdictHit: '{n} nome{s} sinalizado{s} nas listas oficiais',
    verdictSummary: 'Verificação de risco concluída — resumo gratuito abaixo. O relatório verificado completo (com aliases de correspondência aproximada, links para fontes, versão dos dados e monitoramento de 90 dias) chega por e-mail.',
    fieldSubject: 'Entidade verificada', fieldLists: 'Listas consultadas',
    fieldVersion: 'Versão dos dados', fieldTime: 'Data e hora da verificação',
    evidNote: 'Triagem limpa = sem sinalização nestas listas. <b>Não</b> é uma garantia — um dossiê real de compliance acrescenta registro, propriedade e monitoramento contínuo.',
    meta: 'Verificação de cadeia de evidência auditável',
    tagExact: 'CORRESPONDÊNCIA EXATA', tagPossible: 'POSSÍVEL'
  },
  ar: {
    loading: 'يتم تحميل قاعدة بيانات العقوبات الآن (65,337 سجلًا)...',
    loaded: 'تم تحميل قاعدة البيانات: {n} اسمًا (OFAC، المملكة المتحدة، الاتحاد الأوروبي، الأمم المتحدة، BIS).',
    failed: 'تعذر تحميل قاعدة البيانات ({m}). حاول مرة أخرى لاحقًا.',
    verdictNoHit: 'لا توجد تطابقات دقيقة أو قريبة في القوائم المدققة',
    verdictHit: '{n} اسم مدرج في القوائم الرسمية',
    verdictSummary: 'اكتمل فحص المخاطر — الملخص المجاني أدناه. التقرير الكامل الموثَّق (مع الأسماء المتطابقة تقريبًا وروابط المصادر وإصدار البيانات ومراقبة 90 يومًا) يصل عبر البريد الإلكتروني.',
    fieldSubject: 'الكيان المدقَّق', fieldLists: 'القوائم المدققة',
    fieldVersion: 'إصدار البيانات', fieldTime: 'وقت الفحص',
    evidNote: 'شاشة نظيفة = لا يوجد تنبيه في هذه القوائم. <b>هذا ليس</b> ضمانًا — الملف الامتثالي الكامل يضيف السجل والملكية والمراقبة المستمرة.',
    meta: 'فحص سلسلة الأدلة القابل للتدقيق',
    tagExact: 'تطابق دقيق', tagPossible: 'احتمال'
  }
};
let INDEX = null;
const loading = document.getElementById('idx-status');
function lang() {
  const l = (document.documentElement.lang || '').toLowerCase().slice(0, 2);
  return I18N[l] || I18N.en;
}
function t(key) { return lang()[key] || I18N.en[key] || key; }
function fillTpl(s, map) { return s.replace(/\{(\w+)\}/g, (m, k) => map[k] !== undefined ? map[k] : m); }

async function loadIndex() {
  try {
    loading.textContent = t('loading');
    const res = await fetch('/kehe-screener/data/sanctions_index.json.gz');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = await res.arrayBuffer();
    const ds = new DecompressionStream('gzip');
    const stream = new Blob([buf]).stream().pipeThrough(ds);
    const text = await new Response(stream).text();
    INDEX = JSON.parse(text);
    loading.textContent = fillTpl(t('loaded'), { n: Object.keys(INDEX).length.toLocaleString() });
  } catch (e) {
    loading.textContent = fillTpl(t('failed'), { m: e.message });
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

  // —— 免费摘要（收敛完整判定：不给数据版本/逐条来源，给风险等级+方向）——
  let verdict, verdictCls;
  let summaryHtml;
  if (total === 0) {
    verdict = '<div class="verdict ok">✓ ' + t('verdictNoHit') + '</div>';
    verdictCls = 'ok';
    summaryHtml = '<div class="field"><b>' + t('fieldSubject') + '</b><span class="r-escape">' + escapeHtml(qv) + '</span></div>'
      + '<div class="field"><b>' + t('fieldLists') + '</b><span>OFAC · UK · EU · UN · BIS</span></div>'
      + '<div class="evid-note">' + t('evidNote') + '</div>';
  } else {
    verdict = '<div class="verdict flag">⚠ ' + fillTpl(t('verdictHit'), { n: total, s: total > 1 ? (lang().tagExact === 'EXACT' ? 's' : '') : '' }) + '</div>';
    verdictCls = 'flag';
    let hits = '';
    for (const h of r.exact) hits += hitCard(h, t('tagExact'));
    for (const h of r.contain.slice(0, 8)) hits += hitCard(h, t('tagPossible'));
    summaryHtml = '<div class="field"><b>' + t('fieldSubject') + '</b><span class="r-escape">' + escapeHtml(qv) + '</span></div>'
      + '<div class="field"><b>' + t('fieldLists') + '</b><span>OFAC · UK · EU · UN · BIS</span></div>'
      + '<div class="hits">' + hits + '</div>';
  }

  box.innerHTML = '<div class="report">'
    + '<div class="rep-head"><div class="logo">Kehe<span>.</span></div><div class="meta">' + t('meta') + '</div></div>'
    + verdict + summaryHtml
    + '<div class="summary-cta" style="margin-top:14px;padding:14px;background:#f0f6ff;border:1px solid #d6e4ff;border-radius:8px;text-align:center;">'
    + t('verdictSummary')
    + '</div></div>';

  // —— 邮箱区块（紧跟摘要，是拿完整报告的唯一入口）——
  const capture = document.getElementById('leademail');
  if (capture) {
    capture.style.display = 'block';
    const ce = document.getElementById('cap-co');
    if (ce && qv) ce.value = qv;
    try { capture.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
  }
  // —— $29 证据链报告订阅（含90天状态监控）—— 只留一个主交易
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
