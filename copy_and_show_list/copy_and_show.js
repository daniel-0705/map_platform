const express = require("express"); // express 模組
const router = express.Router();  //建立 router 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔



// 顯示其他使用者的一個清單裡的所有地點 show places of one user and one list result 
router.post("/show/list",async function(req,res){
    
  
    //使用者搜尋他人清單，不用登入

    let list_data = req.body;

    console.log(list_data);

    let find_list_user = await dao_map.select_2("user_map_list","list_id",list_data.data.list_id,"list_name",list_data.data.list_name)

    if(find_list_user.length == 0){
    var error = {
        "error": "該清單已被刪除，無法顯示，請再重新搜尋"
    };
    res.send(error);
    return;
    }

    console.log(find_list_user)

    let one_list_result = await dao_map.select_2("user_map_place","user_name",find_list_user[0].user_name,"list_name",list_data.data.list_name)

    console.log(one_list_result)
    res.send({user_list:find_list_user,user_list_place:one_list_result});
    
  
  });
  
//copy public list
router.post("/copy",async function(req,res){

    let list_data = req.body;

    console.log(list_data);
    console.log(list_data.data.list_name.includes("(複製)"))
    if(list_data.data.list_name.includes("(複製)")){
    let error = {
        "error": "! 請先編輯您手上的複製清單，再進行複製"
    };
    res.send(error);
    return;
    }

    //確認使用者的身分
    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    if(select_user_result == 0){
        let error = {
            "error": "! 查無此使用者，請重新註冊"
        };
        res.send(error);
        return;
    }


    let select_public_list_result = await dao_map.select("user_map_list","list_id",list_data.data.list_id)
    console.log("原清單擁有者",select_public_list_result);
    
    let insert_copy_list = {
        category : "true",
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name+"(複製)",
        list_icon : select_public_list_result[0].list_icon,
        appear_list : "true",
        copy_number : 0
    }

    //先確認使用者清單沒有與複製清單名稱重複
    let select_copy_list_in_user = await dao_map.select_2("user_map_list","user_name",insert_copy_list.user_name,"list_name",insert_copy_list.list_name);
    console.log(insert_copy_list);
    console.log(select_copy_list_in_user);
    if (select_copy_list_in_user != 0){
        let error = {
            "error": "! 複製清單名稱與您的清單名稱重複，請更改名稱"
        };
        res.send(error);
        return;
    }

    //新增複製的清單到使用者中
    let insert_copy_list_in_user = await dao_map.insert("user_map_list",insert_copy_list,insert_copy_list.user_name);
    //搜尋被複製的清單裡的地點
    let select_place_in_copy_list = await dao_map.select_2("user_map_place","user_name",select_public_list_result[0].user_name,"list_name",list_data.data.list_name);
    console.log("被複製的點",select_place_in_copy_list);

    //新增複製的地點到使用者中
    for(let i =0; i<select_place_in_copy_list.length;i++){

        let insert_copy_places = {
            user_name : select_user_result[0].name,
            list_name : list_data.data.list_name+"(複製)",
            list_icon : select_place_in_copy_list[i].list_icon,
            appear_list : select_place_in_copy_list[i].appear_list,
            place_name : select_place_in_copy_list[i].place_name,
            place_order : select_place_in_copy_list[i].place_order,
            longitude : select_place_in_copy_list[i].longitude,
            latitude : select_place_in_copy_list[i].latitude,
            information : select_place_in_copy_list[i].information
        }
        console.log("555",insert_copy_places)
        let insert_copy_places_in_user = await dao_map.insert("user_map_place",insert_copy_places,insert_copy_places.place_name)
    }
    
    //新增被複製名單的追蹤者

    let copy_from_who = {
        list_id : list_data.data.list_id,
        copy_user_name : select_user_result[0].name
    }
    let insert_copy_user_in_public_list = await dao_map.insert("user_map_copy",copy_from_who,copy_from_who.list_id)
    //更新被複製名單的複製數量
    let select_owner_list = await dao_map.select_2("user_map_list","list_id",list_data.data.list_id,"list_name",list_data.data.list_name)

    console.log(select_owner_list)

    let update_owner = {
        list_id : select_owner_list[0].list_id,
        category : select_owner_list[0].category,
        user_name : select_owner_list[0].user_name,
        list_name : select_owner_list[0].list_name,
        copy_number : select_owner_list[0].copy_number+1,
    }

    let update_owner_list = await dao_map.update("user_map_list","list_id",select_owner_list[0].list_id,update_owner,update_owner.list_id)

    //將使用者的複製清單裡面的地點找出來傳給前端
    let select_place_of_copy_list = await dao_map.select_2("user_map_place","user_name",insert_copy_list.user_name,"list_name",insert_copy_list.list_name);

    res.send({success:"copy OK",data:select_place_of_copy_list})


});



module.exports = router;
