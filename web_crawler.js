const schedule = require('node-schedule');                          //node-schedule 模組，可定時執行
const request = require('request');                                 // request 模組
const cheerio = require("cheerio");                                   //爬蟲時，可以讓前端的東西變成 DOM 物件
const axios = require('axios');                                    //讓 request 變成 promise 物件
const mysql=require("./mysql_connection.js");                       // MySQL Initialization
const dao_map = require("./dao/map.js")                             // dao_map.js 檔
const googleMapsClient = require('@google/maps').createClient({     //google 可用 gecoding 功能
    key: 'AIzaSyAkK5NajaFKNXkYT2WsdB96edSWRo5kYhY',
    Promise: Promise
});






let sleep = function(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
};

let replace_fullwidth_and_symbol = function(address){
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
    address = address.replace(/\[/g, "(");
    address = address.replace(/\]/g, ")");
    address = address.replace(/［/g, "(");
    address = address.replace(/］/g, ")");
    address = address.replace(/号/g, "號");
    address = address.replace(/～/g, "~");
    return address;
};

let number_change_words = function(address){
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

let word_change_number = function(address){
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

let find_address_district = async function(address) {
   
    let address_URI =encodeURI(address);
    let new_address

    await axios.get(`https://zip5.5432.tw/zip5json.py?adrs=${address_URI}&_=1569334120491`)
    .then(function (response) {
        if(response.data.zipcode.substring(0,3).includes("100")){
            new_address = [address.slice(0, 3),"中正區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("103")){
            new_address = [address.slice(0, 3),"大同區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("104")){
            new_address = [address.slice(0, 3),"中山區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("105")){
            new_address = [address.slice(0, 3),"松山區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("106")){
            new_address = [address.slice(0, 3),"大安區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("108")){
            new_address = [address.slice(0, 3),"萬華區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("110")){
            new_address = [address.slice(0, 3),"信義區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("111")){
            new_address = [address.slice(0, 3),"士林區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("112")){
            new_address = [address.slice(0, 3),"北投區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("114")){
            new_address = [address.slice(0, 3),"內湖區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("115")){
            new_address = [address.slice(0, 3),"南港區",address.slice(3)].join("");
            return new_address;
        }if(response.data.zipcode.substring(0,3).includes("116")){
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
};

let address_add_taipet_city = function(address){
    if(address.includes("台北市")){
        address = address.replace("台北市", "臺北市");
    }

    if(!address.includes("臺北市")){
        address = [address.slice(0, 0), "臺北市", address.slice(0)].join('');
    }
    return address;
};

let complete_the_address = async function(address){
    address = address.replace(/F/g, "樓");
    address = address.replace(/Ｆ/g, "樓");
    address = address.replace(/f/g, "樓");
    address = address.replace(/ｆ/g, "樓");
    address = address.replace(/Ｂ/g, "B");
    address = address.replace(/\./g, "、"); 
  
    address = replace_fullwidth_and_symbol(address);
    address = number_change_words(address);
    address = word_change_number(address);
    address = address_add_taipet_city(address);
    address = address.replace(/ *\([^)]*\) */g, "");

    //把臺北市前面的郵遞區號拿掉
    for(let i = 0 ; i<address.length ; i++){
        if(address.charAt(i) == "臺"){
            address = address.substring(i, address.length);
        }
    }

    await sleep(2000); //太快會被禁 官方建議1-2秒

    if(!address.includes("區")){
        address =await find_address_district(address);
    };
    
    return address;
}

let complete_the_name = function(name){
    if(name.includes("台北")){
        name = name.replace("台北", "臺北");
    }
    if(name.includes("台灣")){
        name = name.replace("台灣", "臺灣");
    }
    name = replace_fullwidth_and_symbol(name);
    name = number_change_words(name);
    name = word_change_number(name);
    return name;
}

let check_address_update_or_insert =async function(select_condition,map_data,category){

    if(select_condition == "name"){
        //若地名一樣的話(雖然不是很準但至少完全一樣)，可以略過轉經緯度的步驟，直接更新資料，
        let select_map_name_result = await dao_map.select ("map","name",map_data.name);
    
        if(select_map_name_result.length > 0){
            if(!select_map_name_result[0].category.includes(category)){
                map_data.category=select_map_name_result[0].category+category;
            }
            let update_map_result = await dao_map.update("map","name",map_data.name,map_data,map_data.name);
            return "update";
        }
        return "for_geocode";

    }else{
        //用經緯度+地址 三個條件判斷，因為光靠地址還是會有經緯度不一樣的情況
        let select_map_address_result = await dao_map.select_3("map","address",map_data.address,"longitude",map_data.longitude,"latitude",map_data.latitude);
        
        if(select_map_address_result.length>0){

            if(!select_map_address_result[0].category.includes(category)){
                map_data.category=select_map_address_result[0].category+category;
            }

            let update_map_address_result = await dao_map.update_3("map","address",map_data.address,"longitude",map_data.longitude,"latitude",map_data.latitude,map_data,map_data.name);

        }else{
            map_data.category=category;

            let insert_map_result = await dao_map.insert("map",map_data,map_data.name);
        }
    }



}

let is_name_in_taipei_city_or_empty = function(geocode_result){
   return (geocode_result.length == 0 || (!geocode_result[0].formatted_address.includes("Taipei") || geocode_result[0].formatted_address.includes("New")))
}

let data_for_geocode_and_insert = async function(map_data,category){

    //因為現在沒有經緯度協助判斷的話，會有經緯度不一樣但地址一樣的地點無法插入，只好全部先用轉換經緯度，經緯度地點不一樣當作判斷，畢竟地名不是可靠的變數可以當作參考值，雖然很浪費流量，但為了精準度只好選擇


    //若地名一樣的話(雖然不是很準但至少完全一樣)，可以略過轉經緯度的步驟，直接更新資料
    let check_address_result = await check_address_update_or_insert("name",map_data,category)
    if(check_address_result == "update"){
        return;
    }

    //先用地名去轉經緯度
    let geocode_result = await geocode_function(map_data.name);

    //如果地名轉失敗，用地址轉經緯度
    if(is_name_in_taipei_city_or_empty(geocode_result)){
        console.log(map_data.name+" 名稱搜尋不到，改換地址搜尋");

        geocode_result = await geocode_function(map_data.address);
    }

    map_data.longitude=geocode_result[0].geometry.location.lng;
    map_data.latitude=geocode_result[0].geometry.location.lat;

    check_address_update_or_insert("address",map_data,category);
   
}


let geocode_function =async function(name_or_address){

    let result;

    await sleep(100);
    await googleMapsClient.geocode({address: name_or_address})
    .asPromise()
    .then(async (response) => {
        result = response.json.results;
    })
    .catch((err) => {
        console.log(err);
    });

    return result;
}


let address_skip_or_not = function(address){
    return ((!address.includes("路") && !address.includes("段") && !address.includes("號")&& !address.includes("街")) || address.length > 50 || address.length < 5)
}

let taipei_city_government_request = async function (url,category,place_icon,api_name,api_address, api_information){
    request({
        url:url,
        method:"GET"
    },async function(error, response, body){
        if(body.error){
            console.log(body.error);
        }else{
            let data = JSON.parse(body);

            data = data.result.results;

            for(let i=0; i<data.length; i++){

                let map_list={
                    name:data[i][api_name],
                    address:data[i][api_address],
                    place_icon:place_icon
                };

                if (api_information !== null){
                    map_list.information = data[i].information;
                }
                
                if(address_skip_or_not(map_list.address)){
                    continue;
                }
                
                map_list.address =await complete_the_address(map_list.address);
                map_list.name = complete_the_name(map_list.name);
        
                data_for_geocode_and_insert(map_list,category);

            }   
        }
    });
};


let government_request = async function (url,category,location,taipei_city,place_icon,api_name,api_address, api_information){
    request({
        url:url,
        method:"GET"
    },async function(error, response, body){
        if(body.error){
            console.log(body.error);
        }else{
            let data = JSON.parse(body);
            
            if(data.result){
                //為了台北市政府資料平台而設定的
                data = data.result.results;
            }

            for(let i=0; i<data.length; i++){
                if (data[i][location].includes(taipei_city)){
                    let map_list={
                        name:data[i][api_name],
                        address:data[i][api_address],
                        place_icon:place_icon
                    };

                    if (api_information !== null){
                        map_list.information = data[i].information;
                    }
                    
                    if(address_skip_or_not(map_list.address)){
                        continue;
                    }
                    
                    map_list.address =await complete_the_address(map_list.address);
                    map_list.name = complete_the_name(map_list.name);
            
                    data_for_geocode_and_insert(map_list,category);
                }
            }   
        }
    });
};



government_request("https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=M","獨立書店","cityName","臺北市","store","name","address","intro");




let on_schedule = schedule.scheduleJob('0 0 0 1 1 */1', async function(){

    // 政府資料開放平台 博物館
    request({
        url:"https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=H",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                data = JSON.parse(body);
     
                for (let i = 0; i<data.length;i++){
                    if (data[i].cityName.includes("臺北市")){
                        
                        let map_list={
                            name:data[i].name,
                            address:data[i].cityName+data[i].address,
                            place_icon:"museum",
                            information:data[i].ticketPrice
                        };

                        if(address_skip_or_not(map_list.address)){
                            continue;
                        }


                        map_list.address =await complete_the_address(map_list.address);
                        map_list.name = complete_the_name(map_list.name);

                        data_for_geocode_and_insert(map_list,"博物館");

                    }
                };
            }
    });

    //台北市資料大平台 藝文館所
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=dfad2ec4-fa19-4b2f-9efb-f6fe3456f469","藝文館所","museum_art","venues_name","address",null);

    //台北市資料大平台 文化資產
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=d40ee29c-a538-4a87-84f0-f43acfa19a20",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                let data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    data[i].building_brief = number_change_words(data[i].building_brief);

                    let map_list={
                        name:data[i].case_name,
                        address:data[i].belong_city_name+data[i].belong_address,//去掉空格
                        place_icon:"ruins",
                        information:data[i].building_brief
                    };

                    if(address_skip_or_not(map_list.address)){
                        continue;
                    }

                    map_list.address =await complete_the_address(map_list.address);
                    map_list.name = complete_the_name(map_list.name);

                    data_for_geocode_and_insert(map_list,"文化資產");

                }   
            }
    });

    //台北市資料大平台 環保旅店
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=adef2044-760f-40bd-8e13-a7fda6d011de","環保旅店","lodging","名稱","地址",null);

    //台北市資料大平台 臺北市電動機車充電地址及充電格位
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=c2b666e0-f848-4609-90cb-5e416435b93a","電動機車充電","charging","單位","地址",null);

    //台北市資料大平台 臺北市社區資源回收站資訊
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=0ab06b17-3ac0-4a7b-9e64-66ef69bba697","社區資源回收站","recycle","回收站名稱","地址",null);

    //台北市資料大平台 臺北市環境教育機構
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=9d6b643e-5d71-46e7-8368-eb0aaf907171","環境教育機構","education","機構名稱","機構地址",null);

    //台北市資料大平台 臺北市廢棄物處理場
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=13ac57a2-f4a1-4e9b-9372-9ce1c7f85df0","廢棄物處理場","other","Chinese_name","addr",null);

    //台北市資料大平台 臺北市拖吊場
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=24045907-b7c3-4351-b0b8-b93a54b55367","拖吊場","other","拖吊保管場名稱","地址",null);

    //台北市資料大平台 臺北市各區公所聯絡資訊
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=a0484907-e5ce-4d5b-ac4a-42c1e7684326","區公所","government","name","address",null);

    //台北市資料大平台 臺北市休閒農場
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=2bbc419c-d774-4bcf-812b-b87b6fd15abb","休閒農場","farm","農場名稱","地址","農場主要特色簡介");

    //台北市資料大平台 臺北市各區運動中心
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=e7c46724-3517-4ce5-844f-5a4404897b7d","運動中心","sport","name","addr",null);

    //台北市資料大平台 臺北市居家護理所
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=77b20322-618d-4a1e-aaaa-bf42a363dcc9","護理所","therapy","機構名稱","地址",null);

    //台北市資料大平台 臺北市預防接種合約院所  要放在醫院後面 因為裡面還有醫院別類
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=3063803c-8794-4d19-ab1c-3e602dd77506","診所","clinic","title","address_for_display",null);

    //台北市資料大平台 臺北市精神復健機構  
    taipei_city_government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=7ece5203-926a-47a6-a426-2599f1beded1","復健","rehabilitation","機構名稱","地址",null);

    //台北市資料大平台 臺北市合法電子遊戲場業者清冊
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=6a95357f-e76a-4cc0-84f6-27e550ced5e5",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                let data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    let map_list={
                        name:data[i]["公司/商業名稱"],
                        address:"臺北市"+data[i]["行政區"]+data[i]["營業場所地址"],
                        place_icon:"game",
                        information:data[i]["備註"]
                    };

                    if(address_skip_or_not(map_list.address)){
                        continue;
                    }

                    map_list.address =await complete_the_address(map_list.address);
                    map_list.name = complete_the_name(map_list.name);

                    data_for_geocode_and_insert(map_list,"電子遊戲場");

                }   
            }
    });

    //台北市資料大平台 戒菸合約醫事機構
    request({
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=43f32f04-e57f-47f5-9658-2494311c0f86",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                let data = JSON.parse(body);

                data = data.result.results;
                
                for (let i = 0; i<data.length;i++){

                    let map_list={
                        name:data[i]["院所名稱"],
                        address:"臺北市"+data[i]["鄉鎮市區"]+data[i]["地址"]
                    };

                    if(address_skip_or_not(map_list.address)){
                        continue;
                    }

                    map_list.address =await complete_the_address(map_list.address);
                    map_list.name = complete_the_name(map_list.name);

                    if(data[i]["層級"] == "藥局"){
                        map_list.place_icon = "drugstore";
                        data_for_geocode_and_insert(map_list,"藥局");
                    }else if (data[i]["層級"] == "牙科診所"){
                        map_list.place_icon = "dentist";
                        data_for_geocode_and_insert(map_list,"牙醫");
                    }else if (data[i]["層級"] == "診所"){
                        map_list.place_icon = "clinic";
                        data_for_geocode_and_insert(map_list,"診所");
                    }else{
                        map_list.place_icon = "hospital";
                        data_for_geocode_and_insert(map_list,"醫院");
                    }

                }   
            }
    });
    
    //台北市資料大平台 高度近視合約醫院
    government_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=29fe058f-8ff8-48c2-b4b1-9948235d90db","眼科","地址","臺北市","eye","醫療院所","地址",null);

    //政府資料開放平台 休閒農業 更新接在臺北休閒農場後面
    government_request("http://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvAttractions.aspx","休閒農場","City","臺北市","farm","Name","Address","Introduction");
    
    //政府資料開放平台 休閒農業 更新接在臺北休閒農場後面 只有多一個
    government_request("http://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvOutdoorEdu.aspx","休閒農場","County","台北市","farm","FarmNm_CH","Address_CH",null);

    //政府資料開放平台 休閒農業 更新接在臺北休閒農場後面 只有多一個
    government_request("http://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvPermitAgri.aspx","休閒農場","CountyName","臺北市","farm","AgriMainName","AgriMainAdrs",null);

    //政府資料開放平台 特色圖書館
    government_request("https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=K","圖書館","cityName","臺北市","library","name","address","intro");

    //政府資料開放平台 獨立書店
    request({
        url:"https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=M",
        method:"GET"
            },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                let data = JSON.parse(body);
            
                for (let i = 0; i<data.length;i++){
                    if (data[i].cityName.includes("臺北市")){
                        
                        let map_list={
                            name:data[i].name,
                            address:data[i].address,
                            place_icon:"store",
                            information:data[i].intro
                        };

                        if(address_skip_or_not(map_list.address)){
                            continue;
                        }

                        map_list.address =await complete_the_address(map_list.address);
                        map_list.name = complete_the_name(map_list.name);

                        data_for_geocode_and_insert(map_list,"獨立書店");

                    }
                };
            }
    });

    government_request("https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=M","獨立書店","cityName","臺北市","store","name","address","intro");



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
    
                        if(address_skip_or_not(map_list.address)){
                            continue;
                        }
    
                        map_list.address =await complete_the_address(map_list.address);
                        map_list.name = complete_the_name(map_list.name);
    
                        data_for_geocode_and_insert(map_list,"郵局");
                    }
                }   
            }
    });

    //社團法人台灣失智症協會 十二區健康服務中心
    request({
        url:"http://tada2002.ehosting.com.tw/Support.Tada2002.org.tw/NewsDtl.aspx?pk=104",
        method:"GET"
        },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                let $ = cheerio.load(body); // 載入 body
    
                let data_name_array = [];
                let data_address_array = [];
    
                $('table > tbody > tr > td > div > span').each((idx,el) => {
                    if(idx >6 && idx % 6 == 1){
                        data_name_array.push($(el).text())
                    };
                    if(idx >6 && idx % 6 == 2){
                        data_address_array.push($(el).text())
                    };
                })
    
                for (let i = 0; i<data_address_array.length;i++){
                 
                    let map_list={
                        name:data_name_array[i],
                        address:data_address_array[i],
                        place_icon:"therapy",
                    };
    
                    if(address_skip_or_not(map_list.address)){
                        continue;
                    }
    
                    map_list.address =await complete_the_address(map_list.address);
                    map_list.name = complete_the_name(map_list.name);
    
                    data_for_geocode_and_insert(map_list,"健康服務中心");
                
                }   
            }
    });

    //維基百科 普通型高級中等學校
    request({
    url:"https://zh.wikipedia.org/wiki/%E4%B8%AD%E8%8F%AF%E6%B0%91%E5%9C%8B%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1%E5%88%97%E8%A1%A8#%E8%87%BA%E5%8C%97%E5%B8%82",
    method:"GET"
        },async function(error, response, body){
        if(body.error){
            console.log(body.error);
        }else{
            let $ = cheerio.load(body); // 載入 body

            let data_name_array = [];
            let data_address_array = [];

            $('#mw-content-text > div > table:nth-child(9) > tbody > tr > td').each((idx,el) => {
                if(idx % 7 == 1){
                   data_name_array.push($(el).text())
                };
                if(idx % 7 == 3){
                   data_address_array.push($(el).text())
                };
            })

            for (let i = 0; i<data_address_array.length;i++){
             
                let map_list={
                    name:data_name_array[i],
                    address:"臺北市"+data_address_array[i],
                    place_icon:"school",
                };

                if(address_skip_or_not(map_list.address)){
                    continue;
                }

                map_list.address =await complete_the_address(map_list.address);
                map_list.name = complete_the_name(map_list.name);

                data_for_geocode_and_insert(map_list,"學校");
            
            }   
        }
    });

    //維基百科 技術型高級中等學校
    request({
    url:"https://zh.wikipedia.org/wiki/%E4%B8%AD%E8%8F%AF%E6%B0%91%E5%9C%8B%E6%8A%80%E8%A1%93%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1%E5%88%97%E8%A1%A8#%E8%87%BA%E5%8C%97%E5%B8%82",
    method:"GET"
        },async function(error, response, body){
        if(body.error){
            console.log(body.error);
        }else{
            let $ = cheerio.load(body); // 載入 body

            let data_name_array = [];
            let data_address_array = [];

            $('#mw-content-text > div > table:nth-child(6) > tbody > tr > td').each((idx,el) => { 
                if(idx % 7 == 1){
                   data_name_array.push($(el).text())
                };
                if(idx % 7 == 3){
                   data_address_array.push($(el).text())
                };
            })

            for (let i = 0; i<data_address_array.length;i++){
             
                let map_list={
                    name:data_name_array[i],
                    address:data_address_array[i],
                    place_icon:"school",
                };

                if(address_skip_or_not(map_list.address)){
                    continue;
                }

                map_list.address =await complete_the_address(map_list.address);
                map_list.name = complete_the_name(map_list.name);

                data_for_geocode_and_insert(map_list,"學校");
            
            }   
        }
    });

    //維基百科 宗教學校
    request({
    url:"https://zh.wikipedia.org/wiki/%E5%8F%B0%E7%81%A3%E5%AE%97%E6%95%99%E5%AD%B8%E6%A0%A1%E5%88%97%E8%A1%A8#%E8%87%BA%E5%8C%97%E5%B8%82",
    method:"GET"
        },async function(error, response, body){
        if(body.error){
            console.log(body.error);
        }else{
            let $ = cheerio.load(body); // 載入 body

            let data_name_array = [];
            let data_address_array = [];

            $('#mw-content-text > div > table:nth-child(8) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(39) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            for (let i = 0; i<data_address_array.length;i++){
             
                let map_list={
                    name:data_name_array[i],
                    address:data_address_array[i],
                    place_icon:"school",
                };

                if(address_skip_or_not(map_list.address)){
                    continue;
                }

                map_list.address =await complete_the_address(map_list.address);
                map_list.name = complete_the_name(map_list.name);

                data_for_geocode_and_insert(map_list,"學校");
            
            }   
        }
    });

    //維基百科 國民中學
    request({
    url:"https://zh.wikipedia.org/wiki/%E8%87%BA%E5%8C%97%E5%B8%82%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%AD%B8%E5%88%97%E8%A1%A8",
    method:"GET"
        },async function(error, response, body){
        if(body.error){
            console.log(body.error);
        }else{
            let $ = cheerio.load(body); // 載入 body

            let data_name_array = [];
            let data_address_array = [];

            $('#mw-content-text > div > table:nth-child(5) > tbody > tr> td').each((idx,el) => {
                //console.log($(el).text(),idx) 
                if(idx > 5 && idx % 5 == 1){
                    //console.log($(el).text(),idx)
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    //console.log($(el).text(),idx)
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(7) > tbody > tr > td').each((idx,el) => {
                //console.log($(el).text(),idx) 
                if(idx > 5 && idx % 5 == 1){
                    //console.log($(el).text(),idx)
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    //console.log($(el).text(),idx)
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(9) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(11) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(13) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(15) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(17) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(19) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(21) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(23) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(25) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            $('#mw-content-text > div > table:nth-child(27) > tbody > tr > td').each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })

            for (let i = 0; i<data_address_array.length;i++){
             
                let map_list={
                    name:data_name_array[i],
                    address:data_address_array[i],
                    place_icon:"school",
                };

                if(address_skip_or_not(map_list.address)){
                    continue;
                }

                map_list.address =await complete_the_address(map_list.address);
                map_list.name = complete_the_name(map_list.name);
                
                data_for_geocode_and_insert(map_list,"學校");
            
            }   
        }
    });

    //維基百科 夜市
    request({
    url:"https://zh.wikipedia.org/wiki/%E8%87%BA%E7%81%A3%E5%A4%9C%E5%B8%82%E5%88%97%E8%A1%A8#%E8%87%BA%E5%8C%97%E5%B8%82",
    method:"GET"
        },async function(error, response, body){
        if(body.error){
            console.log(body.error);
        }else{
            let $ = cheerio.load(body); // 載入 body

            let data_name_array = [];
            let data_address_array = [];

            $('#mw-content-text > div > table:nth-child(10) > tbody > tr > td').each((idx,el) => {
                //console.log($(el).text(),idx) 
                if(idx % 4 == 0){
                    //console.log($(el).text(),idx)
                    data_name_array.push($(el).text())
                };
                if(idx % 4 == 1){
                    //console.log($(el).text(),idx)
                    data_address_array.push($(el).text())
                };
            })


            for (let i = 0; i<data_address_array.length;i++){
             
                let map_list={
                    name:data_name_array[i],
                    address:data_address_array[i],
                    place_icon:"market",
                };

                if(address_skip_or_not(map_list.address)){
                    continue;
                }

                map_list.address =await complete_the_address(map_list.address);
                map_list.name = complete_the_name(map_list.name);
                
                data_for_geocode_and_insert(map_list,"夜市");
            
            }   
        }
    });

    //維基百科 電影院
    request({
        url:"https://zh.wikipedia.org/wiki/%E5%8F%B0%E7%81%A3%E9%9B%BB%E5%BD%B1%E9%99%A2%E5%88%97%E8%A1%A8",
        method:"GET"
            },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                let $ = cheerio.load(body); // 載入 body

                let data_name_array = [];
                let data_address_array = [];

                $('#mw-content-text > div > table:nth-child(6) > tbody > tr > td').each((idx,el) => {
                    //console.log($(el).text(),idx) 
                    if(idx % 6 == 0){
                        //console.log($(el).text(),idx)
                        data_name_array.push($(el).text())
                    };
                    if(idx % 6 == 4){
                        //console.log($(el).text(),idx)
                        data_address_array.push($(el).text())
                    };
                })


                for (let i = 0; i<data_address_array.length;i++){
                
                    let map_list={
                        name:data_name_array[i],
                        address:data_address_array[i],
                        place_icon:"movie",
                    };

                    if(address_skip_or_not(map_list.address)){
                        continue;
                    }

                    map_list.address =await complete_the_address(map_list.address);
                    map_list.name = complete_the_name(map_list.name);
                    
                    data_for_geocode_and_insert(map_list,"電影院");
                
                }   
            }
    })



    //台北市立圖書館 圖書館
    request({
        url:`https://tpml.gov.taipei/News_Content.aspx?n=5319E72A2B31CC90&sms=CFFFC938B352678A&s=E997B413EC53833C`,
        method:"GET",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Host': 'tpml.gov.taipei',
            'Connection': 'keep-alive'
        }
            },async function(error, response, body){
            if(body.error){
                console.log(body.error);
            }else{
                let $ = cheerio.load(body); // 載入 body
                
                let data_name_array = [];
                let data_address_array = [];
                
                $('td').each((idx,el) => {
                    //console.log($(el).text(),idx) 
                    if(idx % 5 == 0 && idx <40){
                        //console.log($(el).text(),idx)
                        data_name_array.push($(el).text())
                    };
                    if(idx % 5 == 1 && idx <40){
                        //console.log($(el).text(),idx)
                        data_address_array.push($(el).text())
                    };
                })

                $('#table_2 > tbody > tr > td').each((idx,el) => {
                    //console.log($(el).text(),idx) 
                    if(idx % 16 == 0){
                        //console.log($(el).text(),idx)
                        data_name_array.push("臺北市立圖書館"+$(el).text())
                    };
                    if(idx % 16 == 2){
                        //console.log($(el).text(),idx)
                        data_address_array.push($(el).text())
                    };
                })

                $('td > a').each((idx,el) => {
                    //console.log($(el).text(),idx) 
                    if(idx % 2 == 0 && idx >45){
                        //console.log($(el).text(),idx)
                        if($(el).text().includes("分館") || $(el).text().includes("總館")){
                            data_name_array.push("臺北市立圖書館"+$(el).text())
                        }else{
                        data_name_array.push($(el).text())
                        }
                    };
                    if(idx % 2 == 1 && idx >45){
                        //console.log($(el).text(),idx)
                        data_address_array.push($(el).text())
                    };
                })

                

                for (let i = 0; i<data_address_array.length;i++){
                
                    let map_list={
                        name:data_name_array[i],
                        address:data_address_array[i],
                        place_icon:"library",
                    };

                    if(address_skip_or_not(map_list.address)){
                        continue;
                    }
                    
                    map_list.address =await complete_the_address(map_list.address);
                    map_list.name = complete_the_name(map_list.name);
                    console.log(map_list)
                    data_for_geocode_and_insert(map_list,"圖書館");
                
                }   
            }
    });
});



