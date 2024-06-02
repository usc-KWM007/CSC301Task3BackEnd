const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const dbController = require('./db/dbController.js');
const { v4: uuidv4 } = require('uuid');
const cors = require("cors")
const { generateUUID, checkPassword, encryptPassword } = require('./db/encryption.js');
require('dotenv').config();
const jwt = require('jsonwebtoken');
app.use(cookieParser(process.env.JWT_SECRET_KEY));

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true
  }
)); //configure to only except few urls?

//used to validate the token - needs to be done on all requests except login signup and signout
const checkToken = (req) => {
  try {
    let cookies = req.cookies
    jwt.verify(cookies.token, process.env.JWT_SECRET_KEY)
    return true
  } catch {
    return false
  }
}

app.get('/addTask', async (req, res) => {
  try {
    let employees = await dbController.getEmployeeIdNames()
    res.send(employees);
  } catch {
    res.status(404).send('Failed to get employees');
  }
}
);

app.post('/addTask', async (req, res) => {
  console.log('Got a POST request');
  try {
    let newUuid = generateUUID();
    let data = {
      taskid: newUuid,
      taskname: req.body.taskname,
      taskdescription: req.body.taskdescription,
      tasklocation: req.body.tasklocation,
      taskduedate: req.body.taskduedate,
      taskEmployees: req.body.taskEmployees

    };
    await dbController.addTasks(data)
    res.send('task added');
  } catch {
    res.status(400).send('Invalid request body');
  }
}
);

app.get('/dashboard', async (req, res) => {
  console.log('Got a GET request');
  try {
    console.log("one")
    const tasks = await dbController.getTasks();
    res.send(tasks);
  } catch {
    res.status(404).send('Failed to get employees');
  }
});


app.post('/signup', async (req, res) => {
  console.log('Got a POST request');
  try {
    //const validatedData = await todoSchema.validateAsync(req.body);
    /** @type {Types.TaskData} */
    let newUuid = generateUUID();
    let data = {
      empid: newUuid,
      email: req.body.email,
      password: encryptPassword(req.body.password, newUuid),
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      role: req.body.role
    };
    await dbController.createEmployee(data);
    res.send('You are registered');
  } catch (error) {
    console.error(error);
    res.status(400).send('Invalid request body');
  }
});



app.post('/login', async (req, res) => {
  console.log('Got a POST requests');
  try {

    /** @type {Types.TaskData} */
    let data = {
      email: req.body.email,
      password: req.body.password,
    };

    //check if email exists
    let dbResponse = await dbController.checkEmployeeEmail(data);
    if (dbResponse) {
      //get the uuid and encrypted password
      let employeeCredentials = await dbController.getEmployeeCredentials(data);
      //check plain password to encrypted password
      let passwordCheck = checkPassword(data.password, employeeCredentials.empid, employeeCredentials.password)
      if (passwordCheck) {
        //generate and send JWT Token
        let email = data.email;
        const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
        res.cookie("token", token, { expiresIn: '1h' });
        res.send(token);
        console.log("Someone Logged in")

      } else {
        res.send("Incorrect Password")
      }
    } else {
      res.send("Email does not exists")
    }
  } catch (error) {
    console.error(error);
    res.status(400).send('Invalid request body');
  }
});

app.get('/signout', async (req, res) => {
  console.log('Got a GET request');
  res.clearCookie("token");
  res.send("User has signed out");
  console.log("User has signed out");
});

app.get('/check', async (req, res) => {
  console.log('Got a GET request');
  let check = checkToken(req)
  res.send(check)
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Task API running on port ${PORT}`));