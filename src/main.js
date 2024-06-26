const express = require('express');
const cookieParser = require("cookie-parser");
const dbController = require('./db/dbController.js');
const { v4: uuidv4 } = require('uuid');
const cors = require("cors")
const { generateUUID, checkPassword, encryptPassword } = require('./db/encryption.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cookieParser(process.env.JWT_SECRET_KEY));

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Credentials",
    ]
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

app.get('/getEmployees', async (req, res) => {
  try {
    let employees = await dbController.getEmployeeIdNames()
    res.status(200).send(employees);
  } catch (error) {
    console.log(error)
    res.status(404).send('Failed to get employees');
  }
}
);

app.get('/loggedIn', async (req, res) => {
  try {
    const check = checkToken(req);
    if (check) {
      res.status(200).send('User is authenticated');
    } else {
      res.status(200).send('User is not authenticated');
    }
  } catch (error) {
    console.log(error)
    res.status(404).send('Failed to login');
  }
}
);

app.get('/signOut', async (req, res) => {
  try {
    res.clearCookie('token', { httpOnly: true, sameSite: "none", secure: true })
    res.status(202).send("signed out")
  } catch (error) {
    console.log(error)
    res.status(404).send('Failed to sign out');
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
    res.status(200).send('Task added');
  } catch (error) {
    console.log(error)
    res.status(400).send('Invalid request body');
  }
}
);

app.put('/editTask', async (req, res) => {
  console.log('Got a PUT request');
  try {
    let data = {
      taskid: req.body.taskid,
      taskname: req.body.taskname,
      taskdescription: req.body.taskdescription,
      tasklocation: req.body.tasklocation,
      taskduedate: req.body.taskduedate,
      taskEmployees: req.body.taskEmployees

    };
    await dbController.editTask(data)
    res.status(200).send('Task edit added');
  } catch (error) {
    console.log(error)
    res.status(400).send('Failed to edit task');
  }
}
);

app.delete('/dashboard', async (req, res) => {
  console.log('Got a DELETE request');
  try {
    let data = req.body.taskData;
    await dbController.deleteTask(data)
    res.status(200).send('Task Deleted');
  } catch (error) {
    console.log(error)
    res.status(404).send('Failed to delete task');
  }
}
);

app.delete('/settings', async (req, res) => {
  console.log('Got a DELETE request');
  try {
    let email = req.body.email;
    let employeeCredentials = await dbController.getEmployeeCredentials(email);
    await dbController.deleteAccount(employeeCredentials.empid)
    res.status(200).send('Account Deleted');
  } catch (error) {
    console.log(error)
    res.status(404).send('Failed to delete account');
  }
}
);

app.get('/dashboard', async (req, res) => {
  console.log('Got a GET request');
  try {
    const tasks = await dbController.getTasks();
    res.status(200).send(tasks);
  } catch (error) {
    console.log(error)
    res.status(404).send('Failed to get tasks');
  }
});


app.post('/signup', async (req, res) => {
  console.log('Got a Sign Up POST request');
  try {
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

    const emailExists = await dbController.checkEmployeeEmail(data)
    if (emailExists) {
      res.status(400).send('Email already exists');
      return
    }

    await dbController.createEmployee(data);
    res.status(200).send('You are registered');
  } catch (error) {
    console.log(error);
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
      let employeeCredentials = await dbController.getEmployeeCredentials(data.email);
      //check plain password to encrypted password
      let passwordCheck = checkPassword(data.password, employeeCredentials.empid, employeeCredentials.password)


      if (passwordCheck) {
        //generate and send JWT Token
        let email = data.email;
        const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
        res.cookie("token", token, { httpOnly: true, maxAge: 60 * 60 * 1000, sameSite: "none", secure: true });
        console.log("Someone Logged in")
        res.status(200)
        res.send("Logged in")

      } else {
        res.status(401).send("Incorrect Password")

      }
    } else {
      res.status(401).send("Email does not exists")
    }
  } catch (error) {
    console.log(error);
    res.status(400).send('Invalid request body');
  }
});

app.get('/signOut', async (req, res) => {
  console.log('Got a GET request');
  res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
  res.send("User has signed out");
  console.log("User has signed out");
});

app.get('/settings', async (req, res) => {
  console.log('Got a GET request');
  try {
    let cookies = req.cookies;
    let data = jwt.verify(cookies.token, process.env.JWT_SECRET_KEY);
    const accountData = await dbController.getAccountData(data.email);
    res.status(200).send(accountData);
  } catch (error) {
    console.log(error);
    res.status(404).send('Failed to get account data');
  }
});

app.put('/settings', async (req, res) => {
  console.log('Got a PUT request');
  try {
    let data = {
      email: req.body.email,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      role: req.body.role
    };
    let cookies = req.cookies;
    let cookieData = jwt.verify(cookies.token, process.env.JWT_SECRET_KEY);

    if (cookieData.email != data.email) {
      throw error
    }
    let employeeCredentials = await dbController.getEmployeeCredentials(data.email);
    //check if new password is entered by first checking if its the same or null as teh old password
    if (data.password == "" || encryptPassword(data.password, employeeCredentials.empid) == employeeCredentials.password) {
      data.password = null
    } else {
      data.password = encryptPassword(data.password, employeeCredentials.empid)
    }
    console.log(data)
    await dbController.editAccount(data);
    res.status(200).send("Updated Account");
  } catch(error) {
    console.log(error);
    res.status(400).send('Failed to update account data');
  }
});


//delete this?
app.get('/check', async (req, res) => {
  console.log('Got a GET request');
  let check = checkToken(req)
  res.send(check)
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Task API running on port ${PORT}`));