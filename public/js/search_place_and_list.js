// search_place_and_list.js

//新增清單，按下按鍵送出
let list_name = document.getElementById("list_name");
list_name.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
    event.preventDefault();
    send_list_name();
    }
});

//搜尋他人清單
function search_public_list (){
    delete_child_element("search_list_and_place_result");
    let grandpa_list_result = document.getElementsByClassName("search_list_and_place_result")[0];
    let list_data = {
    data:search_list_or_place_input.value
    }

    ajax("post", "/api/map_list/search/list",list_data,function(response_data){
    if(response_data.length == 0){
        let parent_list = document.createElement("p");
        parent_list.className = "no_public_list";
        parent_list.innerHTML = "查無清單，請換關鍵字搜尋"
        grandpa_list_result.appendChild(parent_list);
    }

    for (let i = 0 ;i<response_data.length;i++){
        //製作每一個 list 的內容 
        let parent_list = document.createElement("div");
        parent_list.className = "public_list_container";
        grandpa_list_result.appendChild(parent_list);

        let public_list_icon = document.createElement("img");
        public_list_icon.className = "public_list_icon";
        public_list_icon.src = "/img/point.png";
        parent_list.appendChild(public_list_icon);


        let public_list_name_and_owner = document.createElement("div");
        public_list_name_and_owner.className = "public_list_name_and_owner";
        parent_list.appendChild(public_list_name_and_owner);

        let public_list_name = document.createElement("p");
        public_list_name.innerHTML = response_data[i].list_name;
        public_list_name.id =response_data[i].list_id;
        public_list_name.className = "public_list_name";
        public_list_name.setAttribute("onclick","show_and_open_public_list(this)");
        public_list_name_and_owner.appendChild(public_list_name);

        let public_list_owner = document.createElement("p");
        public_list_owner.innerHTML = response_data[i].user_name;
        public_list_owner.className = "public_list_owner";
        public_list_name_and_owner.appendChild(public_list_owner);

        let list_copy_number_img = document.createElement("img");
        list_copy_number_img.className = "list_copy_number_img";
        list_copy_number_img.src = "/img/multiple-users-silhouette.png";
        parent_list.appendChild(list_copy_number_img);

        let list_copy_number = document.createElement("p");
        list_copy_number.innerHTML = response_data[i].copy_number;
        list_copy_number.className = "list_copy_number";
        parent_list.appendChild(list_copy_number);

        

    }

    })

    
}

//搜尋地點
function search_place (){
    delete_child_element("search_list_and_place_result");
    let grandpa_place_result = document.getElementsByClassName("search_list_and_place_result")[0];

    let place_data = {
    data:search_list_or_place_input.value
    }
    ajax("post", "/api/map_list/search/place",place_data,function(response_data){

    grandpa_place_result.removeAttribute("style");

    if(response_data.length == 0){
        let parent_place = document.createElement("p");
        parent_place.className = "no_place_list";
        parent_place.innerHTML = "查無清單，請換關鍵字搜尋"
        grandpa_place_result.appendChild(parent_place);
    }

    for (let i = 0 ;i<response_data.length;i++){
        //製作每一個 place 的內容 
        let parent_place = document.createElement("div");
        parent_place.className = "place_container";
        parent_place.setAttribute("onclick","change_center_to_place(this.children[1].children[0])")
        grandpa_place_result.appendChild(parent_place);

        let place_img = document.createElement("img");
        place_img.className = "place_img";
        place_img.src = "/img/place_search.png"
        parent_place.appendChild(place_img);

        let name_and_address_container = document.createElement("div");
        name_and_address_container.className = "name_and_address_container";
        parent_place.appendChild(name_and_address_container);

        //為了在搜尋列 顯示地點名稱時知道順序 所以只好用迴圈的方式找出該地名的順序
        let marker_order;
        for (let j =0 ; j <markers.length; j++){
        if(markers[j].name == response_data[i].name){
            marker_order = j;
        }
        }

        let place_name = document.createElement("p");
        place_name.innerHTML = response_data[i].name;
        place_name.id =response_data[i].longitude + "_" + response_data[i].latitude + "_" + marker_order;
        place_name.className = "public_place_name";
        name_and_address_container.appendChild(place_name);

        let place_address = document.createElement("p");
        place_address.innerHTML = response_data[i].address;
        place_address.className = "public_place_address";
        name_and_address_container.appendChild(place_address);


    }
    })
}

let search_list_or_place_input = document.getElementById("search_list_and_place_input");
//搜尋他人清單或是地點
function search_list_or_place (){
    let search_condition = document.getElementsByClassName("checkbox")[0];
    if(search_condition.checked == false){
    search_public_list ();
    }else{
    search_place ();
    }
}

//按下按鍵搜尋他人清單或是地點
search_list_or_place_input.addEventListener("keyup", function(event) {
// Number 13 is the "Enter" key on the keyboard
    //console.log(search_list_or_place_input)
    if (event.keyCode === 13) {
    event.preventDefault();
    search_list_or_place (); 
    }
});

//刪除 input 的內容及搜尋結果
function delete_search_input (){
    delete_child_element("search_list_and_place_result");
    document.getElementById("search_list_and_place_input").value = "";
}


//點擊搜尋地址按鈕外的地方，搜尋列會縮回去 //點擊搜尋地址結果外的地方，搜尋結果會關掉
document.onclick = function(e){

    //點擊地圖以外的地方 infoWindow 會關掉
    if(e.target.id || e.target.className){
    infoWindow.close();
    }

};
