// --- 1. SELEKSI DOM ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoDesc = document.getElementById('todo-desc'); // BARU
const tagContainer = document.getElementById('tag-container');
const todoDate = document.getElementById('todo-date');
const todoPriority = document.getElementById('todo-priority');
const todoList = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const themeToggle = document.getElementById('theme-toggle');
const taskStats = document.getElementById('task-stats');
const toast = document.getElementById('toast');
const undoBtn = document.getElementById('undo-btn');

// Calendar Elements
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthYear = document.getElementById('calendar-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// Modal Elements
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

const STORAGE_KEY = 'todoApp_Elite_Final_v3'; // Update Key versi baru

// --- 2. STATE MANAGEMENT ---
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = 'all';
let searchQuery = '';
let editingTaskId = null;
let taskToDeleteId = null;
let deletedTaskBackup = null;
let undoTimeout = null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

let currentCalDate = new Date();
let selectedDateFilter = null;

const AVAILABLE_TAGS = ["Javascript", "HTML", "CSS", "PDF", "Presentasi", "Quiz", "UTS", "UAS", "Proyek"];
let selectedTagsBuffer = []; 

// --- 3. INIT & THEME ---
if (isDarkMode) document.body.classList.add('dark-mode');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
});

function renderTagOptions() {
    tagContainer.innerHTML = '';
    AVAILABLE_TAGS.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag-option';
        span.textContent = tag;
        span.addEventListener('click', () => {
            if (selectedTagsBuffer.includes(tag)) {
                selectedTagsBuffer = selectedTagsBuffer.filter(t => t !== tag);
                span.classList.remove('selected');
            } else {
                selectedTagsBuffer.push(tag);
                span.classList.add('selected');
            }
        });
        tagContainer.appendChild(span);
    });
}
renderTagOptions();

// --- 4. CALENDAR LOGIC ---
function renderCalendar() {
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    calendarGrid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDiv);
    }

    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasTask = tasks.some(task => task.dueDate && task.dueDate.startsWith(dateString) && !task.completed);
        if (hasTask) dayDiv.classList.add('has-task');
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayDiv.classList.add('today');
        if (selectedDateFilter === dateString) dayDiv.classList.add('selected');

        dayDiv.addEventListener('click', () => {
            if (selectedDateFilter === dateString) {
                selectedDateFilter = null;
                closeDailyPreview();
            } else {
                selectedDateFilter = dateString;
                renderDailyPreview(dateString);
            }
            renderCalendar();
            // renderList(); // Tidak perlu render list utama agar tidak hilang
        });
        calendarGrid.appendChild(dayDiv);
    }
}
prevMonthBtn.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendar(); });

// --- 5. CORE FUNCTIONS ---
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    renderList();
    renderCalendar();
    // Jika sedang filter tanggal, refresh juga preview bawahnya
    if (selectedDateFilter) renderDailyPreview(selectedDateFilter);
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getDaysRemaining(dueDateString) {
    if (!dueDateString) return null;
    const now = new Date();
    const due = new Date(dueDateString);
    const diffTime = due - now;
    return diffTime / (1000 * 60 * 60 * 24); 
}

function getSortedTasks(taskList) {
    const sortMode = sortSelect.value;
    let sorted = [...taskList];
    if (sortMode === 'date-nearest') {
        sorted.sort((a, b) => {
            if (!a.dueDate) return 1; if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    } else if (sortMode === 'priority') {
        const priorityVal = { high: 3, medium: 2, low: 1 };
        sorted.sort((a, b) => priorityVal[b.priority] - priorityVal[a.priority]);
    } else if (sortMode === 'created-newest') {
        sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
}

// --- RENDER LIST ---
function renderList() {
    todoList.innerHTML = '';
    let filtered = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (searchQuery) {
        filtered = filtered.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())));
    }

    const finalTasks = getSortedTasks(filtered);

    // Progress Bar
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    if(progressFill) progressFill.style.width = `${percentage}%`;
    if(progressText) progressText.textContent = `${done}/${total} Selesai`;

    finalTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('draggable', sortSelect.value === 'manual'); 
        li.dataset.id = task.id;

        if (sortSelect.value === 'manual') {
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragenter', e => e.preventDefault());
        }

        let tagsHTML = task.tags ? task.tags.map(tag => `<span class="badge-tag">${tag}</span>`).join('') : '';
        
        const subtasksHTML = task.subtasks.map(sub => `
            <li class="subtask-item ${sub.completed ? 'completed' : ''}">
                <input type="checkbox" ${sub.completed ? 'checked' : ''} onchange="toggleSubtask(${task.id}, ${sub.id})">
                <span>${sub.text}</span>
                <button onclick="deleteSubtask(${task.id}, ${sub.id})" class="btn-delete-sub">×</button>
            </li>
        `).join('');

        const dueStr = formatDateTime(task.dueDate);
        const daysLeft = getDaysRemaining(task.dueDate);
        let timeStatusHTML = '';
        if (task.dueDate && !task.completed) {
            if (daysLeft < 0) timeStatusHTML = `<span class="time-badge overdue">Terlambat!</span>`;
            else if (daysLeft < 1) timeStatusHTML = `<span class="time-badge warning">${Math.ceil(daysLeft * 24)} jam lagi</span>`;
            else timeStatusHTML = `<span class="time-badge info">${Math.ceil(daysLeft)} hari lagi</span>`;
        }

        // Tampilan Deskripsi (Hanya jika ada)
        const descHTML = task.description ? `<div class="todo-desc">${task.description}</div>` : '';

        if (task.id === editingTaskId) {
            // --- MODE EDIT (Judul & Deskripsi) ---
            li.innerHTML = `
                <div class="edit-mode-wrapper">
                    <input type="text" id="edit-title-${task.id}" class="edit-mode-input" value="${task.text}" placeholder="Judul Tugas">
                    <textarea id="edit-desc-${task.id}" class="edit-mode-input" rows="3" placeholder="Deskripsi...">${task.description || ''}</textarea>
                    <div class="todo-actions" style="justify-content:flex-end; width:100%; margin-top:0.5rem;">
                        <button onclick="saveEdit(${task.id})" class="btn-complete">✔</button>
                        <button onclick="cancelEdit()" class="btn-delete">✕</button>
                    </div>
                </div>
            `;
            setTimeout(() => { document.getElementById(`edit-title-${task.id}`).focus(); }, 0);
        } else {
            // --- MODE TAMPILAN NORMAL ---
            li.innerHTML = `
                <div class="main-task-column">
                    <div class="task-header">
                        <span class="todo-title" onclick="toggleComplete(${task.id})">${task.text}</span>
                        ${timeStatusHTML}
                    </div>
                    
                    ${descHTML}

                    <div class="task-footer">
                        <div class="todo-meta">
                            <span class="badge badge-${task.priority}">${task.priority}</span>
                            <div class="tags-wrapper">${tagsHTML}</div>
                            <span class="date-info"><strong>${dueStr}</strong></span>
                        </div>
                        <div class="todo-actions">
                            <button onclick="toggleComplete(${task.id})" class="btn-complete" title="Selesai">✔</button>
                            <button onclick="startEdit(${task.id})" class="btn-edit" title="Edit">✎</button>
                            <button onclick="askDeleteTask(${task.id})" class="btn-delete" title="Hapus">🗑️</button>
                        </div>
                    </div>
                </div>
                <ul class="subtask-list">${subtasksHTML}</ul>
                <button class="btn-add-sub" onclick="addSubtask(${task.id})">+ Tambah Langkah Kecil</button>
            `;
        }
        todoList.appendChild(li);
    });
}

// --- DAILY PREVIEW ---
const dailyPreviewEl = document.getElementById('daily-task-preview');
const dailyDateTitle = document.getElementById('daily-date-title');
const dailyTaskList = document.getElementById('daily-task-list');

function renderDailyPreview(dateString) {
    const dailyTasks = tasks.filter(task => task.dueDate && task.dueDate.startsWith(dateString));
    const dateObj = new Date(dateString);
    dailyDateTitle.textContent = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    dailyPreviewEl.classList.remove('hidden');
    dailyTaskList.innerHTML = '';

    if (dailyTasks.length === 0) {
        dailyTaskList.innerHTML = `<li style="text-align:center; font-size:0.8rem; color:#888; padding:0.5rem;">Tidak ada tugas.</li>`;
        return;
    }

    dailyTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `mini-task-item ${task.completed ? 'completed' : ''}`;
        const timeStr = new Date(task.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        // Tampilkan potongan deskripsi di preview
        const shortDesc = task.description ? `<div style="font-size:0.75rem; color:#888; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${task.description}</div>` : '';
        
        li.innerHTML = `
            <span class="mini-task-title">${task.text}</span>
            ${shortDesc}
            <div class="mini-task-meta">
                <span>${timeStr}</span>
                <span class="badge badge-${task.priority}" style="font-size:0.6rem; padding:0.1rem 0.3rem;">${task.priority}</span>
            </div>
        `;
        dailyTaskList.appendChild(li);
    });
}
function closeDailyPreview() {
    dailyPreviewEl.classList.add('hidden');
    selectedDateFilter = null;
    renderCalendar();
}

// --- EVENT LISTENERS ---
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    const desc = todoDesc.value.trim(); // AMBIL DESKRIPSI
    const dateVal = todoDate.value; 
    if (!text || !dateVal) { alert("Isi nama & waktu!"); return; }

    tasks.push({
        id: Date.now(),
        text: text,
        description: desc, // SIMPAN DESKRIPSI
        tags: [...selectedTagsBuffer],
        completed: false,
        dueDate: dateVal,
        priority: todoPriority.value,
        subtasks: []
    });

    todoInput.value = '';
    todoDesc.value = ''; // RESET INPUT DESKRIPSI
    selectedTagsBuffer = [];
    document.querySelectorAll('.tag-option').forEach(el => el.classList.remove('selected'));
    saveTasks();
});

// Drag Drop & Helper Functions (Standard)
let dragSrcEl = null;
function handleDragStart(e) { dragSrcEl = this; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/html', this.innerHTML); this.classList.add('dragging'); }
function handleDragOver(e) { if (e.preventDefault) e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }
function handleDrop(e) { if (e.stopPropagation) e.stopPropagation(); const dragItem = this; if (dragSrcEl !== dragItem) { const srcId = Number(dragSrcEl.dataset.id); const targetId = Number(dragItem.dataset.id); const srcIndex = tasks.findIndex(t => t.id === srcId); const targetIndex = tasks.findIndex(t => t.id === targetId); const [movedItem] = tasks.splice(srcIndex, 1); tasks.splice(targetIndex, 0, movedItem); saveTasks(); } return false; }

window.addSubtask = (pid) => { const pli = document.querySelector(`li[data-id="${pid}"]`); if(!pli)return; const lst = pli.querySelector('.subtask-list'); if(lst.querySelector('input[type="text"]'))return; const li=document.createElement('li'); li.className='subtask-input-wrapper'; li.innerHTML=`<input type="text" class="input-subtask-inline" id="new-sub-${pid}"><button class="btn-save-sub" onclick="confirmAddSubtask(${pid})">✔</button><button class="btn-cancel-sub" onclick="cancelAddSubtask(this)">×</button>`; lst.appendChild(li); li.querySelector('input').focus(); li.querySelector('input').addEventListener('keydown', e=>{if(e.key==='Enter')confirmAddSubtask(pid);if(e.key==='Escape')li.remove();}); };
window.confirmAddSubtask = (pid) => { const inp=document.getElementById(`new-sub-${pid}`); if(inp.value.trim()){ tasks.find(t=>t.id===pid).subtasks.push({id:Date.now(), text:inp.value.trim(), completed:false}); saveTasks(); } else inp.closest('li').remove(); };
window.cancelAddSubtask = (el) => el.closest('li').remove();
window.toggleSubtask = (pid, sid) => { const t=tasks.find(x=>x.id===pid).subtasks.find(s=>s.id===sid); t.completed=!t.completed; saveTasks(); };
window.deleteSubtask = (pid, sid) => { const t=tasks.find(x=>x.id===pid); t.subtasks=t.subtasks.filter(s=>s.id!==sid); saveTasks(); };
window.toggleComplete = (id) => { const t=tasks.find(x=>x.id===id); if(t){t.completed=!t.completed; saveTasks();} };

window.startEdit = (id) => { editingTaskId = id; renderList(); };
window.cancelEdit = () => { editingTaskId = null; renderList(); };
window.saveEdit = (id) => {
    const titleVal = document.getElementById(`edit-title-${id}`).value.trim();
    const descVal = document.getElementById(`edit-desc-${id}`).value.trim();
    if (titleVal) {
        const t = tasks.find(task => task.id === id);
        t.text = titleVal;
        t.description = descVal; // UPDATE DESKRIPSI JUGA
        editingTaskId = null;
        saveTasks();
    }
};

window.askDeleteTask = (id) => { taskToDeleteId = id; deleteModal.classList.remove('hidden'); };
confirmDeleteBtn.addEventListener('click', () => { if(taskToDeleteId){ const idx=tasks.findIndex(t=>t.id===taskToDeleteId); deletedTaskBackup={item:tasks[idx], index:idx}; tasks.splice(idx,1); saveTasks(); taskToDeleteId=null; deleteModal.classList.add('hidden'); toast.classList.remove('hidden'); setTimeout(()=>toast.classList.add('hidden'),5000); } });
cancelDeleteBtn.addEventListener('click', () => { taskToDeleteId = null; deleteModal.classList.add('hidden'); });
undoBtn.addEventListener('click', () => { if(deletedTaskBackup){ tasks.splice(deletedTaskBackup.index,0,deletedTaskBackup.item); saveTasks(); toast.classList.add('hidden'); deletedTaskBackup=null; } });

sortSelect.addEventListener('change', renderList);
document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentFilter = btn.getAttribute('data-filter'); renderList(); }));
searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderList(); });

// Render Awal
renderCalendar();
renderList();