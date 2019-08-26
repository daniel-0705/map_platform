var express=require("express");                     //express 模組
var app=express();                                  //express 模組
var bodyParser = require('body-parser');            //body-parser 模組
var path = require('path');                          //path 模組
var multer  = require('multer');                  //multer 模組
var admin = multer({ dest: './public' });        //multer 模組
var request = require('request');             //request 模組
var async = require('async');                 //async模組
const crypto = require('crypto');              //crypto 模組
const https = require('https')                 //https模組
const NodeCache = require( "node-cache" );    //node-cache模組
const myCache = new NodeCache({stdTTL: 60, checkperiod: 0});                //node-cache模組
var aws = require('aws-sdk')                     //Multer S3模組
var multerS3 = require('multer-s3')              //Multer S3模組


//configuring the AWS environment
aws.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    region:""
});

var s3 = new aws.S3()        //Multer S3模組 接在configuring the AWS environment後面
//multer 模組
// var storage = multer.diskStorage({                         
//     destination: function (req, file, cb) {
//       cb(null, (path.join(__dirname +'/public')))
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now()+".jpg")
//     }
//   });

//multer S3 模組
var admin= multer({
    storage: multerS3({
        s3: s3,
        bucket: 'daniel0705',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()+".jpg")
        }
    }) 
});


//靜態檔案 模組
app.use('/',express.static('public'));
//為了可以讀取header裡面的內容
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// DataBase connect
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "94720705",
    database: "test",
    multipleStatements: true
});

connection.connect(function(err) {
    if (err) {
        console.log('connecting database error');
        return;
    }
    console.log('connecting database success');
});







//just test outcome
app.get("/",function(req,res){
    res.send("kk")
});

app.post("/test",function(req,res){

})



app.listen(3000,function(){
    console.log("Server is running in http://localhost:3000/")
});