const db = require('./models');

module.exports = db.sequelize.models;


// Using PG package instead of sequelize
// const { Pool } = require("pg");

// const pool = new Pool();
// module.exports = {
//     query: (text, params) => pool.query(text, params),
// };