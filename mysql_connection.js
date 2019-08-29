// MySQL Initialization
const mysql=require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "94720705",
    database: "my_map",
    multipleStatements: true
});

connection.connect(function(err) {
    if (err) {
        console.log('connecting database error');
        return;
    }
    console.log('connecting database success');
});

module.exports={
	core:mysql,
	con:connection
};