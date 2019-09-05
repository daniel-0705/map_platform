const mysql=require("../mysql_connection.js");                       // MySQL Initialization

let select_mysql = function(table_name,column_name,data){ 
    return new Promise(function(resolve, reject){

        if(column_name == null){
            mysql.con.query(`select * from ${table_name}`,function (err,result) {
                if (err) {
                    console.log(`${data} select ${table_name} table failed`);
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        }else{
            mysql.con.query(`select * from ${table_name} where ${column_name} ="${data}"`,function (err,result) {
                if (err) {
                    console.log(`${data.name} select ${table_name} table failed`);
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        }
    })
};

let select_2_conditions_mysql = function(table_name,column_name_1,data_1,column_name_2,data_2){ 
    return new Promise(function(resolve, reject){
        mysql.con.query(`select * from ${table_name} where ${column_name_1} ="${data_1}" and ${column_name_2} = "${data_2}"`,function (err,result) {
            if (err) {
                console.log(`${data_1.name} select ${table_name} table failed`);
                reject(err);
            }else{
                resolve(result);
            }
        })
    })
};


let select_last_insert_id_mysql = function(){ 
    return new Promise(function(resolve, reject){
        mysql.con.query(`SELECT LAST_INSERT_ID()`,function (err,result) {
            if (err) {
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

let update_mysql = function(table_name,column_name,data_detail,data,data_name){ 
    return new Promise(function(resolve, reject){
        mysql.con.query(`UPDATE ${table_name} SET ? where ${column_name} ="${data_detail}"`,data,function (err,result) {
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
    select_2:select_2_conditions_mysql,
    select_last_insert_id:select_last_insert_id_mysql,
    insert:insert_mysql,
    update:update_mysql
};