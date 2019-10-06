const express = require("express"); // express 模組
const router = express.Router();  //建立 router 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔

const redis = require('redis');       //redis 模組
const REDIS_PORT = process.env.PORT || 6379;   //redis 建立
const client = redis.createClient(REDIS_PORT);
// const app = express(); // express 模組
// const mysql = require("../mysql_connection.js"); // MySQL Initialization
// const bodyParser = require("body-parser"); // body-parser 模組
// const request = require('request'); // request 模組





//地圖上所有的點 及使用者收藏的點
router.post("/map",async function (req, res) {

    let list_data = req.body;

    console.log(list_data);

    let data ={};
    let all_place_data;

    //這段先判斷使用者有無登入，有的話找出使用者收藏的地點
    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    //console.log(select_user_result.length == 0)

    if(select_user_result.length !== 0){
    let select_all_user_place = await dao_map.select("user_map_place","user_name",select_user_result[0].name);
    data.user_places =select_all_user_place;
    }


    //接著找公用地圖上所有的點，因為幾乎不會變動，所以這邊設置快取
    await client.get('all_place',async function(err, value) {
    if( !err ){
        if(!value){
        console.log("redis","沒值")
        let select_all_place = await dao_map.select("map",null,"all places");
        select_all_place = JSON.stringify(select_all_place);
        client.setex('all_place', 600, select_all_place); //記得要改回86400
        all_place_data = select_all_place;
        data.places =JSON.parse(all_place_data);
        res.send(data);
        }
        else{
        console.log("redis","有值")
        all_place_data = value;

        data.places =JSON.parse(all_place_data);
        res.send(data);
        }
    }
    })
  
    
});

//user insert update delete list
router.post("/user/map_list",async function(req,res){

    
    let list_data = req.body;

    console.log(list_data)

    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    console.log(select_user_result)

    if(select_user_result == 0){
    var error = {
        "error": "!無此使用者資訊，請登入或重新註冊"
    };
    res.send(error);
    return;
    }


    if(list_data.type == "create"){
        
    let user_list_data = {
        category : list_data.data.category,
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name,
        list_icon : list_data.data.list_icon,
        appear_list:"true",
        copy_number:0
    }
    console.log(user_list_data)

    let select_user_insert_list = await dao_map.select_2("user_map_list","list_name",user_list_data.list_name,"user_name",user_list_data.user_name);

    if(select_user_insert_list.length >0){
        var error = {
        "error": "! 清單名稱重複，請重新命名"
        };
        res.send(error);
        return;
    }

    let insert_user_list_data = await dao_map.insert("user_map_list",user_list_data,user_list_data.user_name);

    res.send({success:"insert list OK"});

    }else if(list_data.type == "update"){

    let user_list_data = {
        list_id : list_data.data.list_id,
        category : list_data.data.category,
        user_name : select_user_result[0].name,
        list_icon : list_data.data.list_icon
    }
    
    if(list_data.data.list_name != undefined){
        user_list_data.list_name = list_data.data.list_name
        let select_user_insert_list = await dao_map.select_2("user_map_list","list_name",user_list_data.list_name,"user_name",user_list_data.user_name);

        if(select_user_insert_list.length >0){
        var error = {
            "error": "! 清單名稱重複，請重新命名"
        };
        res.send(error);
        return;
        }
    }
    
    console.log(user_list_data);
    
    let update_user_list_name = await dao_map.update("user_map_list","list_id",user_list_data.list_id,user_list_data,user_list_data.user_name);

    let select_update_list = await dao_map.select_2("user_map_list","list_id",user_list_data.list_id,"user_name",user_list_data.user_name);
    console.log(select_update_list);
    res.send({success:"update OK",data:select_update_list});
    
    }else if(list_data.type == "update_appear"){

    let user_list_data = {
        list_id : list_data.data.list_id,
        list_name : list_data.data.list_name,
        user_name : select_user_result[0].name,
        appear_list :`${list_data.data.appear_list}`
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
    }else{
    let user_list_data = {
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name
    }

    //先找出清單是否真的存在
    let select_user_delete_list = await dao_map.select("user_map_list","list_name",user_list_data.list_name);

    if(select_user_delete_list.length == 0){
        var error = {
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



    let delete_user_list_name = await dao_map.delete("user_map_list","list_id",list_data.data.list_id,user_list_data.user_name)

    res.send({success:"delete OK",data:select_user_delete_place});
    }
  
    
    
});
  
//user insert delete place in list
router.post("/user/map_list/place",async function(req,res){


    let list_data = req.body;

    console.log(1,list_data);

    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    if(select_user_result == 0){
    var error = {
        "error": "!無此使用者資訊，請登入或重新註冊"
    };
    res.send(error);
    return;
    }

    if(list_data.type == "create"){
    
    let user_list_data = {
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name,
        place_name :list_data.data.place_name,
        place_order :list_data.data.place_order
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

    let insert_user_place_data = await dao_map.insert("user_map_place",user_list_data,user_list_data.user_name);

    let last_place_id = await dao_map.select_last_insert_id()

    let select_user_last_place = await dao_map.select("user_map_place","No",last_place_id[0]["LAST_INSERT_ID()"]);

    let data={
        place_in_this_list:select_user_last_place,
    }

    //console.log(select_user_last_place)
    res.send(select_user_last_place);




    // let user_list_data = {
    //   user_name : select_user_result[0].name,
    //   list_name : list_data.data.list_name,
    //   place_name :list_data.data.place_name,
    //   place_order :list_data.data.place_order,
    //   longitude : list_data.data.longitude,
    //   latitude : list_data.data.latitude,
    //   information :list_data.data.information
    // };

    // console.log(user_list_data)
    
    // let select_user_insert_place = await dao_map.select_3("user_map_place","user_name",user_list_data.user_name,"place_name",user_list_data.place_name,"list_name",user_list_data.list_name);
    
    // console.log(select_user_insert_place)
    
    // if(select_user_insert_place.length >0){
    //   var error = {
    //     "error": "此地點已收藏"
    //   };
    //   res.send(error);
    //   return;
    // }

    // let select_list_icon_and_appear = await dao_map.select_2("user_map_list","user_name",user_list_data.user_name,"list_name",user_list_data.list_name)

    // console.log(select_list_icon_and_appear);

    // user_list_data.list_icon = select_list_icon_and_appear[0].list_icon;
    // user_list_data.appear_list = select_list_icon_and_appear[0].appear_list;

    // let insert_user_place_data = await dao_map.insert("user_map_place",user_list_data,user_list_data.user_name);

    // let last_place_id = await dao_map.select_last_insert_id()

    // let select_user_last_place = await dao_map.select("user_map_place","No",last_place_id[0]["LAST_INSERT_ID()"]);

    // let data={
    //   place_in_this_list:select_user_last_place,
    // }

    // console.log(select_user_last_place)
    // res.send(select_user_last_place);


    }else if(list_data.type == "select"){
    let user_list_data = {
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name
    }
    console.log(user_list_data)
    let select_user_list_place = await dao_map.select("user_map_place","list_name",user_list_data.list_name);

    res.send(select_user_list_place);
    
    }else{

    console.log(list_data);

    let user_list_data = {
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name,
        place_name : list_data.data.place_name
    }

    console.log(user_list_data);

    let delete_user_list_name = await dao_map.delete_3("user_map_place","user_name",user_list_data.user_name,"list_name",user_list_data.list_name,"place_name",user_list_data.place_name,user_list_data.place_name)

    let check_place_is_exist = await dao_map.select_2("user_map_place","user_name",user_list_data.user_name,"place_name",user_list_data.place_name)
    console.log("確認存在與否")
    console.log(check_place_is_exist)


    res.send({
        success:"delete OK",
        check_place_is_exist:check_place_is_exist.length
    });
    

}

});

//send user all lists in public map
router.post("/user/map_list/result",async function(req,res){

    let list_data = req.body;

    console.log(list_data);

    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    if(select_user_result == 0){
    var error = {
        "error": "!查無此使用者，請重新註冊"
    };
    res.send(error);
    return;
    }

    let select_place_in_list = await dao_map.select_2("user_map_place","user_name",select_user_result[0].name,"place_name",list_data.data.place_name);

    console.log(select_place_in_list);

    let select_all_list = await dao_map.select_order_by("user_map_list","user_name",select_user_result[0].name,"list_id");

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