// =========================================================
// THE DEVIL'S PROJECT - TERMINAL ENGINE (ENHANCED CREEPY VIBE)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    let state = {
        currentPage: 'home',
        searchQuery: '',
        searchMode: 'General Research',
        savedItems: JSON.parse(localStorage.getItem('devils_saved') || '[]'),
        history: JSON.parse(localStorage.getItem('devils_history') || '[]'),
        settings: JSON.parse(localStorage.getItem('devils_settings') || JSON.stringify({
            effects: true,
            reduceMotion: false
        }))
    };

    // Apply saved settings classes
    if (!state.settings.effects) document.body.classList.add('effects-off');
    if (state.settings.reduceMotion) document.body.classList.add('reduce-motion-setting');

    // Initialize UI components
    initIntro();
    initParticleCanvas();
    initNavigation();
    updateSidebarCounts();
    renderPage(state.currentPage);

    // Global Keybindings (Ctrl + K)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const input = document.getElementById('search-input-main');
            if (input) input.focus();
        }
    });
});

// --- CINEMATIC INTRO ANIMATION (HORROR TERMINAL STYLE) ---
function initIntro() {
    const intro = document.getElementById('intro');
    const percentSpan = document.getElementById('intro-percent');
    const progressFill = document.getElementById('intro-progress-fill');
    const statusText = document.getElementById('intro-status');
    const skipBtn = document.getElementById('skip-intro');
    const appShell = document.getElementById('app');

    const statuses = [
        "ESTABLISHING SECURE DARK TUNNEL...",
        "BYPASSING MAINFRAME FIREWALLS...",
        "DECRYPTING RESTRICTED INTELLIGENCE...",
        "SYSTEM READY. ENTER AT YOUR OWN RISK."
    ];

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(dismissIntro, 500);
        }
        if (percentSpan) percentSpan.textContent = String(progress).padStart(2, '0');
        if (progressFill) progressFill.style.width = progress + '%';
        if (statusText) {
            const idx = Math.min(Math.floor((progress / 100) * statuses.length), statuses.length - 1);
            statusText.textContent = statuses[idx];
        }
    }, 150);

    if (skipBtn) skipBtn.addEventListener('click', dismissIntro);

    window.addEventListener('keydown', function escSkip(e) {
        if (e.key === 'Escape') {
            dismissIntro();
            window.removeEventListener('keydown', escSkip);
        }
    });

    function dismissIntro() {
        clearInterval(interval);
        if (percentSpan) percentSpan.textContent = '100';
        if (progressFill) progressFill.style.width = '100%';
        if (intro) {
            intro.style.opacity = '0';
            intro.style.visibility = 'hidden';
            setTimeout(() => intro.remove(), 800);
        }
        if (appShell) appShell.removeAttribute('aria-hidden');
    }
}

// --- PARTICLE BACKGROUND CANVAS (BLOOD RED GLOW EMBERS) ---
function initParticleCanvas() {
    const canvas = document.getElementById('particle-field');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.4,
        speedY: (Math.random() * 0.5 + 0.1) * -1,
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.7 + 0.2
    }));

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#f34237';
        particles.forEach(p => {
            ctx.globalAlpha = p.opacity;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff0000';
            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y < 0) {
                p.y = height;
                p.x = Math.random() * width;
            }
        });
        requestAnimationFrame(draw);
    }
    draw();
}

// --- NAVIGATION & ROUTING ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            if (!page) return;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            state.currentPage = page;
            renderPage(page);

            // Close mobile menu if active
            document.getElementById('sidebar')?.classList.remove('mobile-open');
            document.getElementById('sidebar-scrim')?.classList.remove('is-visible');
        });
    });

    // Sidebar Collapse
    const collapseBtn = document.getElementById('collapse-sidebar');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            document.getElementById('app')?.classList.toggle('sidebar-collapsed');
        });
    }

    // Mobile Menu Trigger
    const mobileTrigger = document.getElementById('mobile-menu');
    const scrim = document.getElementById('sidebar-scrim');
    if (mobileTrigger && scrim) {
        mobileTrigger.addEventListener('click', () => {
            document.getElementById('sidebar')?.classList.add('mobile-open');
            scrim.classList.add('is-visible');
        });
        scrim.addEventListener('click', () => {
            document.getElementById('sidebar')?.classList.remove('mobile-open');
            scrim.classList.remove('is-visible');
        });
    }

    // Topbar Command Search & Settings buttons
    document.getElementById('command-search')?.addEventListener('click', () => {
        const searchNav = document.querySelector('[data-page="search"]');
        if (searchNav) searchNav.click();
    });

    document.querySelectorAll('[data-go="settings"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('[data-page="settings"]')?.click();
        });
    });
}

function updateSidebarCounts() {
    const savedCount = document.getElementById('saved-count');
    const historyCount = document.getElementById('history-count');
    if (savedCount) savedCount.textContent = String(state.savedItems.length).padStart(2, '0');
    if (historyCount) historyCount.textContent = String(state.history.length).padStart(2, '0');
}

// --- RENDER PAGES ---
function renderPage(pageId) {
    const host = document.getElementById('page-host');
    const breadcrumb = document.getElementById('breadcrumb');
    if (!host || !breadcrumb) return;

    breadcrumb.innerHTML = `HOME <i>/</i> ${pageId.toUpperCase()}`;

    switch(pageId) {
        case 'home':
            host.innerHTML = renderHomePage();
            setupHomeEvents();
            break;
        case 'search':
            host.innerHTML = renderSearchPage();
            setupSearchEvents();
            break;
        case 'people':
            host.innerHTML = renderPeoplePage();
            setupSavedEvents();
            break;
        case 'scholarships':
            host.innerHTML = renderScholarshipsPage();
            setupSavedEvents();
            break;
        case 'technology':
            host.innerHTML = renderTechPage();
            setupSavedEvents();
            break;
        case 'organizations':
            host.innerHTML = renderOrganizationsPage();
            setupSavedEvents();
            break;
        case 'education':
            host.innerHTML = renderEducationPage();
            setupSavedEvents();
            break;
        case 'deep':
            host.innerHTML = renderDeepResearchPage();
            setupSavedEvents();
            break;
        case 'saved':
            host.innerHTML = renderSavedFilesPage();
            setupSavedEvents();
            break;
        case 'history':
            host.innerHTML = renderHistoryPage();
            setupHistoryEvents();
            break;
        case 'settings':
            host.innerHTML = renderSettingsPage();
            setupSettingsEvents();
            break;
        default:
            host.innerHTML = renderHomePage();
            setupHomeEvents();
    }
}

// --- PAGE TEMPLATES ---

function renderHomePage() {
    return `
        <div class="hero-row">
            <div>
                <p class="section-kicker">SECURE INTELLIGENCE PORTAL</p>
                <h1 class="hero-title">THE DEVIL'S <span class="red">PROJECT</span></h1>
                <p class="hero-subtitle">EVERY QUESTION HAS A DARK SIDE.</p>
            </div>
            <div class="time-readout">
                <strong id="live-clock">17:59:04</strong>
                <span>LOCAL SESSION / ACTIVE</span>
            </div>
        </div>

        <div class="search-console">
            <div class="console-head">
                <div class="console-state"><span class="status-pulse" style="margin:0;"></span><span>UNIVERSAL QUERY INTERFACE</span></div>
                <strong>LOCAL DEMO / READY</strong>
            </div>
            <div class="search-form">
                <span class="search-symbol">⌕</span>
                <input type="text" class="search-input" id="search-input-main" placeholder="Ask anything. Discover everything." value="${state.searchQuery}">
                <select class="category-select" id="search-mode-select">
                    <option>General Research</option>
                    <option>People Intelligence</option>
                    <option>Scholarships</option>
                    <option>Technology</option>
                    <option>Organizations</option>
                </select>
                <button class="search-button" id="main-search-btn" type="button"><span>⚡</span> INITIATE SEARCH</button>
            </div>
            <div class="console-bottom">
                <span>DEMO INTERFACE · NO LIVE SEARCH CONNECTED</span>
                <span class="console-note">PRESS ENTER TO EXECUTE QUERY</span>
            </div>
        </div>

        <div class="demo-banner">
            <span class="banner-mark">⚠</span>
            <div><b>DEMONSTRATION MODE.</b> Search results are illustrative interface data. No AI model, web search, or source verification is connected.</div>
        </div>

        <div class="category-strip">
            <button class="category-chip" data-cat="General"><i>#</i> General Research</button>
            <button class="category-chip" data-cat="People"><i>#</i> People Intelligence</button>
            <button class="category-chip" data-cat="Scholarships"><i>#</i> Scholarships</button>
            <button class="category-chip" data-cat="Technology"><i>#</i> Technology</button>
            <button class="category-chip" data-cat="Organizations"><i>#</i> Organizations</button>
            <button class="category-chip" data-cat="Education"><i>#</i> Education</button>
        </div>

        <div class="home-lower">
            <div class="recent-section">
                <div class="section-head">
                    <div>
                        <h2>Recent research</h2>
                        <p>Your searches in this browser session.</p>
                    </div>
                    <button class="text-action" id="clear-history-btn" type="button">CLEAR HISTORY</button>
                </div>
                <div class="activity-list">
                    ${state.history.length === 0 ? '<div class="empty-state" style="border:0; min-height:80px;"><div><strong>No recent searches recorded.</strong></div></div>' : 
                      state.history.slice(0, 3).map(h => `
                        <div class="activity-row">
                            <div class="activity-indicator">⌕</div>
                            <div class="activity-copy">
                                <strong>${h.query}</strong>
                                <small>${h.mode} · Recorded query</small>
                            </div>
                            <span class="row-meta">${h.time}</span>
                        </div>
                      `).join('')}
                </div>
            </div>

            <div class="saved-preview">
                <div class="section-head">
                    <div>
                        <h2>Saved reports</h2>
                        <p>Keep useful demo notes close.</p>
                    </div>
                    <button class="text-action" type="button" onclick="document.querySelector('[data-page=saved]').click()">VIEW ARCHIVE</button>
                </div>
                <div>
                    ${state.savedItems.length === 0 ? '<div class="saved-empty">No saved reports or bookmarks found in local repository.</div>' :
                      state.savedItems.slice(0, 2).map(s => `
                        <div class="saved-card">
                            <div class="activity-indicator">▣</div>
                            <div>
                                <strong>${s.title}</strong>
                                <small>${s.source}</small>
                            </div>
                        </div>
                      `).join('')}
                </div>
            </div>
        </div>

        <div class="metrics-row">
            <div class="metric">
                <strong>1,048</strong>
                <span>VERIFIED NODES SCANNED</span>
            </div>
            <div class="metric">
                <strong>0.04s</strong>
                <span>QUERY LATENCY</span>
            </div>
            <div class="metric">
                <strong>SECURE</strong>
                <span>ENCRYPTION STATUS</span>
            </div>
        </div>
    `;
}

function renderSearchPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Universal Search</h1>
                <p>Execute deep multi-domain queries across verified public intelligence records.</p>
            </div>
            <div class="heading-code">
                <b>QUERY_ENGINE // 02</b>
                <span>READY FOR INPUT</span>
            </div>
        </div>

        <div class="page-console">
            <div class="search-form">
                <span class="search-symbol">⌕</span>
                <input type="text" class="search-input" id="universal-query-input" placeholder="Enter research subject, entity, or topic..." value="${state.searchQuery}">
                <button class="search-button" id="execute-search-btn" type="button"><span>⚡</span> SEARCH</button>
            </div>
        </div>

        <div class="scan-state" id="scan-animation-box">
            <div class="scan-bar"><span></span></div>
            <span id="scan-status-label">SCANNING MAINFRAME NODES...</span>
        </div>

        <div id="search-results-container" style="margin-top: 24px;">
            <div class="result-toolbar">
                <span>RESULTS FOR: <strong>"${state.searchQuery || 'ALL DATA'}"</strong></span>
                <span>3 MATCHES FOUND</span>
            </div>
            <div class="result-grid">
                <div class="result-list">
                    <div class="result-card">
                        <div class="result-card-head">
                            <span class="data-tag">VERIFIED PUBLIC RECORD</span>
                            <span class="result-meta">CONFIDENCE: 99.4%</span>
                        </div>
                        <h3>Global Artificial Intelligence Learning Framework</h3>
                        <p>Comprehensive overview of open-access AI certifications, institutional courses, and research grants available for international students.</p>
                        <div class="result-card-foot">
                            <span class="result-source">SOURCE: global-ai-initiatives.org</span>
                            <button class="save-button" type="button" data-title="Global AI Learning Framework" data-source="global-ai-initiatives.org">SAVE REPORT</button>
                        </div>
                    </div>
                </div>
                <div class="insight-panel">
                    <h3>Metadata Analysis</h3>
                    <p>Query successfully resolved against local demo database indices.</p>
                    <div class="insight-line"><span>ENTITIES</span><b>3 Identified</b></div>
                    <div class="insight-line"><span>THREAT LEVEL</span><b>None (Public)</b></div>
                </div>
            </div>
        </div>
    `;
}

function renderPeoplePage() {
    return `
        <div class="page-heading">
            <div>
                <h1>People Intelligence</h1>
                <p>Public record OSINT terminal for authorized professional and organizational background lookups.</p>
            </div>
            <div class="heading-code">
                <b>OSINT_MODULE // 03</b>
                <span>PUBLIC RECORDS ONLY</span>
            </div>
        </div>
        <div class="result-card">
            <div class="result-card-head"><span class="data-tag">SUBJECT IDENTIFIED</span><span class="result-meta">ID: #99402-EM</span></div>
            <h3>Elon Musk</h3>
            <p>Entrepreneur, engineer, and inventor. Founder, CEO, and chief engineer at SpaceX; angel investor, CEO, and product architect of Tesla, Inc.</p>
            <div class="result-card-foot">
                <span class="result-source">SOURCE: Public Registry & Corporate Filings</span>
                <button class="save-button" type="button" data-title="Profile: Elon Musk" data-source="Public Registry">SAVE PROFILE</button>
            </div>
        </div>
    `;
}

function renderScholarshipsPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Scholarships Finder</h1>
                <p>Filter global academic grants, financial aid, and institutional fellowships.</p>
            </div>
            <div class="heading-code">
                <b>ACADEMIC_INTEL // 04</b>
                <span>UPDATED Q4 2026</span>
            </div>
        </div>
        <div class="result-card">
            <div class="result-card-head"><span class="data-tag">FULLY FUNDED</span><span class="result-meta">DEADLINE: NOV 22, 2026</span></div>
            <h3>Google Generation Google Scholarship</h3>
            <p>For computer science and technology students. Includes financial support and mentorship opportunities from Google engineers.</p>
            <div class="result-card-foot">
                <span class="result-source">ELIGIBILITY: Age 16-25 · Global</span>
                <button class="save-button" type="button" data-title="Google Generation Scholarship" data-source="Google Official">SAVE SCHOLARSHIP</button>
            </div>
        </div>
    `;
}

function renderTechPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Technology Research</h1>
                <p>Inspect programming architectures, AI frameworks, and software engineering standards.</p>
            </div>
            <div class="heading-code">
                <b>TECH_MODULE // 05</b>
                <span>SYSTEM ACTIVE</span>
            </div>
        </div>
        <div class="result-card">
            <div class="result-card-head"><span class="data-tag">CORE ARCHITECTURE</span><span class="result-meta">Vite + Static Terminal</span></div>
            <h3>Advanced Frontend Interface Guidelines</h3>
            <p>Documentation on building high-performance, immersive dark-themed web interfaces with optimized CSS animations.</p>
            <div class="result-card-foot">
                <span class="result-source">INTERNAL REPOSITORY</span>
                <button class="save-button" type="button" data-title="Frontend Interface Guidelines" data-source="Internal Doc">SAVE REPORT</button>
            </div>
        </div>
    `;
}

function renderOrganizationsPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Organizations & Institutions</h1>
                <p>Structured intelligence records for global corporate entities and research labs.</p>
            </div>
            <div class="heading-code">
                <b>ORG_MODULE // 06</b>
                <span>VERIFIED RECORDS</span>
            </div>
        </div>
        <div class="result-card">
            <h3>Global Research Consortium</h3>
            <p>Non-profit technological research and open-source intelligence initiative.</p>
            <div class="result-card-foot">
                <span class="result-source">SOURCE: Institutional Directory</span>
                <button class="save-button" type="button" data-title="Global Research Consortium" data-source="Institutional Directory">SAVE RECORD</button>
            </div>
        </div>
    `;
}

function renderEducationPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Educational Resources</h1>
                <p>Searchable index of academic courses, open certifications, and training programs.</p>
            </div>
            <div class="heading-code">
                <b>EDU_MODULE // 07</b>
                <span>INDEX ACTIVE</span>
            </div>
        </div>
        <div class="result-card">
            <h3>Cybersecurity Fundamentals & Threat Analysis</h3>
            <p>Open access certification curriculum for defensive network security.</p>
            <div class="result-card-foot">
                <span class="result-source">SOURCE: Open Academy</span>
                <button class="save-button" type="button" data-title="Cybersecurity Fundamentals" data-source="Open Academy">SAVE COURSE</button>
            </div>
        </div>
    `;
}

function renderDeepResearchPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Deep Research Workspace</h1>
                <p>Detailed investigative reports, source comparisons, and long-form analytical summaries.</p>
            </div>
            <div class="heading-code">
                <b>DEEP_MODULE // 08</b>
                <span>WORKSPACE READY</span>
            </div>
        </div>
        <div class="result-card">
            <h3>Comprehensive Threat Landscape Report 2026</h3>
            <p>Detailed analysis of emerging cybersecurity trends, systemic risks, and encryption protocols.</p>
            <div class="result-card-foot">
                <span class="result-source">SOURCE: Deep Intelligence Unit</span>
                <button class="save-button" type="button" data-title="Threat Landscape Report 2026" data-source="Deep Intelligence Unit">SAVE REPORT</button>
            </div>
        </div>
    `;
}

function renderSavedFilesPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Saved Files & Reports</h1>
                <p>Your bookmarked intelligence summaries and research records.</p>
            </div>
            <div class="heading-code">
                <b>ARCHIVE // 09</b>
                <span>${state.savedItems.length} ITEMS STORED</span>
            </div>
        </div>

        <div class="archive-list">
            ${state.savedItems.length === 0 ? 
                `<div class="empty-state"><div><strong>No saved files found.</strong><p style="margin-top:6px;">Click 'SAVE REPORT' on any search result.</p></div></div>` :
                state.savedItems.map((item, index) => `
                    <div class="archive-row">
                        <div class="activity-indicator">▣</div>
                        <div class="activity-copy">
                            <strong>${item.title}</strong>
                            <small>Source: ${item.source}</small>
                        </div>
                        <div class="archive-controls">
                            <button class="small-button remove-saved-btn" type="button" data-index="${index}">REMOVE</button>
                        </div>
                    </div>
                `).join('')}
        </div>
    `;
}

function renderHistoryPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Search History</h1>
                <p>Chronological log of queries executed during your session.</p>
            </div>
            <div class="heading-code">
                <b>LOGS // 10</b>
                <span>${state.history.length} QUERIES</span>
            </div>
        </div>
        <div class="archive-list">
            ${state.history.length === 0 ? '<div class="empty-state"><div><strong>History log is empty.</strong></div></div>' :
              state.history.map(h => `
                <div class="archive-row">
                    <div class="activity-indicator">⌕</div>
                    <div class="activity-copy"><strong>${h.query}</strong><small>${h.mode}</small></div>
                    <span class="row-meta">${h.time}</span>
                </div>
              `).join('')}
        </div>
    `;
}

function renderSettingsPage() {
    return `
        <div class="page-heading">
            <div>
                <h1>Terminal Settings</h1>
                <p>Configure visual effects, ambient animations, and preferences.</p>
            </div>
            <div class="heading-code">
                <b>CONFIG // 11</b>
                <span>LOCAL PREFERENCES</span>
            </div>
        </div>
        <div class="settings-layout">
            <div class="settings-list">
                <div class="setting-row">
                    <div>
                        <strong>Ambient Visual Effects</strong>
                        <span class="setting-note">Enable or disable background grid scanlines and particle animations.</span>
                    </div>
                    <button class="toggle" id="toggle-effects" type="button" role="switch" aria-checked="${state.settings.effects}"></button>
                </div>
            </div>
        </div>
    `;
}

// --- EVENT HANDLERS ---

function setupHomeEvents() {
    const searchBtn = document.getElementById('main-search-btn');
    const searchInput = document.getElementById('search-input-main');
    const modeSelect = document.getElementById('search-mode-select');
    const clearBtn = document.getElementById('clear-history-btn');

    if (searchBtn && searchInput) {
        const execute = () => {
            const query = searchInput.value.trim();
            if (query) {
                state.searchQuery = query;
                state.searchMode = modeSelect ? modeSelect.value : 'General Research';
                addToHistory(query, state.searchMode);
            }
            document.querySelector('[data-page="search"]')?.click();
        };
        searchBtn.addEventListener('click', execute);
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') execute(); });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            state.history = [];
            localStorage.setItem('devils_history', JSON.stringify([]));
            updateSidebarCounts();
            renderPage('home');
            showToast('History cleared.');
        });
    }

    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            state.searchQuery = chip.getAttribute('data-cat') + ' research';
            document.querySelector('[data-page="search"]')?.click();
        });
    });

    setInterval(() => {
        const clock = document.getElementById('live-clock');
        if (clock) clock.textContent = new Date().toTimeString().split(' ')[0];
    }, 1000);
}

function setupSearchEvents() {
    const searchBtn = document.getElementById('execute-search-btn');
    const searchInput = document.getElementById('universal-query-input');
    const scanBox = document.getElementById('scan-animation-box');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const q = searchInput.value.trim();
            if (q) {
                state.searchQuery = q;
                addToHistory(q, 'Universal Search');
                if (scanBox) {
                    scanBox.classList.add('visible');
                    setTimeout(() => scanBox.classList.remove('visible'), 900);
                }
            }
        });
    }
}

function setupSavedEvents() {
    document.querySelectorAll('.save-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = e.target.getAttribute('data-title');
            const source = e.target.getAttribute('data-source');
            if (title && source) {
                saveItem(title, source);
                e.target.textContent = 'SAVED ✓';
            }
        });
    });

    document.querySelectorAll('.remove-saved-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            state.savedItems.splice(idx, 1);
            localStorage.setItem('devils_saved', JSON.stringify(state.savedItems));
            updateSidebarCounts();
            renderPage('saved');
            showToast('Item removed from archive.');
        });
    });
}

function setupHistoryEvents() {}

function setupSettingsEvents() {
    const effToggle = document.getElementById('toggle-effects');
    if (effToggle) {
        effToggle.addEventListener('click', () => {
            const val = effToggle.getAttribute('aria-checked') === 'true';
            effToggle.setAttribute('aria-checked', !val);
            state.settings.effects = !val;
            localStorage.setItem('devils_settings', JSON.stringify(state.settings));
            document.body.classList.toggle('effects-off', val);
            showToast('Visual effects updated.');
        });
    }
}

function addToHistory(query, mode) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.history.unshift({ query, mode, time });
    if (state.history.length > 20) state.history.pop();
    localStorage.setItem('devils_history', JSON.stringify(state.history));
    updateSidebarCounts();
}

function saveItem(title, source) {
    if (!state.savedItems.some(i => i.title === title)) {
        state.savedItems.push({ title, source });
        localStorage.setItem('devils_saved', JSON.stringify(state.savedItems));
        updateSidebarCounts();
        showToast('Saved to local archive.');
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}
