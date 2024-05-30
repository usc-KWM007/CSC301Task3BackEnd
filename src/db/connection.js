//connecting and make tables if they don't exist
const pg = require('pg');
require('dotenv').config();
const { Pool } = pg;

const sql = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

async function checkTable() {
    sql.query(`
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'tasks'
    );
`, (err, result) => {
        if (err) {
            console.error('Error checking table existence:', err);
            createTable()
        } else {
            const tableExists = result.rows[0].exists;
            if (tableExists === false) {
                console.log('Table does not exist, creating it now:');
                createTable();
            } else {
                console.log('Table exists:', tableExists);
            }
        }
    });
    sql.query(`
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'employees'
    );
`, (err, result) => {
        if (err) {
            console.error('Error checking table existence:', err);
            createTable()
        } else {
            const tableExists = result.rows[0].exists;
            if (tableExists === false) {
                console.log('Table does not exist, creating it now:');
                createTable();
            } else {
                console.log('Table exists:', tableExists);
            }
        }
    });
    sql.query(`
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'taskemployee'
    );
`, (err, result) => {
        if (err) {
            console.error('Error checking table existence:', err);
            createTable()
        } else {
            const tableExists = result.rows[0].exists;
            if (tableExists === false) {
                console.log('Table does not exist, creating it now:');
                createTable();
            } else {
                console.log('Table exists:', tableExists);
            }
        }
    });
}

async function createTable() {
    await sql.query(`
    CREATE TABLE tasks (
        taskId UUID PRIMARY KEY,
        taskName VARCHAR(255) NOT NULL,
        taskDescription VARCHAR(255) NOT NULL,
        taskLocation VARCHAR(255),
        taskDueDate TIMESTAMP,
        completed BOOLEAN DEFAULT false
    );`).catch((err) => {
        console.error('Error creating table:', err);
    });
    console.log('Task Table created');

    await sql.query(`
    CREATE TABLE employees (
        empId UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL
    );`).catch((err) => {
        console.error('Error creating table:', err);
    });
    console.log('Employees Table created');

    await sql.query(`
    CREATE TABLE taskemployee (
        assignId UUID PRIMARY KEY,
        empId UUID REFERENCES employees (empID) NOT NULL,
        taskId UUID REFERENCES tasks (taskId) NOT NULL
    );`).catch((err) => {
        console.error('Error creating table:', err);
    });
    console.log('TaskEmployee Table created');
};

module.exports = { sql, checkTable };