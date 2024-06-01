/**
 * @file This file serves as the main controller for any database operation required within the app.
 * @module dbController
 */

const {sql, checkTable } = require('./connection.js');
const { generateUUID } = require('./encryption.js');

/**
 * Run our prechecks on the database which includes checking if the 
 * table exists and creating it if it doesn't.
 */
checkTable();

/**
 * The database controller object.
 * Can be used by calling db.create(data), db.update(data), db.delete(id) etc.
 */
let db = {
    /**
     * Creates a new record in the database.
     * @async
     * @param {Object} data - The data to be inserted into the database.
     * @param {string} data.task - The task description.
     * @param {boolean} data.completed - Indicates whether the task is completed or not.
     * @param {boolean} data.active - Indicates whether the task is active or not.
     * @param {Date} data.modified_at - The date when the task was last modified.
     * @returns {Promise<Object>} - The newly created record.
     */
    createEmployee: async(data) => {
        console.log("creating employee");
        const text = 'INSERT INTO employees(empid, email, password, firstname, lastname, role) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
        const values = [data.empid, data.email, data.password, data.firstname, data.lastname, data.role];
        const res = await sql.query(text, values)
        return res;
    },
    checkEmployeeEmail: async(data) => {
        console.log("checking employee");
        const text = 'SELECT EXISTS(SELECT 1 FROM employees WHERE email=$1)'
        const values = [data.email];
        const res = await sql.query(text, values)
        let exists = (res.rows[0].exists);
        return exists;
    },
    getEmployeeCredentials: async(data) => {
        console.log("getting employee");
        const text = 'SELECT empid, password FROM employees WHERE email=$1'
        const values = [data.email];
        const res = await sql.query(text, values)
        return res.rows[0];
    },

    getEmployeeIdNames: async() => {
        console.log("getting employees and Ids");
        const text = 'SELECT empid, firstname, lastname FROM employees'
        const res = await sql.query(text)
        return res.rows;
    },

    addTasks: async(data) => {
        console.log("adding task");
        const text = 'INSERT INTO tasks(taskid, taskname, taskdescription, tasklocation, taskduedate) VALUES($1, $2, $3, $4, $5) RETURNING *'
        const values = [data.taskid, data.taskname, data.taskdescription, data.tasklocation, data.taskduedate];
        const res = await sql.query(text,values)

        if (data.taskEmployees.length > 0){
            for (i=0; i < data.taskEmployees.length; i++){
                let assignid = generateUUID();
                let text1 = 'INSERT INTO taskemployee(assignid, empid, taskid) VALUES($1, $2, $3) RETURNING *'
                let values1 = [assignid, data.taskEmployees[i], data.taskid];
                let res1 = await sql.query(text1,values1)
            }
        }
        return res
    },
    getTasks: async() => {
        console.log("getting tasks");
        const text = 'SELECT taskid, taskname, taskdescription, tasklocation, taskduedate FROM tasks'
        const res = await sql.query(text)

        for (i=0; i < res.rows.length; i++){
            //get the associated employees for each
            let text2 = 'SELECT taskemployee.empid, employees.firstname, employees.lastname FROM taskemployee INNER JOIN employees ON taskemployee.empid= employees.empid  WHERE taskemployee.taskid =$1'
            let values2 = [res.rows[i].taskid];
            let res2 = await sql.query(text2,values2)
            res.rows[i].assignedEmployees = res2.rows;
        }   
        return res.rows;
    },
    
    /**
     * Updates an existing record in the database.
     * @param {Object} data - The data to be updated in the database.
     * @returns {Object} - The updated record.
     */
    update: (data) => {
        return data;
    },
    /**
     * Deletes a record from the database.
     * @param {number} id - The ID of the record to be deleted.
     * @returns {number} - The ID of the deleted record.
     */
    delete: (id) => {
        return id;
    },
}

module.exports = db;