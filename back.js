const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

app.use(express.json());

const users = []
const todos = []

const JWT_SECRET = "madhavxoxo";

app.use(express.static(path.join(__dirname , "todo-ass")));

app.post("/signup" , (req , res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password){
        return res.json({
            message: "username and passwords cant be empty!"
        });
    }

    if(username.length < 5){
        return res.json({
            message: "username is too small"
        });
    }

    const user = users.find(user => user.username === username && user.password === password)

    if(user){
        return res.json({
            message : "you are already signed in"
        })
    }
    users.push({
        username,
        password
    })

    res.json({
        message : "you are signedup successfully"
    })
});

app.post("/signin" , (req , res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password){
        return res.json({
            message: "username and passwords cant be empty!"
        });
    }

    const user = users.find(user => user.username === username && user.password === password)

    if(user){
        const token = jwt.sign({
            username ,
            password 
        } , JWT_SECRET)
    }

    else{
        res.json({
            message:"Enter valid username or password"
        })
    }
});

function auth(req , res , next){
    const token = req.headers.authorization;

    if(!token){
        return res.json({
            message : "Token missing! there's some issue."
        })
    }
    try{
        const decoded = jwt.verify(token , JWT_SECRET);

        req.username = decoded.username;
        req.password = decoded.password;
        next();
    }  
    catch(error){
        res.json({
            message: "invalid token!"
        })
    }
}

app.get("/todos" , auth , (req , res) => {
    const currentUser = req.username;
    const userTodos = todos.filter(todos => userTodos.username === currentUser);

    res.json(userTodos);
});

app.post("/todos" , auth , (req , res) => {
    const title = req.body.title;

    const currentUser = req.username;

    if(!title){
        return res.json({
            message : "Todo list cant be empty"
        })
    }

    const newTodo = {
        id : todos.length + 1 ,
        username : currentUser ,
        title ,
        done : false, //every todo is stored with an id ,  so that we can update and do other things to this todo
    };

    todos.push(newTodo);

    res.json({message : "todo created successfully" , todo : newTodo})
})
//updating a todo
app.put("/todos/:id" , auth , (req , res) => {
    const id = req.params.id;
    const title = req.body.title;
    const currentUser = req.username;
    //finding todo
    const todo = todos.find(todo => todo.id === parseInt(id) && todo.username === currentUser) //find todos by currentuser and todo id always 

    if(!todo){
        return res.json({
            message: "todo not found"
        })
    }
    if(!title){
        return res.json({
            message: "title is wrong or different"
        })
    }
    //finally update the todo or title of the todo which is the todo
    todo.title = title;

    res.json({
        message: "todo has been updates successfully" ,
        todo
    })

})
//deleting a todo find and splice for updation
app.delete("/todos/:id" , auth , (req , res) => {
    const id = req.params.id;
    const currentUser = req.username;
    
    const todo = todos.findIndex(todo => todos.id === parseInt(id) && todos.username === currentUser);

    //new findIndex to find the index and then delete , can we also use normal without indexing ?
    //for updation and deletion etc , findindex is beeter and for simple finding an element , find is better

    if(todo.index === -1){
        return res.json ({
            message: "todo not found"
        })
    }
    todo.splice(todoIndex , 1);

    res.json({
        message: "todo has been deleted successfully"
    })
})

//marking them as done
//this will be a put req because it also updatin



//backend routes are done here 
app.listen(3000)