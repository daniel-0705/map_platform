const axios = require('axios');                                    //讓 request 變成 promise 物件
// const mysql= require("./mysql_connection.js");                       // MySQL Initialization
const dao_map = require("../dao/map.js")                             // dao_map.js 檔
const googleMapsClient = require('@google/maps').createClient({     //google 可用 gecoding 功能
    key: 'AIzaSyAkK5NajaFKNXkYT2WsdB96edSWRo5kYhY',
    Promise: Promise
});



let sleep = function(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
};

let replace_fullwidth_and_symbol = function(address){

    address = address.replace(/\s/g, "");
    address = address.replace(/\[/g, "(");
    address = address.replace(/\]/g, ")");

    replace_array = ["１","２","３","４","５","６","７","８","９","０","（","）","［","］","号","～"];
    alternative_array = ["1","2","3","4","5","6","7","8","9","0","(",")","(",")","號","~"]

    for(let i = 0; i < address.length; i++) {
        let word_idx = replace_array.indexOf(address.charAt(i));
        if(word_idx !== -1){
          
            let regex = new RegExp(replace_array[word_idx])
    
            address = address.replace(regex, alternative_array[word_idx]);
        }

    }
    return address;
};

let number_change_words = function(address){

    let word_array = ["一","二","三","四","五","六","七","八","九"];
    let number_array = ["1","2","3","4","5","6","7","8","9"];

    //若第一個字是小 那就會變成 undefined 小，所以從 1 開始
    for (let i = 1; i < address.length; i++) {     
        if((address.charAt(i) == "段" && !isNaN(address.charAt(i-1))) || (address.charAt(i) == "路" && !isNaN(address.charAt(i-1))) || (address.charAt(i) == "小" && !isNaN(address.charAt(i-1))) ){

            let change_word = word_array[number_array.indexOf(address.charAt(i-1))];

            address = address.substr(0, i-1) + change_word + address.substr(i);
        }
    }
    return address;
};

let word_change_number = function(address){

    let word_array = ["一","二","三","四","五","六","七","八","九"];
    let number_array = ["1","2","3","4","5","6","7","8","9"];

    for (let i = 0; i < address.length; i++) { 
        if(address.charAt(i) == "號" && isNaN(address.charAt(i-1)) ){

            if(word_array.indexOf(address.charAt(i-1)) == -1){
                address = "error";
                break;  //error 處理
            }

            let change_word = number_array[word_array.indexOf(address.charAt(i-1))];
            address = address.substr(0, i-1) + change_word + address.substr(i);
        }
    }
    return address;
};

let find_address_district = async function(address) {
   
    let address_URI = encodeURI(address);
    let new_address;

    await axios.get(`https://zip5.5432.tw/zip5json.py?adrs=${address_URI}&_=1569334120491`)
    .then(function (response) {

        let zip_code = ["100","103","104","105","106","108","110","111","112","114","115","116"];
        let taipei_district = ["中正區","大同區","中山區","松山區","大安區","萬華區","信義區","士林區","北投區","內湖區","南港區","文山區"];
        let district_of_address = taipei_district[zip_code.indexOf(response.data.zipcode.substring(0,3))];

        new_address = [address.slice(0, 3),district_of_address,address.slice(3)].join("");
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
    address = address.replace(/號號/g, "號");
    
    address = replace_fullwidth_and_symbol(address);
    address = number_change_words(address);
    address = word_change_number(address);
    if(address == "error"){
        return "error";  //error 處理
    }
    
    address = address_add_taipet_city(address);
    address = address.replace(/ *\([^)]*\) */g, "");
    
    //把臺北市前面的郵遞區號拿掉
    for(let i = 0 ; i<address.length ; i++){
        if(address.charAt(i) == "臺"){
            address = address.substring(i, address.length);
        }
    }
    if(!address.includes("區")){
        await sleep(2000); //太快會被禁 官方建議1-2秒
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
    if(name == "error"){
        return "error";  //error 處理
    }
    return name;
}


let check_address_update_or_insert =async function(select_condition,map_data,category){
    if(select_condition == "name"){
        //若地名一樣的話(雖然不是很準但至少完全一樣)，可以略過轉經緯度的步驟，直接更新資料，
        let select_map_name_result = await dao_map.select("map","name",map_data.name);
        if(select_map_name_result.length > 0){
            if(!select_map_name_result[0].category.includes(category)){
                map_data.category=select_map_name_result[0].category+category;
            }
            //update_map_result 
            await dao_map.update("map","name",map_data.name,map_data,map_data.name);
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

            //update_map_address_result
            await dao_map.update_3("map","address",map_data.address,"longitude",map_data.longitude,"latitude",map_data.latitude,map_data,map_data.name);

        }else{
            map_data.category=category;

            //insert_map_result 
            await dao_map.insert("map",map_data,map_data.name);
        }
    }
}

let is_name_in_taipei_city_or_empty = function(geocode_result){
   return (geocode_result.length == 0 || (!geocode_result[0].formatted_address.includes("Taipei") || geocode_result[0].formatted_address.includes("New")))
}

let data_for_geocode_and_insert = async function(map_data,category){

    //因為現在沒有經緯度協助判斷的話，會有經緯度不一樣但地址一樣的地點無法插入，只好全部先用轉換經緯度，經緯度地點不一樣當作判斷，畢竟地名不是可靠的變數可以當作參考值，雖然很浪費流量，但為了精準度只好選擇


    //若地名一樣的話(雖然不是很準但至少完全一樣)，可以略過轉經緯度的步驟，直接更新資料
    let check_address_result =await check_address_update_or_insert("name",map_data,category)
    if(check_address_result == "update"){
        return;
    }

    //先用地名去轉經緯度
    let geocode_result =await geocode_function(map_data.name);

    //如果地名轉失敗，用地址轉經緯度
    if(is_name_in_taipei_city_or_empty(geocode_result)){
        console.log(map_data.name+" 名稱搜尋不到，改換地址搜尋");
        geocode_result =await geocode_function(map_data.address);
    }

    if(geocode_result.length == 0){
        return;  //error 處理
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
    return ((!address.includes("路") && !address.includes("段") && !address.includes("號")&& !address.includes("街")) || address.length > 50 || address.length < 5 || address == "error")
}

let taipei_city_government_request = function(address_data){

    axios.get(address_data.url)
    .then(function (response) {

        data = response.data.result.results;
        
        for(let i=0; i<data.length; i++){
            
            let address_and_name_data = {
                category:address_data.category,
                place_icon:address_data.place_icon,
                place_name:data[i][address_data.place_name],
                place_address:data[i][address_data.place_address],
                place_information:data[i][address_data.place_information]
            };

            for_loop_insert_address_and_name(address_and_name_data);

        }   
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

};

let government_request = function(address_data){

    axios.get(address_data.url)
    .then(function (response) {
        data = response.data;
            
        if(data.result){
            //為了台北市政府資料平台而設定的
            data = data.result.results;
        }

        for(let i=0; i<data.length; i++){
            if (data[i][address_data.location].includes(address_data.taipei_city)){

                let address_and_name_data = {
                    category:address_data.category,
                    place_icon:address_data.place_icon,
                    place_name:data[i][address_data.place_name],
                    place_address:data[i][address_data.place_address],
                    place_information:data[i][address_data.place_information]
                };

                for_loop_insert_address_and_name(address_and_name_data);

            }
        }   
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

};


let normal_request = async function(url){
    let request_result;

    await axios.get(url)
    .then(function (response) {
        request_result = response;
    })
    .catch(function (error) {
        console.log(error);
    })
    .finally(function () {
    });

    return request_result;
}


let for_loop_insert_address_and_name = async function(address_and_name_data){

    let map_list={
        name:address_and_name_data.place_name,
        address:address_and_name_data.place_address,
        place_icon:address_and_name_data.place_icon
    };
   
    if (address_and_name_data.place_information !== null){
        map_list.information = address_and_name_data.place_information;
    }
    
    map_list.address = await complete_the_address(map_list.address);
    map_list.name = complete_the_name(map_list.name);
    
    if(address_skip_or_not(map_list.address)){
        return;
    }

    if(map_list.name == "error"){
        return;
    }

    data_for_geocode_and_insert(map_list,address_and_name_data.category);

}






module.exports={
    taipei_city_government_request:taipei_city_government_request,
    government_request:government_request,
    for_loop_insert_address_and_name:for_loop_insert_address_and_name,
    normal_request:normal_request,
    address_skip_or_not:address_skip_or_not,
    complete_the_address:complete_the_address,
    complete_the_name:complete_the_name,
    data_for_geocode_and_insert:data_for_geocode_and_insert
};