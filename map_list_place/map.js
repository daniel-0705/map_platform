/* eslint-disable camelcase */
const express = require("express"); // express 模組

const router = express.Router(); // 建立 router 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔
const redis = require("redis"); // redis 模組

const REDIS_PORT = process.env.PORT || 6379; // redis 建立
const client = redis.createClient(REDIS_PORT);

// 地圖上所有的點 及使用者收藏的點
router.get("/", async function (req, res) {
    let data = {};
    let all_place_data;

    // 這段先判斷使用者有無登入，有的話找出使用者收藏的地點
    const select_user_result = await dao_map.select("user", "access_token", req.token);

    if (select_user_result.length !== 0) {
        const select_all_user_place = await dao_map.select("user_map_place", "user_name", select_user_result[0].name);
        data.user_places = select_all_user_place;
    }

    // 接著找公用地圖上所有的點，因為幾乎不會變動，所以這邊設置快取
    await client.get("all_place", async function (err, value) {
        if (!err) {
            if (!value) {
                let select_all_place = await dao_map.select("map", null, "all places");
                select_all_place = JSON.stringify(select_all_place);
                client.setex("all_place", 86400, select_all_place);
                all_place_data = select_all_place;
                data.places = JSON.parse(all_place_data);
                res.send(data);
            } else {
                all_place_data = value;
                data.places = JSON.parse(all_place_data);
                res.send(data);
            }
        }
    });
});

module.exports = router;
