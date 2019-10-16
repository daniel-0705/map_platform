const express = require("express"); // express 模組
const router = express.Router();  //建立 router 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔
const mysql=require("../mysql_connection.js");                       // MySQL Initialization



  
//copy public list
router.post("/",async function(req,res){
    let list_data = req.body.data;
    let user_data = req.user[0];

    if(list_data.list_name.includes("(複製)")){
        let error = {
            "error": "! 請先編輯您手上的複製清單，再進行複製。"
        };
        res.send(error);
        return;
    }

    mysql.con.beginTransaction(async function(err) {
        try {
            if(err) { 
                throw err;
            }

            let select_public_list_result = await dao_map.select("user_map_list","list_id",list_data.list_id);
            
            let insert_copy_list = {
                category: "true",
                user_name: user_data.name,
                list_name: list_data.list_name + "(複製)",
                list_icon: select_public_list_result[0].list_icon,
                appear_list: select_public_list_result[0].appear_list,
                copy_number: 0
            }

            //先確認使用者清單沒有與複製清單名稱重複
            let select_copy_list_in_user = await dao_map.select_2("user_map_list","user_name",insert_copy_list.user_name,"list_name",insert_copy_list.list_name);
            
            if(select_copy_list_in_user != 0){
                let error = {
                    "error": "! 複製清單名稱與您的清單名稱重複，請更改名稱。"
                };
                res.send(error);
                return;
            }

            //新增複製的清單到使用者中
            //insert_copy_list_in_user 
            await dao_map.insert("user_map_list",insert_copy_list,insert_copy_list.user_name);
            
            //搜尋被複製的清單裡的地點
            let select_place_in_copy_list = await dao_map.select_2("user_map_place","user_name",select_public_list_result[0].user_name,"list_name",list_data.list_name);
            
            //新增複製的地點到使用者中
            for(let i =0; i<select_place_in_copy_list.length;i++){

                let insert_copy_places = {
                    user_name: user_data.name,
                    list_name: list_data.list_name + "(複製)",
                    list_icon: select_place_in_copy_list[i].list_icon,
                    appear_list: String(select_place_in_copy_list[i].appear_list),
                    place_name: select_place_in_copy_list[i].place_name,
                    place_order: select_place_in_copy_list[i].place_order,
                    longitude: select_place_in_copy_list[i].longitude,
                    latitude: select_place_in_copy_list[i].latitude,
                    information: select_place_in_copy_list[i].information
                }
                //insert_copy_places_in_user 
                await dao_map.insert("user_map_place",insert_copy_places,insert_copy_places.place_name);
            }
            
            //新增被複製名單的追蹤者

            let copy_from_who = {
                list_id: list_data.list_id,
                copy_user_name: user_data.name
            }
            //insert_copy_user_in_public_list 
            await dao_map.insert("user_map_copy",copy_from_who,copy_from_who.list_id);
            
            //更新被複製名單的複製數量
            let select_owner_list = await dao_map.select_2("user_map_list","list_id",list_data.list_id,"list_name",list_data.list_name);

            let update_owner = {
                list_id: select_owner_list[0].list_id,
                category: select_owner_list[0].category,
                user_name: select_owner_list[0].user_name,
                list_name: select_owner_list[0].list_name,
                copy_number: select_owner_list[0].copy_number + 1,
            }

            //update_owner_list 
            await dao_map.update("user_map_list","list_id",select_owner_list[0].list_id,update_owner,update_owner.list_id);

            //將使用者的複製清單裡面的地點找出來傳給前端
            let select_place_of_copy_list = await dao_map.select_2("user_map_place","user_name",insert_copy_list.user_name,"list_name",insert_copy_list.list_name);

            mysql.con.commit(function(err) {
                if (err) {
                    throw err;
                }
            });

            res.send({success: "copy OK",data: select_place_of_copy_list})

        }
        catch(err) {
            mysql.con.rollback(function(){console.log(`交易取消`)});
            res.send({error:"! 系統出現錯誤，請重新整理。"});
        }
    });


});



module.exports = router;
