const API_URL = "http://localhost:3000";
let currentUser = null;
let darkMode = true; // Start with dark mode by default

document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme based on local storage or default
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    darkMode = false;
    document.body.classList.remove("dark-mode");
  }

  // Set up theme toggle
  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);

  // Set up event listeners
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

function checkAuthStatus() {
  const token = localStorage.getItem("token");
  if (token) {
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
      currentUser = username;
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
  currentUser = null;
  document.body.classList.remove("user-logged-in");
  moveToSignin();
}

async function getTodos() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/todos`, {
      headers: { Authorization: token },
    });
    const list = document.getElementById("todos-list");
    list.innerHTML = "";

    // Update task count
    document.getElementById("task-count").textContent = res.data.length;

    if (res.data.length) {
      res.data.forEach((todo) => {
        const el = createTodoElement(todo);
        list.appendChild(el);
      });
    } else {
      list.innerHTML =
        '<p class="empty-message">No tasks yet. Add one above!</p>';
    }
  } catch (err) {
    console.error("Error fetching todos:", err);
    alert("Error fetching tasks");
  }
}

async function addTodo() {
  const input = document.getElementById("input");
  const title = input.value.trim();
  if (!title) return alert("Please enter a task");

  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/todos`,
      { title },
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

async function updateTodo(id, newTitle) {
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_URL}/todos/${id}`,
      { title: newTitle },
      {
        headers: { Authorization: token },
      }
    );
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
    const el = document.querySelector(`.todo-item[data-id='${id}']`);
    if (el) {
      el.classList.add("fade-out");
      setTimeout(() => {
        el.remove();
        // Update counter after removing
        const count = document.querySelectorAll(".todo-item").length;
        document.getElementById("task-count").textContent = count;
        if (count === 0) {
          document.getElementById("todos-list").innerHTML =
            '<p class="empty-message">No tasks yet. Add one above!</p>';
        }
      }, 300);
    }
  } catch (err) {
    console.error("Error deleting todo:", err);
    alert("Failed to delete task");
  }
}

async function toggleTodoDone(id, done) {
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_URL}/todos/${id}/done`,
      {},
      {
        headers: { Authorization: token },
      }
    );
    getTodos();
  } catch (err) {
    console.error("Error toggling todo status:", err);
    alert("Failed to update task status");
  }
}

function createTodoElement(todo) {
  const div = document.createElement("div");
  div.className = "todo-item";
  div.setAttribute("data-id", todo.id);
  if (todo.done) div.classList.add("done");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.done;
  checkbox.onchange = () => toggleTodoDone(todo.id, !todo.done);

  const input = document.createElement("input");
  input.type = "text";
  input.value = todo.title;
  input.readOnly = true;

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
        updateTodo(todo.id, newTitle);
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

  div.append(checkbox, input, editBtn, deleteBtn);
  return div;
}
