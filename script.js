const API_URL = "http://localhost:3000";
let currentUser = null;
let darkMode = true; // Start with dark mode by default
let currentFilter = "all";
let selectedPriority = "medium"; // Default priority

document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme based on local storage or default
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    darkMode = false;
    document.body.classList.remove("dark-mode");
  } else {
    document.body.classList.add("dark-mode");
  }

  // Set up theme toggle
  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);

  // Set up user logo click for menu
  document
    .getElementById("user-logo")
    .addEventListener("click", toggleUserMenu);

  // Close user menu when clicking elsewhere
  document.addEventListener("click", (e) => {
    const userMenu = document.getElementById("user-menu");
    const userLogo = document.getElementById("user-logo");
    if (
      userMenu.style.display === "block" &&
      e.target !== userLogo &&
      !userMenu.contains(e.target)
    ) {
      userMenu.style.display = "none";
    }
  });

  // Set up priority dropdown
  document
    .getElementById("priority-btn")
    .addEventListener("click", togglePriorityMenu);

  // Close priority menu when clicking elsewhere
  document.addEventListener("click", (e) => {
    const priorityMenu = document.getElementById("priority-menu");
    const priorityBtn = document.getElementById("priority-btn");
    if (
      priorityMenu.style.display === "block" &&
      e.target !== priorityBtn &&
      !priorityBtn.contains(e.target) &&
      !priorityMenu.contains(e.target)
    ) {
      priorityMenu.style.display = "none";
    }
  });

  // Set up priority options
  document.querySelectorAll(".priority-option").forEach((option) => {
    option.addEventListener("click", () => {
      selectedPriority = option.getAttribute("data-priority");
      document.getElementById(
        "priority-btn"
      ).innerHTML = `${capitalizeFirstLetter(
        selectedPriority
      )} Priority <span class="dropdown-arrow">▼</span>`;
      togglePriorityMenu();
    });
  });

  // Set up filter tabs
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.getAttribute("data-filter");
      filterTodos();
    });
  });

  // Set up clear all button
  document
    .getElementById("clear-all-btn")
    .addEventListener("click", clearAllTasks);

  // Set up event listeners for auth
  document
    .getElementById("signup-password")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") signup();
    });

  document
    .getElementById("signin-password")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") signin();
    });

  document.getElementById("input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });

  // Check if user is already logged in
  checkAuthStatus();
});

function toggleTheme() {
  darkMode = !darkMode;
  if (darkMode) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
}

function toggleUserMenu() {
  const userMenu = document.getElementById("user-menu");
  userMenu.style.display =
    userMenu.style.display === "block" ? "none" : "block";
}

function togglePriorityMenu() {
  const priorityMenu = document.getElementById("priority-menu");
  priorityMenu.style.display =
    priorityMenu.style.display === "block" ? "none" : "block";
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function checkAuthStatus() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (token && username) {
    currentUser = username;
    document.getElementById("user-name").textContent = username;
    showTodoApp();
  } else {
    moveToSignin();
  }
}

function moveToSignup() {
  showSection("signup-container");
}

function moveToSignin() {
  showSection("signin-container");
}

function showTodoApp() {
  showSection("todos-container");
  document.body.classList.add("user-logged-in");
  getTodos();
}

function showSection(id) {
  document
    .querySelectorAll(".section")
    .forEach((div) => (div.style.display = "none"));
  document.getElementById(id).style.display = "block";
}

async function signup() {
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value;
  if (!username || !password) return alert("All fields are required");

  try {
    const res = await axios.post(`${API_URL}/signup`, { username, password });
    alert(res.data.message);
    if (res.data.message.includes("signedup")) moveToSignin();
  } catch (err) {
    alert(err.response?.data?.message || "Signup error");
  }
}

async function signin() {
  const username = document.getElementById("signin-username").value.trim();
  const password = document.getElementById("signin-password").value;
  if (!username || !password) return alert("All fields are required");

  try {
    const res = await axios.post(`${API_URL}/signin`, { username, password });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", username);
      currentUser = username;
      document.getElementById("user-name").textContent = username;
      showTodoApp();
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    alert(err.response?.data?.message || "Signin error");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  currentUser = null;
  document.body.classList.remove("user-logged-in");
  // Hide user menu
  document.getElementById("user-menu").style.display = "none";
  moveToSignin();
}

async function getTodos() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/todos`, {
      headers: { Authorization: token },
    });

    // Store todos in memory for filtering
    window.todos = res.data.map((todo) => ({
      ...todo,
      completed: todo.done,
      priority: todo.priority || "medium",
    }));

    // Apply current filter
    filterTodos();

    // Update stats
    updateStats();
  } catch (err) {
    console.error("Error fetching todos:", err);
    if (err.response?.status === 401) {
      // Token expired or invalid
      logout();
      alert("Session expired. Please sign in again.");
    } else {
      alert("Error fetching tasks");
    }
  }
}

function filterTodos() {
  if (!window.todos) return;

  const list = document.getElementById("todos-list");
  list.innerHTML = "";

  let filteredTodos = [...window.todos];

  // Apply filters
  switch (currentFilter) {
    case "completed":
      filteredTodos = filteredTodos.filter((todo) => todo.completed);
      break;
    case "pending":
      filteredTodos = filteredTodos.filter((todo) => !todo.completed);
      break;
    case "high":
      filteredTodos = filteredTodos.filter((todo) => todo.priority === "high");
      break;
    case "medium":
      filteredTodos = filteredTodos.filter(
        (todo) => todo.priority === "medium"
      );
      break;
    case "low":
      filteredTodos = filteredTodos.filter((todo) => todo.priority === "low");
      break;
    // "all" case - no filtering needed
  }

  if (filteredTodos.length) {
    filteredTodos.forEach((todo) => {
      const el = createTodoElement(todo);
      list.appendChild(el);
    });
  } else {
    // Show empty state
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No tasks found</p>
      </div>
    `;
  }
}

function updateStats() {
  if (!window.todos) return;

  const totalCount = window.todos.length;
  const completedCount = window.todos.filter((todo) => todo.completed).length;
  const pendingCount = totalCount - completedCount;

  document.getElementById("total-count").textContent = totalCount;
  document.getElementById("completed-count").textContent = completedCount;
  document.getElementById("pending-count").textContent = pendingCount;
}

async function addTodo() {
  const input = document.getElementById("input");
  const title = input.value.trim();
  if (!title) return alert("Please enter a task");

  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/todos`,
      {
        title,
        priority: selectedPriority,
      },
      {
        headers: { Authorization: token },
      }
    );
    input.value = "";
    getTodos();
  } catch (err) {
    console.error("Error adding todo:", err);
    alert("Failed to add task");
  }
}

async function updateTodo(id, updates) {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`${API_URL}/todos/${id}`, updates, {
      headers: { Authorization: token },
    });
    getTodos();
  } catch (err) {
    console.error("Error updating todo:", err);
    alert("Failed to update task");
  }
}

async function deleteTodo(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/todos/${id}`, {
      headers: { Authorization: token },
    });

    // Find and animate the element
    const el = document.querySelector(`.todo-item[data-id='${id}']`);
    if (el) {
      el.classList.add("fade-out");
      setTimeout(() => {
        // Update local data
        window.todos = window.todos.filter((todo) => todo.id !== id);
        updateStats();
        filterTodos();
      }, 300);
    }
  } catch (err) {
    console.error("Error deleting todo:", err);
    alert("Failed to delete task");
  }
}

async function toggleTodoCompleted(id, completed) {
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_URL}/todos/${id}/done`,
      {},
      {
        headers: { Authorization: token },
      }
    );

    // Update local data first for smoother UX
    const todoIndex = window.todos.findIndex((todo) => todo.id === id);
    if (todoIndex !== -1) {
      window.todos[todoIndex].completed = completed;
      updateStats();
    }

    // Then refresh from server to ensure data consistency
    getTodos();
  } catch (err) {
    console.error("Error toggling todo status:", err);
    alert("Failed to update task status");
  }
}

function createTodoElement(todo) {
  const div = document.createElement("div");
  div.className = `todo-item priority-${todo.priority || "medium"}`;
  div.setAttribute("data-id", todo.id);
  if (todo.completed) div.classList.add("done");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.className = "todo-checkbox";
  checkbox.onchange = () => toggleTodoCompleted(todo.id, checkbox.checked);

  const input = document.createElement("input");
  input.type = "text";
  input.value = todo.title;
  input.className = "todo-text";
  input.readOnly = true;

  const priorityBadge = document.createElement("span");
  priorityBadge.className = `priority-badge priority-${todo.priority}`;
  priorityBadge.textContent = `${capitalizeFirstLetter(todo.priority)}`;

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "todo-item-actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "edit-btn";
  editBtn.onclick = () => {
    if (input.readOnly) {
      input.readOnly = false;
      editBtn.textContent = "Save";
      input.focus();
    } else {
      const newTitle = input.value.trim();
      if (newTitle) {
        updateTodo(todo.id, { title: newTitle });
      } else {
        alert("Task cannot be empty");
        input.value = todo.title;
      }
      input.readOnly = true;
      editBtn.textContent = "Edit";
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";
  deleteBtn.onclick = () => deleteTodo(todo.id);

  actionsDiv.append(editBtn, deleteBtn);
  div.append(checkbox, input, priorityBadge, actionsDiv);
  return div;
}

async function clearAllTasks() {
  if (!window.todos || window.todos.length === 0) {
    alert("No tasks to clear");
    return;
  }

  if (
    !confirm(
      "Are you sure you want to delete all tasks? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/todos/all`, {
      headers: { Authorization: token },
    });

    window.todos = [];
    updateStats();
    filterTodos();
  } catch (err) {
    console.error("Error clearing all todos:", err);
    alert("Failed to clear tasks");
  }
}

// Initialize the priority button text
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById(
    "priority-btn"
  ).innerHTML = `Medium Priority <span class="dropdown-arrow">▼</span>`;
});
