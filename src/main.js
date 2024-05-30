const  tasks = require('./testData/tasks.json');
const express = require('express');
const app = express();
const dbController = require('./db/dbController.js');
const { v4: uuidv4 } = require('uuid');
const cors = require("cors")


app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); //configure to only except few urls?

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

app.post('/signup', async (req, res) => {
  console.log('Got a POST request');
  try {
    
    //const validatedData = await todoSchema.validateAsync(req.body);
    
    /** @type {Types.TaskData} */
    /*let data = {
      task: validatedData.task,
      completed: validatedData.completed,
      active: validatedData.active,
      modified_at: validatedData.modified_at
    };*/

    let data = {
      empid: uuidv4(),
      email: req.body.email,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      role: req.body.role
    };

    console.log(data); 
    await dbController.createEmployee(data);
    res.send('Cool, it\'s saved 🤞');
  } catch (error) {
    console.error(error);
    res.status(400).send('Invalid request body');
  }
});

app.post('/login', async (req, res) => {
  console.log('Got a POST request');
  try {
    
    //const validatedData = await todoSchema.validateAsync(req.body);
    
    /** @type {Types.TaskData} */
    /*let data = {
      task: validatedData.task,
      completed: validatedData.completed,
      active: validatedData.active,
      modified_at: validatedData.modified_at
    };*/

    let data = {
      email: req.body.email,
      password: req.body.password,
    };

    console.log(data); 
    let dbResponse = await dbController.checkEmployee(data);
    if(dbResponse){
      res.send('Cool, it\'s you are allowed 🤞');
    }else{
      res.send("You are not allowed!") 
    }
    
  } catch (error) {
    console.error(error);
    res.status(400).send('Invalid request body');
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Task API running on port ${PORT}`));