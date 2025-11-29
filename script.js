/**
 * TO-DO LIST ELITE - ULTIMATE VERSION
 * Termasuk: Gamifikasi, Sound, Confetti, Pin, Duplicate, Shortcuts, dll.
 */

// ==========================================
// 1. CONFIG & INIT
// ==========================================
const STORAGE_KEY = 'todoElite_Ultimate_v1';

const defaultData = {
    tasks: [],
    customTags: ["Penting", "Belajar", "Rumah"],
    folders: ["Inbox", "Kantor", "Kuliah"],
    user: { xp: 0, level: 1, streak: 0, lastLogin: new Date().toDateString() },
    settings: { isDarkMode: false, soundEnabled: true }
};

let appData;

// Load Data
try {
    const saved = localStorage.getItem(STORAGE_KEY);
    appData = saved ? JSON.parse(saved) : defaultData;
    if (!appData.folders || !Array.isArray(appData.tasks)) appData = defaultData;
} catch (e) {
    console.error("Data corrupted, resetting...", e);
    appData = defaultData;
}

// Global State
let currentFilter = 'all'; 
let currentFolderFilter = 'all';
let searchQuery = '';
let selectedDateFilter = null;
let currentCalDate = new Date();
let historyDate = new Date();
let selectedTagsBuffer = [];
let editingTaskId = null;
let deletedTaskBackup = null;
let undoTimeout = null;

// DOM Elements
const DOM = {
    // ... (Sama seperti sebelumnya, ditambah canvas)
    form: document.getElementById('todo-form'),
    input: document.getElementById('todo-input'),
    desc: document.getElementById('todo-desc'),
    date: document.getElementById('todo-date'),
    prio: document.getElementById('todo-priority'),
    folder: document.getElementById('todo-folder'),
    recurring: document.getElementById('todo-recurring'),
    list: document.getElementById('todo-list'),
    tags: document.getElementById('tag-container'),
    projects: document.getElementById('project-list'),
    search: document.getElementById('search-input'),
    sort: document.getElementById('sort-select'),
    themeBtn: document.getElementById('theme-toggle'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    pageTitle: document.getElementById('page-title'),
    
    // Modals
    inputModal: document.getElementById('custom-input-modal'),
    inputField: document.getElementById('custom-input-field'),
    confirmModal: document.getElementById('universal-confirm-modal'),
    progressModal: document.getElementById('progress-modal'),
    randomModal: document.getElementById('random-modal'),
    toast: document.getElementById('toast'),
    
    // Pomodoro
    pomoOverlay: document.getElementById('pomodoro-overlay'),
    timerDisplay: document.getElementById('timer-display'),
    
    // New
    confettiCanvas: document.getElementById('confetti-canvas')
};

// ==========================================
// 2. INITIALIZER
// ==========================================
function init() {
    applyTheme();
    updateGreeting();
    updateStats();
    checkStreak();
    renderDynamicAvatar(); // NEW
    
    renderFolderOptions(); 
    renderTags();
    renderCalendar();
    renderList();
    
    setupEventListeners();
    setupKeyboardShortcuts(); // NEW
}

function setupEventListeners() {
    if(DOM.themeBtn) DOM.themeBtn.onclick = toggleTheme;
    if(DOM.prevMonth) DOM.prevMonth.onclick = () => changeMonth(-1);
    if(DOM.nextMonth) DOM.nextMonth.onclick = () => changeMonth(1);
    if(DOM.search) DOM.search.oninput = (e) => { searchQuery = e.target.value; renderList(); };
    if(DOM.sort) DOM.sort.onchange = renderList;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderList();
        };
    });

    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.onclick = (e) => { e.stopPropagation(); window.toggleSidebar(); };
    }

    // Modal Enter Key
    if (DOM.inputField) {
        DOM.inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") { e.preventDefault(); document.getElementById("btn-confirm-input").click(); }
        });
    }
}

// NEW: Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 'Shift + N' = Fokus ke input tugas baru
        if (e.shiftKey && e.key === 'N') {
            e.preventDefault();
            DOM.input.focus();
        }
        // '/' = Fokus ke search
        if (e.key === '/' && document.activeElement !== DOM.input && document.activeElement !== DOM.desc) {
            e.preventDefault();
            DOM.search.focus();
        }
    });
}

// ==========================================
// 3. SOUND & VISUAL FX (NEW)
// ==========================================

// Simple Audio Synthesizer (No MP3 files needed)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (!appData.settings.soundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'complete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'delete') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'levelup') {
        // Simple arpeggio
        [440, 554, 659, 880].forEach((freq, i) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'square';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.1);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.3);
            o.start(audioCtx.currentTime + i*0.1);
            o.stop(audioCtx.currentTime + i*0.1 + 0.3);
        });
    }
}

// Confetti Effect
function triggerConfetti() {
    const canvas = DOM.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for(let i=0; i<100; i++) {
        particles.push({
            x: canvas.width/2, y: canvas.height/2,
            vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
            color: `hsl(${Math.random()*360}, 100%, 50%)`,
            life: 100
        });
    }

    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let active = false;
        particles.forEach(p => {
            if(p.life > 0) {
                p.x += p.vx; p.y += p.vy; p.life--;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 5, 5);
                active = true;
            }
        });
        if(active) requestAnimationFrame(animate);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    animate();
}

// ==========================================
// 4. CORE LOGIC
// ==========================================
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    renderList(); renderCalendar(); updateStats(); renderDynamicAvatar();
    if (DOM.progressModal && !DOM.progressModal.classList.contains('hidden')) {
        renderHistoryCalendar(); renderStats();
    }
}

function applyTheme() {
    if (appData.settings.isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
}

function toggleTheme() {
    appData.settings.isDarkMode = !appData.settings.isDarkMode;
    applyTheme(); saveData();
}

function updateGreeting() {
    const h = new Date().getHours();
    let text = h < 12 ? "Selamat Pagi" : h < 15 ? "Selamat Siang" : h < 18 ? "Selamat Sore" : "Selamat Malam";
    const el = document.getElementById('greeting-text');
    if(el) el.textContent = `${text}, Semangat!`;
    const dateEl = document.getElementById('current-date-display');
    if(dateEl) dateEl.textContent = new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
}

// NEW: Dynamic Avatar based on Level
function renderDynamicAvatar() {
    const avatarEl = document.getElementById('user-avatar'); // Perlu div di HTML jika mau
    // Kita inject emoji ke greeting area jika belum ada avatar
    const lvl = appData.user.level;
    let emoji = "🌱"; // Lvl 1
    if (lvl >= 5) emoji = "🌿";
    if (lvl >= 10) emoji = "🌳";
    if (lvl >= 20) emoji = "🦁";
    if (lvl >= 50) emoji = "🐉";
    if (lvl >= 100) emoji = "👑";
    
    // Update badge with emoji
    const lvlBadge = document.getElementById('level-badge');
    if(lvlBadge) lvlBadge.textContent = `${emoji} Lvl ${lvl}`;
}

function addXP(amount) {
    appData.user.xp += amount;
    if(appData.user.xp < 0) appData.user.xp = 0;
    const nextLevel = appData.user.level * 100;
    if (appData.user.xp >= nextLevel) { 
        appData.user.level++; 
        playSound('levelup');
        triggerConfetti();
        showToast(`🎉 Level Up! Sekarang Level ${appData.user.level}`); 
    }
    updateStats();
}

function updateStats() {
    renderDynamicAvatar();
    const xpFill = document.getElementById('xp-fill');
    if(xpFill) xpFill.style.width = `${appData.user.xp % 100}%`;
    const streakBadge = document.getElementById('streak-badge');
    if(streakBadge) streakBadge.textContent = `🔥 ${appData.user.streak} Hari`;
}

function checkStreak() {
    const today = new Date().toDateString();
    if (appData.user.lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (appData.user.lastLogin === yesterday.toDateString()) appData.user.streak++;
        else appData.user.streak = 1;
        appData.user.lastLogin = today;
        saveData();
    }
}

// ==========================================
// 5. DATA MANAGERS (Folder/Tag)
// ==========================================
window.switchFolder = function(f, btnElement) {
    currentFolderFilter = f;
    currentFilter = (f === 'trash') ? 'trash' : 'all';
    document.querySelectorAll('.nav-item, .folder-btn-text').forEach(el => el.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    
    const titles = {'all':'Semua Tugas','today':'Hari Ini','trash':'Sampah','overdue':'Tertunda','completed':'Terselesaikan'};
    if(DOM.pageTitle) DOM.pageTitle.textContent = titles[f] || `📁 ${f}`;
    
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('active')) window.toggleSidebar();
    renderList();
}

function renderFolderOptions() {
    if(DOM.folder) {
        DOM.folder.innerHTML = '<option value="Inbox">Inbox</option>';
        appData.folders.forEach(f => {
            const opt = document.createElement('option'); opt.value = f; opt.textContent = f;
            DOM.folder.appendChild(opt);
        });
    }
    if(DOM.projects) {
        DOM.projects.innerHTML = '';
        appData.folders.forEach(folder => {
            const wrapper = document.createElement('div');
            wrapper.className = 'folder-item-wrapper';
            const btnMain = document.createElement('button');
            btnMain.className = `folder-btn-text ${currentFolderFilter === folder ? 'active' : ''}`;
            btnMain.textContent = `📁 ${folder}`;
            btnMain.onclick = function() { switchFolder(folder, this); };

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'folder-actions';
            const btnEdit = document.createElement('button'); btnEdit.className = 'btn-fold-act'; btnEdit.innerHTML = '✎'; btnEdit.onclick = (e)=>{e.stopPropagation(); editFolder(folder)};
            const btnDel = document.createElement('button'); btnDel.className = 'btn-fold-act del'; btnDel.innerHTML = '×'; btnDel.onclick = (e)=>{e.stopPropagation(); deleteFolder(folder)};

            actionsDiv.append(btnEdit, btnDel); wrapper.append(btnMain, actionsDiv);
            DOM.projects.appendChild(wrapper);
        });
    }
}

window.createNewFolder = function() { openInputModal("Folder Baru", "Nama folder...", (name) => { if (name && !appData.folders.includes(name)) { appData.folders.push(name); saveData(); renderFolderOptions(); showToast(`Folder dibuat`); } }); }
function editFolder(oldName) { openInputModal("Ganti Nama", oldName, (newName) => { if (newName && newName !== oldName && !appData.folders.includes(newName)) { const idx = appData.folders.indexOf(oldName); appData.folders[idx] = newName; appData.tasks.forEach(t => { if (t.folder === oldName) t.folder = newName; }); if (currentFolderFilter === oldName) currentFolderFilter = newName; saveData(); renderFolderOptions(); showToast("Nama diubah"); } }); }
function deleteFolder(name) { openConfirmModal("Hapus Folder?", `Folder "${name}" akan dihapus.`, "⚠️", () => { appData.folders = appData.folders.filter(f => f !== name); appData.tasks.forEach(t => { if (t.folder === name) t.folder = 'Inbox'; }); if (currentFolderFilter === name) switchFolder('all', null); saveData(); renderFolderOptions(); showToast("Folder dihapus"); }); }

function renderTags() {
    if(!DOM.tags) return; DOM.tags.innerHTML = '';
    appData.customTags.forEach(tag => {
        const div = document.createElement('div'); div.className = `tag-option ${selectedTagsBuffer.includes(tag) ? 'selected' : ''}`;
        div.innerHTML = `<span>${tag}</span> <span class="tag-del">×</span>`;
        div.querySelector('span').onclick = (e) => { e.stopPropagation(); toggleTag(tag); };
        div.querySelector('.tag-del').onclick = (e) => { e.stopPropagation(); openConfirmModal("Hapus Label?", `Label "${tag}"?`, "🏷️", () => { appData.customTags = appData.customTags.filter(t => t !== tag); appData.tasks.forEach(t => { if(t.tags) t.tags = t.tags.filter(tg => tg !== tag); }); saveData(); renderTags(); }); };
        DOM.tags.appendChild(div);
    });
}
function toggleTag(tag) { if (selectedTagsBuffer.includes(tag)) selectedTagsBuffer = selectedTagsBuffer.filter(t => t !== tag); else selectedTagsBuffer.push(tag); renderTags(); }
window.addNewTag = function() { openInputModal("Label Baru", "Nama label...", (name) => { if (name && !appData.customTags.includes(name)) { appData.customTags.push(name); saveData(); renderTags(); } }); }

// ==========================================
// 6. TASK CRUD (Advanced)
// ==========================================
if(DOM.form) {
    DOM.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = DOM.input.value.trim();
        if(!text) return;
        appData.tasks.push({
            id: Date.now(),
            text, desc: DOM.desc.value, date: DOM.date.value, 
            priority: DOM.prio.value, folder: DOM.folder.value || 'Inbox',
            recurring: DOM.recurring.value, tags: [...selectedTagsBuffer],
            completed: false, deleted: false, pinned: false // NEW: Pinned property
        });
        DOM.input.value = ''; DOM.desc.value = ''; selectedTagsBuffer = [];
        renderTags(); saveData(); addXP(5); playSound('complete');
    });
}

// NEW: Search Highlight Logic
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function renderList() {
    if (!DOM.list) return; DOM.list.innerHTML = ''; const now = new Date(); 

    let filtered = appData.tasks.filter(t => {
        if (currentFolderFilter === 'trash') return t.deleted;
        if (t.deleted) return false;
        if (currentFolderFilter === 'all') return !t.completed;
        if (currentFolderFilter === 'completed') return t.completed;
        if (currentFolderFilter === 'overdue') return !t.completed && t.date && new Date(t.date) < now;
        if (currentFolderFilter === 'today') return !t.completed && t.date && new Date(t.date).toDateString() === now.toDateString();
        if (!['all','completed','overdue','today','trash'].includes(currentFolderFilter)) return t.folder === currentFolderFilter && !t.completed;
        return true;
    });

    if (searchQuery) filtered = filtered.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Sort: Pinned first, then by User selection
    const sort = DOM.sort ? DOM.sort.value : 'newest';
    filtered.sort((a,b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0) || 0); // Pinned logic
    if (sort === 'newest') filtered.sort((a,b) => b.pinned===a.pinned ? b.id - a.id : 0);
    if (sort === 'priority') { const p={high:3,medium:2,low:1}; filtered.sort((a,b)=>b.pinned===a.pinned ? p[b.priority]-p[a.priority] : 0); }
    if (sort === 'date') filtered.sort((a,b) => b.pinned===a.pinned ? new Date(a.date||'9999') - new Date(b.date||'9999') : 0);

    // Progress Bar
    const active = appData.tasks.filter(t => !t.deleted).length;
    const done = appData.tasks.filter(t => !t.deleted && t.completed).length;
    const perc = active === 0 ? 0 : Math.round((done/active)*100);
    if(document.getElementById('progress-fill')) document.getElementById('progress-fill').style.width = `${perc}%`;
    if(document.getElementById('progress-text')) document.getElementById('progress-text').textContent = `${done}/${active} Selesai`;

    if (filtered.length === 0) { DOM.list.innerHTML = `<div style="text-align:center;color:var(--text-secondary);margin-top:2rem;">Tidak ada tugas di sini.</div>`; return; }

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''} ${task.pinned ? 'pinned' : ''}`; // NEW Class Pinned
        
        const dateStr = task.date ? new Date(task.date).toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit'}) : '-';
        const folderHTML = `<span class="badge" style="background:#f3f4f6;color:#666;">📁 ${task.folder}</span>`;
        const tagsHTML = (task.tags||[]).map(t => `<span class="badge" style="background:#dbeafe;color:#2563eb;">#${t}</span>`).join('');
        
        // NEW: Highlighted Text
        const safeText = highlightText(task.text, searchQuery);

        let btns = '';
        if (currentFolderFilter === 'trash') {
            btns = `<button class="btn-edit" onclick="restoreTask(${task.id})" title="Pulihkan">♻️</button>
                    <button class="btn-del" onclick="hardDeleteTask(${task.id})" title="Hapus Selamanya">🔥</button>`;
        } else {
            const checkIcon = currentFolderFilter === 'completed' ? '↩' : '✔';
            // NEW Buttons: Pin & Duplicate
            const pinIcon = task.pinned ? '📍' : '📌';
            const pinClass = task.pinned ? 'active' : '';
            
            btns = `<button class="btn-pin ${pinClass}" onclick="pinTask(${task.id})" title="Sematkan">${pinIcon}</button>
                    <button class="btn-edit" onclick="duplicateTask(${task.id})" title="Duplikat">📑</button>
                    <button class="btn-complete" onclick="toggleComplete(${task.id})" title="${checkIcon==='↩'?'Batal':'Selesai'}">${checkIcon}</button>
                    <button class="btn-edit" onclick="startEdit(${task.id})">✎</button>
                    <button class="btn-delete" onclick="softDeleteTask(${task.id})">🗑️</button>`;
        }

        if (task.id === editingTaskId) {
            li.innerHTML = `<div class="edit-mode-wrapper">
                <input type="text" id="edit-t-${task.id}" class="modern-input" value="${task.text}">
                <textarea id="edit-d-${task.id}" class="modern-input">${task.desc||''}</textarea>
                <div class="todo-actions">
                    <button onclick="saveEdit(${task.id})" class="btn-complete">✔</button>
                    <button onclick="cancelEdit()" class="btn-delete">✕</button>
                </div>
            </div>`;
        } else {
            const descHTML = task.desc ? `<div class="todo-desc">${task.desc}</div>` : '';
            li.innerHTML = `
                <div class="main-task-column">
                    <div class="task-header">
                        <span class="todo-title">${safeText}</span>
                        <div class="todo-actions">${btns}</div>
                    </div>
                    ${descHTML}
                    <div class="task-footer">
                        <div class="todo-meta">
                            <span class="badge badge-${task.priority}">${task.priority}</span>
                            <div class="tags-wrapper">${tagsHTML} ${folderHTML}</div>
                            <span class="date-info"><strong>${dateStr}</strong></span>
                        </div>
                    </div>
                </div>
            `;
        }
        DOM.list.appendChild(li);
    });
}

window.toggleComplete = (id) => {
    const t = appData.tasks.find(x => x.id === id); t.completed = !t.completed;
    if(t.completed) { addXP(10); playSound('complete'); if(t.recurring && t.recurring !== 'none') handleRecurring(t); } 
    else { addXP(-10); } saveData();
};

// NEW: Pin Function
window.pinTask = (id) => {
    const t = appData.tasks.find(x => x.id === id);
    if(t) { t.pinned = !t.pinned; saveData(); showToast(t.pinned ? "Tugas disematkan" : "Pin dilepas"); }
};

// NEW: Duplicate Function
window.duplicateTask = (id) => {
    const t = appData.tasks.find(x => x.id === id);
    if(t) {
        const newTask = {...t, id: Date.now(), text: t.text + " (Copy)", completed: false, pinned: false, date: ''};
        appData.tasks.push(newTask); saveData(); showToast("Tugas diduplikasi");
    }
};

function handleRecurring(task) {
    const oldDate = new Date(task.date);
    if (task.recurring === 'daily') oldDate.setDate(oldDate.getDate() + 1);
    if (task.recurring === 'weekly') oldDate.setDate(oldDate.getDate() + 7);
    const pad = (n) => String(n).padStart(2,'0');
    const newDateStr = `${oldDate.getFullYear()}-${pad(oldDate.getMonth()+1)}-${pad(oldDate.getDate())}T${pad(oldDate.getHours())}:${pad(oldDate.getMinutes())}`;
    const newTask = { ...task, id: Date.now(), completed: false, timeSpent: 0, date: newDateStr };
    appData.tasks.push(newTask); showToast('Tugas berulang dibuat!');
}

window.softDeleteTask = (id) => { openConfirmModal("Hapus?", "Masuk ke folder Sampah.", "🗑️", () => { const idx = appData.tasks.findIndex(x => x.id === id); deletedTaskBackup = { item: appData.tasks[idx], index: idx }; appData.tasks[idx].deleted = true; saveData(); playSound('delete'); showToast("Tugas dihapus", true); }); };
window.restoreTask = (id) => { appData.tasks.find(x => x.id === id).deleted = false; saveData(); showToast("Tugas Dipulihkan"); };
window.hardDeleteTask = (id) => { openConfirmModal("Hapus Permanen?", "Tidak bisa dikembalikan.", "🔥", () => { appData.tasks = appData.tasks.filter(x => x.id !== id); saveData(); showToast("Dihapus Permanen"); }); };
window.startEdit = (id) => { editingTaskId = id; renderList(); };
window.cancelEdit = () => { editingTaskId = null; renderList(); };
window.saveEdit = (id) => { const t = appData.tasks.find(x => x.id === id); const textVal = document.getElementById(`edit-t-${id}`).value; const descVal = document.getElementById(`edit-d-${id}`).value; if(t && textVal) { t.text = textVal; t.desc = descVal; editingTaskId = null; saveData(); } };

// ==========================================
// 7. CALENDAR & STATS
// ==========================================
function changeMonth(step) { currentCalDate.setMonth(currentCalDate.getMonth() + step); renderCalendar(); }
function renderCalendar() {
    const grid = document.getElementById('calendar-grid'); if (!grid) return;
    const year = currentCalDate.getFullYear(); const month = currentCalDate.getMonth();
    const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year}`;
    grid.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    for(let i=0; i<firstDay; i++) { const e = document.createElement('div'); e.className = 'calendar-day empty'; grid.appendChild(e); }
    for(let day=1; day<=daysInMonth; day++) {
        const div = document.createElement('div'); div.className = 'calendar-day'; div.textContent = day;
        const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const hasTask = appData.tasks.some(t => t.date && t.date.startsWith(dStr) && !t.deleted && !t.completed);
        if(hasTask) div.classList.add('has-task');
        if(selectedDateFilter === dStr) div.classList.add('selected');
        div.onclick = () => { if(selectedDateFilter === dStr) closeDailyPreview(); else { selectedDateFilter = dStr; renderDailyPreview(dStr); } renderCalendar(); };
        grid.appendChild(div);
    }
}
function renderDailyPreview(dStr) {
    const list = document.getElementById('daily-task-list'); const previewBox = document.getElementById('daily-task-preview'); if(previewBox) previewBox.classList.remove('hidden');
    document.getElementById('daily-date-title').textContent = new Date(dStr).toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long'}); list.innerHTML = '';
    const tasks = appData.tasks.filter(t => t.date && t.date.startsWith(dStr) && !t.deleted);
    if(tasks.length === 0) list.innerHTML = '<li style="text-align:center;padding:1rem;">Tidak ada tugas.</li>';
    else { tasks.forEach(t => { const li = document.createElement('li'); li.className = `mini-task-item prio-${t.priority} ${t.completed?'completed':''}`; const time = new Date(t.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}); li.innerHTML = `<div class="mini-content-left"><span class="mini-task-title">${t.text}</span></div><div class="mini-task-meta"><span class="mini-time">⏰ ${time}</span></div>`; list.appendChild(li); }); }
}
window.closeDailyPreview = () => { const previewBox = document.getElementById('daily-task-preview'); if(previewBox) previewBox.classList.add('hidden'); selectedDateFilter = null; renderCalendar(); renderList(); };

// Pomodoro
let pomoInterval = null; let pomoTime = 25 * 60; let isPomoRunning = false;
window.togglePomodoro = () => { if(DOM.pomoOverlay) DOM.pomoOverlay.classList.toggle('hidden'); };
window.handleMainAction = function() { if (!isPomoRunning) startPomo(); else pausePomo(); }
function startPomo() { if(isPomoRunning) return; isPomoRunning = true; updatePomoControls(); pomoInterval = setInterval(() => { pomoTime--; updatePomoDisplay(); if(pomoTime<=0) { clearInterval(pomoInterval); isPomoRunning = false; updatePomoControls(); playSound('levelup'); alert('Waktu Habis!'); resetPomo(); addXP(50); } }, 1000); }
function pausePomo() { clearInterval(pomoInterval); isPomoRunning = false; updatePomoControls(); }
window.resetPomo = function() { pausePomo(); pomoTime = 25 * 60; updatePomoDisplay(); updatePomoControls(); };
window.resetTimer = window.resetPomo;
function updatePomoDisplay() { if(!DOM.timerDisplay) return; const m = Math.floor(pomoTime/60); const s = pomoTime%60; DOM.timerDisplay.textContent = `${m<10?'0'+m:m}:${s<10?'0'+s:s}`; }
function updatePomoControls() { const btn = document.getElementById('btn-main-action'); const status = document.getElementById('pomo-status-text'); if(btn && status) { if(isPomoRunning) { btn.textContent = "Jeda"; btn.className = "btn-pause-style"; status.textContent = "BERJALAN"; } else { btn.textContent = "Mulai"; btn.className = ""; status.textContent = "FOKUS"; } } }

// Stats & Modals
window.pickRandomTask = function() { const valid = appData.tasks.filter(t => !t.completed && !t.deleted); if(valid.length) { const t = valid[Math.floor(Math.random()*valid.length)]; document.getElementById('random-result-text').textContent = t.text; DOM.randomModal.classList.remove('hidden'); } else showToast("Tidak ada tugas aktif"); };
window.closeRandomModal = () => DOM.randomModal.classList.add('hidden');
window.openProgressModal = function() { DOM.progressModal.classList.remove('hidden'); renderHistoryCalendar(); renderStats(); document.getElementById('detail-task-list').innerHTML = '<li class="empty-state">Klik tanggal di kalender kiri 👈</li>'; document.getElementById('detail-date-title').textContent = 'Pilih Tanggal'; const sb = document.querySelector('.sidebar'); if(sb && sb.classList.contains('active')) window.toggleSidebar(); };
window.closeProgressModal = function() { DOM.progressModal.classList.add('hidden'); };
window.changeHistoryMonth = function(step) { historyDate.setMonth(historyDate.getMonth() + step); renderHistoryCalendar(); renderStats(); };
function renderHistoryCalendar() {
    const grid = document.getElementById('history-grid'); if(!grid) return;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    document.getElementById('history-month-year').textContent = `${monthNames[historyDate.getMonth()]} ${historyDate.getFullYear()}`;
    grid.innerHTML = ''; const year = historyDate.getFullYear(); const month = historyDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    for(let i=0; i<firstDay; i++) { const e = document.createElement('div'); e.className = 'hist-day empty'; grid.appendChild(e); }
    for(let day=1; day<=daysInMonth; day++) {
        const div = document.createElement('div'); div.className = 'hist-day'; div.textContent = day;
        const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dailyTasks = appData.tasks.filter(t => t.date && t.date.startsWith(dStr) && !t.deleted);
        if(dailyTasks.length > 0) { const comp = dailyTasks.filter(t => t.completed).length; if(comp === dailyTasks.length) div.classList.add('perfect'); else if(comp > 0) div.classList.add('progress'); else { if(new Date(dStr) < new Date().setHours(0,0,0,0)) div.classList.add('missed'); else div.style.border = "1px solid var(--primary-color)"; } } else div.classList.add('empty');
        div.onclick = () => { document.querySelectorAll('.hist-day').forEach(el => el.classList.remove('active-selected')); div.classList.add('active-selected'); renderDayDetails(dStr); };
        grid.appendChild(div);
    }
}
function renderStats() { 
    const year = historyDate.getFullYear(); const month = historyDate.getMonth();
    const monthlyTasks = appData.tasks.filter(t => { if(!t.date || t.deleted) return false; const d = new Date(t.date); return d.getFullYear() === year && d.getMonth() === month; });
    const total = monthlyTasks.length; const completed = monthlyTasks.filter(t => t.completed).length; const pending = total - completed; const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById('stat-completed').textContent = completed; document.getElementById('stat-pending').textContent = pending; document.getElementById('stat-rate').textContent = `${rate}%`;
}
function renderDayDetails(dStr) {
    const list = document.getElementById('detail-task-list'); const title = document.getElementById('detail-date-title');
    title.textContent = new Date(dStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    list.innerHTML = ''; const tasks = appData.tasks.filter(t => t.date && t.date.startsWith(dStr) && !t.deleted);
    if(tasks.length === 0) { list.innerHTML = '<li class="empty-state">Tidak ada tugas pada tanggal ini.</li>'; return; }
    tasks.forEach(t => { const li = document.createElement('li'); li.className = `detail-item ${t.completed ? 'done' : ''}`; li.innerHTML = `<span>${t.text}</span><span>${t.completed ? '✅' : '⏳'}</span>`; list.appendChild(li); });
}

// Helpers
let inputCallback = null; let confirmCallback = null;
function openInputModal(title, placeholder, cb) { document.getElementById('input-modal-title').textContent = title; DOM.inputField.placeholder = placeholder; DOM.inputField.value = ''; inputCallback = cb; DOM.inputModal.classList.remove('hidden'); setTimeout(()=>DOM.inputField.focus(), 100); }
window.closeInputModal = () => DOM.inputModal.classList.add('hidden');
if(document.getElementById('btn-confirm-input')) { document.getElementById('btn-confirm-input').onclick = () => { const val = DOM.inputField.value.trim(); if (!val) { showToast("⚠️ Tidak boleh kosong!"); DOM.inputField.focus(); return; } if(inputCallback) { inputCallback(val); closeInputModal(); } }; }
function openConfirmModal(title, desc, icon, cb) { document.getElementById('confirm-title').textContent = title; document.getElementById('confirm-desc').textContent = desc; document.getElementById('confirm-icon').textContent = icon; confirmCallback = cb; DOM.confirmModal.classList.remove('hidden'); }
window.closeConfirmModal = () => DOM.confirmModal.classList.add('hidden');
if(document.getElementById('btn-confirm-yes')) { document.getElementById('btn-confirm-yes').onclick = () => { if(confirmCallback) confirmCallback(); closeConfirmModal(); }; }
function showToast(msg, showUndo = false) { const btn = document.getElementById('undo-btn'); document.getElementById('toast-msg').textContent = msg; if(btn) { btn.classList.toggle('hidden', !showUndo); btn.style.display = showUndo ? 'block' : 'none'; } DOM.toast.classList.remove('hidden'); if(undoTimeout) clearTimeout(undoTimeout); undoTimeout = setTimeout(() => { DOM.toast.classList.add('hidden'); if(!showUndo) deletedTaskBackup = null; }, 3000); }
if(document.getElementById('undo-btn')) { document.getElementById('undo-btn').onclick = () => { if(deletedTaskBackup) { appData.tasks[deletedTaskBackup.index].deleted = false; saveData(); DOM.toast.classList.add('hidden'); deletedTaskBackup = null; } }; }
window.toggleSidebar = function() { const sidebar = document.querySelector('.sidebar'); const overlay = document.getElementById('sidebar-overlay'); const btn = document.getElementById('sidebar-toggle'); if (!sidebar || !overlay) return; const isActive = sidebar.classList.toggle('active'); overlay.classList.toggle('active'); if (btn) { if (isActive) { btn.innerHTML = '✕'; btn.style.color = 'var(--danger-color)'; } else { btn.innerHTML = '☰'; btn.style.color = 'var(--text-primary)'; } } };
window.exportData = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(appData)], {type:'application/json'})); a.download = 'backup.json'; a.click(); };
window.importData = (input) => { const f = input.files[0]; if(f) { const r = new FileReader(); r.onload=e=>{ try{ appData=JSON.parse(e.target.result); saveData(); location.reload(); } catch{ alert('File tidak valid'); } }; r.readAsText(f); } };

// Start App
init();