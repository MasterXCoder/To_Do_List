function moveToSignup(){
    //displaying the signup container
    document.getElementById("signup-container").style.display = "block";
    //hide the rest of the containers todo and signin

    document.getElementById("signin-container").style.display = "none";

    document.getElementById("todos-container").style.display = "none"
}

function moveToSignin(){
    //display the signin container and hide both signup and todos

    document.getElementById("signin-container").display.style = "block";

    document.getElementById("signup-container").display.style = "none";
    document.getElementById("todos-container").display.style = "none";
}

function showTodoApp(){
    //show todos and hide signin and signup
    
    document.getElementById("todos-container").display.style = "block";

    document.getElementById("signup-container").display.style = "none";
    document.getElementById("signin-container").display.style = "none";

    getTodos();
}

async function signup(){
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    try{
        const response = await axios.post("http://localhost:3000/signup" , {
            username ,
            password
        })
        alert(response.data.message);

        if(response.data.message === "you are signedup successfully"){
            moveToSignin();
        }
    }
    catch(error){
        console.error("Error while signup" , error);
    }
}

async function signin(){
    const username = document.getElementById("signin-username").value;
    const password = document.getElementById("signin-password").value;

    try {
        const response = await axios.post("http://localhost:3000/signin" , {
            username ,
            password
        });
        //now take the token and set it in local storage
        if(response.data.token){
            localStorage.setItem("token" , response.data.token);
            alert(response.data.message);
            showTodoApp;
        } else {
            alert(response.data.message);
        }
    } catch(error){
        console.error("error while siging in:" , error);
    }
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

