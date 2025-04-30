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

