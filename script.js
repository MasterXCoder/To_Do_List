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

