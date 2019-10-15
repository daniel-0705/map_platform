const schedule = require('node-schedule');                          //node-schedule 模組，可定時執行
const cheerio = require("cheerio");                                   //爬蟲時，可以讓前端的東西變成 DOM 物件
const axios = require('axios');                                    //讓 request 變成 promise 物件
// const mysql= require("./mysql_connection.js");                       // MySQL Initialization
const googleMapsClient = require('@google/maps').createClient({     //google 可用 gecoding 功能
    key: 'AIzaSyAkK5NajaFKNXkYT2WsdB96edSWRo5kYhY',
    Promise: Promise
});
const crawler = require("../crawler/crawler_function.js")                             // crawler_function.js 檔
const express = require("express"); // express 模組
const app = express(); // express 模組



let leisure_farm_update_on_schedule = schedule.scheduleJob('* */1 * * * *', async function(){
    console.log("gogo")
    //台北市資料大平台 臺北市休閒農場
    let taipei_leisure_farm = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=2bbc419c-d774-4bcf-812b-b87b6fd15abb",
        category:"休閒農場",
        place_icon:"farm",
        place_name:"農場名稱",
        place_address:"地址",
        place_information:"農場主要特色簡介"
    };
    crawler.taipei_city_government_request(taipei_leisure_farm);

    //政府資料開放平台 休閒農業 更新接在臺北休閒農場後面
    let attractions_leisure_farm = {
        url:"http://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvAttractions.aspx",
        category:"休閒農場",
        location:"City",
        taipei_city:"臺北市",
        place_icon:"farm",
        place_name:"Name",
        place_address:"Address",
        place_information:"Introduction"
    };
    crawler.government_request(attractions_leisure_farm);
    
    //政府資料開放平台 休閒農業 更新接在臺北休閒農場後面 只有多一個
    let outdoor_edu_leisure_farm = {
        url:"http://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvOutdoorEdu.aspx",
        category:"休閒農場",
        location:"County",
        taipei_city:"台北市",
        place_icon:"farm",
        place_name:"FarmNm_CH",
        place_address:"Address_CH",
        place_information:null
    };
    crawler.government_request(outdoor_edu_leisure_farm);

    //政府資料開放平台 休閒農業 更新接在臺北休閒農場後面 只有多一個
    let permit_agri_leisure_farm = {
        url:"http://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvPermitAgri.aspx",
        category:"休閒農場",
        location:"CountyName",
        taipei_city:"臺北市",
        place_icon:"farm",
        place_name:"AgriMainName",
        place_address:"AgriMainAdrs",
        place_information:null
    };
    crawler.government_request(permit_agri_leisure_farm);
});

let library_and_book_store_update_on_schedule = schedule.scheduleJob('* * * 2 */1 *', async function(){

    //台北市立圖書館 圖書館
    axios({
        method: 'get',
        url: 'https://tpml.gov.taipei/News_Content.aspx?n=5319E72A2B31CC90&sms=CFFFC938B352678A&s=E997B413EC53833C',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Host': 'tpml.gov.taipei',
            'Connection': 'keep-alive'
        }
    })
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body
                
        let data_name_array = [];
        let data_address_array = [];
        
        $('td').each((idx,el) => {
            if(idx % 5 == 0 && idx <40){
                data_name_array.push($(el).text())
            };
            if(idx % 5 == 1 && idx <40){
                data_address_array.push($(el).text())
            };
        })

        $('#table_2 > tbody > tr > td').each((idx,el) => {
            if(idx % 16 == 0){
                data_name_array.push("臺北市立圖書館"+$(el).text())
            };
            if(idx % 16 == 2){
                data_address_array.push($(el).text())
            };
        })

        $('td > a').each((idx,el) => {
            if(idx % 2 == 0 && idx >45){
                if($(el).text().includes("分館") || $(el).text().includes("總館")){
                    data_name_array.push("臺北市立圖書館"+$(el).text())
                }else{
                    data_name_array.push($(el).text())
                }
            };
            if(idx % 2 == 1 && idx >45){
                data_address_array.push($(el).text())
            };
        })

        for (let i = 0; i<data_address_array.length;i++){ 
            
            let address_and_name_data = {
                category:"圖書館",
                place_icon:"library",
                place_name:data_name_array[i],
                place_address:data_address_array[i],
                place_information:null
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data);     
        }   
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

    //政府資料開放平台 獨立書店
    let indie_book_store = {
        url:"https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=M",
        category:"獨立書店",
        location:"cityName",
        taipei_city:"臺北市",
        place_icon:"store",
        place_name:"name",
        place_address:"address",
        place_information:"intro"
    };
    crawler.government_request(indie_book_store);


    //政府資料開放平台 特色圖書館
    let special_library = {
        url:"https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=K",
        category:"圖書館",
        location:"cityName",
        taipei_city:"臺北市",
        place_icon:"library",
        place_name:"name",
        place_address:"address",
        place_information:"intro"
    };
    crawler.government_request(special_library);


});

let health_update_on_schedule = schedule.scheduleJob('* * * 3 */1 *', async function(){

    //台北市資料大平台 臺北市居家護理所
    let nursing_facility = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=77b20322-618d-4a1e-aaaa-bf42a363dcc9",
        category:"護理所",
        place_icon:"therapy",
        place_name:"機構名稱",
        place_address:"地址",
        place_information:null
    }
    crawler.taipei_city_government_request(nursing_facility);

    //台北市資料大平台 臺北市精神復健機構
    let rehabilitation_institute = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=7ece5203-926a-47a6-a426-2599f1beded1",
        category:"復健",
        place_icon:"rehabilitation",
        place_name:"機構名稱",
        place_address:"地址",
        place_information:null
    }
    crawler.taipei_city_government_request(rehabilitation_institute);

    //台北市資料大平台 臺北市預防接種合約院所  要放在醫院前面 因為裡面還有醫院別類
    let inoculation_hotel = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=3063803c-8794-4d19-ab1c-3e602dd77506",
        category:"診所",
        place_icon:"clinic",
        place_name:"title",
        place_address:"address_for_display",
        place_information:null
    }
    crawler.taipei_city_government_request(inoculation_hotel);

    //台北市資料大平台 高度近視合約醫院
    let myopia_hospital = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=29fe058f-8ff8-48c2-b4b1-9948235d90db",
        category:"眼科",
        location:"地址",
        taipei_city:"臺北市",
        place_icon:"eye",
        place_name:"醫療院所",
        place_address:"地址",
        place_information:null
    };
    crawler.government_request(myopia_hospital);

    //台北市資料大平台 戒菸合約醫事機構
    let drug_dentist_clinic_hospital_request = await crawler.normal_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=43f32f04-e57f-47f5-9658-2494311c0f86");

    drug_dentist_clinic_hospital_request = drug_dentist_clinic_hospital_request.data.result.results;

    for (let i = 0; i<drug_dentist_clinic_hospital_request.length; i++){

        let map_list={
            name:drug_dentist_clinic_hospital_request[i]["院所名稱"],
            address:"臺北市"+drug_dentist_clinic_hospital_request[i]["鄉鎮市區"]+drug_dentist_clinic_hospital_request[i]["地址"]
        };

        if(crawler.address_skip_or_not(map_list.address)){
            continue;
        }

        if(map_list.name == "error"){
            continue;
        }

        map_list.address =await crawler.complete_the_address(map_list.address);
        map_list.name = crawler.complete_the_name(map_list.name);

        if(drug_dentist_clinic_hospital_request[i]["層級"] == "藥局"){
            map_list.place_icon = "drugstore";
            crawler.data_for_geocode_and_insert(map_list,"藥局");
        }else if (drug_dentist_clinic_hospital_request[i]["層級"] == "牙科診所"){
            map_list.place_icon = "dentist";
            crawler.data_for_geocode_and_insert(map_list,"牙醫");
        }else if (drug_dentist_clinic_hospital_request[i]["層級"] == "診所"){
            map_list.place_icon = "clinic";
            crawler.data_for_geocode_and_insert(map_list,"診所");
        }else{
            map_list.place_icon = "hospital";
            crawler.data_for_geocode_and_insert(map_list,"醫院");
        }

    }  

    //社團法人台灣失智症協會 十二區健康服務中心
    axios.get("http://tada2002.ehosting.com.tw/Support.Tada2002.org.tw/NewsDtl.aspx?pk=104")
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body
    
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
            
            let address_and_name_data = {
                category:"健康服務中心",
                place_icon:"therapy",
                place_name:data_name_array[i],
                place_address:data_address_array[i],
                place_information:null
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data);
        }   
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });


});

let school_update_on_schedule = schedule.scheduleJob('* * * 4 */1 *', async function(){

    //維基百科 普通型高級中等學校
    axios.get("https://zh.wikipedia.org/wiki/%E4%B8%AD%E8%8F%AF%E6%B0%91%E5%9C%8B%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1%E5%88%97%E8%A1%A8#%E8%87%BA%E5%8C%97%E5%B8%82")
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body
    
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

        for (let i = 0; i<data_address_array.length; i++){

            let address_and_name_data = {
                category:"學校",
                place_icon:"school",
                place_name:data_name_array[i],
                place_address:"臺北市"+data_address_array[i],
                place_information:null
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data);            
        }   
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

    //維基百科 技術型高級中等學校
    axios.get("https://zh.wikipedia.org/wiki/%E4%B8%AD%E8%8F%AF%E6%B0%91%E5%9C%8B%E6%8A%80%E8%A1%93%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1%E5%88%97%E8%A1%A8#%E8%87%BA%E5%8C%97%E5%B8%82")
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body

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

            let address_and_name_data = {
                category:"學校",
                place_icon:"school",
                place_name:data_name_array[i],
                place_address:data_address_array[i],
                place_information:null
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data); 
        }   
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

    //維基百科 宗教學校
    axios.get("https://zh.wikipedia.org/wiki/%E5%8F%B0%E7%81%A3%E5%AE%97%E6%95%99%E5%AD%B8%E6%A0%A1%E5%88%97%E8%A1%A8#%E8%87%BA%E5%8C%97%E5%B8%82")
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body

        let data_name_array = [];
        let data_address_array = [];

        let elemnt_selector_array= [
            '#mw-content-text > div > table:nth-child(8) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(39) > tbody > tr > td'
        ];

        elemnt_selector_array.map(item =>{
            $(item).each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })
        })

        for (let i = 0; i<data_address_array.length;i++){

            let address_and_name_data = {
                category:"學校",
                place_icon:"school",
                place_name:data_name_array[i],
                place_address:data_address_array[i],
                place_information:null
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data);
        }
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

    //維基百科 國民中學
    axios.get("https://zh.wikipedia.org/wiki/%E8%87%BA%E5%8C%97%E5%B8%82%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%AD%B8%E5%88%97%E8%A1%A8")
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body

        let data_name_array = [];
        let data_address_array = [];

        let elemnt_selector_array= [
            '#mw-content-text > div > table:nth-child(5) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(7) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(9) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(11) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(13) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(15) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(17) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(19) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(21) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(23) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(25) > tbody > tr > td',
            '#mw-content-text > div > table:nth-child(27) > tbody > tr > td'
        ];

        elemnt_selector_array.map(item =>{
            $(item).each((idx,el) => { 
                if(idx > 5 && idx % 5 == 1){
                    data_name_array.push($(el).text())
                };
                if(idx > 5 && idx % 5 == 2){
                    data_address_array.push($(el).text())
                };
            })
        })


        for (let i = 0; i<data_address_array.length;i++){

            let address_and_name_data = {
                category:"學校",
                place_icon:"school",
                place_name:data_name_array[i],
                place_address:data_address_array[i],
                place_information:null
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data);
        }
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });


});

let living_update_on_schedule = schedule.scheduleJob('* * * 25 */1 *', async function(){

    //政府資料開放平台 旅館民宿
    let hotel_and_homestay_request = await crawler.normal_request("https://gis.taiwan.net.tw/XMLReleaseALL_public/hotel_C_f.json");

    hotel_and_homestay_request = JSON.parse(hotel_and_homestay_request.data.substring(1)).XML_Head.Infos.Info;
    
    for (let i = 0; i<hotel_and_homestay_request.length; i++){
        if (hotel_and_homestay_request[i].Add.includes("臺北市")){
            let address_and_name_data = {
                category:"旅館",
                place_icon:"lodging",
                place_name:hotel_and_homestay_request[i].Name,
                place_address:hotel_and_homestay_request[i].Add,
                place_information:hotel_and_homestay_request[i].Description
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data);
        }
    }

    //台北市資料大平台 環保旅店
    let environmental_hotel = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=adef2044-760f-40bd-8e13-a7fda6d011de",
        category:"環保旅店",
        place_icon:"lodging",
        place_name:"名稱",
        place_address:"地址",
        place_information:null
    };
    crawler.taipei_city_government_request(environmental_hotel);

});

let other_update_on_schedule = schedule.scheduleJob('* * * 26 */1 *', async function(){

    //台北市資料大平台 臺北市電動機車充電地址及充電格位
    let moto_charge = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=c2b666e0-f848-4609-90cb-5e416435b93a",
        category:"電動機車充電",
        place_icon:"charging",
        place_name:"單位",
        place_address:"地址",
        place_information:null
    };
    crawler.taipei_city_government_request(moto_charge);

    //台北市資料大平台 臺北市社區資源回收站資訊 
    let recycle_community ={
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=0ab06b17-3ac0-4a7b-9e64-66ef69bba697",
        category:"社區資源回收站",
        place_icon:"recycle",
        place_name:"回收站名稱",
        place_address:"地址",
        place_information:null
    }
    crawler.taipei_city_government_request(recycle_community);

    //台北市資料大平台 臺北市廢棄物處理場
    let waste_disposal_site = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=13ac57a2-f4a1-4e9b-9372-9ce1c7f85df0",
        category:"廢棄物處理場",
        place_icon:"other",
        place_name:"Chinese_name",
        place_address:"addr",
        place_information:null
    }
    crawler.taipei_city_government_request(waste_disposal_site);

    //台北市資料大平台 臺北市拖吊場
    let towing_field = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=24045907-b7c3-4351-b0b8-b93a54b55367",
        category:"拖吊場",
        place_icon:"other",
        place_name:"拖吊保管場名稱",
        place_address:"地址",
        place_information:null
    }
    crawler.taipei_city_government_request(towing_field);

    //台北市資料大平台 臺北市合法電子遊戲場業者清冊
    let video_arcade_request = await crawler.normal_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=6a95357f-e76a-4cc0-84f6-27e550ced5e5");

    video_arcade_request = video_arcade_request.data.result.results;

    for (let i = 0; i<video_arcade_request.length; i++){
        
        let address_and_name_data = {
            category:"電子遊戲場",
            place_icon:"game",
            place_name:video_arcade_request[i]["公司/商業名稱"],
            place_address:"臺北市"+video_arcade_request[i]["行政區"]+video_arcade_request[i]["營業場所地址"],
            place_information:video_arcade_request[i]["備註"]
        };

        crawler.for_loop_insert_address_and_name(address_and_name_data);

    }

    //台北市資料大平台 臺北市各區公所聯絡資訊
    let district_office = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=a0484907-e5ce-4d5b-ac4a-42c1e7684326",
        category:"區公所",
        place_icon:"government",
        place_name:"name",
        place_address:"address",
        place_information:null
    }
    crawler.taipei_city_government_request(district_office);


    //台北市資料大平台 臺北市各區運動中心
    let sports_center = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=e7c46724-3517-4ce5-844f-5a4404897b7d",
        category:"運動中心",
        place_icon:"sport",
        place_name:"name",
        place_address:"addr",
        place_information:null
    }
    crawler.taipei_city_government_request(sports_center);

    //中華郵政 臺北市郵局
    axios.get("https://www.post.gov.tw/post/internet/I_location/index_all.jsp")
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body

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

                let address_and_name_data = {
                    category:"郵局",
                    place_icon:"postal",
                    place_name:data_name_array[i],
                    place_address:data_address_array[i],
                    place_information:null
                };

                crawler.for_loop_insert_address_and_name(address_and_name_data);
            }
        }    
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });


});

let play_on_schedule = schedule.scheduleJob('* * * 27 */1 *', async function(){

    //台北市資料大平台 文化資產   有3個 undefined
    let culter_asset_request = await crawler.normal_request("https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=d40ee29c-a538-4a87-84f0-f43acfa19a20");
    culter_asset_request = culter_asset_request.data.result.results;

    for (let i = 0; i<culter_asset_request.length; i++){

        let address_and_name_data = {
            category:"文化資產",
            place_icon:"ruins",
            place_name:culter_asset_request[i].case_name,
            place_address:culter_asset_request[i].belong_city_name+culter_asset_request[i].belong_address,
            place_information:culter_asset_request[i].building_brief
        };
        
        crawler.for_loop_insert_address_and_name(address_and_name_data);

    }   

    //台北市資料大平台 藝文館所
    let art_and_culture_hall = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=dfad2ec4-fa19-4b2f-9efb-f6fe3456f469",
        category:"藝文館所",
        place_icon:"museum_art",
        place_name:"venues_name",
        place_address:"address",
        place_information:"intro"
    };
    crawler.taipei_city_government_request(art_and_culture_hall);

    //台北市資料大平台 臺北市環境教育機構
    let environmental_education = {
        url:"https://data.taipei/opendata/datalist/apiAccess?scope=resourceAquire&rid=9d6b643e-5d71-46e7-8368-eb0aaf907171",
        category:"環境教育機構",
        place_icon:"education",
        place_name:"機構名稱",
        place_address:"機構地址",
        place_information:null
    }
    crawler.taipei_city_government_request(environmental_education);

    // 政府資料開放平台 博物館
    let museum_request = await crawler.normal_request("https://cloud.culture.tw/frontsite/trans/emapOpenDataAction.do?method=exportEmapJson&typeId=H");

    museum_request = museum_request.data;

    for (let i = 0; i<museum_request.length; i++){

        if (museum_request[i].cityName.includes("臺北市")){

            let address_and_name_data = {
                category:"博物館",
                place_icon:"museum",
                place_name:museum_request[i].name,
                place_address:museum_request[i].cityName+museum_request[i].address,
                place_information:museum_request[i].ticketPrice
            };

            crawler.for_loop_insert_address_and_name(address_and_name_data);
        }
    }

    //維基百科 夜市
    axios.get("https://zh.wikipedia.org/wiki/%E8%87%BA%E7%81%A3%E5%A4%9C%E5%B8%82%E5%88%97%E8%A1%A8#%E8%87%BA%E5%8C%97%E5%B8%82")
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body

        let data_name_array = [];
        let data_address_array = [];

        $('#mw-content-text > div > table:nth-child(10) > tbody > tr > td').each((idx,el) => {
            if(idx % 4 == 0){
                data_name_array.push($(el).text())
            };
            if(idx % 4 == 1){
                data_address_array.push($(el).text())
            };
        })


        for (let i = 0; i<data_address_array.length;i++){

            let address_and_name_data = {
                category:"夜市",
                place_icon:"market",
                place_name:data_name_array[i],
                place_address:data_address_array[i],
                place_information:null
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data);      
        }       
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

    //維基百科 電影院
    axios.get("https://zh.wikipedia.org/wiki/%E5%8F%B0%E7%81%A3%E9%9B%BB%E5%BD%B1%E9%99%A2%E5%88%97%E8%A1%A8")
    .then(function (response) {

        let $ = cheerio.load(response.data); // 載入 body

        let data_name_array = [];
        let data_address_array = [];

        $('#mw-content-text > div > table:nth-child(6) > tbody > tr > td').each((idx,el) => {
            if(idx % 6 == 0){
                data_name_array.push($(el).text())
            };
            if(idx % 6 == 4){
                data_address_array.push($(el).text())
            };
        })

        for (let i = 0; i<data_address_array.length;i++){ 

            let address_and_name_data = {
                category:"電影院",
                place_icon:"movie",
                place_name:data_name_array[i],
                place_address:data_address_array[i],
                place_information:null
            };
            crawler.for_loop_insert_address_and_name(address_and_name_data);             
        }        
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });



});



app.listen(8000, function () {
    console.log("Server is running in http://localhost:8000/")
})