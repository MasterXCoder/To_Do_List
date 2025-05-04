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