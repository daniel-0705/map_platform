/* eslint-disable camelcase */
const express = require("express"); // express 模組

const router = express.Router(); // 建立 router 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔
const search = require("../search/search_function.js"); // crawler_function.js 檔

// search other public lists in map
router.post("/list", async function (req, res) {
    // 使用者搜尋他人清單，不用登入

    const search_word = req.body.data;

    let final_result = [];

    const search_list_result = [];

    // 迴圈尋資料庫
    for (let i = 0; i < search_word.length; i++) {
        // 一開始用搜尋字串下去找
        const fuzzy_select_list = await dao_map.fuzzy_select("user_map_list", "list_name", search_word, "copy_number", 10);
        fuzzy_select_list.map(item => {
            search_list_result.push(item);
        });

        // 從字串中刪除最後一個字開始找
        const positive_word = search_word.slice(0, -i - 1);
        const positive_fuzzy_select_list = await dao_map.fuzzy_select("user_map_list", "list_name", positive_word, "copy_number", 10);
        positive_fuzzy_select_list.map(item => {
            search_list_result.push(item);
        });

        // 從字串中刪除第一個字開始找
        const negative_word = search_word.substring(i + 1);
        const negative_fuzzy_select_list = await dao_map.fuzzy_select("user_map_list", "list_name", negative_word, "copy_number", 10);
        negative_fuzzy_select_list.map(item => {
            search_list_result.push(item);
        });

        // 將重複的結果剃除
        final_result = search.removeDuplicates(search_list_result, "list_id");

        // 當最後結果超過特定數字就停止迴圈
        if (final_result.length > 6) {
            break;
        }
    }

    res.send({
        data: final_result
    });
});

// search place in map
router.post("/place", async function (req, res) {
    // 使用者搜尋他人清單，不用登入

    const search_word = search.full_search(req.body.data);

    let final_result = [];

    const search_place_result = [];

    // 迴圈尋資料庫
    for (let i = 0; i < search_word.length; i++) {
        // 一開始用搜尋字串下去找
        const fuzzy_search_place_in_name = await dao_map.fuzzy_search_place("map", "name", search_word, 7);
        fuzzy_search_place_in_name.map(item => {
            search_place_result.push(item);
        });
        const fuzzy_search_place_in_address = await dao_map.fuzzy_search_place("map", "address", search_word, 5);
        fuzzy_search_place_in_address.map(item => {
            search_place_result.push(item);
        });

        // 將重複的結果剃除
        final_result = search.removeDuplicates(search_place_result, "map_id");
        // 當最後結果超過特定數字就停止迴圈
        if (final_result.length > 5) {
            break;
        }

        // 從字串中刪除最後一個字開始找
        const positive_word = search_word.slice(0, -i - 1);
        const positive_fuzzy_select_name = await dao_map.fuzzy_search_place("map", "name", positive_word, 5);
        positive_fuzzy_select_name.map(item => {
            search_place_result.push(item);
        });
        const positive_fuzzy_select_address = await dao_map.fuzzy_search_place("map", "address", positive_word, 3);
        positive_fuzzy_select_address.map(item => {
            search_place_result.push(item);
        });

        // 從字串中刪除第一個字開始找
        const negative_word = search_word.substring(i + 1);
        const negative_fuzzy_select_name = await dao_map.fuzzy_search_place("map", "name", negative_word, 5);
        negative_fuzzy_select_name.map(item => {
            search_place_result.push(item);
        });

        // 將重複的結果剃除
        final_result = search.removeDuplicates(search_place_result, "map_id");
        // 當最後結果超過特定數字就停止迴圈
        if (final_result.length > 5) {
            break;
        }
    }

    res.send({
        data: final_result
    });
});

module.exports = router;
