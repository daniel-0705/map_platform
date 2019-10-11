const express = require("express"); // express 模組
const router = express.Router();  //建立 router 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔

// const app = express(); // express 模組
// const mysql = require("../mysql_connection.js"); // MySQL Initialization
// const bodyParser = require("body-parser"); // body-parser 模組
// const request = require('request'); // request 模組





//user insert update list
router.post("/list",async function(req,res){
    console.log("新增清單")

    let list_data = req.body.data;
    let user_data = req.user[0];

    console.log(list_data)

    let user_list_data = {
        category : list_data.category,
        user_name : user_data.name,
        list_name : list_data.list_name,
        list_icon : list_data.list_icon,
        appear_list:"true",
        copy_number:0
    }
    console.log(user_list_data)

    let select_user_insert_list = await dao_map.select_2("user_map_list","list_name",user_list_data.list_name,"user_name",user_list_data.user_name);

    if(select_user_insert_list.length >0){
        let error = {
            "error": "! 清單名稱重複，請重新命名"
        };
        res.send(error);
        return;
    }

    // insert_user_list_data
    await dao_map.insert("user_map_list",user_list_data,user_list_data.user_name);

    res.send({success:"insert list OK"});
});

//user update list
router.put("/list",async function(req,res){

    console.log("更新清單")

    let list_data = req.body.data;
    let user_data = req.user[0];

    console.log(list_data)

    let user_list_data = {
        list_id : list_data.list_id,
        category : list_data.category,
        user_name : user_data.name,
        list_icon : list_data.list_icon
    }
    
    if(list_data.list_name != undefined){
        user_list_data.list_name = list_data.list_name
        let select_user_insert_list = await dao_map.select_2("user_map_list","list_name",user_list_data.list_name,"user_name",user_list_data.user_name);

        if(select_user_insert_list.length >0){
        let error = {
            "error": "! 清單名稱重複，請重新命名"
        };
        res.send(error);
        return;
        }
    }
    
    console.log(user_list_data);
    
    // update_user_list_name
    await dao_map.update("user_map_list","list_id",user_list_data.list_id,user_list_data,user_list_data.user_name);

    let select_update_list = await dao_map.select_2("user_map_list","list_id",user_list_data.list_id,"user_name",user_list_data.user_name);
    console.log(select_update_list);

    let select_all_user_place = await dao_map.select("user_map_place","user_name",user_list_data.user_name);


    res.send({success:"update OK",data:select_all_user_place});
    
   
    
});

//user update list appear
router.put("/list/appear",async function(req,res){

    console.log("更新清單顯示")

    let list_data = req.body.data;
    let user_data = req.user[0];

    console.log(list_data)

    let user_list_data = {
        list_id : list_data.list_id,
        list_name : list_data.list_name,
        user_name : user_data.name,
        appear_list :`${list_data.appear_list}`
    }
    console.log(user_list_data);

    //更新清單的顯示資料
    let update_user_list = await dao_map.update("user_map_list","list_id",user_list_data.list_id,user_list_data,user_list_data.user_name);
    //將該清單的地點全部抓出來
    let select_user_update_place = await dao_map.select_2("user_map_place","list_name",user_list_data.list_name,"user_name",user_list_data.user_name);

    //尋找該清單的地點是否存在在其他清單中，並且要是 true 的狀態
    for(let i = 0 ; i< select_user_update_place.length ; i++){

        let select_place_is_exist_other_list = await dao_map.select_3("user_map_place","place_name",select_user_update_place[i].place_name,"user_name",user_list_data.user_name,"appear_list","true");

        select_user_update_place[i].place_is_exist = select_place_is_exist_other_list.length;

    }

    console.log(select_user_update_place);


    res.send({success:`update ${user_list_data.appear_list}`,data:select_user_update_place});
    
    
});

//user delete list
router.delete("/list",async function(req,res){
    console.log("刪除清單")

    let list_data = req.body.data;
    let user_data = req.user[0];

    console.log(list_data)

    let user_list_data = {
        user_name : user_data.name,
        list_name : list_data.list_name
    }

    //先找出清單是否真的存在
    let select_user_delete_list = await dao_map.select("user_map_list","list_name",user_list_data.list_name);

    if(select_user_delete_list.length == 0){
        let error = {
            "error": "List is not existing."
        };
        res.send(error);
        return;
    }

    //先將要刪除的清單所收藏的地點先找出來
    let select_user_delete_place = await dao_map.select_2("user_map_place","list_name",user_list_data.list_name,"user_name",user_list_data.user_name);

    //尋找該清單的地點是否存在在其他清單中，並且要是 true 的狀態
    for(let i = 0 ; i< select_user_delete_place.length ; i++){

        let select_place_is_exist_other_list = await dao_map.select_3("user_map_place","place_name",select_user_delete_place[i].place_name,"user_name",user_list_data.user_name,"appear_list","true");

        //排除自己
        if(select_user_delete_place[i].appear_list == "true"){
            select_user_delete_place[i].place_is_exist = select_place_is_exist_other_list.length-1;
        }

    }
    // delete_user_list_name
    await dao_map.delete("user_map_list","list_id",list_data.list_id,user_list_data.user_name)

    res.send({success:"delete OK",data:select_user_delete_place});
    
});

//user insert place in list
router.post("/place",async function(req,res){

    let list_data = req.body.data;
    let user_data = req.user[0];

    console.log(1,list_data);

    let user_list_data = {
        user_name : user_data.name,
        list_name : list_data.list_name,
        place_name :list_data.place_name,
        place_order :list_data.place_order
    };

    let select_user_insert_place = await dao_map.select_3("user_map_place","user_name",user_list_data.user_name,"place_name",user_list_data.place_name,"list_name",user_list_data.list_name);
    
    console.log(select_user_insert_place);
    
    if(select_user_insert_place.length >0){
        var error = {
        "error": "此地點已收藏"
        };
        res.send(error);
        return;
    }

    //將目標清單的圖案跟顯示與否 抓出來 並存入使用者收藏的地點中
    let select_list_icon_and_appear = await dao_map.select_2("user_map_list","user_name",user_list_data.user_name,"list_name",user_list_data.list_name)

    //console.log(select_list_icon_and_appear);

    user_list_data.list_icon = select_list_icon_and_appear[0].list_icon;
    user_list_data.appear_list = select_list_icon_and_appear[0].appear_list;

    //把欲存的地點的經緯度及資訊抓出來 並存入使用者收藏的地點中
    let select_map_place = await dao_map.select("map","name",user_list_data.place_name);

    user_list_data.latitude = select_map_place[0].latitude;
    user_list_data.longitude = select_map_place[0].longitude;
    user_list_data.information = select_map_place[0].information;

    //console.log(user_list_data)

    // insert_user_place_data
    await dao_map.insert("user_map_place",user_list_data,user_list_data.user_name);

    let last_place_id = await dao_map.select_last_insert_id()

    let select_user_last_place = await dao_map.select("user_map_place","No",last_place_id[0]["LAST_INSERT_ID()"]);

    //console.log(select_user_last_place)
    res.send(select_user_last_place);



});

//user select place in list
router.post("/place/show",async function(req,res){

    let list_data = req.body.data;
    let user_data = req.user[0];

    console.log("顯示清單地點",list_data);


    let user_list_data = {
        user_name : user_data.name,
        list_name : list_data.list_name
    }
    console.log(user_list_data)
    let select_user_list_place = await dao_map.select("user_map_place","list_name",user_list_data.list_name);

    res.send(select_user_list_place);
    
    

});

//user delete in list
router.delete("/place",async function(req,res){
    console.log("刪除地點")

    let list_data = req.body.data;
    let user_data = req.user[0];

    console.log(list_data);

    let user_list_data = {
        user_name : user_data.name,
        list_name : list_data.list_name,
        place_name : list_data.place_name
    }

    console.log(user_list_data);

    // delete_user_list_name
    await dao_map.delete_3("user_map_place","user_name",user_list_data.user_name,"list_name",user_list_data.list_name,"place_name",user_list_data.place_name,user_list_data.place_name);

    let check_place_is_exist = await dao_map.select_2("user_map_place","user_name",user_list_data.user_name,"place_name",user_list_data.place_name);
    console.log("確認存在與否")
    console.log(check_place_is_exist)


    res.send({
        success:"delete OK",
        check_place_is_exist:check_place_is_exist.length
    });

});

//send user all lists in public map
router.post("/result",async function(req,res){

    let list_data = req.body;
    let user_data = req.user[0];

    console.log(list_data);

    let select_place_in_list = await dao_map.select_2("user_map_place","user_name",user_data.name,"place_name",list_data.data.place_name);

    console.log(select_place_in_list);

    let select_all_list = await dao_map.select_order_by("user_map_list","user_name",user_data.name,"list_id");

    for (let i =0 ; i <select_place_in_list.length ; i++ ){
        for (let j =0 ; j <select_all_list.length ; j++ ){

            if(select_place_in_list[i].list_name == select_all_list[j].list_name){
            select_all_list[j].check_place_is_exist = "true"
            }
        }
    }

    console.log(select_all_list)

    res.send(select_all_list);


});






module.exports = router;