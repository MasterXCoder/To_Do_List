function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const taskList = document.getElementById("taskList");

  const listItem = document.createElement("li");
  listItem.textContent = taskText;

  // Delete Button
  listItem.onclick = function () {
    taskList.removeChild(listItem);
  };

  taskList.appendChild(listItem);

  taskInput.value = "";
}
