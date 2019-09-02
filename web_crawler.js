const schedule = require('node-schedule');                          //node-schedule 模組，可定時執行
const puppeteer = require('puppeteer');                             //爬蟲套件 puppeteer 模組
const request = require('request');                                 // request 模組
const mysql=require("./mysql_connection.js");                       // MySQL Initialization
const dao_map = require("./dao/map.js")                             // dao_map.js檔
const googleMapsClient = require('@google/maps').createClient({     //google 可用 gecoding 功能
    key: 'AIzaSyAkK5NajaFKNXkYT2WsdB96edSWRo5kYhY',
    Promise: Promise
});


function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
};

// 與下面三個包在一起回傳會變 promise 物件
function number_change_words (address){
    for (let i = 0; i < address.length; i++) {     
        if(address.charAt(i) == "段" && !isNaN(address.charAt(i-1))  ){
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

function full_to_half　(address){
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
    return address;
};

let find_district = async function (address) {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.tp.edu.tw/neighbor/html/');
    await page.waitForSelector("table")
    await page.type("#k2", address);
    await page.click("#searchBtn2");
    await page.waitForSelector("#content > ul:nth-child(3) > p")

    // get data details
    const result = await page.evaluate(() => {

        let data = document.querySelector('#content > ul:nth-child(2) ').innerHTML

        let district = data.substring(31,34)

        return district
    })
    
    await browser.close();
    return [address.slice(0, 3),result,address.slice(3)].join("");
};

function add_taipet_city (address){
    
    if(address.includes("台北市")){
        address = address.replace("台北市", "臺北市");
    }

    if(!address.includes("臺北市")){
        address = [address.slice(0, 0), "臺北市", address.slice(0)].join('');
    }
    return address;
};

let core_geocode_function = async function(map_data,category_data,search){
    let select_map_result = await dao_map.select ("map","address",map_data.address,map_data.address);

        if(select_map_result.length > 0){

            let update_map_result = await dao_map.update("map",map_data,map_data.name);

            //因為已經先判斷地址有沒有了，所以這層直接判斷分類有沒有，再來決定要更新還是新增

            let select_category_result = await dao_map.select("map_category","category",category_data.category,category_data.address);

            if(select_category_result.length > 0){
                let update_category_result = await dao_map.update("map_category",category_data,map_data.name);
            }else{
                let insert_category_result = await dao_map.insert("map_category",category_data,map_data.name);
            }

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

                                let insert_map_result = await dao_map.insert("map",map_data,map_data.name);
                                let insert_category_result = await dao_map.insert("map_category",category_data,map_data.name);

                            })
                            .catch((err) => {
                                console.log(err);
                            });
                        })();

                        return;
                    }

                    map_data.longitude=response.json.results[0].geometry.location.lng;
                    map_data.latitude=response.json.results[0].geometry.location.lat;
            
                    let insert_map_result = await dao_map.insert("map",map_data,map_data.name);
                    let insert_category_result = await dao_map.insert("map_category",category_data,map_data.name);
                    
                })
                .catch((err) => {
                    console.log(err);
                });
            })();
        }
}

let puppeteer_for_geocode_function = async function  (category,data,api_information,api_url,search){
    for (let i = 0; i<data.name.length;i++){

        let map_list={
            name:data.name[i],
            address:data.address[i]
        };

        map_list.address = full_to_half　(map_list.address);
        map_list.address = number_change_words(map_list.address);
        map_list.address = add_taipet_city(map_list.address);
        if(!map_list.address.includes("區")){
            map_list.address = await find_district(map_list.address);
        };

        let map_category_list = {
            address:map_list.address,
            category:category
        };

        if (api_information !== null){
            map_list.information = data.information[i]
        }

        if (api_url !== null){
            map_list.url = data.url[i]
        }

        core_geocode_function (map_list,map_category_list,search);

    }

};


let taipei_city_request = async function (url,category,api_name,api_address,api_information,api_url,search){
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
                        address:data[i][api_address]
                    };
                    
                    map_list.address = full_to_half　(map_list.address);
                    map_list.address = number_change_words(map_list.address);
                    map_list.address = add_taipet_city(map_list.address);
                    if(!map_list.address.includes("區")){
                        map_list.address = await find_district(map_list.address);
                    };
            
                    let map_category_list = {
                        address:map_list.address,
                        category:category
                    };
            
                    if (api_information !== null){
                        map_list.information = data[i].information
                    }
            
                    if (api_url !== null){
                        map_list.url = data[i].url
                    }

                    core_geocode_function (map_list,map_category_list,search);

                }   
            }
    });
};






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
                            address:data[i].cityName.replace(/\s/g, "")+data[i].address, //去掉空格
                            information:data[i].ticketPrice,
                            url:data[i].website
                        };

                        map_list.address = full_to_half　(map_list.address);
                        map_list.address = number_change_words(map_list.address);
                        map_list.address = add_taipet_city(map_list.address);
                        if(!map_list.address.includes("區")){
                            map_list.address = await find_district(map_list.address);
                        };

                        let map_category_list = {
                            address:map_list.address,
                            category:"博物館"
                        };

                        map_list.address = number_change_words(map_list.address)

                        core_geocode_function (map_list,map_category_list,"name");
    
    
    
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
                        address:data[i].address.replace(/\s/g, "").slice(3) //去掉空格
                    };
    
                    map_list.address = full_to_half　(map_list.address);
                    map_list.address = number_change_words(map_list.address);
                    map_list.address = add_taipet_city(map_list.address);
                    if(!map_list.address.includes("區")){
                        map_list.address = await find_district(map_list.address);
                    };

                    let map_category_list = {
                        address:map_list.address,
                        category:"藝文館所"
                    };

                    map_list.address = number_change_words(map_list.address)

                    core_geocode_function (map_list,map_category_list,"name");
    
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
                        address:data[i].belong_city_name.replace(/\s/g, "")+data[i].belong_address,//去掉空格
                        information:data[i].building_brief
                    };

                    map_list.address = full_to_half　(map_list.address);
                    map_list.address = number_change_words(map_list.address);
                    map_list.address = add_taipet_city(map_list.address);
                    if(!map_list.address.includes("區")){
                        map_list.address = await find_district(map_list.address);
                    };

                    let map_category_list = {
                        address:map_list.address,
                        category:"藝文館所"
                    };

                    map_list.address = number_change_words(map_list.address)

                    core_geocode_function (map_list,map_category_list,"name");

                }   
            }
    });

    //台北市資料大平台 環保旅店
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=adef2044-760f-40bd-8e13-a7fda6d011de","環保旅店","名稱","地址",null,null,"name")

    //台北市資料大平台 臺北市電動機車充電地址及充電格位
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=c2b666e0-f848-4609-90cb-5e416435b93a","臺北市電動機車充電地址","單位","地址",null,null,"name")

    //台北市資料大平台 臺北市社區資源回收站資訊
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=0ab06b17-3ac0-4a7b-9e64-66ef69bba697","臺北市社區資源回收站資訊","回收站名稱","地址",null,null,"address")

    //台北市資料大平台 臺北市環境教育機構
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=9d6b643e-5d71-46e7-8368-eb0aaf907171","臺北市環境教育機構","機構名稱","機構地址",null,"機關網址","name")

    //台北市資料大平台 臺北市廢棄物處理場
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=13ac57a2-f4a1-4e9b-9372-9ce1c7f85df0","臺北市廢棄物處理場","Chinese_name","addr",null,null,"name")

    //台北市資料大平台 臺北市拖吊場
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=24045907-b7c3-4351-b0b8-b93a54b55367","臺北市拖吊場","拖吊保管場名稱","地址",null,null,"name")

    //台北市資料大平台 臺北市各區公所聯絡資訊
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=a0484907-e5ce-4d5b-ac4a-42c1e7684326","臺北市各區公所聯絡資訊","name","address",null,null,"name")

    //台北市資料大平台 臺北市休閒農場
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=2bbc419c-d774-4bcf-812b-b87b6fd15abb","臺北市休閒農場","農場名稱","地址","農場主要特色簡介",null,"name")

    //台北市資料大平台 臺北市各區運動中心
    taipei_city_request ("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=e7c46724-3517-4ce5-844f-5a4404897b7d","臺北市各區運動中心","name","addr",null,null,"name")

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
                        information:data[i]["備註"]
                    };
                    map_list.address = full_to_half　(map_list.address);
                    map_list.address = number_change_words(map_list.address);
                    map_list.address = add_taipet_city(map_list.address);
                    if(!map_list.address.includes("區")){
                        map_list.address = await find_district(map_list.address);
                    };

                    let map_category_list = {
                        address:map_list.address,
                        category:"博物館"
                    };

                    map_list.address = number_change_words(map_list.address)

                    core_geocode_function (map_list,map_category_list,"name");

                }   
            }
    });

    //中華郵政 臺北市郵局
    (async () => {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto('https://www.post.gov.tw/post/internet/I_location/index_all.jsp');
        await page.waitForSelector("#FooterContainer")
        await page.select('#city', '臺北市');
        await page.click("#pointbluelineTitle > div > form > input");
        await page.waitForSelector("#FooterContainer");
    
        // get data details
        const result = await page.evaluate(() => {
            let data_name_array = [];
            let data_name = document.querySelectorAll('a.rwd-close')
            let data_address_array = [];
            let data_address = document.querySelectorAll('td.detail')
            data_name.forEach((item) => {
                if(!item.innerText.trim() == ""){
                    data_name_array.push(item.innerText.trim())
                };
            });
            data_address.forEach((item) => {
                if(!item.innerText.trim() == ""){
                    data_address_array.push(item.innerText.trim())
                };
            });
    
            return {
                name:data_name_array,
                address:data_address_array
            }
       })
    
       await puppeteer_for_geocode_function ("臺北市郵局",result,null,null,"name");
       
       await browser.close();
    })();

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

        await puppeteer_for_geocode_function ("十二區健康服務中心",result,null,null,"name");
        
        await browser.close();
    })();




});



