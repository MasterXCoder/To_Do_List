// Modify the task creation to include due date
function addTask() {
  const input = document.getElementById('taskInput');
  const priority = document.getElementById('prioritySelect').value;
  const dueDate = document.getElementById('dueDate').value; // Add this input to HTML
  const text = input.value.trim();

  if (text === "") {
    alert("Please enter a task!");
    return;
  }

  tasks.push({ 
    text, 
    priority, 
    completed: false, 
    date: new Date(),
    dueDate: dueDate 
  });
  saveTasks();
  renderTasks();
  input.value = "";
}
