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

async function getTodos(){
    try {
    const token = localStorage.getItem("token");

    const response = await axios.get("http://localhost:3000/todos" ,{
        headers: { Authorization:token }
    })

    const todosList = document.getElementById("todos-list");

    todosList.innerHTML = "";

    if(response.data.length){
        response.data.forEach((todo) => {
            const todoElement = createTodoElement(todo);
            todosList.appendChild (todoElement);
        });
    }
} catch (error){
    console.error("error while getting todo list:" , error)
}
} 

async function addTodo(){
    const inputElement = document.getElementById("input"); //createinputelement se 
    const title = inputElement.value;

    if(title.trim() === ""){
        alert("please add a todo to add one");
        return;
    }

    const token = localStorage.getItem("token");
    try{
    await axios.post("http://localhost:3000/todos" ,
        { title } , 

        { Authorization : token });

        inputElement.value = ""; //clear the field after adding a todo

        //refresh the gettodo
        getTodos;
} 
 catch(error){
    console.error("error while loading the new added todos" , error); 
}
}

async function updateTodo(id , newTitle){
    //token put refresh 

    const token = localStorage.getItem("token");

    try{
        await axios.put(`http://localhost:3000/todos/${id}` , {
            title : newTitle
        }  , 
    { headers : {
        Authorization : token
    }});
    getTodos();
    }
 catch(error){
    console.error("error while updating a todo item" , error);
}
}
//deleting -- token deleting refreshing 
async function deleteTodo(id){
    const token = localStorage.getItem("token");

    try{
        await axios.delete(`http://localhost:3000/${id}` , {
            headers : {
                Authorization: token
            }
        });
        getTodos;
    } catch(error){
        console.error("error while deleting a todo" , error)
    }
}

async function toggleTodoDone(){
    const token = localStorage.getItem("token");

    try{
        await axios.put(`http://localhost:3000/todos/${id}/done` , {
            headers: {
                Authorization: token
            }
        })
        getTodos();
    } catch(error){
        console.error("error while marking it as done" , error)
    }
}

function createTodoElement(todo){
    const todoDiv =deocument.createElement("div");
    todoDiv.className = "todo-item";

    const inputElement = createInputElement(todo.title);
    inputElement.readOnly = true //sets the todo as read only

    //for more functionalities , created update , delete and done button
    const updateBtn = createUpdateButton(inputElement , todo.id);
    const deleteBtn = createDeleteButton(todo.id);
    const doneCheckbox = createDoneCheckbox(todo.done , todo.id , inputElement);

    //APPEND THESE BUTTONS IN THE DIV
    todoDiv.appendChild(inputElement);
    todoDiv.appendChild(doneCheckbox);
    todoDiv.appendChild(updateBtn);
    todoDiv.appendChild(deleteBtn);

    return todoDiv;
}

function createInputElement(value){
    const inputElement = document.createElement("input");

    inputElement.type = "text";
    inputElement.value = value;
    inputElement.readOnly = true;

    return inputElement;
}

function createUpdateElement(inputElement , id){
    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Edit";

    updateBtn.onclick = function(){
        if(inputElement.readOnly){
            inputElement.readOnly = false;
            updateBtn.textContent = "Save";
            inputElement.focus();
            inputElement.style.outline = "1px solid #007BFF";
        } else {
            inputElement.readOnly = true;
            updateBtn.textContent = "edit";
            inputElement.style.outline = "none";
            updateTodo(id , inputElement.value);
        }
    };
    return updateBtn;
}

function createDeleteButton(id){
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.onclick = function(){
        deleteTodo(id);
    };
    return deleteBtn;
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