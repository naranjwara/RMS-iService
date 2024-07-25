const Pool = require('pg').Pool;

const pool = new Pool ({
    user: "postgres",
    password: "01012015",
    database: "iService",
    host: "localhost",
    port: 5432
});

module.exports = pool;