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

    if (user) {
        return res.status(400).json({
            message: "you are already signed up"
        });
    }

    users.push({
        username,
        password
    });

    res.json({
        message: "you are signedup successfully"
    });
});

app.post("/signin", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "username and passwords cant be empty!"
        });
    }

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        const token = jwt.sign({
            username
        }, JWT_SECRET);
        
        return res.json({
            token,
            message: "Signed in successfully"
        });
    }

    res.status(401).json({
        message: "Enter valid username or password"
    });
});

function auth(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Token missing! there's some issue."
        });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.username = decoded.username;
        next();
    } catch (error) {
        res.status(401).json({
            message: "invalid token!"
        });
    }
}

app.get("/todos", auth, (req, res) => {
    const currentUser = req.username;
    const userTodos = todos.filter(todo => todo.username === currentUser);
    res.json(userTodos);
});

app.post("/todos", auth, (req, res) => {
    const title = req.body.title;
    const priority = req.body.priority || "medium";
    const currentUser = req.username;

    if (!title) {
        return res.status(400).json({
            message: "Todo list cant be empty"
        });
    }

    const newTodo = {
        id: todos.length + 1,
        username: currentUser,
        title,
        priority,
        done: false
    };

    todos.push(newTodo);
    res.json({ message: "todo created successfully", todo: newTodo });
});

app.put("/todos/:id/done", auth, (req, res) => {
    const id = parseInt(req.params.id);
    const currentUser = req.username;

    const todo = todos.find(todo => todo.id === id && todo.username === currentUser);

    if (!todo) {
        return res.status(404).json({
            message: "todo not found"
        });
    }

    todo.done = !todo.done;
    res.json({
        message: `Todo marked as ${todo.done ? "done" : "undone"}`,
        todo
    });
});

app.delete("/todos/all", auth, (req, res) => {
    const currentUser = req.username;
    
    const initialLength = todos.length;
    const newTodos = todos.filter(todo => todo.username !== currentUser);
    const deletedCount = initialLength - newTodos.length;
    
    if (deletedCount === 0) {
        return res.status(404).json({
            message: "No todos found to delete"
        });
    }
    
    todos.length = 0;
    todos.push(...newTodos);
    
    res.json({
        message: `${deletedCount} todos have been deleted successfully`
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});