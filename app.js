var express = require("express"); // express 模組
var app = express(); // express 模組
const crypto = require("crypto"); // crypto 模組
const mysql = require("./mysql_connection.js"); // MySQL Initialization
const crawler = require("./web_crawler.js"); // 爬蟲檔案
const dao_map = require("./dao/map.js"); // dao_map.js檔
const request = require('request'); // request 模組
const redis = require('redis');       //redis 模組
const REDIS_PORT = process.env.PORT || 6379;   //redis 建立
const client = redis.createClient(REDIS_PORT);






const NodeCache = require("node-cache"); // node-cache模組
const myCache = new NodeCache({ stdTTL: 60, checkperiod: 0 }); // node-cache模組
var bodyParser = require("body-parser"); // body-parser 模組
var path = require("path"); // path 模組
var multer = require("multer"); // multer 模組
var admin = multer({ dest: "./public" }); // multer 模組
var async = require("async"); // async模組
const https = require("https"); // https模組
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








//地圖上所有的點 及使用者收藏的點
app.post("/api/map",async function (req, res) {

 
  if(req.header('Content-Type') != "application/json"){
    var error = {
        "error": "Invalid request body."
    };
    res.send(error);
  }else{

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

    // let select_all_place = await dao_map.select("map",null,"all places");
    // data.places = select_all_place;
    // res.send(data);


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

  }
  
});

//user insert delete place in list
app.post("/api/user/map_list/place",async function(req,res){

  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{
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

  }
  
});

//send user all lists in public map
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
  }

});

//search other public lists in map
app.post("/api/user/map_list/search/list",async function(req,res){
  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{

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
  }

});

//search place in map
app.post("/api/user/map_list/search/place",async function(req,res){
  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{

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
      let positive_fuzzy_select_address = await dao_map.fuzzy_search_place("map","address",positive_word,5);
      positive_fuzzy_select_address.map(item =>{search_place_result.push(item)});
 

      //將重複的結果剃除
      final_result = removeDuplicates(search_place_result, 'map_id');
      //console.log(i);
      //當最後結果超過特定數字就停止迴圈
      if(final_result.length>5){
        break;
      }
    } 

    console.log(final_result)

    res.send(final_result);
  }

});


// 顯示其他使用者的一個清單裡的所有地點 show places of one user and one list result 
app.post("/api/user/map_list/show/list",async function(req,res){
  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{

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
  }

});

//copy public list
app.post("/api/user/map_list/copy",async function(req,res){
  if(req.header('Content-Type') != "application/json"){
      var error = {
          "error": "Invalid request body."
      };
      res.send(error);
  }else{
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


    let select_user_result = await dao_map.select("user","access_token",list_data.data.access_token)
    if(select_user_result == 0){
      let error = {
        "error": "There is no user data."
      };
      res.send(error);
      return;
    }

    let select_public_list_result = await dao_map.select("user_map_list","list_id",list_data.data.list_id)
    
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
    let select_place_in_copy_list = await dao_map.select_2("user_map_place","user_name",list_data.data.list_owner,"list_name",list_data.data.list_name);
    //console.log(select_place_in_copy_list);

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
      //console.log(insert_copy_places)
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
  }

});



app.listen(3000, function () {
  console.log("Server is running in http://localhost:3000/")
})


