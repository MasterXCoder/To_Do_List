// Global variables
const API_URL = "http://localhost:3000";
let currentUser = null;

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// Authentication functions
function checkAuthStatus() {
    const token = localStorage.getItem("token");
    
    if (token) {
        showTodoApp();
    } else {
        moveToSignin();
    }
}

function moveToSignup() {
    document.getElementById("signup-container").style.display = "block";
    document.getElementById("signin-container").style.display = "none";
    document.getElementById("todos-container").style.display = "none";
    
    // Clear input fields
    document.getElementById("signup-username").value = "";
    document.getElementById("signup-password").value = "";
}



function moveToSignin() {
    document.getElementById("signin-container").style.display = "block";
    document.getElementById("signup-container").style.display = "none";
    document.getElementById("todos-container").style.display = "none";
    
    // Clear input fields
    document.getElementById("signin-username").value = "";
    document.getElementById("signin-password").value = "";
}

function showTodoApp() {
    document.getElementById("todos-container").style.display = "block";
    document.getElementById("signup-container").style.display = "none";
    document.getElementById("signin-container").style.display = "none";
    getTodos();
}

async function signup() {
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value;

    if (!username || !password) {
        alert("Username and password cannot be empty!");
        return;
    }

    try {
        const response = await axios.post(${API_URL}/signup, {
            username,
            password
        });
        
        alert(response.data.message);

        if (response.data.message === "you are signedup successfully") {
            moveToSignin();
        }
    } catch (error) {
        console.error("Error while signup", error);
        alert(error.response?.data?.message || "Error signing up");
    }
}


async function signin() {
    const username = document.getElementById("signin-username").value.trim();
    const password = document.getElementById("signin-password").value;

    if (!username || !password) {
        alert("Username and password cannot be empty!");
        return;
    }

    try {
        const response = await axios.post(${API_URL}/signin, {
            username,
            password
        });
        
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            currentUser = username;
            alert(response.data.message);
            showTodoApp();
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error("Error while signing in:", error);
        alert(error.response?.data?.message || "Error signing in");
    }
}

function logout() {
    localStorage.removeItem("token");
    currentUser = null;
    alert("Logged out successfully");
    moveToSignin();
}

//logout remove token and move to sign in
async function logout(){
    localStorage.remove("token");

    alert("logged out successfully");

    moveToSignin();
}

// Todo management functions
async function getTodos() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            moveToSignin();
            return;
        }

        const response = await axios.get(${API_URL}/todos, {
            headers: { Authorization: token }
        });

        const todosList = document.getElementById("todos-list");
        todosList.innerHTML = "";

        if (response.data.length) {
            response.data.forEach((todo) => {
                const todoElement = createTodoElement(todo);
                todosList.appendChild(todoElement);
            });
        } else {
            todosList.innerHTML = '<p class="empty-message">No todos yet. Add one above!</p>';
        }
    } catch (error) {
        console.error("Error while getting todo list:", error);
        if (error.response?.status === 401) {
            alert("Session expired. Please sign in again.");
            logout();
        }
    }
}


async function addTodo() {
    const inputElement = document.getElementById("input");
    const title = inputElement.value.trim();

    if (title === "") {
        alert("Please enter a task to add");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        moveToSignin();
        return;
    }

    try {
        await axios.post(
            ${API_URL}/todos,
            { title },
            { headers: { Authorization: token } }
        );
        
        inputElement.value = "";
        getTodos();
    } catch (error) {
        console.error("Error while adding new todo:", error);
        if (error.response?.status === 401) {
            alert("Session expired. Please sign in again.");
            logout();
        }
    }
}

async function updateTodo(id, newTitle) {
    const token = localStorage.getItem("token");
    if (!token) {
        moveToSignin();
        return;
    }
    moveToSignin();
    return;
}

try {
    await axios.put(
        ${API_URL}/todos/${id},
        { title: newTitle },
        { headers: { Authorization: token } }
    );
    
    getTodos();
} catch (error) {
    console.error("Error while updating todo:", error);
    if (error.response?.status === 401) {
        alert("Session expired. Please sign in again.");
        logout();
    }
}
}

async function deleteTodo(id) {
if (!confirm("Are you sure you want to delete this task?")) {
    return;
}

const token = localStorage.getItem("token");
if (!token) {
    moveToSignin();
    return;
}

try {
    await axios.delete(
        ${API_URL}/todos/${id},
        { headers: { Authorization: token } }
    );
    
    getTodos();
} catch (error) {
    console.error("Error while deleting todo:", error);
    if (error.response?.status === 401) {
        alert("Session expired. Please sign in again.");
        logout();
    } else {
        alert("Error deleting task. Please try again.");
    }
}
}

async function toggleTodoDone(id, done) {
const token = localStorage.getItem("token");
if (!token) {
    moveToSignin();
    return;
}

try {
    await axios.put(
        ${API_URL}/todos/${id}/done,
        {},
        { headers: { Authorization: token } }
    );
    
    getTodos();
} catch (error) {
    console.error("Error while toggling todo status:", error);
    if (error.response?.status === 401) {
        alert("Session expired. Please sign in again.");
        logout();
    }
}
}

// DOM element creation functions
function createTodoElement(todo) {
const todoDiv = document.createElement("div");
todoDiv.className = "todo-item";
if (todo.done) {
    todoDiv.classList.add("done");
}

const inputElement = createInputElement(todo.title);
inputElement.readOnly = true;
if (todo.done) {
    inputElement.style.textDecoration = "line-through";
}

const doneCheckbox = createDoneCheckbox(todo.done, todo.id, inputElement);
const updateBtn = createUpdateButton(inputElement, todo.id);
const deleteBtn = createDeleteButton(todo.id);

todoDiv.appendChild(doneCheckbox);
todoDiv.appendChild(inputElement);
todoDiv.appendChild(updateBtn);
todoDiv.appendChild(deleteBtn);

return todoDiv;
}

function createInputElement(value) {
const inputElement = document.createElement("input");
inputElement.type = "text";
inputElement.value = value;
inputElement.readOnly = true;
return inputElement;
}

function createUpdateButton(inputElement, id) {
const updateBtn = document.createElement("button");
updateBtn.textContent = "Edit";
updateBtn.className = "edit-btn";

updateBtn.onclick = function() {
    if (inputElement.readOnly) {
        inputElement.readOnly = false;
        updateBtn.textContent = "Save";
        inputElement.focus();
        // Select all text in the input for easier editing
        inputElement.setSelectionRange(0, inputElement.value.length);
    } else {
        const newValue = inputElement.value.trim();
        if (newValue === "") {
            alert("Task cannot be empty");
            return;
        }
        
        inputElement.readOnly = true;
        updateBtn.textContent = "Edit";
        updateTodo(id, newValue);
    }
};

return updateBtn;
}

function createDeleteButton(id) {
const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Delete";
deleteBtn.className = "delete-btn";

deleteBtn.onclick = function() {
    deleteTodo(id);
};

return deleteBtn;
}

function createDoneCheckbox(done, id, inputElement) {
const doneCheckbox = document.createElement("input");
doneCheckbox.type = "checkbox";
doneCheckbox.checked = done;

doneCheckbox.onchange = function() {
    toggleTodoDone(id, done);
};

return doneCheckbox;
}

// Add event listeners for Enter key
document.addEventListener('DOMContentLoaded', () => {
// For signup form
document.getElementById("signup-password").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        signup();
    }
});

// For signin form
document.getElementById("signin-password").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        signin();
    }
});

// For todo input
document.getElementById("input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addTodo();
    }
    });
});



async function toggleTodoDone(id , done){
    const token = localStorage.getItem("token");

    try {
        await axios.put(
           ` http://localhost:3000/todos/${id}/done` ,
           { done: !done } ,
           {
            headers: {
                Authorization : token 
            },
           }
        )
        getTodos();
    } catch(error){
        console.error("error while toggling todo : " , error)
    }
}

function createDoneCheckbox(done , id , inputElement){
    const doneCheckbox = document.createElement("input");
    doneCheckbox.type = "checkbox";
    doneCheckbox.checked = done;

    inputElement.style.textDecoration = done ? "line-through" : "none";

    doneCheckbox.onchange = function () {
        // Toggle the To-Do status and update text decoration
        toggleTodoDone(id, done); // Pass the current done state
        inputElement.style.textDecoration = doneCheckbox.checked ? "line-through" : "none"; // Update text decoration based on checkbox state
    };

    return doneCheckbox;
}