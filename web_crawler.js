const schedule = require('node-schedule');                          //node-schedule 模組，可定時執行
const puppeteer = require('puppeteer');                             //爬蟲套件 puppeteer 模組
const request = require('request');                                 // request 模組
const mysql=require("./mysql_connection.js");                       // MySQL Initialization
const googleMapsClient = require('@google/maps').createClient({     //google 可用 gecoding 功能
    key: 'AIzaSyAkK5NajaFKNXkYT2WsdB96edSWRo5kYhY',
    Promise: Promise
});

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

var on_schedule = schedule.scheduleJob('0 0 0 1 1 */1', function(){

    // 政府資料開放平台 博物館
    request({
        url:"https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=H",
        method:"GET"
        },function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                data = JSON.parse(body);
    
                function sleep (time) {
                    return new Promise((resolve) => setTimeout(resolve, time));
                }
            
                for (let i = 0; i<data.length;i++){
                    if (data[i].cityName.includes("臺北市")){
    
                        let map_list={
                            name:data[i].name,
                            address:data[i].cityName.replace(/\s/g, "")+data[i].address, //去掉空格
                            information:data[i].ticketPrice,
                            url:data[i].website
                        };
                        // 在還沒 geocode 前，先判斷有無資料，有的話就直接更新經緯度以外的部分
                        mysql.con.query(`select * from map where name = "${map_list.name}" or address ="${map_list.address}"`,function (err,result) {
                            if (err) {
                                console.log(`${map_list.name} select map table failed`);
                                console.log(err);
                            }else{
                                if(result.length > 0){
                                    mysql.con.query(`UPDATE map SET ? where address ="${map_list.address}"`, map_list,function (err,result) {
                                        if(err){
                                            console.log(`${map_list.name} update map table failed`);
                                            console.log(err);
                                        }else{
                                            console.log(`${map_list.name} update map table ok`);
                                        }
                                    })
                                }else{
                                    
                                    (async function() {
                                        await sleep(100);
                                        console.log(data[i].name)
                                        googleMapsClient.geocode({address: `${data[i].name}`})
                                        .asPromise()
                                        .then((response) => {
                                            //判斷 geocode 是否有值，若沒有就重新用地址找
                                            //判斷用名字丟 geocode 是否在台北市內，若沒有就用地址找
                                            if(response.json.results.length == 0 || (!response.json.results[0].formatted_address.includes("Taipei") ||response.json.results[0].formatted_address.includes("New"))){
                                                console.log(data[i].venues_name+" 名稱搜尋不到，改換地址搜尋");
                                                (async function() {
                                                    await sleep(100);
                                                    googleMapsClient.geocode({address: `${data[i].cityName.replace(/\s/g, "")}+${data[i].address}`})
                                                    .asPromise()
                                                    .then((response) => {
                                                                    
                                                        map_list.category="博物館"
                                                        map_list.longitude=response.json.results[0].geometry.location.lng
                                                        map_list.latitude=response.json.results[0].geometry.location.lat
                
                                                        mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                                            if (err) {
                                                                console.log(`${map_list.name} insert map table failed`);
                                                                console.log(err);
                                                            }else{
                                                                console.log(`${map_list.name} insert map table ok`);
                                        
                                                            };
                                                        })
                                                    })
                                                    .catch((err) => {
                                                        console.log(err);
                                                    });
                                                })();
    
                                                return;
                                            }
    
                                            map_list.category="博物館"
                                            map_list.longitude=response.json.results[0].geometry.location.lng
                                            map_list.latitude=response.json.results[0].geometry.location.lat
    
                                            mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                                if (err) {
                                                    console.log(`${map_list.name} insert map table failed`);
                                                    console.log(err);
                                                }else{
                                                    console.log(`${map_list.name} insert map table ok`);
                            
                                                };
                                            })
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                        });
                                    })();
                                }
        
                            };
                        })
    
    
    
                    }
                };
            }
    });


    //台北市資料大平台 藝文館所
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=dfad2ec4-fa19-4b2f-9efb-f6fe3456f469",
        method:"GET"
        },function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);
    
                data = data.result.results;
    
                for (let i = 0; i<data.length;i++){
    
                    let map_list={
                        name:data[i].venues_name,
                        address:data[i].address.replace(/\s/g, "").slice(3) //去掉空格
                    };
    
                    // 在還沒 geocode 前，先判斷有無資料，有的話就直接更新經緯度以外的部分
                    mysql.con.query(`select * from map where name = "${map_list.name}" or address ="${map_list.address}"`,function (err,result) {
                        if (err) {
                            console.log(`${map_list.name} select map table failed`);
                            console.log(err);
                        }else{
                            if(result.length > 0){
                                mysql.con.query(`UPDATE map SET ? where address ="${map_list.address}"`, map_list,function (err,result) {
                                    if(err){
                                        console.log(`${map_list.name} update map table failed`);
                                        console.log(err);
                                    }else{
                                        console.log(`${map_list.name} update map table ok`);
                                    }
                                })
                            }else{
                                (async function() {
                                    await sleep(100);
                                    googleMapsClient.geocode({address: `${data[i].venues_name}`})
                                    .asPromise()
                                    .then((response) => {
                                        //判斷 geocode 是否有值，若沒有就重新用地址找
                                        //判斷用名字丟 geocode 是否在台北市內，若沒有就用地址找
                                        if(response.json.results.length == 0 || (!response.json.results[0].formatted_address.includes("Taipei") ||response.json.results[0].formatted_address.includes("New"))){
                                            console.log(data[i].venues_name+" 名稱搜尋不到，改換地址搜尋");
                                            (async function() {
                                                await sleep(100);
                                                googleMapsClient.geocode({address: `${map_list.address}`})
                                                .asPromise()
                                                .then((response) => {
                                                                
                                                    map_list.category="藝文館所"
                                                    map_list.longitude=response.json.results[0].geometry.location.lng
                                                    map_list.latitude=response.json.results[0].geometry.location.lat
            
                                                    mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                                        if (err) {
                                                            console.log(`${map_list.name} insert map table failed`);
                                                            console.log(err);
                                                        }else{
                                                            console.log(`${map_list.name} insert map table ok`);
                                    
                                                        };
                                                    })
                                                })
                                                .catch((err) => {
                                                    console.log(err);
                                                });
                                            })();
    
                                            return;
                                        }
    
    
                                        map_list.category="藝文館所"
                                        map_list.longitude=response.json.results[0].geometry.location.lng
                                        map_list.latitude=response.json.results[0].geometry.location.lat
                                
                                        mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                            if (err) {
                                                console.log(`${map_list.name} insert map table failed`);
                                                console.log(err);
                                            }else{
                                                console.log(`${map_list.name} insert map table ok`);
                        
                                            };
                                        })
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                })();
                            }
                        }           
                    });
    
                }   
            }
    });

    //台北市資料大平台 文化資產
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=d40ee29c-a538-4a87-84f0-f43acfa19a20",
        method:"GET"
        },function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    let map_list={
                        name:data[i].case_name,
                        address:data[i].belong_city_name.replace(/\s/g, "")+data[i].belong_address,//去掉空格
                        information:data[i].building_brief
                    };

                    // 在還沒 geocode 前，先判斷有無資料，有的話就直接更新經緯度以外的部分
                    mysql.con.query(`select * from map where name = "${map_list.name}" or address ="${map_list.address}"`,function (err,result) {
                        if (err) {
                            console.log(`${map_list.name} select map table failed`);
                            console.log(err);
                        }else{
                            if(result.length > 0){
                                mysql.con.query(`UPDATE map SET ? where address ="${map_list.address}"`, map_list,function (err,result) {
                                    if(err){
                                        console.log(`${map_list.name} update map table failed`);
                                        console.log(err);
                                    }else{
                                        console.log(`${map_list.name} update map table ok`);
                                    }
                                })
                            }else{
                                (async function() {
                                    await sleep(100);
                                    googleMapsClient.geocode({address: `${map_list.name}`})
                                    .asPromise()
                                    .then((response) => {
                                        //判斷 geocode 是否有值，若沒有就重新用地址找
                                        //判斷用名字丟 geocode 是否在台北市內，若沒有就用地址找
                                        if(response.json.results.length == 0 || (!response.json.results[0].formatted_address.includes("Taipei") ||response.json.results[0].formatted_address.includes("New"))){
                                            console.log(map_list.name+" 名稱搜尋不到，改換地址搜尋");
                                            (async function() {
                                                await sleep(100);
                                                googleMapsClient.geocode({address: `${map_list.address}`})
                                                .asPromise()
                                                .then((response) => {
                                                                
                                                    map_list.category="文化資產"
                                                    map_list.longitude=response.json.results[0].geometry.location.lng
                                                    map_list.latitude=response.json.results[0].geometry.location.lat
            
                                                    mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                                        if (err) {
                                                            console.log(`${map_list.name} insert map table failed`);
                                                            console.log(err);
                                                        }else{
                                                            console.log(`${map_list.name} insert map table ok`);
                                    
                                                        };
                                                    })
                                                })
                                                .catch((err) => {
                                                    console.log(err);
                                                });
                                            })();

                                            return;
                                        }


                                        map_list.category="文化資產"
                                        map_list.longitude=response.json.results[0].geometry.location.lng
                                        map_list.latitude=response.json.results[0].geometry.location.lat
                                
                                        mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                            if (err) {
                                                console.log(`${map_list.name} insert map table failed`);
                                                console.log(err);
                                            }else{
                                                console.log(`${map_list.name} insert map table ok`);
                        
                                            };
                                        })
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                })();
                            }
                        }           
                    });

                }   
            }
    });


    //台北市資料大平台 焚化廠
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=95ceba2e-b19d-4e06-9cfc-bc4a3713fd7b",
        method:"GET"
        },function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    let map_list={
                        name:data[i].Chinese_name,
                        address:data[i].addr
                    };
                    // 在還沒 geocode 前，先判斷有無資料，有的話就直接更新經緯度以外的部分
                    mysql.con.query(`select * from map where name = "${map_list.name}" or address ="${map_list.address}"`,function (err,result) {
                        if (err) {
                            console.log(`${map_list.name} select map table failed`);
                            console.log(err);
                        }else{
                            if(result.length > 0){
                                mysql.con.query(`UPDATE map SET ? where address ="${map_list.address}"`, map_list,function (err,result) {
                                    if(err){
                                        console.log(`${map_list.name} update map table failed`);
                                        console.log(err);
                                    }else{
                                        console.log(`${map_list.name} update map table ok`);
                                    }
                                })
                            }else{
                                (async function() {
                                    await sleep(100);
                                    googleMapsClient.geocode({address: `${map_list.name.slice(10)}`})
                                    .asPromise()
                                    .then((response) => {
                                        //判斷 geocode 是否有值，若沒有就重新用地址找
                                        //判斷用名字丟 geocode 是否在台北市內，若沒有就用地址找
                                        if(response.json.results.length == 0 || (!response.json.results[0].formatted_address.includes("Taipei") ||response.json.results[0].formatted_address.includes("New"))){
                                            console.log(map_list.name+" 名稱搜尋不到，改換地址搜尋");
                                            (async function() {
                                                await sleep(100);
                                                googleMapsClient.geocode({address: `${map_list.address}`})
                                                .asPromise()
                                                .then((response) => {
                                                                
                                                    map_list.category="焚化廠"
                                                    map_list.longitude=response.json.results[0].geometry.location.lng
                                                    map_list.latitude=response.json.results[0].geometry.location.lat
            
                                                    mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                                        if (err) {
                                                            console.log(`${map_list.name} insert map table failed`);
                                                            console.log(err);
                                                        }else{
                                                            console.log(`${map_list.name} insert map table ok`);
                                    
                                                        };
                                                    })
                                                })
                                                .catch((err) => {
                                                    console.log(err);
                                                });
                                            })();

                                            return;
                                        }


                                        map_list.category="焚化廠"
                                        map_list.longitude=response.json.results[0].geometry.location.lng
                                        map_list.latitude=response.json.results[0].geometry.location.lat
                                
                                        mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                            if (err) {
                                                console.log(`${map_list.name} insert map table failed`);
                                                console.log(err);
                                            }else{
                                                console.log(`${map_list.name} insert map table ok`);
                        
                                            };
                                        })
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                })();
                            }
                        }           
                    });

                }   
            }
    });

    //台北市資料大平台 環保旅店
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=adef2044-760f-40bd-8e13-a7fda6d011de",
        method:"GET"
        },function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    let map_list={
                        name:data[i]["名稱"],
                        address:data[i]["地址"]
                    };

                    // 在還沒 geocode 前，先判斷有無資料，有的話就直接更新經緯度以外的部分
                    mysql.con.query(`select * from map where name = "${map_list.name}" or address ="${map_list.address}"`,function (err,result) {
                        if (err) {
                            console.log(`${map_list.name} select map table failed`);
                            console.log(err);
                        }else{
                            if(result.length > 0){
                                mysql.con.query(`UPDATE map SET ? where address ="${map_list.address}"`, map_list,function (err,result) {
                                    if(err){
                                        console.log(`${map_list.name} update map table failed`);
                                        console.log(err);
                                    }else{
                                        console.log(`${map_list.name} update map table ok`);
                                    }
                                })
                            }else{
                                (async function() {
                                    await sleep(100);
                                    googleMapsClient.geocode({address: `${map_list.name}`})
                                    .asPromise()
                                    .then((response) => {
                                        //判斷 geocode 是否有值，若沒有就重新用地址找
                                        //判斷用名字丟 geocode 是否在台北市內，若沒有就用地址找
                                        if(response.json.results.length == 0 || (!response.json.results[0].formatted_address.includes("Taipei") ||response.json.results[0].formatted_address.includes("New"))){
                                            console.log(map_list.name+" 名稱搜尋不到，改換地址搜尋");
                                            (async function() {
                                                await sleep(100);
                                                googleMapsClient.geocode({address: `${map_list.address}`})
                                                .asPromise()
                                                .then((response) => {
                                                                
                                                    map_list.category="環保旅店"
                                                    map_list.longitude=response.json.results[0].geometry.location.lng
                                                    map_list.latitude=response.json.results[0].geometry.location.lat
            
                                                    mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                                        if (err) {
                                                            console.log(`${map_list.name} insert map table failed`);
                                                            console.log(err);
                                                        }else{
                                                            console.log(`${map_list.name} insert map table ok`);
                                    
                                                        };
                                                    })
                                                })
                                                .catch((err) => {
                                                    console.log(err);
                                                });
                                            })();

                                            return;
                                        }


                                        map_list.category="環保旅店"
                                        map_list.longitude=response.json.results[0].geometry.location.lng
                                        map_list.latitude=response.json.results[0].geometry.location.lat
                                
                                        mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                            if (err) {
                                                console.log(`${map_list.name} insert map table failed`);
                                                console.log(err);
                                            }else{
                                                console.log(`${map_list.name} insert map table ok`);
                        
                                            };
                                        })
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                })();
                            }
                        }           
                    });

                }   
            }
    });

    //台北市資料大平台 臺北市電動機車充電地址及充電格位
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=c2b666e0-f848-4609-90cb-5e416435b93a",
        method:"GET"
        },function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    let map_list={
                        name:data[i]["單位"],
                        address:data[i]["地址"]
                    };

                    // 在還沒 geocode 前，先判斷有無資料，有的話就直接更新經緯度以外的部分
                    mysql.con.query(`select * from map where name = "${map_list.name}" or address ="${map_list.address}"`,function (err,result) {
                        if (err) {
                            console.log(`${map_list.name} select map table failed`);
                            console.log(err);
                        }else{
                            if(result.length > 0){
                                mysql.con.query(`UPDATE map SET ? where address ="${map_list.address}"`, map_list,function (err,result) {
                                    if(err){
                                        console.log(`${map_list.name} update map table failed`);
                                        console.log(err);
                                    }else{
                                        console.log(`${map_list.name} update map table ok`);
                                    }
                                })
                            }else{
                                (async function() {
                                    await sleep(100);
                                    googleMapsClient.geocode({address: `${map_list.name}`})
                                    .asPromise()
                                    .then((response) => {
                                        //判斷 geocode 是否有值，若沒有就重新用地址找
                                        //判斷用名字丟 geocode 是否在台北市內，若沒有就用地址找
                                        if(response.json.results.length == 0 || (!response.json.results[0].formatted_address.includes("Taipei") ||response.json.results[0].formatted_address.includes("New"))){
                                            console.log(map_list.name+" 名稱搜尋不到，改換地址搜尋");
                                            (async function() {
                                                await sleep(100);
                                                googleMapsClient.geocode({address: `${map_list.address}`})
                                                .asPromise()
                                                .then((response) => {
                                                                
                                                    map_list.category="臺北市電動機車充電地址"
                                                    map_list.longitude=response.json.results[0].geometry.location.lng
                                                    map_list.latitude=response.json.results[0].geometry.location.lat
            
                                                    mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                                        if (err) {
                                                            console.log(`${map_list.name} insert map table failed`);
                                                            console.log(err);
                                                        }else{
                                                            console.log(`${map_list.name} insert map table ok`);
                                    
                                                        };
                                                    })
                                                })
                                                .catch((err) => {
                                                    console.log(err);
                                                });
                                            })();

                                            return;
                                        }


                                        map_list.category="臺北市電動機車充電地址"
                                        map_list.longitude=response.json.results[0].geometry.location.lng
                                        map_list.latitude=response.json.results[0].geometry.location.lat
                                
                                        mysql.con.query(`insert into map set ?`,map_list,function (err,rs) {
                                            if (err) {
                                                console.log(`${map_list.name} insert map table failed`);
                                                console.log(err);
                                            }else{
                                                console.log(`${map_list.name} insert map table ok`);
                        
                                            };
                                        })
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                })();
                            }
                        }           
                    });

                }   
            }
    });

});






