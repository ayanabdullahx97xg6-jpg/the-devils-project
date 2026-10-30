const STORE = {
  history: 'devils-project-history-v1',
  saved: 'devils-project-saved-v1',
  settings: 'devils-project-settings-v1'
};

const categories = [
  ['general', 'General Research', '⌕'], ['people', 'People', '◉'],
  ['scholarships', 'Scholarships', '⌑'], ['technology', 'Technology', '⌘'],
  ['organizations', 'Organizations', '▤'], ['education', 'Education', '⌬'], ['deep', 'Deep Research', '◈']
];

const demoResults = [
  { title: 'A field guide to the question', tag: 'DEMO SYNTHESIS', source: 'LOCAL SAMPLE / 001', body: 'A structured starting point for examining the topic. This illustrative entry is sample interface content, not a finding from a live search or a verified source.' },
  { title: 'Signals, context & open questions', tag: 'DEMO NOTE', source: 'LOCAL SAMPLE / 002', body: 'Compare the central claims, the context they depend on, and what would need independent verification before drawing a conclusion.' },
  { title: 'Further lines of inquiry', tag: 'DEMO LEAD', source: 'LOCAL SAMPLE / 003', body: 'Use this space to collect follow-up questions and source leads when a research service is connected. No external sources are currently connected.' }
];

const pageInfo = {
  home: ['HOME', 'OVERVIEW'], search: ['UNIVERSAL SEARCH', 'QUERY CONSOLE'], people: ['PEOPLE INTELLIGENCE', 'PUBLIC PROFILE RESEARCH'],
  scholarships: ['SCHOLARSHIPS', 'FUNDING INDEX'], technology: ['TECHNOLOGY', 'TECHNICAL INTELLIGENCE'],
  organizations: ['ORGANIZATIONS', 'INSTITUTIONAL RESEARCH'], education: ['EDUCATION', 'LEARNING INDEX'],
  deep: ['DEEP RESEARCH', 'ANALYSIS WORKSPACE'], saved: ['SAVED FILES', 'PERSONAL ARCHIVE'],
  history: ['HISTORY', 'LOCAL ACTIVITY'], settings: ['SETTINGS', 'INTERFACE CONTROLS']
};

const pageTitles = {
  people: ['People Intelligence', 'Organize public-profile research in one place. This demo does not identify or investigate real people.'],
  scholarships: ['Scholarships', 'Explore a sample funding index. All entries and filters below are illustrative demo data.'],
  technology: ['Technology', 'A workspace for technical topics, software, AI and security research. Sample results only.'],
  organizations: ['Organizations', 'Structure research on institutions and organizations. No external registry is connected.'],
  education: ['Education', 'A searchable index for courses, learning resources and certifications. Demo entries only.'],
  deep: ['Deep Research', 'Build a detailed research brief and compare source material. Backend integration is not connected.']
};

const demoScholarships = [
  { name: 'Northstar Global Scholars', country: 'Global', level: 'Undergraduate', interest: 'STEM', funding: 'Full funding', ages: [18, 30], note: 'Illustrative program record. Verify eligibility and deadlines with the provider.' },
  { name: 'Meridian Research Fellowship', country: 'United States', level: 'Graduate', interest: 'Research', funding: 'Partial funding', ages: [21, 36], note: 'Illustrative program record. Verify eligibility and deadlines with the provider.' },
  { name: 'Cinder Arts & Humanities Award', country: 'United Kingdom', level: 'Undergraduate', interest: 'Arts', funding: 'Full funding', ages: [17, 26], note: 'Illustrative program record. Verify eligibility and deadlines with the provider.' },
  { name: 'Open Horizons Learning Grant', country: 'Global', level: 'Certificate', interest: 'Technology', funding: 'Need-based', ages: [18, 45], note: 'Illustrative program record. Verify eligibility and deadlines with the provider.' }
];

const state = {
  page: 'home', category: 'general', query: '', resultsQuery: '', scanning: false, timer: null,
  history: readStore(STORE.history, []), saved: readStore(STORE.saved, []), settings: readStore(STORE.settings, { effects: true, reducedMotion: false }),
  scholarshipFilters: { country: 'Any country', age: '', level: 'All', interest: 'Any interest', funding: 'Any funding' }
};

function readStore(key, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    return stored ?? fallback;
  } catch { return fallback; }
}

function persist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { notify('Browser storage is unavailable. This change will not persist.'); return false; }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timeout);
  notify.timeout = setTimeout(() => toast.classList.remove('show'), 2700);
}

function categoryName(id) { return categories.find(item => item[0] === id)?.[1] || 'General Research'; }
function twoDigits(value) { return String(value).padStart(2, '0'); }

function updateCounts() {
  document.querySelector('#saved-count').textContent = twoDigits(state.saved.length);
  document.querySelector('#history-count').textContent = twoDigits(state.history.length);
}

function setPage(page) {
  if (!pageInfo[page]) return;
  state.page = page;
  state.scanning = false;
  clearTimeout(state.timer);
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  const [section, crumb] = pageInfo[page];
  document.querySelector('#breadcrumb').innerHTML = `${section} <i>/</i> ${crumb}`;
  document.querySelector('#page-host').innerHTML = renderPage(page);
  document.querySelector('#page-host').classList.remove('page-in');
  void document.querySelector('#page-host').offsetWidth;
  document.querySelector('#page-host').classList.add('page-in');
  document.querySelector('#sidebar').classList.remove('mobile-open');
  document.querySelector('#sidebar-scrim').classList.remove('is-visible');
  bindPageEvents();
  updateCounts();
}

function renderPage(page) {
  if (page === 'home') return renderHome();
  if (page === 'search') return renderSearch();
  if (page === 'saved') return renderArchive('saved');
  if (page === 'history') return renderArchive('history');
  if (page === 'settings') return renderSettings();
  if (page === 'scholarships') return renderScholarships();
  if (page === 'people' || page === 'technology' || page === 'organizations' || page === 'education' || page === 'deep') return renderResearchPage(page);
  return renderHome();
}

function renderCategoryChips() {
  return `<div class="category-strip" aria-label="Research categories">${categories.map(([id, name, icon]) => `<button type="button" class="category-chip ${state.category === id ? 'selected' : ''}" data-category="${id}"><i>${icon}</i>${name}</button>`).join('')}</div>`;
}

function renderSearchConsole({ compact = false } = {}) {
  return `<section class="${compact ? 'page-console' : 'search-console'}">
    ${compact ? '' : '<div class="console-head"><strong>UNIVERSAL QUERY INTERFACE</strong><span class="console-state"><i></i> LOCAL DEMO / READY</span></div>'}
    <form class="search-form" data-search-form>
      <span class="search-symbol" aria-hidden="true">⌕</span>
      <input class="search-input" name="query" type="search" autocomplete="off" placeholder="Ask anything. Discover everything." value="${escapeHTML(state.query)}" aria-label="Research query" />
      <button class="search-button" type="submit"><span>↗</span> INITIATE SEARCH</button>
    </form>
    ${compact ? '' : `<div class="console-bottom"><label for="category-select">RESEARCH MODE <select class="category-select" id="category-select">${categories.map(([id, name]) => `<option value="${id}" ${state.category === id ? 'selected' : ''}>${name}</option>`).join('')}</select></label><span class="console-note">DEMO INTERFACE · NO LIVE SEARCH CONNECTED</span></div>`}
    <div class="scan-state" data-scan-state><span>SCANNING LOCAL DEMO</span><span class="scan-bar"><span></span></span><b>•••</b></div>
  </section>`;
}

function renderHome() {
  const recent = state.history.slice(0, 3);
  const saved = state.saved.slice(0, 2);
  return `<section class="hero-row"><div><p class="section-kicker">INTELLIGENCE / 001</p><h1 class="hero-title">THE DEVIL'S<br /><span class="red">PROJECT</span></h1><p class="hero-subtitle">EVERY QUESTION HAS A DARK SIDE.</p></div><div class="time-readout"><strong id="live-clock">--:--:--</strong><span>LOCAL SESSION / ACTIVE</span></div></section>
    ${renderSearchConsole()}
    <div class="demo-banner"><span class="banner-mark">◈</span><span><b>DEMONSTRATION MODE.</b> Search results are illustrative interface data. No AI model, web search, or source verification is connected.</span></div>
    ${renderCategoryChips()}
    <div class="home-lower">
      <section><div class="section-head"><div><h2>Recent research</h2><p>Your searches in this browser session.</p></div><button class="text-action" data-go="history">OPEN HISTORY ↗</button></div><div class="activity-list">${recent.length ? recent.map(item => `<div class="activity-row"><span class="activity-indicator">⌕</span><div class="activity-copy"><strong>${escapeHTML(item.query)}</strong><small>${escapeHTML(categoryName(item.category).toUpperCase())} / DEMO SEARCH</small></div><span class="row-meta">${escapeHTML(item.time)}</span></div>`).join('') : '<div class="saved-empty">No searches yet. Begin with a question above.</div>'}</div></section>
      <section class="saved-preview"><div class="section-head"><div><h2>Saved reports</h2><p>Keep useful demo notes close.</p></div><button class="text-action" data-go="saved">VIEW ARCHIVE ↗</button></div>${saved.length ? saved.map(item => `<div class="saved-card"><span class="activity-indicator">▣</span><div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.category || 'DEMO REPORT')}</small></div></div>`).join('') : '<div class="saved-empty">Your archive is empty. Save a sample result to start a local collection.</div>'}</section>
    </div>
    <div class="metrics-row"><div class="metric"><strong>${twoDigits(state.history.length)}</strong><span>LOCAL QUERIES</span></div><div class="metric"><strong>${twoDigits(state.saved.length)}</strong><span>SAVED DEMO ITEMS</span></div><div class="metric"><strong>OFFLINE</strong><span>RESEARCH CONNECTION</span></div></div>`;
}

function renderSearch() {
  return `<div class="page-heading"><div><p class="section-kicker">QUERY CONSOLE / 002</p><h1>Universal Search</h1><p>Search across a prepared demo interface. Queries are stored locally in this browser; nothing is sent to a service.</p></div><div class="heading-code"><b>MODE / DEMO</b>NO CONNECTED SOURCES</div></div>
    ${renderSearchConsole({ compact: true })}
    ${renderCategoryChips()}
    <div class="demo-banner"><span class="banner-mark">◈</span><span><b>SAMPLE RESULTS ONLY.</b> The cards below are demonstration content, not findings about your query.</span></div>
    ${state.resultsQuery ? renderResultArea(state.resultsQuery) : '<div class="empty-state" style="margin-top:19px"><div><strong>QUERY STANDING BY</strong>Enter a research question to preview the sample results interface.<br />No external search will be performed.</div></div>'}`;
}

function renderResultArea(query) {
  const safeQuery = escapeHTML(query);
  return `<div class="result-toolbar"><span>DEMO RESULTS FOR <strong>“${safeQuery}”</strong></span><span>03 SAMPLE CARDS / UNVERIFIED</span></div><div class="result-grid"><div class="result-list">${demoResults.map((item, index) => {
    const id = `demo-${state.category}-${index}`;
    const saved = state.saved.some(entry => entry.id === id);
    return `<article class="result-card"><div class="result-card-head"><span class="data-tag">${item.tag}</span><span class="result-meta">${categoryName(state.category).toUpperCase()} / ${twoDigits(index + 1)}</span></div><h3>${item.title}</h3><p>${item.body}</p><div class="result-card-foot"><span class="result-source">${item.source}</span><button class="save-button ${saved ? 'is-saved' : ''}" data-save-result="${id}" data-query="${safeQuery}" data-title="${item.title}" data-category="${categoryName(state.category)}">${saved ? 'SAVED ✓' : '+ SAVE NOTE'}</button></div></article>`;
  }).join('')}</div><aside class="insight-panel"><h3>QUERY CONTEXT</h3><p>These are static examples to demonstrate how a future research response could be organized. They are not generated from this query.</p><div class="insight-line"><span>QUERY</span><b>${safeQuery}</b></div><div class="insight-line"><span>MODE</span><b>${escapeHTML(categoryName(state.category))}</b></div><div class="insight-line"><span>VERIFICATION</span><b>NOT AVAILABLE</b></div></aside></div>`;
}

function renderResearchPage(page) {
  const [title, description] = pageTitles[page];
  const prompts = { people: 'Enter a public-profile research question', technology: 'Enter a technology research question', organizations: 'Enter an organization or institution', education: 'Search courses, learning resources, certifications', deep: 'Enter a question for a structured research brief' };
  return `<div class="page-heading"><div><p class="section-kicker">${pageInfo[page][0]} / DEMO</p><h1>${title}</h1><p>${description}</p></div><div class="heading-code"><b>LOCAL INTERFACE</b>NO LIVE DATA SOURCE</div></div>
    <section class="page-console"><form class="search-form" data-search-form data-specialized="${page}"><span class="search-symbol">⌕</span><input class="search-input" type="search" name="query" placeholder="${prompts[page]}" aria-label="${prompts[page]}" value="${escapeHTML(state.query)}"/><button class="search-button" type="submit"><span>↗</span> SEARCH DEMO</button></form><div class="scan-state" data-scan-state><span>SCANNING LOCAL DEMO</span><span class="scan-bar"><span></span></span><b>•••</b></div></section>
    ${page === 'deep' ? '<div class="field-grid"><label class="field"><span class="field-label">RESEARCH QUESTION</span><input class="filter-input" placeholder="What do you need to understand?" /></label><label class="field"><span class="field-label">SCOPE</span><select class="filter-select"><option>Balanced overview</option><option>Compare perspectives</option><option>Timeline and context</option></select></label><label class="field"><span class="field-label">OUTPUT FORMAT</span><select class="filter-select"><option>Structured brief</option><option>Question map</option><option>Source comparison</option></select></label></div>' : ''}
    <div class="demo-banner"><span class="banner-mark">◈</span><span><b>DEMO WORKSPACE.</b> Public information only; this view contains sample interface data and does not search for real people, courses, technology or organizations.</span></div>
    ${page === 'people' ? renderPeopleStructure() : ''}
    ${state.resultsQuery ? renderResultArea(state.resultsQuery) : page === 'people' ? '' : `<div class="section-head"><div><h2>${page === 'deep' ? 'Research workspace' : 'Sample research layout'}</h2><p>Structured to support a future connected research service.</p></div></div><div class="empty-state"><div><strong>NO RESEARCH LOADED</strong>Run a demo query to preview the sample result cards.<br />All displayed content will be clearly marked as illustrative.</div></div>`}`;
}

function renderPeopleStructure() {
  return `<div class="section-head"><div><h2>Public profile research layout</h2><p>Empty structure only. No person is being researched.</p></div></div><div class="result-grid"><div class="result-card"><div class="result-card-head"><span class="data-tag">PROFILE SUMMARY / EMPTY</span><span class="result-meta">PUBLIC INFORMATION ONLY</span></div><h3>No profile loaded</h3><p>This panel is reserved for a user-provided, public-interest research subject. It does not identify private individuals or retrieve personal data.</p><div class="insight-line"><span>IDENTITY</span><b>NOT PROVIDED</b></div><div class="insight-line"><span>PUBLIC PRESENCE</span><b>NOT LOADED</b></div><div class="insight-line"><span>VERIFICATION</span><b>NOT AVAILABLE</b></div></div><aside class="insight-panel"><h3>RESEARCH SAFEGUARDS</h3><p>Only user-provided, public, non-sensitive information belongs in this workspace. Sources must be reviewed independently when a research service is connected.</p><div class="insight-line"><span>SOURCES</span><b>NONE CONNECTED</b></div></aside></div>`;
}

function renderScholarships() {
  const filters = state.scholarshipFilters;
  const age = Number(filters.age);
  const rows = demoScholarships.filter(item =>
    (filters.country === 'Any country' || item.country === filters.country) &&
    (!age || (age >= item.ages[0] && age <= item.ages[1])) &&
    (filters.level === 'All' || item.level === filters.level) &&
    (filters.interest === 'Any interest' || item.interest === filters.interest) &&
    (filters.funding === 'Any funding' || item.funding === filters.funding)
  );
  return `<div class="page-heading"><div><p class="section-kicker">FUNDING INDEX / DEMO</p><h1>Scholarships</h1><p>Filter a small set of illustrative opportunities. These are not verified or current listings.</p></div><div class="heading-code"><b>04 / FILTERS</b>DEMO RECORDS ONLY</div></div>
    ${renderSearchConsole({ compact: true })}
    <div class="field-grid"><label class="field"><span class="field-label">COUNTRY</span><select class="filter-select" data-scholarship-filter="country"><option>Any country</option><option>United States</option><option>United Kingdom</option><option>Global</option></select></label><label class="field"><span class="field-label">AGE</span><input class="filter-input" data-scholarship-filter="age" type="number" min="13" max="100" placeholder="Optional" value="${escapeHTML(filters.age)}" /></label><label class="field"><span class="field-label">EDUCATION LEVEL</span><select class="filter-select" data-scholarship-filter="level"><option>All</option><option>Undergraduate</option><option>Graduate</option><option>Certificate</option></select></label><label class="field"><span class="field-label">INTEREST</span><select class="filter-select" data-scholarship-filter="interest"><option>Any interest</option><option>STEM</option><option>Research</option><option>Arts</option><option>Technology</option></select></label><label class="field"><span class="field-label">FUNDING REQUIREMENT</span><select class="filter-select" data-scholarship-filter="funding"><option>Any funding</option><option>Full funding</option><option>Partial funding</option><option>Need-based</option></select></label><label class="field"><span class="field-label">RECORD STATUS</span><select class="filter-select" disabled><option>Illustrative demo data</option></select></label></div>
    <div class="demo-banner"><span class="banner-mark">◈</span><span><b>VERIFY BEFORE ACTING.</b> These fictional sample records are for interface demonstration only. No eligibility, provider, or deadline information is verified.</span></div>
    <div class="result-toolbar"><span><strong>${twoDigits(rows.length)}</strong> SAMPLE OPPORTUNITIES</span><span>NOT CURRENT / NOT VERIFIED</span></div><div class="result-list">${rows.map((item, index) => `<article class="result-card"><div class="result-card-head"><span class="data-tag">ILLUSTRATIVE PROGRAM ${twoDigits(index + 1)}</span><span class="result-meta">${escapeHTML(item.country.toUpperCase())}</span></div><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.note)}</p><div class="result-card-foot"><span class="result-source">${escapeHTML(item.level.toUpperCase())} / ${escapeHTML(item.interest.toUpperCase())} / ${escapeHTML(item.funding.toUpperCase())}</span><button class="save-button" data-save-result="scholarship-${index}" data-query="${escapeHTML(item.name)}" data-title="${escapeHTML(item.name)}" data-category="SCHOLARSHIP DEMO">+ SAVE NOTE</button></div></article>`).join('') || '<div class="empty-state">No illustrative programs match this filter.</div>'}</div>`;
}

function renderArchive(type) {
  const isSaved = type === 'saved';
  const records = isSaved ? state.saved : state.history;
  const rows = records.map((item, index) => `<div class="archive-row"><span class="activity-indicator">${isSaved ? '▣' : '⌕'}</span><div class="activity-copy"><strong>${escapeHTML(isSaved ? item.title : item.query)}</strong><small>${escapeHTML(isSaved ? item.category : `${categoryName(item.category).toUpperCase()} / DEMO QUERY`)}${isSaved && item.query ? ` / ${escapeHTML(item.query)}` : ''}</small></div><span class="row-meta">${escapeHTML(item.time || '')}</span><div class="archive-controls">${isSaved ? `<button class="small-button" data-remove-saved="${escapeHTML(item.id)}" aria-label="Remove saved item">REMOVE</button>` : `<button class="small-button" data-repeat-query="${escapeHTML(item.query)}" data-category="${escapeHTML(item.category)}" aria-label="Repeat search">REPEAT</button>`}</div></div>`).join('');
  return `<div class="page-heading"><div><p class="section-kicker">${isSaved ? 'PERSONAL ARCHIVE' : 'LOCAL ACTIVITY'} / ${isSaved ? '01' : '02'}</p><h1>${isSaved ? 'Saved Files' : 'History'}</h1><p>${isSaved ? 'Demo notes saved in this browser. You can remove items at any time.' : 'Recent demo queries stored locally in this browser.'}</p></div><div class="heading-code"><b>${twoDigits(records.length)} ITEMS</b>LOCAL STORAGE</div></div>
    <div class="demo-banner"><span class="banner-mark">◈</span><span><b>LOCAL DEMO DATA.</b> ${isSaved ? 'Saved notes are stored only in this browser.' : 'Queries remain on this device and are not sent to any service.'}</span></div>
    <div class="section-head"><div><h2>${isSaved ? 'Saved research notes' : 'Recent queries'}</h2><p>${isSaved ? 'Remove notes from your local archive.' : 'Repeat a query to return to the search interface.'}</p></div>${records.length ? `<button class="text-action" data-clear-archive="${type}">CLEAR ${isSaved ? 'SAVED FILES' : 'HISTORY'}</button>` : ''}</div>
    ${rows ? `<div class="archive-list">${rows}</div>` : `<div class="empty-state"><div><strong>${isSaved ? 'ARCHIVE EMPTY' : 'NO SEARCH HISTORY'}</strong>${isSaved ? 'Save a sample result from a search to keep a local note.' : 'Your searches will appear here after you run one.'}</div></div>`}`;
}

function renderSettings() {
  return `<div class="page-heading"><div><p class="section-kicker">SYSTEM / PREFERENCES</p><h1>Settings</h1><p>Control local interface effects and demonstration data stored by this browser.</p></div><div class="heading-code"><b>CLIENT-SIDE ONLY</b>NO SENSITIVE DATA STORED</div></div>
    <div class="settings-layout"><section><div class="section-head" style="margin-top:0"><div><h2>Interface</h2><p>Changes apply immediately and are saved locally.</p></div></div><div class="settings-list">
      <div class="setting-row"><div><strong>Atmospheric effects</strong><span class="setting-note">Particles, pulses and scanning accents</span></div><button class="toggle" role="switch" aria-checked="${state.settings.effects}" data-setting="effects" aria-label="Toggle atmospheric effects"></button></div>
      <div class="setting-row"><div><strong>Reduced motion</strong><span class="setting-note">Limit animation across this interface</span></div><button class="toggle" role="switch" aria-checked="${state.settings.reducedMotion}" data-setting="reducedMotion" aria-label="Toggle reduced motion"></button></div>
      <div class="setting-row"><div><strong>Intro sequence</strong><span class="setting-note">Replay the cinematic opening this session</span></div><button class="small-button" data-replay-intro>REPLAY INTRO</button></div>
    </div></section><aside class="settings-card"><h3>Local data</h3><p>Search history and saved demo notes are stored in browser local storage. No account or remote service is involved.</p><div class="insight-line"><span>SEARCH HISTORY</span><b>${twoDigits(state.history.length)} ITEMS</b></div><div class="insight-line"><span>SAVED NOTES</span><b>${twoDigits(state.saved.length)} ITEMS</b></div><button class="danger-button" data-clear-all>DELETE LOCAL DEMO DATA</button></aside></div>`;
}

function runSearch(query, specializedPage = null) {
  const clean = query.trim();
  if (!clean) { notify('Enter a question before starting a demo search.'); return; }
  state.query = clean;
  state.resultsQuery = clean;
  if (specializedPage === 'people') state.category = 'people';
  else if (specializedPage && categories.some(item => item[0] === specializedPage)) state.category = specializedPage;
  const entry = { query: clean, category: state.category, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), stamp: Date.now() };
  state.history = [entry, ...state.history.filter(item => item.query !== clean)].slice(0, 50);
  persist(STORE.history, state.history);
  state.scanning = true;
  setPage(specializedPage && pageInfo[specializedPage] ? specializedPage : 'search');
  const scan = document.querySelector('[data-scan-state]');
  if (scan) scan.classList.add('visible');
  const form = document.querySelector('[data-search-form]');
  if (form) form.querySelector('input').value = clean;
  state.timer = setTimeout(() => {
    state.scanning = false;
    document.querySelector('#page-host').innerHTML = renderPage(state.page);
    bindPageEvents();
    updateCounts();
  }, 1150);
}

function saveResult(button) {
  const id = button.dataset.saveResult;
  const existing = state.saved.find(item => item.id === id);
  if (existing) {
    state.saved = state.saved.filter(item => item.id !== id);
    notify('Removed from your local saved items.');
  } else {
    state.saved.unshift({ id, title: button.dataset.title || 'Research note', category: button.dataset.category || 'DEMO NOTE', query: button.dataset.query || '', time: new Date().toLocaleDateString() });
    notify('Saved as a local demo note.');
  }
  persist(STORE.saved, state.saved);
  setPage(state.page);
}

function bindPageEvents() {
  const form = document.querySelector('[data-search-form]');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    runSearch(form.querySelector('input[name="query"]').value, form.dataset.specialized || null);
  });

  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    state.category = button.dataset.category;
    document.querySelectorAll('[data-category]').forEach(chip => chip.classList.toggle('selected', chip.dataset.category === state.category));
    const select = document.querySelector('#category-select');
    if (select) select.value = state.category;
  }));

  const categorySelect = document.querySelector('#category-select');
  if (categorySelect) categorySelect.addEventListener('change', () => { state.category = categorySelect.value; });
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => setPage(button.dataset.go)));
  document.querySelectorAll('[data-save-result]').forEach(button => button.addEventListener('click', () => saveResult(button)));
  document.querySelectorAll('[data-remove-saved]').forEach(button => button.addEventListener('click', () => {
    state.saved = state.saved.filter(item => item.id !== button.dataset.removeSaved);
    persist(STORE.saved, state.saved); notify('Removed from your local archive.'); setPage('saved');
  }));
  document.querySelectorAll('[data-repeat-query]').forEach(button => button.addEventListener('click', () => {
    state.category = button.dataset.category; state.query = button.dataset.repeatQuery; state.resultsQuery = '';
    setPage('search');
    const input = document.querySelector('.search-input'); input.value = state.query; input.focus();
  }));
  document.querySelectorAll('[data-clear-archive]').forEach(button => button.addEventListener('click', () => {
    const isSaved = button.dataset.clearArchive === 'saved';
    if (isSaved) { state.saved = []; persist(STORE.saved, state.saved); }
    else { state.history = []; persist(STORE.history, state.history); }
    notify(isSaved ? 'Saved notes cleared from this browser.' : 'Search history cleared from this browser.'); setPage(state.page);
  }));
  document.querySelectorAll('[data-scholarship-filter]').forEach(control => {
    control.value = state.scholarshipFilters[control.dataset.scholarshipFilter];
    control.addEventListener('input', () => {
      state.scholarshipFilters[control.dataset.scholarshipFilter] = control.value;
      const focusedFilter = control.dataset.scholarshipFilter;
      setPage('scholarships');
      document.querySelector(`[data-scholarship-filter="${focusedFilter}"]`)?.focus();
    });
  });
  document.querySelectorAll('[data-setting]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.setting;
    state.settings[key] = !state.settings[key];
    persist(STORE.settings, state.settings);
    applySettings(); setPage('settings');
  }));
  const clearAll = document.querySelector('[data-clear-all]');
  if (clearAll) clearAll.addEventListener('click', () => {
    state.saved = []; state.history = [];
    persist(STORE.saved, []); persist(STORE.history, []);
    notify('Local demo history and saved notes deleted.'); setPage('settings');
  });
  const replay = document.querySelector('[data-replay-intro]');
  if (replay) replay.addEventListener('click', () => { sessionStorage.removeItem('devils-project-intro-played'); location.reload(); });
}

function applySettings() {
  document.documentElement.classList.toggle('effects-off', !state.settings.effects);
  document.documentElement.classList.toggle('reduce-motion-setting', state.settings.reducedMotion);
}

function startClock() {
  const el = document.querySelector('#live-clock');
  if (!el) return;
  const tick = () => { if (document.querySelector('#live-clock')) document.querySelector('#live-clock').textContent = new Date().toLocaleTimeString([], { hour12: false }); };
  tick(); setInterval(tick, 1000);
}

function startIntro() {
  const intro = document.querySelector('#intro');
  const app = document.querySelector('#app');
  const reducedByOS = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let alreadyPlayed = false;
  try { alreadyPlayed = sessionStorage.getItem('devils-project-intro-played') === 'true'; } catch { /* Continue without session storage. */ }
  if (alreadyPlayed || reducedByOS || state.settings.reducedMotion) {
    intro.classList.add('is-gone'); app.classList.remove('is-hidden'); app.setAttribute('aria-hidden', 'false'); return;
  }

  const messages = ['ESTABLISHING SECURE ENVIRONMENT', 'CALIBRATING RESEARCH ARRAY', 'LOCAL DEMO READY'];
  const duration = 3600;
  const started = performance.now();
  let raf;
  const step = now => {
    const progress = Math.min(1, (now - started) / duration);
    const percent = Math.floor(progress * 100);
    document.querySelector('#intro-percent').textContent = twoDigits(percent);
    document.querySelector('#intro-progress-fill').style.width = `${percent}%`;
    document.querySelector('#intro-status').textContent = messages[Math.min(2, Math.floor(progress * 3))];
    if (progress < 1) raf = requestAnimationFrame(step);
    else finishIntro();
  };
  const finishIntro = () => {
    try { sessionStorage.setItem('devils-project-intro-played', 'true'); } catch { /* Intro still completes without session storage. */ }
    intro.classList.add('is-gone'); app.classList.remove('is-hidden'); app.setAttribute('aria-hidden', 'false');
  };
  document.querySelector('#skip-intro').addEventListener('click', () => { cancelAnimationFrame(raf); finishIntro(); });
  raf = requestAnimationFrame(step);
  startParticles();
}

function startParticles() {
  const canvas = document.querySelector('#particle-field');
  const context = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!context || reduce) return;
  let width, height;
  const particles = [];
  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = width * scale; canvas.height = height * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    particles.length = 0;
    for (let i = 0; i < Math.min(75, Math.floor(width * height / 14500)); i++) particles.push({ x: Math.random() * width, y: Math.random() * height, r: Math.random() * 1.5 + .3, a: Math.random() * .5 + .12, v: Math.random() * .25 + .04, phase: Math.random() * 8 });
  };
  const draw = time => {
    context.clearRect(0, 0, width, height);
    for (const p of particles) {
      const shimmer = .65 + Math.sin(time / 900 + p.phase) * .35;
      context.beginPath(); context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(218, 48, 41, ${p.a * shimmer})`; context.fill();
      p.y -= p.v; if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
    }
    if (!document.querySelector('#intro').classList.contains('is-gone')) requestAnimationFrame(draw);
  };
  resize(); window.addEventListener('resize', resize, { passive: true }); requestAnimationFrame(draw);
}

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => setPage(button.dataset.page)));
document.querySelector('#collapse-sidebar').addEventListener('click', () => document.querySelector('.app-shell').classList.toggle('sidebar-collapsed'));
document.querySelector('#mobile-menu').addEventListener('click', () => {
  document.querySelector('#sidebar').classList.add('mobile-open'); document.querySelector('#sidebar-scrim').classList.add('is-visible');
});
document.querySelector('#sidebar-scrim').addEventListener('click', () => {
  document.querySelector('#sidebar').classList.remove('mobile-open'); document.querySelector('#sidebar-scrim').classList.remove('is-visible');
});
document.querySelector('#command-search').addEventListener('click', () => {
  setPage('search'); requestAnimationFrame(() => document.querySelector('.search-input')?.focus());
});
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => setPage(button.dataset.go)));
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPage('search'); requestAnimationFrame(() => document.querySelector('.search-input')?.focus()); }
  if (event.key === 'Escape') { document.querySelector('#sidebar').classList.remove('mobile-open'); document.querySelector('#sidebar-scrim').classList.remove('is-visible'); }
});

applySettings();
updateCounts();
setPage('home');
startClock();
startIntro();
