const express = require("express"); // express 模組
const router = express.Router();  //建立 router 物件
const dao_map = require("../dao/map.js"); // dao_map.js檔
const crypto = require("crypto"); // crypto 模組
const axios = require('axios');   //讓 request 變成 promise 物件

//user input the user data from sigh_up.html and send here
router.post("/signup",async function(req,res){

    // 後端初步驗證資料是否確實填寫
    if(!(req.body.name) || !(req.body.password) || !(req.body.email)){
        res.send({error:"! 請確實填寫註冊欄位"});
        return;
    }

    //密碼加密
    let hash_password = crypto.createHash('sha256');
    hash_password.update(req.body.password);
    
    // create access token
    let hash_time = crypto.createHash('sha256');
    hash_time.update(String(Date.now()));
    let access_token = crypto.randomBytes(48).toString('hex')+hash_time.digest('hex');     

    let user_data={
        provider:"native",
        name:req.body.name,
        email:req.body.email,
        password:hash_password.digest('hex'),
        access_token:access_token
    };
    
    let check_user_name_result = await dao_map.select("user","name",user_data.name);

    if (check_user_name_result.length > 0){
        res.send({error:"! 這個使用者名稱已有人使用，請試試其他名稱。"});
        return;
    }

    let check_user_email_result = await dao_map.select_2("user","email",user_data.email,"provider",user_data.provider);

    if (check_user_email_result.length > 0){
        res.send({error:"! 這個信箱已有人使用，請試試其他信箱。"});
        return;
    }

    let insert_user_data = await dao_map.insert("user",user_data,user_data.name);

    res.send({data:user_data});
  
});
  
//user input the user data from sigh_in.html and send here
router.post("/signin",async function(req,res){


    // create new access token
    const hash_fb_time = crypto.createHash('sha256');
    hash_fb_time.update(String(Date.now()));
    let new_access_token = crypto.randomBytes(48).toString('hex')+hash_fb_time.digest('hex');


    if(req.body.provider == "facebook"){
        let user_fb_token =req.body.access_token;
        let fb =`https://graph.facebook.com/v3.3/me?fields=email,name,picture.width(400).height(500)&access_token=${user_fb_token}`;

        // request({url: fb}, async function (error, response, body) {
        //     body = JSON.parse(body);

        //     let user_data={
        //         provider:"facebook",
        //         name:body.name,
        //         email:body.email,
        //         password:"0",
        //         access_token:new_access_token
        //     };

        //     let select_user_result = await dao_map.select_2("user","email",body.email,"provider","facebook");

        //     if(select_user_result.length >= 1){
        //         let update_fb_user_result = await dao_map.update("user","email",user_data.email,user_data,user_data.name);
        //     res.send({data:user_data});
        //     }else{
        //         let insert_fb_user_result = await dao_map.insert("user",user_data,user_data.name);
        //     res.send({data:user_data});
        //     }
                
        // });

        axios.get(fb)
        .then(async function (response) {
    
            response = response.data;

            let user_data={
                provider:"facebook",
                name:response.name,
                email:response.email,
                password:"0",
                access_token:new_access_token
            };

            let check_user_data = await dao_map.select_2("user","email",user_data.email,"provider","facebook");

            if(check_user_data.length >= 1){
                let update_fb_user_result = await dao_map.update("user","email",user_data.email,user_data,user_data.name);
                res.send({data:user_data});
            }else{
                let insert_fb_user_result = await dao_map.insert("user",user_data,user_data.name);
                res.send({data:user_data});
            }

        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {
        });






    }else{

    //密碼加密後才能查詢資料庫
    const hash_password = crypto.createHash('sha256');
    hash_password.update(req.body.password);
    const crypto_passord = hash_password.digest('hex');
        
    let check_user_data = await dao_map.select_2("user","email",req.body.email,"password",crypto_passord);
    
    if(check_user_data.length == 0){
        res.send("error");
        return;
    }

    let user_data={
        email:req.body.email,
        password:crypto_passord,
        access_token:new_access_token
    };

    let update_user_result = await dao_map.update("user","email",user_data.email,user_data,user_data.email);

    res.send({data:user_data});
    
    }


});





module.exports = router;