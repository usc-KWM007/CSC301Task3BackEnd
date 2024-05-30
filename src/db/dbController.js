/**
 * @file This file serves as the main controller for any database operation required within the app.
 * @module dbController
 */

const {sql, checkTable } = require('./connection.js');

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
        console.log(res);
        return res;
    },
    checkEmployee: async(data) => {
        console.log("checking employee");
        const text = 'SELECT EXISTS(SELECT 1 FROM employees WHERE email=$1 AND password = $2)'
        const values = [data.email, data.password];
        const res = await sql.query(text, values)
        let exists = (res.rows[0].exists);
        return exists;
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