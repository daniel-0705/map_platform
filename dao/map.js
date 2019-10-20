/* eslint-disable func-names */
/* eslint-disable camelcase */
const mysql = require("../mysql_connection.js"); // MySQL Initialization

const select_mysql = function (table_name, column_name, data) {
    return new Promise(function (resolve, reject) {
        if (column_name == null) {
            mysql.con.query(`select * from ${table_name}`, function (err, result) {
                if (err) {
                    console.log(`${data} select ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        } else {
            mysql.con.query(`select * from ${table_name} where ${column_name} = ?`, data, function (err, result) {
                if (err) {
                    console.log(`${data} select ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }
    });
};

const select_2_conditions_mysql = function (table_name, column_name_1, data_1, column_name_2, data_2) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(
            `select * from ${table_name} where ${column_name_1} = ? and ${column_name_2} = ?`, [data_1, data_2],
            function (err, result) {
                if (err) {
                    console.log(`${data_1} select ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

const select_3_conditions_mysql = function (table_name, column_name_1, data_1, column_name_2, data_2, column_name_3, data_3) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(
            `select * from ${table_name} where ${column_name_1} = ? and ${column_name_2} = ? and ${column_name_3} = ?`, [data_1, data_2, data_3],
            function (err, result) {
                if (err) {
                    console.log(`${data_1} select ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

const select_last_insert_id_mysql = function () {
    return new Promise(function (resolve, reject) {
        mysql.con.query("SELECT LAST_INSERT_ID()", function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const select_order_by_mysql = function (table_name, column_name, data, column_order) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(
            `select * from ${table_name} where ${column_name} = ? order by ${column_order}`, data,
            function (err, result) {
                if (err) {
                    console.log(`${data} select ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

const fuzzy_search = function (table_name, column_name, data, column_order, limit_number) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(
            `SELECT * FROM ${table_name} where category = "true" and ${column_name} LIKE ? order by ${column_order} desc limit ${limit_number}`, "%" + data + "%",
            function (err, result) {
                if (err) {
                    console.log(`${data} select ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

const fuzzy_search_place = function (table_name, column_name, data, limit_number) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(
            `SELECT * FROM ${table_name} where ${column_name} LIKE ? limit ${limit_number}`, "%" + data + "%",
            function (err, result) {
                if (err) {
                    console.log(`${data} select ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

const insert_mysql = function (table_name, data, data_name) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(`insert into ${table_name} set ?`, data, function (err, result) {
            if (err) {
                console.log(`${data_name} insert ${table_name} table failed`);
                reject(err);
            } else {
                resolve(`${data_name} insert ${table_name} table ok`);
            }
        });
    });
};

const update_mysql = function (table_name, column_name, data_detail, data, data_name) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(`UPDATE ${table_name} SET ? where ${column_name} = ?`, [data, data_detail], function (err, result) {
            if (err) {
                console.log(`${data_name} update ${table_name} table failed`);
                reject(err);
            } else {
                resolve(`${data_name} update ${table_name} table ok`);
            }
        }
        );
    });
};

const update_2_conditions_mysql = function (table_name, column_name_1, data_1, column_name_2, data_2, data, data_name) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(
            `UPDATE ${table_name} SET ? where ${column_name_1} = ? and ${column_name_2} = ?`, [data, data_1, data_2], function (err, result) {
                if (err) {
                    console.log(`${data_name} update ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(`${data_name} update ${table_name} table ok`);
                }
            }
        );
    });
};

const update_3_conditions_mysql = function (table_name, column_name_1, data_1, column_name_2, data_2, column_name_3, data_3, data, data_name) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(
            `UPDATE ${table_name} SET ? where ${column_name_1} = ? and ${column_name_2} = ? and ${column_name_3} = ?`, [data, data_1, data_2, data_3], function (err, result) {
                if (err) {
                    console.log(`${data_name} update ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(`${data_name} update ${table_name} table ok`);
                }
            }
        );
    });
};

const delete_mysql = function (table_name, column_name, data_detail, data_name) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(`DELETE FROM ${table_name} where ${column_name} = ?`, data_detail, function (err, result) {
            if (err) {
                console.log(`${data_name} delete ${table_name} table failed`);
                reject(err);
            } else {
                resolve(`${data_name} delete ${table_name} table ok`);
            }
        });
    });
};

const delete_3_conditions_mysql = function (table_name, column_name_1, data_1, column_name_2, data_2, column_name_3, data_3, data_name) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(
            `DELETE FROM ${table_name} where ${column_name_1} = ? and ${column_name_2} = ? and ${column_name_3} = ?`, [data_1, data_2, data_3], function (err, result) {
                if (err) {
                    console.log(`${data_name} delete ${table_name} table failed`);
                    reject(err);
                } else {
                    resolve(`${data_name} delete ${table_name} table ok`);
                }
            }
        );
    });
};

module.exports = {
    select: select_mysql,
    select_2_conditions: select_2_conditions_mysql,
    select_3_conditions: select_3_conditions_mysql,
    select_last_insert_id: select_last_insert_id_mysql,
    select_order_by: select_order_by_mysql,
    fuzzy_select: fuzzy_search,
    fuzzy_search_place,
    insert: insert_mysql,
    update: update_mysql,
    update_2_conditions: update_2_conditions_mysql,
    update_3_conditions: update_3_conditions_mysql,
    delete: delete_mysql,
    delete_3_conditions: delete_3_conditions_mysql
};
