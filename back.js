app.put("/todos/:id/done", auth, (req, res) => {
  const id = parseInt(req.params.id);
  const currentUser = req.username;

  const todo = todos.find(
    (todo) => todo.id === id && todo.username === currentUser
  );

  if (!todo) {
    return res.status(404).json({
      message: "todo not found",
    });
  }

  todo.done = !todo.done;
  res.json({
    message: `Todo marked as ${todo.done ? "done" : "undone"}`,
    todo,
  });
});

// Move the app.listen call here
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
