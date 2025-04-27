function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();

  if (text === "") {
    alert("Please enter a task!");
    return;
  }

  const list = document.getElementById("taskList");

  const item = document.createElement("li");
  item.textContent = text;

  const btn = document.createElement("button");
  btn.textContent = "Delete";
  btn.style.marginLeft = "10px";
  btn.style.backgroundColor = "#ff4d4d";
  btn.style.color = "white";
  btn.style.border = "none";
  btn.style.padding = "5px 10px";
  btn.style.cursor = "pointer";
  btn.style.borderRadius = "4px";

  btn.onclick = function () {
    list.removeChild(item);
  };

  item.appendChild(btn);
  list.appendChild(item);

  input.value = "";
}
