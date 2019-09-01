const mysql=require("../mysql_connection.js");                       // MySQL Initialization

let select_mysql = function(table_name,column_name,data,data2){ 
    return new Promise(function(resolve, reject){
        mysql.con.query(`select * from ${table_name} where ${column_name} ="${data}" and address = "${data2}"`,function (err,result) {
            if (err) {
                console.log(`${data_detail} select ${table_name} table failed`);
                reject(err);
            }else{
                resolve(result);
            }
        })
    })
};

let insert_mysql = function(table_name,data,data_name){ 
    return new Promise(function(resolve, reject){
        mysql.con.query(`insert into ${table_name} set ?`,data,function (err,result) {
            if (err) {
                console.log(`${data_name} insert ${table_name} table failed`);
                reject(err);
            }else{
                console.log(`${data_name} insert ${table_name} table ok`);
                resolve(`${data_name} insert ${table_name} table ok`);
            }
        })
    })
};

let update_mysql = function(table_name,data,data_name){ 
    return new Promise(function(resolve, reject){
        mysql.con.query(`UPDATE ${table_name} SET ? where address ="${data.address}"`,data,function (err,result) {
            if (err) {
                console.log(`${data_name} update ${table_name} table failed`);
                reject(err);
            }else{
                console.log(`${data_name} update ${table_name} table ok`);
                resolve(`${data_name} update ${table_name} table ok`);
            }
        })
    })
};






module.exports={
	select:select_mysql,
    insert:insert_mysql,
    update:update_mysql
};