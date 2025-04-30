#!/usr/bin/env node

const fs =  require('fs');
const path = require('path');
const { Command } = require('commander');

const program = new Command();
const todosFilePath = path.join(__dirname , 'todos.json')

function loadTodos(){
    if(!fs.existsSync(todosFilePath)){
        return [];
    }
    else {
        const data = fs.readFileSync(todosFilePath , 'utf-8');
        return JSON.parse(data); //we're picking data from json
    }
}
//save todos in json file
function saveTodos(todos){
    fs.writeFileSync(todosFilePath , JSON.stringify(todos , null ,2));
}

program
    .name('todo')
    .description('CLI to manage a json based todo list')
    .version("1.0.0")
//adding todos
program
    .command("add <task>")
    .description("Add a new todo")
    .action((task) => {
        const todos = loadTodos();
        todos.push({ task, done: false});
        saveTodos(todos);
        console.log(`Added: ${task}`);
    });
// listing todos

program
    .command("list")
    .description("List all todos")
    .action(() => {
        const todos = loadTodos();
        if (todos.length === 0) {
            console.log("No todos found.");
        } else {
            todos.forEach((todo, index) => {
                console.log(`${index + 1}. [${todo.done ? "done" : "not done"}] ${todo.task}`);
            });
        }
    });
//marking todo as done
program 
    .command("toggle <index>")
    .description("toggles the done status of a todo")
    .action((index) => {
        const todos = loadTodos();
        if(index < 1 || index > todos.length){
            console.log("Invalid index.");
            return;
        }
        todos[index - 1].done = !todos[index - 1].done;
        saveTodos(todos);
        console.log(`Toggled status: ${todos[index-1].task} is now ${todos[index-1].done ? "done" : "not done"}`);
    });

program
    .command("delete <index>")
    .description("deletes a todo")
    .action((index) => {
        const todos = loadTodos();
        if(index < 1 || index > todos.length){
            console.log("invalid todo index");
            return;
        }
        const [deletedTodo] = todos.splice(index - 1 , 1);
        saveTodos(todos);
        console.log(`Deleted: ${deletedTodo.task}`);
    });

    program.parse(process.argv);