const express = require("express"); // express 模組
const router = express.Router();  //建立 router 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔




//search other public lists in map
router.post("/list",async function(req,res){
  
  
    function removeDuplicates(array, key) {
        let lookup = {};
        let result = [];
        for(let i=0; i<array.length; i++) {
            if(!lookup[array[i][key]]){
                lookup[array[i][key]] = true;
                result.push(array[i]);
            }
        }
        return result;
    }

    //使用者搜尋他人清單，不用登入

    let search_word = req.body.data;

    let final_result = [];

    let search_list_result = [];

    //迴圈尋資料庫
    for (let i = 0; i<search_word.length; i++){
        //一開始用搜尋字串下去找
        let fuzzy_select_list = await dao_map.fuzzy_select("user_map_list","list_name",search_word,"copy_number",10);
        fuzzy_select_list.map(item =>{search_list_result.push(item)});
        //從字串中刪除最後一個字開始找
        let positive_word = search_word.slice(0, -i-1);
        let positive_fuzzy_select_list = await dao_map.fuzzy_select("user_map_list","list_name",positive_word,"copy_number",10);
        positive_fuzzy_select_list.map(item =>{search_list_result.push(item)});
        //從字串中刪除第一個字開始找
        let negative_word = search_word.substring(i+1);
        let negative_fuzzy_select_list = await dao_map.fuzzy_select("user_map_list","list_name",negative_word,"copy_number",10);
        negative_fuzzy_select_list.map(item =>{search_list_result.push(item)});
        //將重複的結果剃除
        final_result = removeDuplicates(search_list_result, 'list_id');
        console.log(i);
        //當最後結果超過特定數字就停止迴圈
        if(final_result.length>6){
            break;
        }
    } 



    res.send(final_result);

  
  });
  
//search place in map
router.post("/place",async function(req,res){


    function removeDuplicates(array, key) {
        let lookup = {};
        let result = [];
        for(let i=0; i<array.length; i++) {
        if(!lookup[array[i][key]]){
            lookup[array[i][key]] = true;
            result.push(array[i]);
        }
    }
    return result;
    }

    function replace_full_and_symbol(address){
        address = address.replace(/\s/g, "");
        address = address.replace(/１/g, "1");
        address = address.replace(/２/g, "2");
        address = address.replace(/３/g, "3");
        address = address.replace(/４/g, "4");
        address = address.replace(/５/g, "5");
        address = address.replace(/６/g, "6");
        address = address.replace(/７/g, "7");
        address = address.replace(/８/g, "8");
        address = address.replace(/９/g, "9");
        address = address.replace(/０/g, "0");
        address = address.replace(/（/g, "(");
        address = address.replace(/）/g, ")");
        address = address.replace(/ *\([^)]*\) */g, "");
        return address;
    };

    function number_change_words(address){
        for (let i = 0; i < address.length; i++) {     
            if((address.charAt(i) == "段" && !isNaN(address.charAt(i-1))) ||(address.charAt(i) == "路" && !isNaN(address.charAt(i-1))) || (address.charAt(i) == "小" && !isNaN(address.charAt(i-1))) ){
                if (address.charAt(i-1) == 1){
                    address = address.substr(0, i-1) + '一' + address.substr(i)
                }
                if (address.charAt(i-1) == 2){
                    address = address.substr(0, i-1) + '二' + address.substr(i)
                }
                if (address.charAt(i-1) == 3){
                    address = address.substr(0, i-1) + '三' + address.substr(i)
                }
                if (address.charAt(i-1) == 4){
                    address = address.substr(0, i-1) + '四' + address.substr(i)
                }
                if (address.charAt(i-1) == 5){
                    address = address.substr(0, i-1) + '五' + address.substr(i)
                }
                if (address.charAt(i-1) == 6){
                    address = address.substr(0, i-1) + '六' + address.substr(i)
                }
                if (address.charAt(i-1) == 7){
                    address = address.substr(0, i-1) + '七' + address.substr(i)
                }
                if (address.charAt(i-1) == 8){
                    address = address.substr(0, i-1) + '八' + address.substr(i)
                }
                if (address.charAt(i-1) == 9){
                    address = address.substr(0, i-1) + '九' + address.substr(i)
                }
            }
        }
        return address;
    };

    function word_change_number(address){
        for (let i = 0; i < address.length; i++) {     
            if(address.charAt(i) == "號" && isNaN(address.charAt(i-1)) ){
                if (address.charAt(i-1) == "一"){
                    address = address.substr(0, i-1) + '1' + address.substr(i)
                }
                if (address.charAt(i-1) == '二'){
                    address = address.substr(0, i-1) + '2' + address.substr(i)
                }
                if (address.charAt(i-1) == '三'){
                    address = address.substr(0, i-1) + '3' + address.substr(i)
                }
                if (address.charAt(i-1) == '四'){
                    address = address.substr(0, i-1) + '4' + address.substr(i)
                }
                if (address.charAt(i-1) == '五'){
                    address = address.substr(0, i-1) + '5' + address.substr(i)
                }
                if (address.charAt(i-1) == '六'){
                    address = address.substr(0, i-1) + '6' + address.substr(i)
                }
                if (address.charAt(i-1) == '七'){
                    address = address.substr(0, i-1) + '7' + address.substr(i)
                }
                if (address.charAt(i-1) == '八'){
                    address = address.substr(0, i-1) + '8' + address.substr(i)
                }
                if (address.charAt(i-1) == '九'){
                    address = address.substr(0, i-1) + '9' + address.substr(i)
                }
            }
        }
        return address;
    };

    
    let full_search = function(search_word){
        if(search_word.includes("台北")){
            search_word = search_word.replace("台北", "臺北");
        }
        if(search_word.includes("台灣")){
            search_word = search_word.replace("台灣", "臺灣");
        }
        search_word = replace_full_and_symbol(search_word);
        search_word = number_change_words(search_word);
        search_word = word_change_number(search_word);
        return search_word;
    }


    //使用者搜尋他人清單，不用登入

    console.log(req.body)

    let search_word = full_search(req.body.data);

    let final_result = [];

    let search_place_result = [];

    //迴圈尋資料庫
    for (let i = 0; i<search_word.length; i++){
        //一開始用搜尋字串下去找
        let fuzzy_search_place_in_name = await dao_map.fuzzy_search_place("map","name",search_word,7);
        fuzzy_search_place_in_name.map(item =>{search_place_result.push(item)});
        let fuzzy_search_place_in_address = await dao_map.fuzzy_search_place("map","address",search_word,5);
        fuzzy_search_place_in_address.map(item =>{search_place_result.push(item)});

        //將重複的結果剃除
        final_result = removeDuplicates(search_place_result, 'map_id');
        //console.log(i);
        //當最後結果超過特定數字就停止迴圈
        if(final_result.length>5){
            break;
        }

        //從字串中刪除最後一個字開始找
        let positive_word = search_word.slice(0, -i-1);
        console.log(positive_word)
        let positive_fuzzy_select_name = await dao_map.fuzzy_search_place("map","name",positive_word,5);
        positive_fuzzy_select_name.map(item =>{search_place_result.push(item)});
        


        //從字串中刪除第一個字開始找
        let negative_word = search_word.substring(i+1);
        console.log(negative_word)
        let negative_fuzzy_select_name = await dao_map.fuzzy_search_place("map","name",positive_word,5);
        negative_fuzzy_select_name.map(item =>{search_place_result.push(item)});
        // let negative_fuzzy_select_address = await dao_map.fuzzy_search_place("map","address",positive_word,3);
        // negative_fuzzy_select_address.map(item =>{search_place_result.push(item)});

        let positive_fuzzy_select_address = await dao_map.fuzzy_search_place("map","address",positive_word,3);
        positive_fuzzy_select_address.map(item =>{search_place_result.push(item)});


        //將重複的結果剃除
        final_result = removeDuplicates(search_place_result, 'map_id');
        //console.log(i);
        //當最後結果超過特定數字就停止迴圈
        if(final_result.length>5){
            break;
        }
    } 

    //console.log(final_result)

    res.send(final_result);


});



module.exports = router;