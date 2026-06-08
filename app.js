// =============================================
//  STUDY PLANNER - app.js
//  Plain JavaScript, no frameworks needed!
// =============================================

// ---------- DATA (saved in browser storage) ----------

function loadData(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let tasks  = loadData('sp_tasks', []);
let topics = loadData('sp_topics', []);
let selectedStrength = 'weak';   // currently selected toggle in topic form
let currentFilter = 'all';       // current task filter

// ---------- NAVIGATION ----------

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(name).classList.add('active');
  event.currentTarget.classList.add('active');
}

// ---------- TOAST NOTIFICATION ----------

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---------- TO-DO FUNCTIONS ----------

function addTask() {
  const input    = document.getElementById('taskInput');
  const dateEl   = document.getElementById('taskDate');
  const priority = document.getElementById('taskPriority').value;
  const text     = input.value.trim();

  if (!text) {
    showToast('⚠️ Please enter a task first!');
    input.focus();
    return;
  }

  const task = {
    id: Date.now(),
    text: text,
    date: dateEl.value,
    priority: priority,
    done: false,
    createdAt: new Date().toLocaleDateString()
  };

  tasks.unshift(task);   // add to top of list
  saveData('sp_tasks', tasks);

  input.value = '';
  dateEl.value = '';
  renderTasks();
  showToast('✅ Task added!');
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveData('sp_tasks', tasks);
    renderTasks();
    showToast(task.done ? '🎉 Task completed!' : '🔄 Marked as pending');
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveData('sp_tasks', tasks);
  renderTasks();
  showToast('🗑️ Task deleted');
}

function clearCompleted() {
  const count = tasks.filter(t => t.done).length;
  if (count === 0) { showToast('No completed tasks to clear!'); return; }
  tasks = tasks.filter(t => !t.done);
  saveData('sp_tasks', tasks);
  renderTasks();
  showToast(`🧹 Cleared ${count} completed task(s)`);
}

function filterTasks(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  const emptyMsg = document.getElementById('emptyTodo');

  let filtered = tasks;
  if (currentFilter === 'pending')  filtered = tasks.filter(t => !t.done);
  if (currentFilter === 'done')     filtered = tasks.filter(t => t.done);

  if (filtered.length === 0) {
    list.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');

  list.innerHTML = filtered.map(task => `
    <div class="task-item ${task.done ? 'done' : ''}">
      <div class="task-checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask(${task.id})">
        ${task.done ? '✓' : ''}
      </div>
      <div class="task-info">
        <div class="task-text">${escapeHtml(task.text)}</div>
        <div class="task-meta">
          ${task.date ? `<span class="task-date">📅 ${formatDate(task.date)}</span>` : `<span class="task-date">Added ${task.createdAt}</span>`}
          <span class="priority-badge ${task.priority}">${priorityLabel(task.priority)}</span>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete task">✕</button>
    </div>
  `).join('');
}

function priorityLabel(p) {
  return p === 'high' ? '🔴 High' : p === 'medium' ? '🟡 Medium' : '🟢 Low';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------- TOPICS FUNCTIONS ----------

function selectStrength(value) {
  selectedStrength = value;
  document.getElementById('weakBtn').classList.toggle('active', value === 'weak');
  document.getElementById('strongBtn').classList.toggle('active', value === 'strong');
}

function addTopic() {
  const nameEl    = document.getElementById('topicInput');
  const subjectEl = document.getElementById('topicSubject');
  const name      = nameEl.value.trim();
  const subject   = subjectEl.value.trim();

  if (!name) {
    showToast('⚠️ Please enter a topic name!');
    nameEl.focus();
    return;
  }

  const topic = {
    id: Date.now(),
    name: name,
    subject: subject,
    strength: selectedStrength   // 'weak' or 'strong'
  };

  topics.unshift(topic);
  saveData('sp_topics', topics);

  nameEl.value = '';
  subjectEl.value = '';
  renderTopics();
  showToast(selectedStrength === 'weak' ? '😰 Weak topic added!' : '💪 Strong topic added!');
}

function deleteTopic(id) {
  topics = topics.filter(t => t.id !== id);
  saveData('sp_topics', topics);
  renderTopics();
  showToast('🗑️ Topic removed');
}

function moveTopic(id) {
  const topic = topics.find(t => t.id === id);
  if (topic) {
    topic.strength = topic.strength === 'weak' ? 'strong' : 'weak';
    saveData('sp_topics', topics);
    renderTopics();
    const msg = topic.strength === 'strong' ? '💪 Moved to Strong topics!' : '😰 Moved to Weak topics';
    showToast(msg);
  }
}

function renderTopics() {
  const weakList   = document.getElementById('weakList');
  const strongList = document.getElementById('strongList');
  const emptyWeak  = document.getElementById('emptyWeak');
  const emptyStrong= document.getElementById('emptyStrong');

  const weakTopics   = topics.filter(t => t.strength === 'weak');
  const strongTopics = topics.filter(t => t.strength === 'strong');

  // Update count badges
  document.getElementById('weakCount').textContent   = weakTopics.length;
  document.getElementById('strongCount').textContent = strongTopics.length;

  // Render weak list
  if (weakTopics.length === 0) {
    weakList.innerHTML = '';
    emptyWeak.classList.remove('hidden');
  } else {
    emptyWeak.classList.add('hidden');
    weakList.innerHTML = weakTopics.map(topic => `
      <div class="topic-item weak-item">
        <div>
          <div class="topic-name">${escapeHtml(topic.name)}</div>
          ${topic.subject ? `<div class="topic-subject">${escapeHtml(topic.subject)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="move-btn" onclick="moveTopic(${topic.id})" title="Move to Strong">→ Strong</button>
          <button class="delete-btn" onclick="deleteTopic(${topic.id})">✕</button>
        </div>
      </div>
    `).join('');
  }

  // Render strong list
  if (strongTopics.length === 0) {
    strongList.innerHTML = '';
    emptyStrong.classList.remove('hidden');
  } else {
    emptyStrong.classList.add('hidden');
    strongList.innerHTML = strongTopics.map(topic => `
      <div class="topic-item strong-item">
        <div>
          <div class="topic-name">${escapeHtml(topic.name)}</div>
          ${topic.subject ? `<div class="topic-subject">${escapeHtml(topic.subject)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          <button class="move-btn" onclick="moveTopic(${topic.id})" title="Move to Weak">← Weak</button>
          <button class="delete-btn" onclick="deleteTopic(${topic.id})">✕</button>
        </div>
      </div>
    `).join('');
  }
}

// ---------- UTILITY ----------

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Allow pressing Enter to add task or topic
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
  document.getElementById('topicInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTopic();
  });

  // Initial render
  renderTasks();
  renderTopics();
});
