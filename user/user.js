/* eslint-disable camelcase */
const express = require("express"); // express 模組

const router = express.Router(); // 建立 router 物件
const crypto = require("crypto"); // crypto 模組
const axios = require("axios"); // 讓 request 變成 promise 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔
const mysql = require("../mysql_connection.js"); // MySQL Initialization

// user input the user data from sigh_up.html and send here
router.post("/signup", async function (req, res) {
    // 後端初步驗證資料是否確實填寫
    if (!req.body.name || !req.body.password || !req.body.email) {
        res.send({
            error: "! 請確實填寫註冊欄位"
        });
        return;
    }

    // 密碼加密
    const hash_password = crypto.createHash("sha256");
    hash_password.update(req.body.password);

    // create access token
    const hash_time = crypto.createHash("sha256");
    hash_time.update(String(Date.now()));
    const access_token = crypto.randomBytes(48).toString("hex") + hash_time.digest("hex");

    const user_data = {
        provider: "native",
        name: req.body.name,
        email: req.body.email,
        password: hash_password.digest("hex"),
        access_token
    };

    mysql.con.beginTransaction(async function (err) {
        try {

            const check_user_name_result = await dao_map.select("user", "name", user_data.name);

            if (check_user_name_result.length > 0) {
                res.send({ error: "! 這個使用者名稱已有人使用，請試試其他名稱。" });
                return;
            }

            const check_user_email_result = await dao_map.select_2_conditions("user", "email", user_data.email, "provider", user_data.provider);

            if (check_user_email_result.length > 0) {
                res.send({
                    error: "! 這個信箱已有人使用，請試試其他信箱。"
                });
                return;
            }

            // insert_user_data
            await dao_map.insert("user", user_data, user_data.name);

            mysql.con.commit(function (err) {
                if (err) {
                    return mysql.con.rollback(function () {
                        throw err;
                    });
                }
            });

            res.send({
                data: user_data.access_token
            });
        } catch (err) {
            mysql.con.rollback(function () {
                console.log("交易取消");
            });
            res.send({
                error: "! 系統出現錯誤，請重新整理。"
            });
        }
    });
});

// user input the user data from sigh_in.html and send here
router.post("/signin", async function (req, res) {
    // create new access token
    const hash_fb_time = crypto.createHash("sha256");
    hash_fb_time.update(String(Date.now()));
    const new_access_token = crypto.randomBytes(48).toString("hex") + hash_fb_time.digest("hex");

    if (req.body.provider == "facebook") {
        const user_fb_token = req.body.access_token;
        const fb_url = `https://graph.facebook.com/v3.3/me?fields=email,name,picture.width(400).height(500)&access_token=${user_fb_token}`;

        axios
            .get(fb_url)
            .then(async function (response) {
                response = response.data;

                const user_data = {
                    provider: "facebook",
                    name: response.name,
                    email: response.email,
                    password: "0",
                    access_token: new_access_token
                };

                mysql.con.beginTransaction(async function (err) {
                    try {

                        const check_user_data = await dao_map.select_2_conditions("user", "email", user_data.email, "provider", "facebook");

                        if (check_user_data.length >= 1) {
                            // 可能 facebook native 會有相同信箱， 因此要用 email provider 綁定條件
                            // update_fb_user_result
                            await dao_map.update_2_conditions("user", "email", user_data.email, "provider", "facebook", user_data, user_data.name);
                        } else {
                            // insert_fb_user_result
                            await dao_map.insert("user", user_data, user_data.name);
                        }

                        mysql.con.commit(function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                        res.send({
                            data: user_data.access_token
                        });
                    } catch (err) {
                        mysql.con.rollback(function () {
                            console.log("交易取消");
                        });
                        res.send({ error: "! 系統出現錯誤，請重新整理。" });
                    }
                });
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () { });
    } else {
        // 密碼加密後才能查詢資料庫
        const hash_password = crypto.createHash("sha256");
        hash_password.update(req.body.password);
        const crypto_passord = hash_password.digest("hex");

        mysql.con.beginTransaction(async function (err) {
            try {
                const check_user_data = await dao_map.select_3_conditions("user", "email", req.body.email, "password", crypto_passord, "provider", "native");

                if (check_user_data.length == 0) {
                    const error = {
                        error: "! 查無此使用者，請重新註冊。"
                    };
                    res.send(error);
                    return;
                }

                const user_data = {
                    email: req.body.email,
                    password: crypto_passord,
                    access_token: new_access_token
                };

                // 可能 facebook native 會有相同信箱， 因此要用 email provider 綁定條件
                // update_user_result
                await dao_map.update_2_conditions("user", "email", user_data.email, "provider", "native", user_data, user_data.email);

                mysql.con.commit(function (err) {
                    if (err) {
                        throw err;
                    }
                });

                res.send({
                    data: user_data.access_token
                });
            } catch (err) {
                mysql.con.rollback(function () {
                    console.log("交易取消");
                });
                res.send({ error: "! 系統出現錯誤，請重新整理。" });
            }
        });
    }
});

module.exports = router;
