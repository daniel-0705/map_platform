/* eslint-disable func-names */
/* eslint-disable camelcase */
// express模組
const express = require("express");

const app = express(); // express 模組
const redis = require("redis"); // redis 模組
const bodyParser = require("body-parser"); // body-parser 模組
const mysql = require("./mysql_connection.js"); // MySQL Initialization
const dao_map = require("./dao/map.js"); // dao_map.js檔

const router = express.Router(); // 建立 router 物件
const map_list_place = require("./map_list_place/map.js");
const user_map_list_place = require("./map_list_place/user_map.js");
const user = require("./user/user.js");
const search = require("./search/search.js");
const copy_list = require("./copy_and_show_list/copy_list.js");
const show_list = require("./copy_and_show_list/show_list.js");

// 靜態檔案 模組
app.use("/", express.static("public"));

// 為了可以讀取header裡面的內容
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const check_header_type = function (req, res, next) {
    if (req.header("Content-Type") !== "application/json") {
        const error = {
            error: "Invalid request body."
        };
        res.send(error);
    } else {
        next();
    }
};

const check_user_status = async function (req, res, next) {
    let user_token;

    if (req.headers.authorization == null) {
        const error = {
            error: "! 查無此使用者，請重新註冊。"
        };
        res.send(error);
    } else {
        let user_Bearer_token = req.headers.authorization;
        user_Bearer_token = user_Bearer_token.split(" ");

        if (user_Bearer_token[0] !== "Bearer") {
            const error = {
                error: "not a Bearer token"
            };
            res.send(error);
        } else {
            user_token = user_Bearer_token[1];
        }
    }

    // 確認使用者的身分
    const select_user_result = await dao_map.select("user", "access_token", user_token);
    if (select_user_result === 0) {
        const error = {
            error: "! 查無此使用者，請重新註冊。"
        };
        res.send(error);
    } else {
        req.user = select_user_result;
        next();
    }
};

const check_user_in_main_page = async function (req, res, next) {
    let user_Bearer_token = req.headers.authorization;
    user_Bearer_token = user_Bearer_token.split(" ");

    if (user_Bearer_token[0] !== "Bearer") {
        const error = {
            error: "not a Bearer token"
        };
        res.send(error);
    } else {
        req.token = user_Bearer_token[1];
        next();
    }
};

app.use(check_header_type); // middleware

// 分出去的 router
app.use("/api/map", check_user_in_main_page, map_list_place);
app.use("/api/map_list/user", check_user_status, user_map_list_place);
app.use("/api/user", user);
app.use("/api/map_list/search", search);
app.use("/api/map_list/copy", check_user_status, copy_list);
app.use("/api/map_list/show", show_list);

app.listen(3000, function () {
    console.log("Server is running in http://localhost:3000/");
});

