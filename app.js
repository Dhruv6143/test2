(() => {
  "use strict";

  const STORAGE_KEY = "taskly.tasks.v1";

  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const emptyMessage = document.getElementById("empty-message");
  const countLeft = document.getElementById("count-left");
  const clearDoneBtn = document.getElementById("clear-done");
  const filterButtons = Array.from(document.querySelectorAll(".filter"));

  /** @type {{id: string, text: string, done: boolean}[]} */
  let tasks = load();
  let filter = "all";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (t) => t && typeof t.text === "string" && typeof t.done === "boolean"
      );
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function createTask(text) {
    return { id: crypto.randomUUID(), text, done: false };
  }

  function visibleTasks() {
    if (filter === "active") return tasks.filter((t) => !t.done);
    if (filter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }

  /* ---------- rendering ---------- */

  function render() {
    list.innerHTML = "";

    for (const task of visibleTasks()) {
      const li = document.createElement("li");
      li.className = "task" + (task.done ? " done" : "");
      li.dataset.id = task.id;

      const checkbox = document.createElement("button");
      checkbox.className = "checkbox";
      checkbox.textContent = "✓";
      checkbox.setAttribute("aria-label", task.done ? "Mark as active" : "Mark as done");
      checkbox.addEventListener("click", () => toggleTask(task.id));

      const title = document.createElement("span");
      title.className = "task-title";
      title.textContent = task.text;

      const del = document.createElement("button");
      del.className = "btn-delete";
      del.textContent = "✕";
      del.setAttribute("aria-label", "Delete task");
      del.addEventListener("click", () => deleteTask(li, task.id));

      li.append(checkbox, title, del);
      list.appendChild(li);
    }

    const remaining = tasks.filter((t) => !t.done).length;
    countLeft.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;

    const showing = visibleTasks();
    if (showing.length === 0) {
      emptyState.hidden = false;
      emptyMessage.textContent =
        tasks.length === 0
          ? "Nothing here — add your first task above."
          : filter === "active"
          ? "All done! No active tasks left. 🎉"
          : "No completed tasks yet.";
    } else {
      emptyState.hidden = true;
    }

    clearDoneBtn.style.visibility = tasks.some((t) => t.done) ? "visible" : "hidden";
  }

  /* ---------- actions ---------- */

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;
    save();
    render();
  }

  function deleteTask(li, id) {
    li.classList.add("is-leaving");
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      save();
      render();
    }, 180);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    tasks.unshift(createTask(text));
    input.value = "";
    input.focus();
    save();
    render();
  });

  clearDoneBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => !t.done);
    save();
    render();
  });

  for (const btn of filterButtons) {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      for (const b of filterButtons) b.classList.toggle("is-active", b === btn);
      render();
    });
  }

  render();
})();
