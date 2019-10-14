// MySQL Initialization
const mysql = require("mysql");
require('dotenv').config(); //環境變數

 
let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "mapbook",
    multipleStatements: true
});

connection.connect(function(err) {
    if (err) {
        console.log('connecting database error');
        return;
    }
    console.log('connecting database success');
});

module.exports = {
	core:mysql,
	con:connection
};


