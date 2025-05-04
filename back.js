const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

app.use(express.json());
// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

const users = []
const todos = []

const JWT_SECRET = "madhavxoxo";

// Serve static files from current directory
app.use(express.static(__dirname));

app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "username and passwords cant be empty!"
        });
    }

    if (username.length < 5) {
        return res.status(400).json({
            message: "username is too small"
        });
    }

    const user = users.find(user => user.username === username);


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

app.put("/todos/:id/done" , auth , (req , res) => {
    const id = req.params.id;
    const currentUser = req.username;

    const todo = todos.find(todo => todo.id === parseInt(id) && todo.username === currentUser);

    if(!todo){
        return res.json({
            message: "todo not found"
        })
    }
    //toggle button to toggle done and not done
    //better approach will be separating and displaying that

    todo.done = !todo.done;

    res.json({
        message : 'Todo marked as {todo.done ? "done" : "undone"}' ,
        todo
    })
})

//backend routes are done here 
app.listen(3000)