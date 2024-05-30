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
    create: async(data) => {
        console.log("creating");
        const text = 'INSERT INTO todos(task, completed, active, modified_at) VALUES($1, $2, $3, $4) RETURNING *'
        const values = [data.task, data.completed, data.active, data.modified_at];
        const res = await sql.query(text, values)
        console.log(res);
        return res;
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