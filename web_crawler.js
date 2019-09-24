const schedule = require('node-schedule');                          //node-schedule 模組，可定時執行
// const puppeteer = require('puppeteer');                             //爬蟲套件 puppeteer 模組
const pptrFirefox = require('puppeteer-firefox');                             //爬蟲套件 puppeteer 模組
const request = require('request');                                 // request 模組
const cheerio = require("cheerio");                                   //爬蟲時，可以讓前端的東西變成 DOM 物件
const axios = require('axios');                                    //讓 request 變成類似 promise 物件


const mysql=require("./mysql_connection.js");                       // MySQL Initialization
const dao_map = require("./dao/map.js")                             // dao_map.js檔
const googleMapsClient = require('@google/maps').createClient({     //google 可用 gecoding 功能
    key: 'AIzaSyAkK5NajaFKNXkYT2WsdB96edSWRo5kYhY',
    Promise: Promise
});




function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
};


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
    // address = address.replace(/F/g, "樓");
    // address = address.replace(/Ｆ/g, "樓");
    // address = address.replace(/f/g, "樓");
    // address = address.replace(/ｆ/g, "樓");
    // address = address.replace(/\./g, "、");
    // address = address.replace(/ *\([^)]*\) */g, "");
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

let find_district = async function(address) {
   
    let address_URI =encodeURI(address);
    let new_address

    await axios.get(`https://zip5.5432.tw/zip5json.py?adrs=${address_URI}&_=1569334120491`)
    .then(function (response) {
        if(response.data.zipcode.includes("100")){
            new_address = [address.slice(0, 3),"中正區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("103")){
            new_address = [address.slice(0, 3),"大同區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("104")){
            new_address = [address.slice(0, 3),"中山區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("105")){
            new_address = [address.slice(0, 3),"松山區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("106")){
            new_address = [address.slice(0, 3),"大安區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("108")){
            new_address = [address.slice(0, 3),"萬華區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("110")){
            new_address = [address.slice(0, 3),"信義區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("111")){
            new_address = [address.slice(0, 3),"士林區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("112")){
            new_address = [address.slice(0, 3),"北投區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("114")){
            new_address = [address.slice(0, 3),"內湖區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("115")){
            new_address = [address.slice(0, 3),"南港區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.includes("116")){
            new_address = [address.slice(0, 3),"文山區",address.slice(3)].join("");
            return new_address;
        }
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

    return new_address;

    // await request({
    //     url:`https://zip5.5432.tw/zip5json.py?adrs=${address_URI}&_=1569334120491`,
    //     method:"GET"
    //     },async function(error, response, body){
    //         if(body.error){
    //             console.log(body.error);
    //         }else{
    //             body = JSON.parse(body);
    //             if(body.zipcode.includes("100")){
    //                 new_address = [address.slice(0, 3),"中正區",address.slice(3)].join("");
    //                 return new_address;
    //             }
    //             //console.log(new_address);
                
    //         }
    // });
    // console.log("替代後",new_address)
    // return new_address
    






    // const browser = await pptrFirefox.launch({headless: false});
    // const page = await browser.newPage();
    // await page.goto('https://www.tp.edu.tw/neighbor/html/');
    // await page.waitForSelector("table")
    // await page.type("#k2", address);
    // await page.click("#searchBtn2");
    // await page.waitForSelector("#content > ul:nth-child(3) > p")

    // // get data details
    // const result = await page.evaluate(() => {

    //     let data = document.querySelector('#content > ul:nth-child(2) ').innerHTML

    //     let district = data.substring(31,34)

    //     return district
    // })
    
    // await browser.close();
    // return [address.slice(0, 3),result,address.slice(3)].join("");
};




function add_taipet_city(address){
    if(address.includes("台北市")){
        address = address.replace("台北市", "臺北市");
    }

    if(!address.includes("臺北市")){
        address = [address.slice(0, 0), "臺北市", address.slice(0)].join('');
    }
    return address;
};

let full_address = async function(address){
    address = address.replace(/F/g, "樓");
    address = address.replace(/Ｆ/g, "樓");
    address = address.replace(/f/g, "樓");
    address = address.replace(/ｆ/g, "樓");
    address = address.replace(/\./g, "、");  
    address = replace_full_and_symbol(address);
    address = number_change_words(address);
    address = word_change_number(address);
    address = add_taipet_city(address);
    
    if(!address.includes("區")){
        address =await find_district(address);
    };
    console.log(address)
    
    //把臺北市前面的郵遞區號拿掉
    for(let i = 0 ; i<address.length ; i++){
        if(address.charAt(i) == "臺"){
            address = address.substring(i, address.length);
        }
    }

    address = address.replace(/ *\([^)]*\) */g, "");
    return address;
}

let full_name = function(name){
    if(name.includes("台北")){
        name = name.replace("台北", "臺北");
    }
    if(name.includes("台灣")){
        name = name.replace("台灣", "臺灣");
    }
    name = replace_full_and_symbol(name);
    name = number_change_words(name);
    name = word_change_number(name);
    return name;
}


let core_geocode_function = async function(map_data,category,search){

    //判斷地址不一樣的話 就當作不一樣，因為現在沒有經緯度協助判斷，所以還是會有經緯度不一樣但地址一樣的地點無法插入，只好先用地點不一樣當作判斷，畢竟地名不是可靠的變數可以當作參考值
    let select_map_result = await dao_map.select ("map","address",map_data.address);
 
    if(select_map_result.length > 0){
        
        if(!select_map_result[0].category.includes(category)){
            map_data.category=select_map_result[0].category+category;
        }

        let update_map_result = await dao_map.update("map","address",map_data.address,map_data,map_data.name);

    }else{
        (async function() {
            await sleep(100);
            googleMapsClient.geocode({address: `${map_data[search]}`})
            .asPromise()
            .then(async (response) => {

                //判斷 geocode 是否有值，若沒有就重新用地址找
                //判斷用名字丟 geocode 是否在台北市內，若沒有就用地址找
                if(response.json.results.length == 0 || (!response.json.results[0].formatted_address.includes("Taipei") ||response.json.results[0].formatted_address.includes("New"))){
                    console.log(map_data.name+" 名稱搜尋不到，改換地址搜尋");
                    (async function() {
                        await sleep(100);
                        googleMapsClient.geocode({address: `${map_data.address}`})
                        .asPromise()
                        .then(async (response) => {
                                        
                            map_data.longitude=response.json.results[0].geometry.location.lng;
                            map_data.latitude=response.json.results[0].geometry.location.lat;
                            map_data.category=category;

                            let insert_map_result = await dao_map.insert("map",map_data,map_data.name);

                        })
                        .catch((err) => {
                            console.log(err);
                        });
                    })();

                    return;
                }

                map_data.longitude=response.json.results[0].geometry.location.lng;
                map_data.latitude=response.json.results[0].geometry.location.lat;
                map_data.category=category;

                let insert_map_result = await dao_map.insert("map",map_data,map_data.name);
                
            })
            .catch((err) => {
                console.log(err);
            });
        })();
    }
}

let puppeteer_for_geocode_function = async function  (category,place_icon,data,api_information,api_url,search){
    for (let i = 0; i<data.name.length;i++){

        let map_list={
            name:data.name[i],
            address:data.address[i],
            place_icon:place_icon
        };

        map_list.address =await full_address(map_list.address);
        map_list.name = full_name(map_list.name);

        if (api_information !== null){
            map_list.information = data.information[i]
        }

        if (api_url !== null){
            map_list.url = data.url[i]
        }

        core_geocode_function (map_list,category,search);

    }

};


let taipei_city_request = async function (url,category,place_icon,api_name,api_address,api_information,api_url,search){
    request({
        url:url,
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);

                data = data.result.results;

                for (let i = 0; i<data.length;i++){

                    let map_list={
                        name:data[i][api_name],
                        address:data[i][api_address],
                        place_icon:place_icon
                    };
                    
                    if(!map_list.address.includes("路") && !map_list.address.includes("段") && !map_list.address.includes("號")){
                        continue;
                    }
                
                    map_list.address =await full_address(map_list.address);
                    map_list.name = full_name(map_list.name);
                    console.log(map_list.address)
                    if (api_information !== null){
                        map_list.information = data[i].information
                    }
            
                    if (api_url !== null){
                        map_list.url = data[i].url
                    }

                    core_geocode_function (map_list,category,search);

                }   
            }
    });
};


    //台北市資料大平台 臺北市各區運動中心
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=e7c46724-3517-4ce5-844f-5a4404897b7d","運動中心","sport","name","addr",null,null,"name");




var on_schedule = schedule.scheduleJob('0 0 0 1 1 */1', async function(){

    // 政府資料開放平台 博物館
    request({
        url:"https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=H",
        method:"GET"
        },async function(error, response, body){
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
                            address:data[i].cityName+data[i].address,
                            place_icon:"museum",
                            information:data[i].ticketPrice,
                            url:data[i].website
                        };

                        if(!map_list.address.includes("路") && !map_list.address.includes("段") && !map_list.address.includes("號")){
                            continue;
                        }

                        map_list.address =await full_address(map_list.address);
                        map_list.name = full_name(map_list.name);

                        core_geocode_function (map_list,"博物館","name");

                    }
                };
            }
    });

    //台北市資料大平台 藝文館所
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=dfad2ec4-fa19-4b2f-9efb-f6fe3456f469",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);
    
                data = data.result.results;
    
                for (let i = 0; i<data.length;i++){
    
                    let map_list={
                        name:data[i].venues_name,
                        address:data[i].address, 
                        place_icon:"museum_art",
                    };
    
                    if(!map_list.address.includes("路") && !map_list.address.includes("段") && !map_list.address.includes("號")){
                        continue;
                    }

                    map_list.address =await full_address(map_list.address);
                    map_list.name = full_name(map_list.name);

                    core_geocode_function (map_list,"藝文館所","name");
    
                }   
            }
    });

    //台北市資料大平台 文化資產
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=d40ee29c-a538-4a87-84f0-f43acfa19a20",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    data[i].building_brief = number_change_words(data[i].building_brief);

                    let map_list={
                        name:data[i].case_name,
                        address:data[i].belong_city_name+data[i].belong_address,//去掉空格
                        place_icon:"ruins",
                        information:data[i].building_brief
                    };

                    if(!map_list.address.includes("路") && !map_list.address.includes("段") && !map_list.address.includes("號")){
                        continue;
                    }

                    map_list.address =await full_address(map_list.address);
                    map_list.name = full_name(map_list.name);

                    core_geocode_function (map_list,"文化資產","name");

                }   
            }
    });

    //台北市資料大平台 環保旅店
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=adef2044-760f-40bd-8e13-a7fda6d011de","環保旅店","lodging","名稱","地址",null,null,"name");

    //台北市資料大平台 臺北市電動機車充電地址及充電格位
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=c2b666e0-f848-4609-90cb-5e416435b93a","電動機車充電","charging","單位","地址",null,null,"name");

    //台北市資料大平台 臺北市社區資源回收站資訊
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=0ab06b17-3ac0-4a7b-9e64-66ef69bba697","社區資源回收站","recycle","回收站名稱","地址",null,null,"address");

    //台北市資料大平台 臺北市環境教育機構
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=9d6b643e-5d71-46e7-8368-eb0aaf907171","環境教育機構","education","機構名稱","機構地址",null,"機關網址","name");

    //台北市資料大平台 臺北市廢棄物處理場
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=13ac57a2-f4a1-4e9b-9372-9ce1c7f85df0","廢棄物處理場","other","Chinese_name","addr",null,null,"name");

    //台北市資料大平台 臺北市拖吊場
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=24045907-b7c3-4351-b0b8-b93a54b55367","拖吊場","other","拖吊保管場名稱","地址",null,null,"name");

    //台北市資料大平台 臺北市各區公所聯絡資訊
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=a0484907-e5ce-4d5b-ac4a-42c1e7684326","區公所","government","name","address",null,null,"name");

    //台北市資料大平台 臺北市休閒農場
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=2bbc419c-d774-4bcf-812b-b87b6fd15abb","休閒農場","farm","農場名稱","地址","農場主要特色簡介",null,"name");

    //台北市資料大平台 臺北市各區運動中心
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=e7c46724-3517-4ce5-844f-5a4404897b7d","運動中心","sport","name","addr",null,null,"name");

    //台北市資料大平台 臺北市合法電子遊戲場業者清冊
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=6a95357f-e76a-4cc0-84f6-27e550ced5e5",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                var data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    let map_list={
                        name:data[i]["公司/商業名稱"],
                        address:"臺北市"+data[i]["行政區"]+data[i]["營業場所地址"],
                        place_icon:"game",
                        information:data[i]["備註"]
                    };

                    if(!map_list.address.includes("路") && !map_list.address.includes("段") && !map_list.address.includes("號")){
                        continue;
                    }

                    map_list.address =await full_address(map_list.address);
                    map_list.name = full_name(map_list.name);

                    core_geocode_function (map_list,"電子遊戲場","name");

                }   
            }
    });

    //中華郵政 臺北市郵局
    request({
        url:"https://www.post.gov.tw/post/internet/I_location/index_all.jsp",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                let $ = cheerio.load(body); // 載入 body

                let data_name_array = [];
                let data_address_array = [];

                $('a.rwd-close').each((idx,el) => {
                    if(!$(el).text() == ""){
                        data_name_array.push($(el).text())
                    };
                })
                
                $('.detail').each((idx,el) => {
                    data_address_array.push($(el).text())
                    
                });

                for (let i = 0; i<data_address_array.length;i++){

                    if(data_address_array[i].includes("臺北市")){
                        
                        let map_list={
                            name:data_name_array[i],
                            address:data_address_array[i],
                            place_icon:"postal",
                        };
    
                        if(!map_list.address.includes("路") && !map_list.address.includes("段") && !map_list.address.includes("號")){
                            continue;
                        }
    
                        map_list.address =await full_address(map_list.address);
                        map_list.name = full_name(map_list.name);
    
                        core_geocode_function (map_list,"郵局","name");
                    }
                }   
            }
    });


    //臺北市政府衛生局 十二區健康服務中心
    (async () => {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto('https://health.gov.taipei/cp.aspx?n=E04DC448D4D39810');
        await page.waitForSelector("#base-content")

        // get data details
        const result = await page.evaluate(() => {
            let data_all = [];
            let data_name_array = [];
            let data_address_array = [];
            let data_address = document.querySelectorAll('#table_1 > tbody > tr > td')

            data_address.forEach((item) => {
                data_all.push(item.innerText.trim())
            });
            data_all.forEach((item) => {
                if(data_all.indexOf(item) % 4 == 2){
                    data_name_array.push(item)
                }
                if(data_all.indexOf(item) % 4 == 3){
                    data_address_array.push(item)
                }
            });

            return {
                name:data_name_array,
                address:data_address_array
            }
        })

        await puppeteer_for_geocode_function ("健康服務中心","therapy",result,null,null,"name");
        
        await browser.close();
    })();

});



    // request({
    //     url:"https://andy6804tw.github.io/2018/02/11/nodejs-crawler/",
    //     method:"GET"
    //     },async function(error, response, body){
    //         if(body.error){
    //             console.log(body.error);
    //         }else{
    //             // let $ = cheerio.load(body); // 載入 body
    //             console.log(response.body)
    //             console.log(body,"123")
    //             // console.log($('a').text())
    //             // console.log($('#table_1').text())



    //             // $('#table_1 > tbody > tr:nth-child(2) > td:nth-child(2)').each((idx,el) => {
    //             //     console.log($(el).text())
    //             // })


    //             // let data_name_array = [];
    //             // let data_address_array = [];


    //             // let mail_name = $('a.rwd-close')
    //             // $('a.rwd-close').each((idx,el) => {
    //             //     if(!$(el).text() == ""){
    //             //         data_name_array.push($(el).text())
    //             //     };
    //             // })
                
    //             // $('.detail').each((idx,el) => {
    //             //     data_address_array.push($(el).text())
                    
    //             // });

    //             // for (let i = 0; i<data_address_array.length;i++){

    //             //     if(data_address_array[i].includes("臺北市")){
                        
    //             //         let map_list={
    //             //             name:data_name_array[i],
    //             //             address:data_address_array[i],
    //             //             place_icon:"postal",
    //             //         };
    
    //             //         if(!map_list.address.includes("路") && !map_list.address.includes("段") && !map_list.address.includes("號")){
    //             //             continue;
    //             //         }
    
    //             //         map_list.address =await full_address(map_list.address);
    //             //         map_list.name = full_name(map_list.name);
    
    //             //         core_geocode_function (map_list,"郵局","name");
    //             //     }

    //             // }   
    //         }
    // });





    // (async () => {
    //     const browser = await puppeteer.launch({headless: false});
    //     const page = await browser.newPage();
    //     await page.goto('https://health.gov.taipei/cp.aspx?n=E04DC448D4D39810');
    //     await page.waitForSelector("#base-content")

    //     // get data details
    //     const result = await page.evaluate(() => {
    //         let data_all = [];
    //         let data_name_array = [];
    //         let data_address_array = [];
    //         let data_address = document.querySelectorAll('#table_1 > tbody > tr > td')

    //         data_address.forEach((item) => {
    //             data_all.push(item.innerText.trim())
    //         });
    //         data_all.forEach((item) => {
    //             if(data_all.indexOf(item) % 4 == 2){
    //                 data_name_array.push(item)
    //             }
    //             if(data_all.indexOf(item) % 4 == 3){
    //                 data_address_array.push(item)
    //             }
    //         });

    //         return {
    //             name:data_name_array,
    //             address:data_address_array
    //         }
    //     })

    //     await puppeteer_for_geocode_function ("健康服務中心","therapy",result,null,null,"name");
        
    //     await browser.close();
    // })();




    // https://map97.tpgos.taipei.gov.tw/embed/webapi.cfm?callback=jQuery3110648608215798592_1569331560165&SERVICE=ADDRESS&ADDRESS=%E5%85%89%E5%BE%A9%E5%8D%97%E8%B7%AF132%E8%99%9F&APIKEY=918A7CB57AE38AD226859ECFEE7811F0CF9BFC00B197C8D0780CF8C3C9BEE820BDAB728ECD6775DA2DF39DCAF26DBB68&ITEM_LIST=TPGOS_CA_ADDR%3A30%2CTPGOS_PWLMK_ADDR%3A30%2CTPGOS_XY_ADDR%3A30%2CTGOS_V2_ADDR%3A30%2CGMAPI_ADDR%3A30&SRS_T=WGS84&format=JSONP&_=1569331560166


    // https://map97.tpgos.taipei.gov.tw/embed/webapi.cfm?callback=jQuery3110648608215798592_1569331560165&SERVICE=ADDRESS&ADDRESS=%E5%9F%BA%E9%9A%86%E8%B7%AF66%E8%99%9F&APIKEY=918A7CB57AE38AD226859ECFEE7811F0CF9BFC00B197C8D0780CF8C3C9BEE820BDAB728ECD6775DA2DF39DCAF26DBB68&ITEM_LIST=TPGOS_CA_ADDR%3A30%2CTPGOS_PWLMK_ADDR%3A30%2CTPGOS_XY_ADDR%3A30%2CTGOS_V2_ADDR%3A30%2CGMAPI_ADDR%3A30&SRS_T=WGS84&format=JSONP&_=1569331560168


    // var str =encodeURI("台北市仁愛路4段１０號");
    // console.log(str)


    // request({
    //     url:`https://zip5.5432.tw/zip5json.py?adrs=${str}&_=1569334120491`,
    //     method:"GET"
    //     },async function(error, response, body){
    //         if(body.error){
    //             console.log(body.error);
    //         }else{
    //             body = JSON.parse(body)
    //             console.log(body);
    //         }
    // });