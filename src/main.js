const  tasks = require('./testData/tasks.json');
const express = require('express');
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies



// Get list of tasks
app.get('/v1/tasks', (req, res) => {
  res.json(tasks);
});

// Add a new task
app.post('/v1/tasks', (req, res) => {
  const task = { taskID: tasks.length + 1, taskName: req.body.taskName, taskDescription: req.body.taskDescription };
  tasks.push(task);
  res.status(201).json(task);
  console.log(tasks)
});



const PORT = 3000;
app.listen(PORT, () => console.log(`Task API running on port ${PORT}`));