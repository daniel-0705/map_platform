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
app.get("/", function (req, res) {
  res.send("OK");
});

//currently for test
app.get("/api/map",async function (req, res) {

  let select_all_place = await dao_map.select("map",null,"all places");

  res.send(select_all_place);

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
          
          // var fb = `https://graph.facebook.com/v3.3/me?access_token=${user_fb_token}&fields=name,email,picture%7Burl%7D&method=get&pretty=0&sdk=joey&suppress_http_code=1`;
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

app.listen(3000, function () {
  console.log("Server is running in http://localhost:3000/")
})
