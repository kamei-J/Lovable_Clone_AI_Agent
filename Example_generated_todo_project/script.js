// Data model and persistence utilities for Simple Todo

// Expose a global storage key constant
const STORAGE_KEY = "simple_todo_tasks";
window.STORAGE_KEY = STORAGE_KEY;

/**
 * Task class representing a single todo item.
 * @param {string|number} id - Unique identifier for the task.
 * @param {string} text - The description of the task.
 * @param {boolean} [completed=false] - Completion status.
 */
class Task {
  constructor(id, text, completed = false) {
    this.id = id;
    this.text = text;
    this.completed = completed;
  }
}
// Expose globally for other scripts if needed
window.Task = Task;

/**
 * Load tasks from localStorage.
 * Returns an array of Task instances. Handles missing, empty, or corrupted data gracefully.
 * @returns {Task[]}
 */
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Convert plain objects back into Task instances
    return parsed.map(item => new Task(item.id, item.text, Boolean(item.completed)));
  } catch (e) {
    console.warn('Failed to parse tasks from localStorage:', e);
    return [];
  }
}
window.loadTasks = loadTasks;

/**
 * Save an array of Task instances to localStorage.
 * @param {Task[]} tasksArray
 */
function saveTasks(tasksArray) {
  try {
    const plain = tasksArray.map(t => ({ id: t.id, text: t.text, completed: t.completed }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}
window.saveTasks = saveTasks;

// Module‑level variable holding the current list of tasks.
let tasks = [];
window.tasks = tasks;

// Current filter state ("all", "active", "completed")
let currentFilter = "all";
window.currentFilter = currentFilter;

/**
 * Edit a task identified by its id.
 * Prompts the user with the current task text. If a non‑empty string is provided,
 * updates the task, persists the change and re‑renders the list.
 * @param {string|number} id - The unique identifier of the task to edit.
 */
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return; // task not found, nothing to do
  const newText = prompt("Edit task", task.text);
  // If the user cancelled the prompt, newText will be null.
  if (newText === null) return;
  const trimmed = newText.trim();
  // Do not allow empty strings – ignore the edit in that case.
  if (!trimmed) return;
  task.text = trimmed;
  saveTasks(tasks);
  // Re‑render using the current global filter so UI stays consistent.
  renderTasks(currentFilter);
}
window.editTask = editTask;

/**
 * Delete a task identified by its id.
 * Removes the task from the global `tasks` array, persists the change, and re‑renders.
 * @param {string|number} id - The unique identifier of the task to delete.
 */
function deleteTask(id) {
  // Filter out the task with the matching id
  tasks = tasks.filter(t => t.id !== id);
  // Keep the global reference up‑to‑date
  window.tasks = tasks;
  saveTasks(tasks);
  renderTasks(currentFilter);
}
window.deleteTask = deleteTask;

/**
 * Toggle the completion status of a task identified by its id.
 * Flips the `completed` boolean, persists the change, and re‑renders using the current filter.
 * @param {string|number} id - The unique identifier of the task to toggle.
 */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return; // task not found
  task.completed = !task.completed;
  saveTasks(tasks);
  renderTasks(currentFilter);
}
window.toggleComplete = toggleComplete;

/**
 * Render the task list based on the supplied filter.
 * @param {string} filter - "all", "active" or "completed"
 */
function renderTasks(filter = "all") {
  // Keep the global filter in sync for other functions (e.g., addTask)
  currentFilter = filter;
  window.currentFilter = filter;

  const listEl = document.getElementById("task-list");
  if (!listEl) return;
  // Clear current list
  listEl.innerHTML = "";

  // Helper to decide visibility based on filter
  const shouldShow = (task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true; // "all"
  };

  tasks.forEach(task => {
    if (!shouldShow(task)) return;

    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;
    if (task.completed) li.classList.add("completed");

    // Checkbox for completion toggle
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "toggle-complete";
    checkbox.checked = task.completed;
    // Use the dedicated toggleComplete function
    checkbox.addEventListener("change", () => {
      toggleComplete(task.id);
    });
    li.appendChild(checkbox);

    // Text span
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;
    li.appendChild(span);

    // Edit button – now delegates to editTask(id)
    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", () => {
      editTask(task.id);
    });
    li.appendChild(editBtn);

    // Delete button – delegates to deleteTask(id)
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✖";
    deleteBtn.addEventListener("click", () => {
      deleteTask(task.id);
    });
    li.appendChild(deleteBtn);

    listEl.appendChild(li);
  });
}
window.renderTasks = renderTasks;

/**
 * Add a new task based on the input field.
 * Handles form submission prevention, task creation, persistence, and UI refresh.
 * @param {Event} [event]
 */
function addTask(event) {
  // Prevent default form submission if event is provided
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  const input = document.getElementById("new-task-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const id = Date.now(); // simple unique id
  const newTask = new Task(id, text, false);
  tasks.push(newTask);
  // Keep global reference up‑to‑date
  window.tasks = tasks;
  saveTasks(tasks);
  // Clear and focus the input for rapid entry
  input.value = "";
  input.focus();
  // Re‑render using the current filter state
  renderTasks(currentFilter);
}
window.addTask = addTask;

/**
 * Set the current filter, update UI active state, and re‑render tasks.
 * @param {string} filter - "all", "active" or "completed"
 */
function setFilter(filter) {
  // Update the module‑level filter state
  currentFilter = filter;
  window.currentFilter = filter;

  // Update active class on filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('active', isActive);
  });

  // Re‑render tasks based on the new filter
  renderTasks(filter);
}
window.setFilter = setFilter;

/**
 * Initialise the application: load tasks, wire UI controls, and render initial view.
 */
function init() {
  // Load persisted tasks into the global array
  tasks = loadTasks();
  window.tasks = tasks;

  // Ensure the default filter is set to "all"
  currentFilter = "all";
  window.currentFilter = currentFilter;

  // Render the initial task list
  renderTasks(currentFilter);

  // Register filter button listeners
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      setFilter(filter);
    });
  });

  // Register add‑task UI listeners
  const input = document.getElementById("new-task-input");
  const addBtn = document.getElementById("add-task-btn");
  if (addBtn) addBtn.addEventListener("click", addTask);
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addTask(e);
      }
    });
  }

  // Global keyboard shortcuts (same logic as previous implementation)
  document.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const tag = activeEl ? activeEl.tagName.toLowerCase() : '';
    const isTextInput = (tag === 'input' && activeEl && !activeEl.readOnly) || tag === 'textarea' || (activeEl && activeEl.isContentEditable);

    // Shortcut: focus the new task input with "N" when not typing elsewhere
    if (!isTextInput && (e.key === 'n' || e.key === 'N')) {
      const newInput = document.getElementById('new-task-input');
      if (newInput) {
        e.preventDefault();
        newInput.focus();
      }
      return;
    }

    // When the new‑task input is focused
    if (activeEl && activeEl.id === 'new-task-input') {
      // Enter -> add task (handled by input listener, but ensure global handling)
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        addTask(e);
        return;
      }
      // Ctrl+Enter -> clear the input field
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        activeEl.value = '';
        return;
      }
      // Escape -> blur (remove focus) from the input
      if (e.key === 'Escape') {
        e.preventDefault();
        activeEl.blur();
        return;
      }
    }
  });

  // Ensure data is saved before the page unloads (extra safety)
  window.addEventListener('beforeunload', () => {
    saveTasks(tasks);
  });
}
window.init = init;

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
