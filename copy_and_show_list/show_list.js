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
        "error": "! 該清單已被刪除，無法顯示，請再重新搜尋"
    };
    res.send(error);
    return;
    }

    console.log(find_list_user)

    let one_list_result = await dao_map.select_2("user_map_place","user_name",find_list_user[0].user_name,"list_name",list_data.data.list_name)

    console.log(one_list_result)
    res.send({user_list:find_list_user,user_list_place:one_list_result});
    
  
});
  




module.exports = router;
