const express = require("express"); // express 模組
const app = express(); // express 模組

const mysql = require("./mysql_connection.js"); // MySQL Initialization
const dao_map = require("./dao/map.js"); // dao_map.js檔
const redis = require('redis');       //redis 模組
const REDIS_PORT = process.env.PORT || 6379;   //redis 建立
const client = redis.createClient(REDIS_PORT);
const bodyParser = require("body-parser"); // body-parser 模組

const router = express.Router();  //建立 router 物件

const map_list_place = require("./map_list_place/map.js");
const user = require("./user/user.js");
const search = require("./search/search.js");
const copy_and_show = require("./copy_and_show_list/copy_and_show.js");

// var path = require("path"); // path 模組
// var admin = multer({ dest: "./public" }); // multer 模組
// var async = require("async"); // async模組
// const https = require("https"); // https模組
//const request = require('request'); // request 模組

// 靜態檔案 模組
app.use("/", express.static("public"));

// 為了可以讀取header裡面的內容
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



let check_header_type = function (req,res,next){

  if(req.header('Content-Type') != "application/json"){
    var error = {
      "error": "Invalid request body."
    };
    res.send(error);
  }else{
    console.log("OKOK");
    next();
  }
}

app.use(check_header_type);   //middleware



// 分出去的 router
app.use('/api', map_list_place);
app.use('/api/user', user);
app.use('/api/user/map_list/search', search);
app.use('/api/user/map_list', copy_and_show);

app.listen(3000, function () {
  console.log("Server is running in http://localhost:3000/")
})


