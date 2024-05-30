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
        WHERE table_name = 'todos'
    );
`, (err, result) => {
    if (err) {
        console.error('Error checking table existence:', err);
        createTable()
    } else {
        const tableExists = result.rows[0].exists;
        if(tableExists === false) {
            console.log('Table does not exist, creating it now:');
            createTable();
        }else{
            console.log('Table exists:', tableExists);
        }
    }
});
}

function createTable() {
    sql.query(`
    CREATE TABLE tasks (
        id SERIAL PRIMARY KEY,
        task VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT false,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,  (err, result) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Table created, have fun :)');
        }
    });
}

checkTable()

console.log(sql);
 
module.exports = {sql, checkTable};