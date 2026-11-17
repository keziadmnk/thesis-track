/* ═══════════════════════════════════════════════════════════
   ThesisTrack — script.js
   Vanilla JS, LocalStorage persistence, all modules
════════════════════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════
// 1. DATA LAYER — default sample data & LocalStorage helpers
// ══════════════════════════════════════════

/** Keys used in LocalStorage */
const LS = {
  SETTINGS:    'tt_settings',
  CHAPTERS:    'tt_chapters',
  TASKS:       'tt_tasks',
  SUPERVISION: 'tt_supervision',
  REVISIONS:   'tt_revisions',
  MILESTONES:  'tt_milestones',
};

/** Save any value to LocalStorage as JSON */
function lsSave(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Load a value from LocalStorage; returns defaultValue if not found */
function lsLoad(key, defaultValue) {
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try { return JSON.parse(raw); } catch { return defaultValue; }
}

/** Unique ID generator */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Default Sample Data ──────────────────
const DEFAULT_SETTINGS = {
  name:        'Aira Nabilah',
  gradDate:    new Date(new Date().getFullYear() + 1, 5, 20).toISOString().slice(0, 10),
  thesisTitle: 'The Influence of Social Media Usage on Academic Motivation Among University Students',
};

const DEFAULT_CHAPTERS = [
  { id: '1', num: 1, title: 'Introduction',         subtitle: 'Background, problem, objectives, scope', pct: 100, status: 'completed'  },
  { id: '2', num: 2, title: 'Literature Review',    subtitle: 'Theoretical framework & prior research',  pct: 85,  status: 'in-progress'},
  { id: '3', num: 3, title: 'Research Methodology', subtitle: 'Research design & data collection plan',  pct: 60,  status: 'in-progress'},
  { id: '4', num: 4, title: 'Results & Analysis',   subtitle: 'Data analysis and findings',              pct: 20,  status: 'in-progress'},
  { id: '5', num: 5, title: 'Conclusion',            subtitle: 'Summary, implications, recommendations', pct: 0,   status: 'not-started'},
];

function mkTask(title, desc, chapter, priority, deadline, status) {
  return { id: uid(), title, desc, chapter, priority, deadline, status, createdAt: new Date().toISOString() };
}

const DEFAULT_TASKS = [
  mkTask('Finalize Chapter 2 framework', 'Revise the theoretical framework section with updated sources.', 'Chapter II', 'high',   daysFromNow(3),  'in-progress'),
  mkTask('Collect survey respondents',   'Distribute questionnaire to at least 150 respondents.',           'Chapter III', 'high',   daysFromNow(10), 'pending'    ),
  mkTask('Write Chapter 3 methodology',  'Detail the sampling method and data collection procedure.',        'Chapter III', 'medium', daysFromNow(14), 'pending'    ),
  mkTask('Review Chapter 1 supervisor feedback', 'Apply all corrections from the last supervision meeting.','Chapter I',   'medium', daysFromNow(-2), 'in-progress'),
  mkTask('Compile literature sources',   'Organize references in Mendeley and format them in APA 7.',       'Chapter II',  'low',    daysFromNow(21), 'pending'    ),
  mkTask('Submit revised Chapter 2',     'Send the revised chapter to the supervisor for review.',          'Chapter II',  'high',   daysFromNow(7),  'pending'    ),
  mkTask('Write abstract draft',         'Draft a 250-word abstract once Chapter 3 is finalized.',          'General',     'low',    daysFromNow(30), 'pending'    ),
  mkTask('Print and bind proposal',      'Get document printed and bound before proposal seminar.',         'General',     'medium', daysFromNow(-5), 'completed'  ),
];

function mkSupervision(supervisor, date, topic, notes) {
  return { id: uid(), supervisor, date, topic, notes, createdAt: new Date().toISOString() };
}

const DEFAULT_SUPERVISION = [
  mkSupervision('Dr. Lestari Wijoyo, M.Pd.', daysFromNow(-21), 'Chapter 1 Review',        'The introduction was approved with minor corrections. Focus next session on Chapter 2 framework.'),
  mkSupervision('Dr. Lestari Wijoyo, M.Pd.', daysFromNow(-10), 'Chapter 2 Progress',      'Advised to add more primary sources. Refine the conceptual framework diagram before next submission.'),
  mkSupervision('Dr. Lestari Wijoyo, M.Pd.', daysFromNow(5),   'Chapter 2 Final Review',  'Scheduled session to review Chapter 2 revisions and discuss methodology design.'),
  mkSupervision('Dr. Lestari Wijoyo, M.Pd.', daysFromNow(18),  'Chapter 3 Consultation',  'Planned session to discuss data collection tools and sampling strategy.'),
];

function mkRevision(title, desc, chapter, deadline, status) {
  return { id: uid(), title, desc, chapter, deadline, status, createdAt: new Date().toISOString() };
}

const DEFAULT_REVISIONS = [
  mkRevision('Update problem statement',      'Expand the problem statement with current statistical data.',     'Chapter I',  daysFromNow(-2), 'in-progress'),
  mkRevision('Fix literature review gap',     'Add a section discussing the gap between existing research.',    'Chapter II', daysFromNow(4),  'pending'    ),
  mkRevision('Correct variable definitions',  'Redefine independent and dependent variables more precisely.',   'Chapter II', daysFromNow(6),  'pending'    ),
  mkRevision('Revise research instrument',    'Adapt questionnaire items to better match the research goals.',  'Chapter III',daysFromNow(14), 'pending'    ),
  mkRevision('Chapter 1 format corrections',  'Fix heading hierarchy and citation format per APA 7 guidelines.','Chapter I',  daysFromNow(-8), 'completed'  ),
];

function mkMilestone(name, desc, icon, targetDate, completed) {
  return { id: uid(), name, desc, icon, targetDate, completed };
}

const DEFAULT_MILESTONES = [
  mkMilestone('Proposal Submission', 'Submit the thesis proposal document to the academic committee.',          '📄', daysFromNow(-45), true ),
  mkMilestone('Proposal Seminar',    'Present the thesis proposal to the examiner panel.',                      '🎤', daysFromNow(-20), true ),
  mkMilestone('Data Collection',     'Complete all data collection from survey respondents.',                    '📊', daysFromNow(14),  false),
  mkMilestone('Seminar Hasil',       'Present research findings in the intermediate thesis seminar.',            '📑', daysFromNow(60),  false),
  mkMilestone('Thesis Submission',   'Submit the complete thesis document for final review.',                    '📚', daysFromNow(90),  false),
  mkMilestone('Thesis Defense',      'Defend the thesis before the examiner panel and receive final approval.',  '🏆', daysFromNow(110), false),
];

/** Returns ISO date string N days from today */
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Initialize LocalStorage with defaults if first run */
function initData() {
  if (!localStorage.getItem(LS.SETTINGS)) {
    lsSave(LS.SETTINGS,    DEFAULT_SETTINGS);
    lsSave(LS.CHAPTERS,    DEFAULT_CHAPTERS);
    lsSave(LS.TASKS,       DEFAULT_TASKS);
    lsSave(LS.SUPERVISION, DEFAULT_SUPERVISION);
    lsSave(LS.REVISIONS,   DEFAULT_REVISIONS);
    lsSave(LS.MILESTONES,  DEFAULT_MILESTONES);
  }
}

// ── Data accessors ──────────────────────
function getSettings()    { return lsLoad(LS.SETTINGS,    DEFAULT_SETTINGS); }
function getChapters()    { return lsLoad(LS.CHAPTERS,    []); }
function getTasks()       { return lsLoad(LS.TASKS,       []); }
function getSupervision() { return lsLoad(LS.SUPERVISION, []); }
function getRevisions()   { return lsLoad(LS.REVISIONS,   []); }
function getMilestones()  { return lsLoad(LS.MILESTONES,  []); }

// ══════════════════════════════════════════
// 2. UTILITY HELPERS
// ══════════════════════════════════════════

/** Format a date string as "12 Jan 2025" */
function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Returns how many days until (positive) or past (negative) the given date */
function daysUntil(isoStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(isoStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

/** Badge HTML for a task/revision status */
function statusBadge(status) {
  const map = {
    'pending':     ['badge-yellow', 'Pending'],
    'in-progress': ['badge-sky',    'In Progress'],
    'completed':   ['badge-mint',   'Completed'],
    'not-started': ['badge-gray',   'Not Started'],
    'revision':    ['badge-peach',  'Revision'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

/** Badge HTML for priority */
function priorityBadge(priority) {
  const map = {
    'high':   ['badge-rose',   '● High'],
    'medium': ['badge-peach',  '● Medium'],
    'low':    ['badge-mint',   '● Low'],
  };
  const [cls, label] = map[priority] || ['badge-gray', priority];
  return `<span class="badge ${cls}">${label}</span>`;
}

/** Escape HTML to prevent XSS from stored user input */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Show a toast notification */
function showToast(msg, type = 'default') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type !== 'default' ? ' ' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ══════════════════════════════════════════
// 3. NAVIGATION
// ══════════════════════════════════════════

const PAGE_TITLES = {
  dashboard:  'Dashboard',
  progress:   'Thesis Progress',
  tasks:      'My Tasks',
  supervision:'Supervision',
  revisions:  'Revisions',
  milestones: 'Milestones',
  calendar:   'Calendar',
};

let currentPage = 'dashboard';

function navigateTo(page) {
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  // Show correct page section
  document.querySelectorAll('.page').forEach(sec => {
    sec.classList.toggle('active', sec.id === 'page-' + page);
  });

  // Update topnav title
  document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || page;
  currentPage = page;

  // Re-render the activated page
  renderPage(page);

  // Close sidebar on mobile
  closeSidebar();
}

function renderPage(page) {
  switch (page) {
    case 'dashboard':  renderDashboard();  break;
    case 'progress':   renderProgress();   break;
    case 'tasks':      renderTasks();      break;
    case 'supervision':renderSupervision();break;
    case 'revisions':  renderRevisions();  break;
    case 'milestones': renderMilestones(); break;
    case 'calendar':   renderCalendar();   break;
  }
}

// ══════════════════════════════════════════
// 4. SIDEBAR TOGGLE (mobile)
// ══════════════════════════════════════════

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// ══════════════════════════════════════════
// 5. MODAL HELPERS
// ══════════════════════════════════════════

function openModal(title, bodyHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('modalBackdrop').setAttribute('aria-hidden', 'false');
  // Re-init lucide icons inside modal
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
  document.getElementById('modalBackdrop').setAttribute('aria-hidden', 'true');
}

/** Promise-based confirm dialog */
function confirmDelete(msg) {
  return new Promise(resolve => {
    document.getElementById('confirmMsg').textContent = msg || 'Are you sure you want to delete this item?';
    document.getElementById('confirmBackdrop').classList.add('open');

    // Use { once: true } so listeners auto-remove after firing — no cloneNode needed
    function finish(result) {
      document.getElementById('confirmBackdrop').classList.remove('open');
      resolve(result);
    }

    document.getElementById('confirmOk').addEventListener('click',    () => finish(true),  { once: true });
    document.getElementById('confirmCancel').addEventListener('click', () => finish(false), { once: true });
    document.getElementById('confirmClose').addEventListener('click',  () => finish(false), { once: true });
  });
}

// ══════════════════════════════════════════
// 6. DASHBOARD
// ══════════════════════════════════════════

function renderDashboard() {
  const settings   = getSettings();
  const chapters   = getChapters();
  const tasks      = getTasks();
  const supervision = getSupervision();
  const revisions  = getRevisions();

  // ── Overall progress
  const overall = computeOverallPct(chapters);
  document.getElementById('statOverall').textContent    = overall + '%';
  document.getElementById('statOverallBar').style.width = overall + '%';

  // ── Active chapter (highest in-progress, or first not-started)
  const active = chapters.find(c => c.status === 'in-progress') ||
                 chapters.find(c => c.status === 'not-started')  || null;
  document.getElementById('statActiveChapter').textContent = active ? 'Chapter ' + active.num : '—';

  // ── Task stats
  const totalTasks    = tasks.length;
  const doneTasks     = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks  = tasks.filter(t => t.status !== 'completed').length;
  document.getElementById('statTasksDone').textContent = doneTasks + '/' + totalTasks;
  document.getElementById('statPending').textContent   = pendingTasks;

  // ── Welcome banner
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning! 🌸' : hour < 17 ? 'Good afternoon! ☀️' : 'Good evening! 🌙';
  document.getElementById('welcomeGreeting').textContent = greeting + ' ' + (settings.name ? settings.name.split(' ')[0] : '');
  document.getElementById('welcomeMsg').textContent = motivationalMessage(overall);

  // ── Graduation countdown
  if (settings.gradDate) {
    const days = daysUntil(settings.gradDate);
    document.getElementById('countdownDays').textContent = days > 0 ? days : '🎉 Graduated!';
  } else {
    document.getElementById('countdownDays').textContent = '—';
  }

  // ── Upcoming deadlines (tasks + revisions within 14 days or overdue)
  const today = new Date(); today.setHours(0,0,0,0);
  const deadlines = [];

  tasks.filter(t => t.status !== 'completed' && t.deadline).forEach(t => {
    const diff = daysUntil(t.deadline);
    if (diff <= 14) deadlines.push({ title: t.title, date: t.deadline, diff, type: 'Task' });
  });
  revisions.filter(r => r.status !== 'completed' && r.deadline).forEach(r => {
    const diff = daysUntil(r.deadline);
    if (diff <= 14) deadlines.push({ title: r.title, date: r.deadline, diff, type: 'Revision' });
  });
  deadlines.sort((a, b) => a.diff - b.diff);

  const dlEl = document.getElementById('dashDeadlines');
  if (deadlines.length === 0) {
    dlEl.innerHTML = '<p class="empty-state">No upcoming deadlines. 🎉</p>';
  } else {
    dlEl.innerHTML = deadlines.slice(0, 5).map(d => {
      const dotClass = d.diff < 0 ? 'overdue' : d.diff <= 3 ? 'soon' : 'upcoming';
      const label    = d.diff < 0 ? `${Math.abs(d.diff)}d overdue` : d.diff === 0 ? 'Today!' : `in ${d.diff}d`;
      return `<div class="deadline-item">
        <div class="deadline-dot ${dotClass}"></div>
        <div class="deadline-info">
          <div class="title">${esc(d.title)}</div>
          <div class="date">${d.type} · ${formatDate(d.date)} (${label})</div>
        </div>
      </div>`;
    }).join('');
  }

  // ── Next supervision
  const upcoming = supervision
    .filter(s => daysUntil(s.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextSup = upcoming[0];
  const supEl = document.getElementById('dashSupervision');
  if (!nextSup) {
    supEl.innerHTML = '<p class="empty-state">No upcoming supervision sessions.</p>';
  } else {
    const diff = daysUntil(nextSup.date);
    supEl.innerHTML = `<div class="supervision-item">
      <div class="deadline-info">
        <div class="title">${esc(nextSup.topic)}</div>
        <div class="date">👩‍🏫 ${esc(nextSup.supervisor)}</div>
        <div class="date">${formatDate(nextSup.date)} · ${diff === 0 ? 'Today!' : 'in ' + diff + ' day' + (diff !== 1 ? 's' : '')}</div>
      </div>
    </div>`;
  }

  // ── Thesis Buddy tips
  renderBuddyTips(overall, tasks, revisions, upcoming);

  // ── Update topnav user info
  updateUserInfo();
}

/** Compute overall thesis % as average of chapter percentages */
function computeOverallPct(chapters) {
  if (!chapters.length) return 0;
  const avg = chapters.reduce((sum, c) => sum + (c.pct || 0), 0) / chapters.length;
  return Math.round(avg);
}

/** Pick a motivational message based on progress */
function motivationalMessage(pct) {
  if (pct === 0)        return 'Every journey starts with a single step. Begin today! 🚀';
  if (pct < 20)         return 'Great start! Keep building your momentum. 💪';
  if (pct < 40)         return 'You\'re making real progress. Stay consistent! 📖';
  if (pct < 60)         return 'Halfway there — keep pushing, you\'ve got this! 🌟';
  if (pct < 80)         return 'The finish line is in sight. Almost there! 🏁';
  if (pct < 100)        return 'Outstanding work! Just a little more to go. 🎉';
  return 'You completed your thesis! Celebrate this achievement! 🎓';
}

/** Rule-based Thesis Buddy suggestions */
function renderBuddyTips(overall, tasks, revisions, upcomingSup) {
  const tips = [];
  const today = new Date(); today.setHours(0,0,0,0);

  // Check overdue tasks
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.deadline && daysUntil(t.deadline) < 0);
  if (overdueTasks.length > 0) {
    tips.push(`You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}! Prioritize them to get back on track.`);
  }

  // Check tasks due in 3 days
  const urgentTasks = tasks.filter(t => t.status !== 'completed' && t.deadline && daysUntil(t.deadline) >= 0 && daysUntil(t.deadline) <= 3);
  if (urgentTasks.length > 0) {
    tips.push(`${urgentTasks.length} task${urgentTasks.length > 1 ? 's are' : ' is'} due within 3 days — finish them soon!`);
  }

  // Check overdue revisions
  const overdueRevisions = revisions.filter(r => r.status !== 'completed' && r.deadline && daysUntil(r.deadline) < 0);
  if (overdueRevisions.length > 0) {
    tips.push(`${overdueRevisions.length} revision${overdueRevisions.length > 1 ? 's are' : ' is'} overdue. Address supervisor feedback promptly.`);
  }

  // Upcoming supervision
  if (upcomingSup.length > 0) {
    const diff = daysUntil(upcomingSup[0].date);
    if (diff <= 5) {
      tips.push(`Your next supervision session is in ${diff === 0 ? 'just a few hours' : diff + ' day' + (diff !== 1 ? 's' : '')}. Prepare your materials!`);
    }
  }

  // General progress tip
  if (overall < 30) {
    tips.push('Focus on completing one chapter at a time — steady progress beats rushing!');
  } else if (overall < 60) {
    tips.push('You\'re building great momentum. Consider scheduling regular writing sessions each week.');
  } else if (overall >= 80) {
    tips.push('Almost done! Double-check formatting, citations, and proofreading before submission.');
  }

  // High priority pending tasks
  const highPending = tasks.filter(t => t.priority === 'high' && t.status === 'pending');
  if (highPending.length >= 2) {
    tips.push(`You have ${highPending.length} high-priority tasks still pending. Start with the most critical one.`);
  }

  // Default tip
  if (tips.length === 0) {
    tips.push('Things are looking great! Keep maintaining your writing routine. 🌸');
  }

  const ul = document.getElementById('buddyTips');
  ul.innerHTML = tips.map(tip => `<li>${esc(tip)}</li>`).join('');
}

// ══════════════════════════════════════════
// 7. THESIS PROGRESS
// ══════════════════════════════════════════

const STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'completed':   'Completed',
  'revision':    'Revision',
};

function renderProgress() {
  const chapters = getChapters();
  const overall  = computeOverallPct(chapters);

  document.getElementById('overallPct').textContent       = overall + '%';
  document.getElementById('overallProgressBar').style.width = overall + '%';

  const grid = document.getElementById('chaptersGrid');
  grid.innerHTML = chapters.map(ch => `
    <div class="chapter-card" data-chid="${ch.id}">
      <div class="chapter-header">
        <div>
          <div class="chapter-num">Ch.${ch.num}</div>
        </div>
        <div style="text-align:right">
          ${statusBadge(ch.status)}
          <div class="chapter-pct" style="margin-top:4px">${ch.pct}%</div>
        </div>
      </div>
      <div>
        <div class="chapter-title">${esc(ch.title)}</div>
        <div class="chapter-subtitle">${esc(ch.subtitle)}</div>
      </div>
      <div class="chapter-prog-wrap">
        <div class="chapter-prog">
          <div class="chapter-prog-bar" style="width:${ch.pct}%"></div>
        </div>
      </div>
      <div class="chapter-actions">
        <select class="chapter-status-sel" data-chid="${ch.id}" title="Set Status">
          <option value="not-started" ${ch.status === 'not-started' ? 'selected' : ''}>Not Started</option>
          <option value="in-progress" ${ch.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed"   ${ch.status === 'completed'   ? 'selected' : ''}>Completed</option>
          <option value="revision"    ${ch.status === 'revision'    ? 'selected' : ''}>Revision</option>
        </select>
        <input type="number" class="chapter-pct-input" data-chid="${ch.id}"
               min="0" max="100" value="${ch.pct}" title="Percentage" placeholder="%"
               style="width:68px" />
        <button class="btn btn-primary btn-sm chapter-save-btn" data-chid="${ch.id}">Save</button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

/** Save chapter progress inline */
function saveChapter(chId) {
  const chapters = getChapters();
  const ch = chapters.find(c => c.id === chId);
  if (!ch) return;

  const statusEl = document.querySelector(`.chapter-status-sel[data-chid="${chId}"]`);
  const pctEl    = document.querySelector(`.chapter-pct-input[data-chid="${chId}"]`);
  if (!statusEl || !pctEl) return;

  let pct = parseInt(pctEl.value, 10);
  if (isNaN(pct) || pct < 0) pct = 0;
  if (pct > 100) pct = 100;

  ch.status = statusEl.value;
  ch.pct    = pct;

  // Auto-status correction
  if (pct === 100 && ch.status !== 'revision') ch.status = 'completed';
  if (pct === 0   && ch.status === 'completed') ch.status = 'not-started';

  lsSave(LS.CHAPTERS, chapters);
  showToast('Chapter updated!', 'success');
  renderProgress();
}

// ══════════════════════════════════════════
// 8. TASKS
// ══════════════════════════════════════════

function renderTasks() {
  const tasks     = getTasks();
  const statusF   = document.getElementById('filterTaskStatus').value;
  const priorityF = document.getElementById('filterTaskPriority').value;

  let filtered = tasks;
  if (statusF)   filtered = filtered.filter(t => t.status   === statusF);
  if (priorityF) filtered = filtered.filter(t => t.priority === priorityF);

  // Sort: overdue first, then by deadline asc, then uncompleted first
  filtered.sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });

  const list = document.getElementById('tasksList');
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state-full">
      <div class="icon">📋</div>
      <p>No tasks found. Add a task to get started!</p>
    </div>`;
    return;
  }

  list.innerHTML = filtered.map(t => {
    const diff       = t.deadline ? daysUntil(t.deadline) : null;
    const isOverdue  = diff !== null && diff < 0 && t.status !== 'completed';
    const isSoon     = diff !== null && diff >= 0 && diff <= 3 && t.status !== 'completed';
    const isComplete = t.status === 'completed';

    const cardClass  = isOverdue ? 'task-card overdue' : isSoon ? 'task-card due-soon' : isComplete ? 'task-card completed-card' : 'task-card';
    const checkClass = isComplete ? 'task-checkbox checked' : 'task-checkbox';
    const titleClass = isComplete ? 'task-title line-through' : 'task-title';

    let deadlineText = '';
    if (t.deadline) {
      if (isOverdue)       deadlineText = `⚠️ ${Math.abs(diff)}d overdue`;
      else if (diff === 0) deadlineText = '📅 Due today!';
      else if (isSoon)     deadlineText = `📅 Due in ${diff}d`;
      else                 deadlineText = `📅 ${formatDate(t.deadline)}`;
    }

    return `<div class="${cardClass}" data-tid="${t.id}">
      <div class="${checkClass}" data-toggle-task="${t.id}" title="Toggle complete">
        ${isComplete ? '<i data-lucide="check"></i>' : ''}
      </div>
      <div class="task-info">
        <div class="${titleClass}">${esc(t.title)}</div>
        ${t.desc ? `<div class="task-desc">${esc(t.desc)}</div>` : ''}
        <div class="task-meta">
          ${statusBadge(t.status)}
          ${priorityBadge(t.priority)}
          <span class="badge badge-purple">${esc(t.chapter)}</span>
          ${deadlineText ? `<span class="badge ${isOverdue ? 'badge-rose' : isSoon ? 'badge-peach' : 'badge-gray'}">${deadlineText}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-icon" data-edit-task="${t.id}" title="Edit"><i data-lucide="edit-2"></i></button>
        <button class="btn btn-icon" data-delete-task="${t.id}" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`;
  }).join('');

  lucide.createIcons();
}

function taskFormHTML(task) {
  const t = task || {};
  return `
    <div class="form-group">
      <label class="form-label" for="fTaskTitle">Task Title *</label>
      <input class="form-input" id="fTaskTitle" type="text" value="${esc(t.title || '')}" placeholder="e.g. Write literature review" maxlength="120" />
      <span class="form-error" id="fTaskTitleErr">Title is required.</span>
    </div>
    <div class="form-group">
      <label class="form-label" for="fTaskDesc">Description</label>
      <textarea class="form-textarea form-input" id="fTaskDesc" placeholder="Optional details...">${esc(t.desc || '')}</textarea>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" for="fTaskChapter">Related Chapter *</label>
        <select class="form-input form-select" id="fTaskChapter">
          ${['Chapter I','Chapter II','Chapter III','Chapter IV','Chapter V','General'].map(c =>
            `<option value="${c}" ${(t.chapter||'') === c ? 'selected' : ''}>${c}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="fTaskPriority">Priority *</label>
        <select class="form-input form-select" id="fTaskPriority">
          <option value="high"   ${(t.priority||'') === 'high'   ? 'selected' : ''}>High</option>
          <option value="medium" ${(t.priority||'medium') === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="low"    ${(t.priority||'') === 'low'    ? 'selected' : ''}>Low</option>
        </select>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" for="fTaskDeadline">Deadline</label>
        <input class="form-input" id="fTaskDeadline" type="date" value="${esc(t.deadline || '')}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="fTaskStatus">Status *</label>
        <select class="form-input form-select" id="fTaskStatus">
          <option value="pending"     ${(t.status||'pending') === 'pending'     ? 'selected' : ''}>Pending</option>
          <option value="in-progress" ${(t.status||'') === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed"   ${(t.status||'') === 'completed'   ? 'selected' : ''}>Completed</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" id="fTaskCancel">Cancel</button>
      <button class="btn btn-primary" id="fTaskSave">Save Task</button>
    </div>`;
}

function openTaskModal(taskId) {
  const tasks = getTasks();
  const task  = taskId ? tasks.find(t => t.id === taskId) : null;
  openModal(task ? 'Edit Task' : 'Add New Task', taskFormHTML(task));

  document.getElementById('fTaskCancel').addEventListener('click', closeModal);
  document.getElementById('fTaskSave').addEventListener('click', () => {
    const title    = document.getElementById('fTaskTitle').value.trim();
    const titleErr = document.getElementById('fTaskTitleErr');

    if (!title) { titleErr.classList.add('show'); return; }
    titleErr.classList.remove('show');

    const item = {
      id:        task ? task.id : uid(),
      title,
      desc:      document.getElementById('fTaskDesc').value.trim(),
      chapter:   document.getElementById('fTaskChapter').value,
      priority:  document.getElementById('fTaskPriority').value,
      deadline:  document.getElementById('fTaskDeadline').value || null,
      status:    document.getElementById('fTaskStatus').value,
      createdAt: task ? task.createdAt : new Date().toISOString(),
    };

    const all = getTasks();
    if (task) {
      const idx = all.findIndex(t => t.id === taskId);
      if (idx > -1) all[idx] = item;
    } else {
      all.push(item);
    }
    lsSave(LS.TASKS, all);
    closeModal();
    showToast(task ? 'Task updated!' : 'Task added!', 'success');
    renderTasks();
  });
}

async function deleteTask(taskId) {
  const confirmed = await confirmDelete('Delete this task? This action cannot be undone.');
  if (!confirmed) return;
  const all = getTasks().filter(t => t.id !== taskId);
  lsSave(LS.TASKS, all);
  showToast('Task deleted.', 'default');
  renderTasks();
}

function toggleTaskComplete(taskId) {
  const all = getTasks();
  const t   = all.find(x => x.id === taskId);
  if (!t) return;
  t.status  = t.status === 'completed' ? 'pending' : 'completed';
  lsSave(LS.TASKS, all);
  renderTasks();
}

// ══════════════════════════════════════════
// 9. SUPERVISION
// ══════════════════════════════════════════

function renderSupervision() {
  const sessions = getSupervision().slice().sort((a, b) => a.date.localeCompare(b.date));
  const list     = document.getElementById('supervisionList');

  if (sessions.length === 0) {
    list.innerHTML = `<div class="empty-state-full">
      <div class="icon">👩‍🏫</div>
      <p>No supervision sessions recorded yet. Add your first session!</p>
    </div>`;
    return;
  }

  list.innerHTML = sessions.map(s => {
    const d   = new Date(s.date + 'T00:00:00');
    const day = d.getDate().toString().padStart(2, '0');
    const mon = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    const diff = daysUntil(s.date);
    const label = diff < 0 ? '(past)' : diff === 0 ? '(Today!)' : `(in ${diff}d)`;
    return `<div class="supervision-card" data-sid="${s.id}">
      <div class="supervision-date-badge">
        <span class="day">${day}</span>
        <span class="mon">${mon}</span>
      </div>
      <div class="supervision-info">
        <div class="supervision-title">${esc(s.topic)}</div>
        <div class="supervision-supervisor"><i data-lucide="user" style="width:14px;height:14px"></i> ${esc(s.supervisor)}</div>
        <div class="supervision-supervisor" style="margin-bottom:8px"><i data-lucide="calendar" style="width:14px;height:14px"></i> ${formatDate(s.date)} ${label}</div>
        ${s.notes ? `<div class="supervision-notes">${esc(s.notes)}</div>` : ''}
      </div>
      <div class="supervision-actions">
        <button class="btn btn-icon" data-edit-sup="${s.id}" title="Edit"><i data-lucide="edit-2"></i></button>
        <button class="btn btn-icon" data-delete-sup="${s.id}" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`;
  }).join('');

  lucide.createIcons();
}

function supervisionFormHTML(session) {
  const s = session || {};
  return `
    <div class="form-group">
      <label class="form-label" for="fSupSupervisor">Supervisor Name *</label>
      <input class="form-input" id="fSupSupervisor" type="text" value="${esc(s.supervisor || '')}" placeholder="e.g. Dr. Lestari Wijoyo, M.Pd." maxlength="100" />
      <span class="form-error" id="fSupSupervisorErr">Supervisor name is required.</span>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" for="fSupDate">Meeting Date *</label>
        <input class="form-input" id="fSupDate" type="date" value="${esc(s.date || '')}" />
        <span class="form-error" id="fSupDateErr">Date is required.</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="fSupTopic">Meeting Topic *</label>
        <input class="form-input" id="fSupTopic" type="text" value="${esc(s.topic || '')}" placeholder="e.g. Chapter 2 Review" maxlength="120" />
        <span class="form-error" id="fSupTopicErr">Topic is required.</span>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="fSupNotes">Meeting Notes</label>
      <textarea class="form-textarea form-input" id="fSupNotes" placeholder="Key points discussed...">${esc(s.notes || '')}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" id="fSupCancel">Cancel</button>
      <button class="btn btn-primary" id="fSupSave">Save Session</button>
    </div>`;
}

function openSupervisionModal(sessionId) {
  const all     = getSupervision();
  const session = sessionId ? all.find(s => s.id === sessionId) : null;
  openModal(session ? 'Edit Supervision Session' : 'Add Supervision Session', supervisionFormHTML(session));

  document.getElementById('fSupCancel').addEventListener('click', closeModal);
  document.getElementById('fSupSave').addEventListener('click', () => {
    const supervisor = document.getElementById('fSupSupervisor').value.trim();
    const date       = document.getElementById('fSupDate').value;
    const topic      = document.getElementById('fSupTopic').value.trim();

    let valid = true;
    if (!supervisor) { document.getElementById('fSupSupervisorErr').classList.add('show'); valid = false; } else { document.getElementById('fSupSupervisorErr').classList.remove('show'); }
    if (!date)       { document.getElementById('fSupDateErr').classList.add('show');       valid = false; } else { document.getElementById('fSupDateErr').classList.remove('show'); }
    if (!topic)      { document.getElementById('fSupTopicErr').classList.add('show');      valid = false; } else { document.getElementById('fSupTopicErr').classList.remove('show'); }
    if (!valid) return;

    const item = {
      id:         session ? session.id : uid(),
      supervisor,
      date,
      topic,
      notes:      document.getElementById('fSupNotes').value.trim(),
      createdAt:  session ? session.createdAt : new Date().toISOString(),
    };

    const sessions = getSupervision();
    if (session) {
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx > -1) sessions[idx] = item;
    } else {
      sessions.push(item);
    }
    lsSave(LS.SUPERVISION, sessions);
    closeModal();
    showToast(session ? 'Session updated!' : 'Session added!', 'success');
    renderSupervision();
  });
}

async function deleteSupervision(sessionId) {
  const confirmed = await confirmDelete('Delete this supervision session?');
  if (!confirmed) return;
  const all = getSupervision().filter(s => s.id !== sessionId);
  lsSave(LS.SUPERVISION, all);
  showToast('Session deleted.', 'default');
  renderSupervision();
}

// ══════════════════════════════════════════
// 10. REVISIONS
// ══════════════════════════════════════════

function renderRevisions() {
  let revisions = getRevisions();
  const statusF = document.getElementById('filterRevStatus').value;
  if (statusF) revisions = revisions.filter(r => r.status === statusF);

  revisions.sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });

  const list = document.getElementById('revisionsList');
  if (revisions.length === 0) {
    list.innerHTML = `<div class="empty-state-full">
      <div class="icon">✏️</div>
      <p>No revisions found. Great job staying on track!</p>
    </div>`;
    return;
  }

  list.innerHTML = revisions.map(r => {
    const diff      = r.deadline ? daysUntil(r.deadline) : null;
    const isOverdue = diff !== null && diff < 0 && r.status !== 'completed';
    const isSoon    = diff !== null && diff >= 0 && diff <= 3 && r.status !== 'completed';

    const cardClass = isOverdue ? 'revision-card overdue' : isSoon ? 'revision-card due-soon' : 'revision-card';

    let deadlineText = '';
    if (r.deadline) {
      if (isOverdue)       deadlineText = `⚠️ ${Math.abs(diff)}d overdue`;
      else if (diff === 0) deadlineText = '📅 Due today!';
      else if (isSoon)     deadlineText = `📅 Due in ${diff}d`;
      else                 deadlineText = `📅 ${formatDate(r.deadline)}`;
    }

    return `<div class="${cardClass}" data-rid="${r.id}">
      <div class="revision-info">
        <div class="revision-title">${esc(r.title)}</div>
        ${r.desc ? `<div class="revision-desc">${esc(r.desc)}</div>` : ''}
        <div class="revision-meta">
          ${statusBadge(r.status)}
          <span class="badge badge-purple">${esc(r.chapter)}</span>
          ${deadlineText ? `<span class="badge ${isOverdue ? 'badge-rose' : isSoon ? 'badge-yellow' : 'badge-gray'}">${deadlineText}</span>` : ''}
        </div>
      </div>
      <div class="revision-actions">
        <button class="btn btn-icon" data-edit-rev="${r.id}" title="Edit"><i data-lucide="edit-2"></i></button>
        <button class="btn btn-icon" data-delete-rev="${r.id}" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`;
  }).join('');

  lucide.createIcons();
}

function revisionFormHTML(revision) {
  const r = revision || {};
  return `
    <div class="form-group">
      <label class="form-label" for="fRevTitle">Revision Title *</label>
      <input class="form-input" id="fRevTitle" type="text" value="${esc(r.title || '')}" placeholder="e.g. Fix problem statement" maxlength="120" />
      <span class="form-error" id="fRevTitleErr">Title is required.</span>
    </div>
    <div class="form-group">
      <label class="form-label" for="fRevDesc">Description</label>
      <textarea class="form-textarea form-input" id="fRevDesc" placeholder="Describe the revision...">${esc(r.desc || '')}</textarea>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" for="fRevChapter">Related Chapter *</label>
        <select class="form-input form-select" id="fRevChapter">
          ${['Chapter I','Chapter II','Chapter III','Chapter IV','Chapter V','General'].map(c =>
            `<option value="${c}" ${(r.chapter||'') === c ? 'selected' : ''}>${c}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="fRevStatus">Status *</label>
        <select class="form-input form-select" id="fRevStatus">
          <option value="pending"     ${(r.status||'pending') === 'pending'     ? 'selected' : ''}>Pending</option>
          <option value="in-progress" ${(r.status||'') === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed"   ${(r.status||'') === 'completed'   ? 'selected' : ''}>Completed</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="fRevDeadline">Deadline</label>
      <input class="form-input" id="fRevDeadline" type="date" value="${esc(r.deadline || '')}" />
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" id="fRevCancel">Cancel</button>
      <button class="btn btn-primary" id="fRevSave">Save Revision</button>
    </div>`;
}

function openRevisionModal(revId) {
  const all      = getRevisions();
  const revision = revId ? all.find(r => r.id === revId) : null;
  openModal(revision ? 'Edit Revision' : 'Add Revision', revisionFormHTML(revision));

  document.getElementById('fRevCancel').addEventListener('click', closeModal);
  document.getElementById('fRevSave').addEventListener('click', () => {
    const title = document.getElementById('fRevTitle').value.trim();
    const titleErr = document.getElementById('fRevTitleErr');
    if (!title) { titleErr.classList.add('show'); return; }
    titleErr.classList.remove('show');

    const item = {
      id:        revision ? revision.id : uid(),
      title,
      desc:      document.getElementById('fRevDesc').value.trim(),
      chapter:   document.getElementById('fRevChapter').value,
      deadline:  document.getElementById('fRevDeadline').value || null,
      status:    document.getElementById('fRevStatus').value,
      createdAt: revision ? revision.createdAt : new Date().toISOString(),
    };

    const revisions = getRevisions();
    if (revision) {
      const idx = revisions.findIndex(r => r.id === revId);
      if (idx > -1) revisions[idx] = item;
    } else {
      revisions.push(item);
    }
    lsSave(LS.REVISIONS, revisions);
    closeModal();
    showToast(revision ? 'Revision updated!' : 'Revision added!', 'success');
    renderRevisions();
  });
}

async function deleteRevision(revId) {
  const confirmed = await confirmDelete('Delete this revision record?');
  if (!confirmed) return;
  const all = getRevisions().filter(r => r.id !== revId);
  lsSave(LS.REVISIONS, all);
  showToast('Revision deleted.', 'default');
  renderRevisions();
}

// ══════════════════════════════════════════
// 11. MILESTONES
// ══════════════════════════════════════════

const BADGE_DEFINITIONS = [
  { id: 'proposal',   emoji: '📄', name: 'Proposer',    milestoneIdx: 0 },
  { id: 'seminar1',   emoji: '🎤', name: 'Presenter',   milestoneIdx: 1 },
  { id: 'data',       emoji: '📊', name: 'Researcher',  milestoneIdx: 2 },
  { id: 'semhas',     emoji: '📑', name: 'Semhas Done', milestoneIdx: 3 },
  { id: 'submitted',  emoji: '📚', name: 'Submitted',   milestoneIdx: 4 },
  { id: 'graduate',   emoji: '🎓', name: 'Graduate!',   milestoneIdx: 5 },
];

const MOTIVATION_QUOTES = [
  '"The secret of getting ahead is getting started." — Mark Twain',
  '"It always seems impossible until it\'s done." — Nelson Mandela',
  '"Believe you can and you\'re halfway there." — Theodore Roosevelt',
  '"Success is the sum of small efforts, repeated day in and day out." — Robert Collier',
  '"The expert in anything was once a beginner." — Helen Hayes',
  '"You don\'t have to be great to start, but you have to start to be great." — Zig Ziglar',
  '"Writing is thinking. To write well is to think clearly." — David McCullough',
  '"Research is formalized curiosity." — Zora Neale Hurston',
  '"A thesis is not written in a day. Each paragraph is a victory." — Unknown',
  '"Done is better than perfect — but keep revising until it\'s great." — Unknown',
];

function renderMilestones() {
  const milestones = getMilestones();

  // ── Badges row
  const badgesRow = document.getElementById('badgesRow');
  badgesRow.innerHTML = BADGE_DEFINITIONS.map(b => {
    const milestone = milestones[b.milestoneIdx];
    const earned    = milestone && milestone.completed;
    return `<div class="achievement-badge ${earned ? 'earned' : 'unearned'}">
      <div class="badge-emoji">${b.emoji}</div>
      <div class="badge-name">${b.name}</div>
      ${earned ? '<span class="badge badge-mint" style="font-size:0.68rem">Earned!</span>' : ''}
    </div>`;
  }).join('');

  // ── Milestones list
  const list = document.getElementById('milestonesList');
  if (milestones.length === 0) {
    list.innerHTML = `<div class="empty-state-full"><div class="icon">🏁</div><p>No milestones found.</p></div>`;
    return;
  }

  list.innerHTML = milestones.map((m, idx) => {
    const diff  = m.targetDate ? daysUntil(m.targetDate) : null;
    let dateLabel = m.targetDate ? formatDate(m.targetDate) : 'No target date';
    if (diff !== null) {
      if (m.completed)       dateLabel += ' ✅';
      else if (diff < 0)     dateLabel += ` (${Math.abs(diff)}d overdue)`;
      else if (diff === 0)   dateLabel += ' (Today!)';
      else                   dateLabel += ` (in ${diff}d)`;
    }

    return `<div class="milestone-card ${m.completed ? 'completed-milestone' : ''}" data-mid="${m.id}">
      <div class="milestone-icon">${m.icon || '🏁'}</div>
      <div class="milestone-info">
        <div class="milestone-name">${esc(m.name)}</div>
        <div class="milestone-desc">${esc(m.desc)}</div>
        <div class="milestone-meta">
          ${m.completed ? '<span class="badge badge-mint">✅ Completed</span>' : '<span class="badge badge-yellow">Pending</span>'}
          <span class="badge badge-gray">📅 ${dateLabel}</span>
        </div>
      </div>
      <div class="milestone-actions">
        <label class="milestone-toggle">
          <input type="checkbox" ${m.completed ? 'checked' : ''} data-toggle-milestone="${m.id}" />
          Done
        </label>
        <button class="btn btn-icon btn-sm" data-edit-milestone="${m.id}" title="Edit"><i data-lucide="edit-2"></i></button>
      </div>
    </div>`;
  }).join('');

  // ── Daily motivation quote (rotate by day-of-year)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  document.getElementById('motivationQuote').textContent = MOTIVATION_QUOTES[dayOfYear % MOTIVATION_QUOTES.length];

  lucide.createIcons();
}

function milestoneFormHTML(milestone) {
  const m = milestone || {};
  return `
    <div class="form-group">
      <label class="form-label" for="fMilName">Milestone Name *</label>
      <input class="form-input" id="fMilName" type="text" value="${esc(m.name || '')}" placeholder="e.g. Proposal Seminar" maxlength="100" />
      <span class="form-error" id="fMilNameErr">Name is required.</span>
    </div>
    <div class="form-group">
      <label class="form-label" for="fMilDesc">Description</label>
      <textarea class="form-textarea form-input" id="fMilDesc" placeholder="Describe the milestone...">${esc(m.desc || '')}</textarea>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" for="fMilDate">Target Date</label>
        <input class="form-input" id="fMilDate" type="date" value="${esc(m.targetDate || '')}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="fMilIcon">Icon (emoji)</label>
        <input class="form-input" id="fMilIcon" type="text" value="${esc(m.icon || '🏁')}" maxlength="4" placeholder="🏁" />
      </div>
    </div>
    <div class="form-group">
      <label class="milestone-toggle" style="font-weight:600;cursor:pointer;">
        <input type="checkbox" id="fMilCompleted" ${m.completed ? 'checked' : ''} style="accent-color:var(--clr-purple);width:16px;height:16px;" />
        Mark as Completed
      </label>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" id="fMilCancel">Cancel</button>
      <button class="btn btn-primary" id="fMilSave">Save Milestone</button>
    </div>`;
}

function openMilestoneModal(milestoneId) {
  const all       = getMilestones();
  const milestone = milestoneId ? all.find(m => m.id === milestoneId) : null;
  openModal(milestone ? 'Edit Milestone' : 'Add Milestone', milestoneFormHTML(milestone));

  document.getElementById('fMilCancel').addEventListener('click', closeModal);
  document.getElementById('fMilSave').addEventListener('click', () => {
    const name    = document.getElementById('fMilName').value.trim();
    const nameErr = document.getElementById('fMilNameErr');
    if (!name) { nameErr.classList.add('show'); return; }
    nameErr.classList.remove('show');

    const item = {
      id:          milestone ? milestone.id : uid(),
      name,
      desc:        document.getElementById('fMilDesc').value.trim(),
      targetDate:  document.getElementById('fMilDate').value || null,
      icon:        document.getElementById('fMilIcon').value.trim() || '🏁',
      completed:   document.getElementById('fMilCompleted').checked,
    };

    const milestones = getMilestones();
    if (milestone) {
      const idx = milestones.findIndex(m => m.id === milestoneId);
      if (idx > -1) milestones[idx] = item;
    } else {
      milestones.push(item);
    }
    lsSave(LS.MILESTONES, milestones);
    closeModal();
    showToast(milestone ? 'Milestone updated!' : 'Milestone added!', 'success');
    renderMilestones();
  });
}

function toggleMilestone(milestoneId) {
  const all = getMilestones();
  const m   = all.find(x => x.id === milestoneId);
  if (!m) return;
  m.completed = !m.completed;
  lsSave(LS.MILESTONES, all);
  showToast(m.completed ? 'Milestone marked complete! 🎉' : 'Milestone unmarked.', m.completed ? 'success' : 'default');
  renderMilestones();
}

// ══════════════════════════════════════════
// 12. SETTINGS
// ══════════════════════════════════════════

function openSettings() {
  const s = getSettings();
  document.getElementById('settingName').value       = s.name       || '';
  document.getElementById('settingGradDate').value   = s.gradDate   || '';
  document.getElementById('settingThesisTitle').value= s.thesisTitle|| '';
  document.getElementById('settingsBackdrop').classList.add('open');
}

function closeSettings() {
  document.getElementById('settingsBackdrop').classList.remove('open');
}

function saveSettings() {
  const name        = document.getElementById('settingName').value.trim();
  const gradDate    = document.getElementById('settingGradDate').value;
  const thesisTitle = document.getElementById('settingThesisTitle').value.trim();

  if (!name) { showToast('Please enter your name.', 'error'); return; }

  lsSave(LS.SETTINGS, { name, gradDate, thesisTitle });
  closeSettings();
  updateUserInfo();
  showToast('Settings saved!', 'success');
  if (currentPage === 'dashboard') renderDashboard();
}

function updateUserInfo() {
  const s = getSettings();
  const initial = s.name ? s.name.trim()[0].toUpperCase() : 'S';
  const firstName = s.name ? s.name.split(' ')[0] : 'Student';

  document.getElementById('sidebarAvatar').textContent  = initial;
  document.getElementById('sidebarUserName').textContent = firstName;
  document.getElementById('topnavAvatar').textContent    = initial;
  document.getElementById('topnavName').textContent      = firstName;
}

// ══════════════════════════════════════════
// 13. EVENT DELEGATION & GLOBAL LISTENERS
// ══════════════════════════════════════════

/** Set the page date in the topnav */
function setPageDate() {
  const now = new Date();
  document.getElementById('pageDate').textContent = now.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function bindEvents() {

  // ── Sidebar navigation
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // ── Mobile sidebar toggle
  document.getElementById('menuToggle').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  // ── Close generic modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  });

  // ── Settings
  document.getElementById('btnSettings').addEventListener('click', openSettings);
  document.getElementById('settingsClose').addEventListener('click', closeSettings);
  document.getElementById('settingsCancel').addEventListener('click', closeSettings);
  document.getElementById('settingsSave').addEventListener('click', saveSettings);
  document.getElementById('settingsBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('settingsBackdrop')) closeSettings();
  });

  // ── Add buttons
  document.getElementById('btnAddTask').addEventListener('click', () => openTaskModal(null));
  document.getElementById('btnAddSupervision').addEventListener('click', () => openSupervisionModal(null));
  document.getElementById('btnAddRevision').addEventListener('click', () => openRevisionModal(null));

  // ── Task filters
  document.getElementById('filterTaskStatus').addEventListener('change', renderTasks);
  document.getElementById('filterTaskPriority').addEventListener('change', renderTasks);

  // ── Revision filter
  document.getElementById('filterRevStatus').addEventListener('change', renderRevisions);

  // ── Event delegation for dynamic task actions
  document.getElementById('tasksList').addEventListener('click', e => {
    const toggleBtn = e.target.closest('[data-toggle-task]');
    const editBtn   = e.target.closest('[data-edit-task]');
    const deleteBtn = e.target.closest('[data-delete-task]');

    if (toggleBtn) toggleTaskComplete(toggleBtn.dataset.toggleTask);
    if (editBtn)   openTaskModal(editBtn.dataset.editTask);
    if (deleteBtn) deleteTask(deleteBtn.dataset.deleteTask);
  });

  // ── Event delegation for supervision actions
  document.getElementById('supervisionList').addEventListener('click', e => {
    const editBtn   = e.target.closest('[data-edit-sup]');
    const deleteBtn = e.target.closest('[data-delete-sup]');
    if (editBtn)   openSupervisionModal(editBtn.dataset.editSup);
    if (deleteBtn) deleteSupervision(deleteBtn.dataset.deleteSup);
  });

  // ── Event delegation for revision actions
  document.getElementById('revisionsList').addEventListener('click', e => {
    const editBtn   = e.target.closest('[data-edit-rev]');
    const deleteBtn = e.target.closest('[data-delete-rev]');
    if (editBtn)   openRevisionModal(editBtn.dataset.editRev);
    if (deleteBtn) deleteRevision(deleteBtn.dataset.deleteRev);
  });

  // ── Event delegation for chapter save buttons
  document.getElementById('chaptersGrid').addEventListener('click', e => {
    const saveBtn = e.target.closest('.chapter-save-btn');
    if (saveBtn) saveChapter(saveBtn.dataset.chid);
  });

  // ── Event delegation for milestone actions
  document.getElementById('milestonesList').addEventListener('click', e => {
    const toggleInput = e.target.closest('[data-toggle-milestone]');
    const editBtn     = e.target.closest('[data-edit-milestone]');
    if (toggleInput) toggleMilestone(toggleInput.dataset.toggleMilestone);
    if (editBtn)     openMilestoneModal(editBtn.dataset.editMilestone);
  });

  // ── Calendar-specific listeners
  bindCalendarEvents();

  // ── Keyboard: close modals on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('modalBackdrop').classList.contains('open'))    closeModal();
      if (document.getElementById('settingsBackdrop').classList.contains('open')) closeSettings();
      if (currentPage === 'calendar' && calSelectedDate)                          closeCalendarDetail();
    }
  });
}

// ══════════════════════════════════════════
// 14. CALENDAR
// ══════════════════════════════════════════

/** Currently displayed year/month for the calendar (mutated by navigation) */
let calState = { year: null, month: null };

/** Currently selected ISO date string (or null) */
let calSelectedDate = null;

/**
 * Aggregate all events from Tasks, Revisions, Supervision and Milestones
 * into a flat array of { date, type, title, subtitle, statusBadgeHtml, id }.
 * "date" is an ISO YYYY-MM-DD string.
 */
function getCalendarEvents() {
  const events = [];

  // ── Tasks (by deadline) ──────────────
  getTasks().forEach(t => {
    if (!t.deadline) return;
    events.push({
      date:          t.deadline,
      type:          'task',
      title:         t.title,
      subtitle:      t.chapter + ' · ' + t.priority + ' priority',
      statusBadge:   statusBadge(t.status),
      extraBadge:    priorityBadge(t.priority),
      id:            t.id,
    });
  });

  // ── Revisions (by deadline) ──────────
  getRevisions().forEach(r => {
    if (!r.deadline) return;
    events.push({
      date:        r.deadline,
      type:        'revision',
      title:       r.title,
      subtitle:    r.chapter,
      statusBadge: statusBadge(r.status),
      extraBadge:  '',
      id:          r.id,
    });
  });

  // ── Supervision (by meeting date) ────
  getSupervision().forEach(s => {
    events.push({
      date:        s.date,
      type:        'supervision',
      title:       s.topic,
      subtitle:    '👩‍🏫 ' + s.supervisor,
      statusBadge: '',
      extraBadge:  '',
      id:          s.id,
    });
  });

  // ── Milestones (by targetDate) ───────
  getMilestones().forEach(m => {
    if (!m.targetDate) return;
    events.push({
      date:        m.targetDate,
      type:        'milestone',
      title:       m.name,
      subtitle:    m.completed ? '✅ Completed' : '🏁 Pending',
      statusBadge: m.completed ? '<span class="badge badge-mint">Completed</span>' : '<span class="badge badge-yellow">Pending</span>',
      extraBadge:  '',
      id:          m.id,
    });
  });

  return events;
}

/**
 * Build a map of { 'YYYY-MM-DD': [event, …] } for fast lookup during render.
 */
function buildCalendarEventMap(events) {
  const map = {};
  events.forEach(ev => {
    if (!map[ev.date]) map[ev.date] = [];
    map[ev.date].push(ev);
  });
  return map;
}

/** Type → emoji icon for the detail panel */
const CAL_TYPE_ICON = {
  task:        '📋',
  revision:    '✏️',
  supervision: '👩‍🏫',
  milestone:   '🏁',
};

/** Type → human label */
const CAL_TYPE_LABEL = {
  task:        'Task Deadline',
  revision:    'Revision Deadline',
  supervision: 'Supervision Session',
  milestone:   'Milestone',
};

/** Main calendar render — called each time the page activates or month changes */
function renderCalendar() {
  const now = new Date();

  // Initialise calState to current month on first render
  if (calState.year === null) {
    calState.year  = now.getFullYear();
    calState.month = now.getMonth(); // 0-based
  }

  const { year, month } = calState;

  // Update the month/year heading
  const label = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  document.getElementById('calMonthLabel').textContent = label;

  // Gather all events and build lookup map
  const events   = getCalendarEvents();
  const eventMap = buildCalendarEventMap(events);

  // Build grid cells
  const firstDay    = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days from previous month to fill the leading blank slots
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells      = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const todayStr = now.toISOString().slice(0, 10);
  const cells    = [];

  for (let i = 0; i < totalCells; i++) {
    let cellDate, otherMonth;

    if (i < firstDay) {
      // Days from previous month
      const d = daysInPrevMonth - (firstDay - i - 1);
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear  = month === 0 ? year - 1 : year;
      cellDate   = new Date(prevYear, prevMonth, d);
      otherMonth = true;
    } else if (i >= firstDay + daysInMonth) {
      // Days from next month
      const d = i - (firstDay + daysInMonth) + 1;
      const nextMonth = month === 11 ? 0  : month + 1;
      const nextYear  = month === 11 ? year + 1 : year;
      cellDate   = new Date(nextYear, nextMonth, d);
      otherMonth = true;
    } else {
      cellDate   = new Date(year, month, i - firstDay + 1);
      otherMonth = false;
    }

    cells.push({ date: cellDate, otherMonth });
  }

  // Identify which cells are in the last row (to suppress bottom border)
  const lastRowStart = totalCells - 7;

  const grid = document.getElementById('calGrid');
  grid.innerHTML = cells.map((cell, idx) => {
    const dateStr  = cell.date.toISOString().slice(0, 10);
    const dayEvs   = eventMap[dateStr] || [];
    const isToday  = dateStr === todayStr;
    const isSel    = dateStr === calSelectedDate;
    const isLast   = idx >= lastRowStart;

    const cls = [
      'cal-day',
      cell.otherMonth ? 'other-month' : '',
      isToday  ? 'today'    : '',
      isSel    ? 'selected' : '',
      isLast   ? 'last-row' : '',
    ].filter(Boolean).join(' ');

    // Show up to 3 event pills; overflow becomes "+N more"
    const MAX_PILLS = 3;
    const visibleEvs = dayEvs.slice(0, MAX_PILLS);
    const overflow   = dayEvs.length - MAX_PILLS;

    const pills = visibleEvs.map(ev =>
      `<div class="cal-event-pill ${ev.type}" data-cal-pill-date="${dateStr}" title="${esc(ev.title)}">${esc(truncate(ev.title, 18))}</div>`
    ).join('');

    const moreLbl = overflow > 0
      ? `<div class="cal-more-label" data-cal-pill-date="${dateStr}">+${overflow} more</div>`
      : '';

    return `<div class="${cls}" data-cal-date="${dateStr}">
      <div class="cal-day-num">${cell.date.getDate()}</div>
      ${pills}${moreLbl}
    </div>`;
  }).join('');

  lucide.createIcons();

  // If a date was previously selected, re-render its detail panel
  // (data may have changed since last time)
  if (calSelectedDate) {
    renderCalendarDetail(calSelectedDate, eventMap);
  }
}

/** Truncate a string to maxLen characters, appending "…" */
function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

/** Render (or update) the event detail panel for the given date */
function renderCalendarDetail(dateStr, eventMap) {
  // Allow calling without pre-built map
  if (!eventMap) {
    eventMap = buildCalendarEventMap(getCalendarEvents());
  }

  const dayEvs = eventMap[dateStr] || [];
  const formatted = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  document.getElementById('calDetailTitle').innerHTML =
    `<i data-lucide="calendar"></i> ${formatted}`;

  const listEl = document.getElementById('calEventList');

  if (dayEvs.length === 0) {
    listEl.innerHTML = `<li class="cal-no-events" style="border:none">No events on this date.</li>`;
  } else {
    listEl.innerHTML = dayEvs.map(ev => `
      <li class="${ev.type}">
        <div class="cal-ev-type-icon ${ev.type}">${CAL_TYPE_ICON[ev.type] || '📌'}</div>
        <div class="cal-ev-info">
          <div class="cal-ev-title">${esc(ev.title)}</div>
          <div class="cal-ev-meta">
            <span>${CAL_TYPE_LABEL[ev.type] || ev.type}</span>
            ${ev.subtitle ? `<span>· ${esc(ev.subtitle)}</span>` : ''}
            ${ev.statusBadge || ''}
          </div>
        </div>
      </li>`).join('');
  }

  document.getElementById('calDetailCard').style.display = 'block';
  lucide.createIcons();
}

/** Hide the detail panel and deselect the current date */
function closeCalendarDetail() {
  calSelectedDate = null;
  document.getElementById('calDetailCard').style.display = 'none';

  // Remove selected highlight from all cells
  document.querySelectorAll('.cal-day.selected').forEach(el => {
    el.classList.remove('selected');
  });
}

/** Wire up calendar-specific event listeners (called once from bindEvents) */
function bindCalendarEvents() {
  // ── Previous / next month buttons
  document.getElementById('calPrevBtn').addEventListener('click', () => {
    if (calState.month === 0) { calState.month = 11; calState.year--; }
    else                      { calState.month--; }
    // Keep the selected date but it may no longer be visible — hide detail panel if off-month
    if (calSelectedDate) {
      const selMonth = parseInt(calSelectedDate.slice(5, 7), 10) - 1;
      const selYear  = parseInt(calSelectedDate.slice(0, 4), 10);
      if (selMonth !== calState.month || selYear !== calState.year) closeCalendarDetail();
    }
    renderCalendar();
  });

  document.getElementById('calNextBtn').addEventListener('click', () => {
    if (calState.month === 11) { calState.month = 0; calState.year++; }
    else                       { calState.month++; }
    if (calSelectedDate) {
      const selMonth = parseInt(calSelectedDate.slice(5, 7), 10) - 1;
      const selYear  = parseInt(calSelectedDate.slice(0, 4), 10);
      if (selMonth !== calState.month || selYear !== calState.year) closeCalendarDetail();
    }
    renderCalendar();
  });

  // ── Today button — jump back to current month
  document.getElementById('calTodayBtn').addEventListener('click', () => {
    const now      = new Date();
    calState.year  = now.getFullYear();
    calState.month = now.getMonth();
    closeCalendarDetail();
    renderCalendar();
  });

  // ── Click on a day cell or an event pill
  document.getElementById('calGrid').addEventListener('click', e => {
    // Event pill click — use the pill's data-cal-pill-date
    const pill = e.target.closest('[data-cal-pill-date]');
    if (pill) {
      const date = pill.dataset.calPillDate;
      selectCalendarDate(date);
      e.stopPropagation(); // prevent the cell handler from firing too
      return;
    }

    // Day cell click
    const cell = e.target.closest('[data-cal-date]');
    if (!cell) return;
    const date = cell.dataset.calDate;
    selectCalendarDate(date);
  });

  // ── Close detail panel
  document.getElementById('calDetailClose').addEventListener('click', closeCalendarDetail);
}

/** Select a date: highlight the cell and render the detail panel */
function selectCalendarDate(dateStr) {
  // Toggle off if clicking the already-selected date
  if (calSelectedDate === dateStr) {
    closeCalendarDetail();
    return;
  }

  calSelectedDate = dateStr;

  // Update selected highlight on all cells
  document.querySelectorAll('.cal-day').forEach(el => {
    el.classList.toggle('selected', el.dataset.calDate === dateStr);
  });

  renderCalendarDetail(dateStr, null);
}

// ══════════════════════════════════════════
// 15. APPLICATION INIT
// ══════════════════════════════════════════

function init() {
  initData();          // seed default data if first run
  setPageDate();       // set current date in topnav
  updateUserInfo();    // load user name
  bindEvents();        // attach all event listeners
  navigateTo('dashboard'); // render default page
  lucide.createIcons();    // render all icons
}

// Boot when the DOM is ready
document.addEventListener('DOMContentLoaded', init);
