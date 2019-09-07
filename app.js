var express = require("express"); // express 模組
var app = express(); // express 模組
const crypto = require("crypto"); // crypto 模組
const mysql = require("./mysql_connection.js"); // MySQL Initialization
const crawler = require("./web_crawler.js"); // 爬蟲檔案
const dao_map = require("./dao/map.js"); // dao_map.js檔
const request = require('request'); // request 模組

var bodyParser = require("body-parser"); // body-parser 模組
var path = require("path"); // path 模組
var multer = require("multer"); // multer 模組
var admin = multer({ dest: "./public" }); // multer 模組
var async = require("async"); // async模組
const https = require("https"); // https模組
const NodeCache = require("node-cache"); // node-cache模組
const myCache = new NodeCache({ stdTTL: 60, checkperiod: 0 }); // node-cache模組
var aws = require("aws-sdk"); // Multer S3模組
var multerS3 = require("multer-s3"); // Multer S3模組

// configuring the AWS environment
aws.config.update({
  accessKeyId: "",
  secretAccessKey: "",
  region: ""
});

var s3 = new aws.S3(); // Multer S3模組 接在configuring the AWS environment後面
// multer 模組
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, (path.join(__dirname +'/public')))
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now()+".jpg")
//     }
//   });

// multer S3 模組
var admin = multer({
  storage: multerS3({
    s3: s3,
    bucket: "daniel0705",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg")
    }
  })
});

// 靜態檔案 模組
app.use("/", express.static("public"));
// 為了可以讀取header裡面的內容
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// just test outcome
app.get("/test", function (req, res) {
  res.send("OK");
});

// just test outcome
app.post("/test", function (req, res) {
  res.send("OK");
});


//currently for test 地圖上所有的點 及使用者收藏的點
app.post("/api/map",async function (req, res) {


  if(req.header('Content-Type') != "application/json"){
    var error = {
        "error": "Invalid request body."
    };
    res.send(error);
  }else{

    let list_data = req.body;

    console.log(list_data)
    
    let select_all_place = await dao_map.select("map",null,"all places");

    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    //console.log(select_user_result.length == 0)
    
    let data ={};
  
    if(select_user_result.length == 0){
      data.places =select_all_place;
      res.send(data);
      //console.log(data)
    }else{
      
      let select_all_user_place = await dao_map.select("user_map_place","user_name",select_user_result[0].name);
      data.places =select_all_place;
      data.user_places =select_all_user_place;
      res.send(data);
    }
  
    
  }





  

});

//user input the user data from sigh_up.html and send here
app.post("/api/user/signup",async function(req,res){

  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{
       
      //密碼加密
      let hash_password = crypto.createHash('sha256');
      hash_password.update(req.body.password);
      
      // create access token
      let hash_time = crypto.createHash('sha256');
      hash_time.update(String(Date.now()));
      var access_token = crypto.randomBytes(48).toString('hex')+hash_time.digest('hex');     

      let user_data={
          provider:"native",
          name:req.body.name,
          email:req.body.email,
          password:hash_password.digest('hex'),
          access_token:access_token
      };
      
      let select_user_name_result = await dao_map.select("user","name",user_data.name);

      if (select_user_name_result.length > 0){
        res.send({error:"name duplicate"});
        return;
      }

      let select_user_email_result = await dao_map.select_2("user","email",user_data.email,"provider",user_data.provider);

      if (select_user_email_result.length > 0){
        res.send({error:"email duplicate"});
        return;
      }

      let insert_user_result = await dao_map.insert("user",user_data,user_data.name);

      res.send({data:user_data});
      
  }

});

//user input the user data from sigh_in.html and send here
app.post("/api/user/signin",async function(req,res){

  if(req.header('Content-Type') != "application/json"){
    var error = {
        "error": "Invalid request body."
    };
    res.send(error);
  }else{
    // create new access token
    const hash_fb_time = crypto.createHash('sha256');
    hash_fb_time.update(String(Date.now()));
    var new_access_token = crypto.randomBytes(48).toString('hex')+hash_fb_time.digest('hex');

    if(req.body.provider == "facebook"){
          var user_fb_token =req.body.access_token;
          var fb =`https://graph.facebook.com/v3.3/me?fields=email,name,picture.width(400).height(500)&access_token=${user_fb_token}`;

          request({url: fb}, async function (error, response, body) {
            body = JSON.parse(body);

            let user_data={
              provider:"facebook",
              name:body.name,
              email:body.email,
              password:"0",
              access_token:new_access_token
            };

            let select_user_result = await dao_map.select_2("user","email",body.email,"provider","facebook");

            if(select_user_result.length >= 1){
              let update_fb_user_result = await dao_map.update("user","email",user_data.email,user_data,user_data.name);
              res.send({data:user_data});
            }else{
              let insert_fb_user_result = await dao_map.insert("user",user_data,user_data.name);
              res.send({data:user_data});
            }
               
          });

    }else{

      //密碼加密後才能查詢資料庫
      const hash_password = crypto.createHash('sha256');
      hash_password.update(req.body.password);
      const crypto_passord = hash_password.digest('hex');
          
      let select_user_result = await dao_map.select_2("user","email",req.body.email,"password",crypto_passord);
      
      if(select_user_result.length == 0){
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
  }

});

//user insert update delete list
app.post("/api/user/map_list",async function(req,res){

  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{
    let list_data = req.body;

    console.log(list_data)
    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    console.log(select_user_result)
    if(select_user_result == 0){
      var error = {
        "error": "There is no user data."
      };
      res.send(error);
      return;
    }


    if(list_data.type == "create"){
        
      let user_list_data = {
        category : list_data.data.category,
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name,
      }

      console.log(user_list_data)

      let select_user_insert_list = await dao_map.select("user_map_list","list_name",user_list_data.list_name);

      if(select_user_insert_list.length >0){
        var error = {
          "error": "List name is duplicate."
        };
        res.send(error);
        return;
      }

      let insert_user_list_data = await dao_map.insert("user_map_list",user_list_data,user_list_data.user_name);

      let last_list_id = await dao_map.select_last_insert_id()

      let select_user_last_list = await dao_map.select("user_map_list","list_id",last_list_id[0]["LAST_INSERT_ID()"]);

      res.send(select_user_last_list);

    }else if(list_data.type == "update"){
      let user_list_data = {
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name
      }

      let select_user_insert_list = await dao_map.select("user_map_list","list_name",user_list_data.list_name);

      if(select_user_insert_list.length >0){
        var error = {
          "error": "List name is duplicate."
        };
        res.send(error);
        return;
      }

      let update_user_list_name = await dao_map.update("user_map_list","list_id",list_data.data.list_id,user_list_data,user_list_data.user_name)

      res.send({success:"update OK"});
      
    }else{
      let user_list_data = {
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name
      }

      let select_user_insert_list = await dao_map.select("user_map_list","list_name",user_list_data.list_name);

      if(select_user_insert_list.length == 0){
        var error = {
          "error": "List is not existing."
        };
        res.send(error);
        return;
      }

      let delete_user_list_name = await dao_map.delete("user_map_list","list_id",list_data.data.list_id,user_list_data.user_name)

      res.send({success:"delete OK"});
    }

  }
  
});

//user insert update delete place in list
app.post("/api/user/map_list/place",async function(req,res){

  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{
    let list_data = req.body;

    console.log(list_data);

    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    if(select_user_result == 0){
      var error = {
        "error": "There is no user data."
      };
      res.send(error);
      return;
    }
 

    if(list_data.type == "create"){
        
      let user_list_data = {
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name,
        place_name :list_data.data.place_name,
        place_order :list_data.data.place_order,
        longitude : list_data.data.longitude,
        latitude : list_data.data.latitude
      }

      console.log(user_list_data)
      let select_user_insert_place = await dao_map.select_3("user_map_place","user_name",user_list_data.user_name,"place_name",user_list_data.place_name,"list_name",user_list_data.list_name);
      console.log(select_user_insert_place)
      if(select_user_insert_place.length >0){
        var error = {
          "error": "place name is duplicate."
        };
        res.send(error);
        return;
      }

      let insert_user_place_data = await dao_map.insert("user_map_place",user_list_data,user_list_data.user_name);

      let last_place_id = await dao_map.select_last_insert_id()

      let select_user_last_place = await dao_map.select("user_map_place","No",last_place_id[0]["LAST_INSERT_ID()"]);

      res.send(select_user_last_place);

    }else if(list_data.type == "select"){
      let user_list_data = {
        user_name : select_user_result[0].name,
        list_name : list_data.data.list_name
      }
      console.log(user_list_data)
      let select_user_list_place = await dao_map.select("user_map_place","list_name",user_list_data.list_name);

      res.send(select_user_list_place);
      
    }
    //else{
    //   let user_list_data = {
    //     user_name : select_user_result[0].name,
    //     list_name : list_data.data.list_name
    //   }

    //   let select_user_insert_list = await dao_map.select("user_map_list","list_name",user_list_data.list_name);

    //   if(select_user_insert_list.length == 0){
    //     var error = {
    //       "error": "List is not existing."
    //     };
    //     res.send(error);
    //     return;
    //   }

    //   let delete_user_list_name = await dao_map.delete("user_map_list","list_id",list_data.data.list_id,user_list_data.user_name)

    //   res.send({success:"delete OK"});
    // }

  }
  
});



//all place in public map
app.post("/api/user/map_list/result",async function(req,res){
  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{
    let list_data = req.body;

    console.log(list_data);

    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    if(select_user_result == 0){
      var error = {
        "error": "There is no user data."
      };
      res.send(error);
      return;
    }

    let select_all_list = await dao_map.select("user_map_list","user_name",select_user_result[0].name);
    res.send(select_all_list);
  }

});


app.listen(3000, function () {
  console.log("Server is running in http://localhost:3000/")
})




	
