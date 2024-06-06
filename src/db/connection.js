//connecting and make tables if they don't exist
const pg = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const { Pool } = pg;

function generateUUID(){
    let empid = uuidv4()
    return empid
}

const sql = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
});

const sqlSingle = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    max: 1
});

async function checkTable() {
    await checkTableTasks()
    await checkTableEmployees()
    await checkTableTaskEmployee()
}


async function checkTableTasks() {
    try {
        let submission = await sqlSingle.query(`
        SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'tasks');`)
        const tableExists = submission.rows[0].exists;
        if (tableExists === false) {
            console.log('Table does not exist, creating it now:');
            createTableTasks();
            insertExampleTask()
            return
        } else {
            console.log('Table exists:', tableExists);
            return
        }

    } catch (err) {
        console.error('Error checking table existence:', err);
        createTableTasks()
        insertExampleTask()
        return
    }
}

async function checkTableEmployees() {
    try {
        let submission = await sqlSingle.query(`
        SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'employees');`)
        const tableExists = submission.rows[0].exists;
        if (tableExists === false) {
            console.log('Table does not exist, creating it now:');
            createTableEmployees();
            return
        } else {
            console.log('Table exists:', tableExists);
            return
        }

    } catch (err) {
        console.error('Error checking table existence:', err);
        createTableEmployees()
        return
    }
}

async function checkTableTaskEmployee() {
    try {
        let submission = await sqlSingle.query(`
        SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'taskemployee');`)
        const tableExists = submission.rows[0].exists;
        if (tableExists === false) {
            console.log('Table does not exist, creating it now:');
            createTableTaskEmployee();
            return
        } else {
            console.log('Table exists:', tableExists);
            return
        }

    } catch (err) {
        console.error('Error checking table existence:', err);
        createTableTaskEmployee()
        return
    }
}

async function createTableTasks() {
    await sqlSingle.query(`
    CREATE TABLE tasks (
        taskId UUID PRIMARY KEY,
        taskName VARCHAR(255) NOT NULL,
        taskDescription VARCHAR(255) NOT NULL,
        taskLocation VARCHAR(255),
        taskDueDate TIMESTAMP
    );`).then(console.log('Tasks Table created')).catch((err) => {
        console.error('Check if the docker is launched! Error creating table:', err);
    });
};

async function createTableEmployees() {
    await sqlSingle.query(`
    CREATE TABLE employees (
        empId UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL
    );`).then(console.log('Employees Table created')).catch((err) => {
        console.error('Check if the docker is launched! Error creating table:', err);
    });
};

async function createTableTaskEmployee() {
    await sqlSingle.query(`
    CREATE TABLE taskemployee (
        assignId UUID PRIMARY KEY,
        empId UUID REFERENCES employees(empid) NOT NULL,
        taskId UUID REFERENCES tasks(taskid) NOT NULL
    );`).then(console.log('TaskEmployee Table created')).catch((err) => {
        console.error('Check if the docker is launched! Error creating table:', err);
    });
};

async function insertExampleTask() {
    try {
        let newUuid = generateUUID();
        let data = {
            taskid: newUuid,
            taskname: "Example Task",
            taskdescription: "Example Description",
            tasklocation: "Example Location",
            taskduedate: new Date().toISOString().split('.')[0]+"Z",
        };
        const text = 'INSERT INTO tasks(taskid, taskname, taskdescription, tasklocation, taskduedate) VALUES($1, $2, $3, $4, $5) RETURNING *'
        const values = [data.taskid, data.taskname, data.taskdescription, data.tasklocation, data.taskduedate];
        await sqlSingle.query(text, values)
        return
    } catch (error) {
        console.log(error)
        return
    }
}

module.exports = { sql, checkTable };