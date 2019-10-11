// list.js

function render_user_all_lists_name(){

    //有使用者 token 才執行下列動作
    if(localStorage.getItem("access_token")){

      let list_data ={
        data : {
          access_token:localStorage.getItem("access_token")
        }
      };

      ajax("post", "/api/map_list/user/result",list_data,function(response_data){
        console.log("顯示使用者所有清單",response_data);

        delete_child_element("user_own_list_content");
        let user_own_list_content = document.getElementsByClassName("user_own_list_content")[0];

        let my_list_explain_arrow = document.createElement("img");
        my_list_explain_arrow.src= "/img/arrow.png"
        my_list_explain_arrow.className = "my_list_explain_arrow";
        user_own_list_content.appendChild(my_list_explain_arrow);


        let my_list_explain = document.createElement("p");
        my_list_explain.innerHTML= "開始建立自己的清單吧!"
        my_list_explain.className = "my_list_explain";
        user_own_list_content.appendChild(my_list_explain);

        if(response_data.length > 0){
          delete_child_element("user_own_list_content");

          for (let i = 0 ;i<response_data.length;i++){
            //製作每一個 list 的內容 img p
            let user_own_list_content = document.getElementsByClassName("user_own_list_content")[0];
            let user_every_list_container = document.createElement("div");
            user_every_list_container.className = "user_every_list_container";
            user_own_list_content.insertBefore(user_every_list_container,user_own_list_content.childNodes[0]);
            //user_own_list_content.appendChild(user_every_list_container);

            let user_list_icon = document.createElement("img");
            user_list_icon.className = "user_list_icon";
            user_list_icon.src = `/img/${response_data[i].list_icon}.png`
            user_every_list_container.appendChild(user_list_icon);

            let user_list_name = document.createElement("p");
            user_list_name.className = "user_list_name";
            user_list_name.id = `${response_data[i].list_id}`;
            user_list_name.setAttribute("onClick", "open_a_list(this)");
            user_list_name.innerHTML = response_data[i].list_name;
            user_every_list_container.appendChild(user_list_name);

            let label = document.createElement("label");
            label.className = "switch";
            user_every_list_container.appendChild(label);

            let input = document.createElement("input");
            input.className = "switch_toggle";
            input.type = "checkbox";
            if(response_data[i].appear_list == "true"){
              input.checked = true;
            }
            input.setAttribute("onclick","appear_list_or_not(this)")
            label.appendChild(input);

            let span = document.createElement("span");
            span.className = "slider round";
            label.appendChild(span);
          }
        }  
      })
    }
  }
  
function render_a_list_all_place_name(list){
    
    let list_data = {
      data:list
    }

    ajax("post", "/api/map_list/user/place/show",list_data,function(response_data){

      console.log(response_data);

      let a_list_content = document.getElementsByClassName("a_list_content")[0];

      if(response_data.length == 0){
        let a_list_explain = document.createElement("p");
        a_list_explain.className = "a_list_explain";
        a_list_explain.innerHTML = "此清單尚未收藏地點";
        a_list_content.appendChild(a_list_explain);

        let a_list_explain_1 = document.createElement("p");
        a_list_explain_1.className = "a_list_explain";
        a_list_explain_1.innerHTML = "點選喜歡的地標，開始收藏吧";
        a_list_content.appendChild(a_list_explain_1);



      }else{
        //製作新的 place 的內容 p
        for(let i =0; i<response_data.length ; i++){     

          let user_place_container = document.createElement("div");
          user_place_container.className = "user_place_container";
          a_list_content.appendChild(user_place_container);

          let new_place_name = document.createElement("p");
          new_place_name.className = "user_place_name";
          new_place_name.id = response_data[i].longitude+"_"+response_data[i].latitude+"_"+response_data[i].place_order
          new_place_name.innerHTML = response_data[i].place_name;
          new_place_name.setAttribute("onClick", "change_center_to_place(this)");
          user_place_container.appendChild(new_place_name);

          let user_delete_place = document.createElement("p");
          user_delete_place.className = "user_delete_place";
          user_delete_place.innerHTML = "&times;";
          user_delete_place.setAttribute("onClick", "delete_user_place(this)");
          user_place_container.appendChild(user_delete_place);
        }
      }
      console.log("顯示地點列表完成")
    })

}
 
function render_collection_list_or_not(list){
    
    ajax("post", "/api/map_list/user/result",list,function(response_data){
        console.log(response_data);

        let a_place_content = document.getElementsByClassName("a_place_content")[0];

        if(response_data.length ==0){
            let a_place_explain = document.createElement("p");
            a_place_explain.className = "a_place_explain";
            a_place_explain.innerHTML = "噢不，目前沒有清單可以收藏";
            a_place_content.appendChild(a_place_explain);

            let a_place_explain_1 = document.createElement("p");
            a_place_explain_1.className = "a_place_explain";
            a_place_explain_1.innerHTML = "趕緊建立一個新的清單吧";
            a_place_content.appendChild(a_place_explain_1);


        }else{
            for (let i = 0 ;i<response_data.length;i++){
                //製作每一個 list 的內容 p
                let list_cotainer = document.createElement("div");
                list_cotainer.className = "list_cotainer"
                a_place_content.appendChild(list_cotainer);

                let list_icon = document.createElement("img");
                list_icon.src = `/img/${response_data[i].list_icon}.png`
                list_cotainer.appendChild(list_icon);

            
                let new_list_name = document.createElement("p");
                new_list_name.className = "user_list";
                new_list_name.id = `${response_data[i].list_id}`;
                new_list_name.setAttribute("onClick", "open_a_list(this)");
                new_list_name.innerHTML = response_data[i].list_name;
                list_cotainer.appendChild(new_list_name);

                let collection_button = document.createElement("button");
                collection_button.className = "collection_button";
                if(response_data[i].check_place_is_exist == "true"){
                collection_button.innerHTML = "移除";
                }else{
                collection_button.innerHTML = "收藏";
                }
                collection_button.setAttribute("onClick", "store_place_in_list(this)");
                list_cotainer.appendChild(collection_button);
            
            }
        }

    })
}

function close_slidebar() {
    document.getElementById("search_list_and_place").style.width = "0";
    document.getElementById("a_public_list").style.width = "0";
    document.getElementById("a_list").style.width = "0";
    document.getElementById("a_place").style.width = "0";
    document.getElementById("user_own_list").style.width = "0";

    document.getElementById("map").style.marginLeft= "0";
    document.getElementById("open_bar").style.marginLeft = "0";
    document.getElementById("close_bar").style.marginLeft = "0";
    document.getElementById("open_search_bar").style.marginLeft = "0";
}

function close_a_place_slidebar(){
    document.getElementById("a_place").style.width = "0px";

    if (document.getElementById("a_public_list").style.width == "0px" && document.getElementById("a_list").style.width == "0px" && document.getElementById("search_list_and_place").style.width == "0px" && document.getElementById("user_own_list").style.width == "0px"){
        document.getElementById("map").style.marginLeft = "0px";
        document.getElementById("open_bar").style.marginLeft = "0";
        document.getElementById("close_bar").style.marginLeft = "0";
        document.getElementById("open_search_bar").style.marginLeft = "0";
    }

}
  
function reset_input(){
    document.querySelector('#list_name').value="";
    document.getElementById("reset").checked = true;
}

function send_list_name(){

    let insert_list ={
      category : document.querySelector('input[name="category"]:checked').value,
      list_name : document.getElementsByName("list_name")[0].value,
      list_icon : document.querySelector('input[name="pattern"]:checked').value,
      access_token : localStorage.getItem("access_token")
    }

    if (insert_list.list_name == "" || insert_list.list_name == undefined){
      alert("! 請輸入清單名稱");
      return;
    }

    let list_data = {
      data:insert_list
    }

    ajax("post", "/api/map_list/user/list",list_data,function(response_data){

      console.log(response_data);      
      delete_child_element("user_own_list_content")
      render_user_all_lists_name();
      close_list_input_and_edit();
      reset_input();
    })
}

function open_a_list(e) {
    console.log(e)
    
    let new_a_list_name = document.getElementsByClassName("a_list_title")[0];
    new_a_list_name.innerHTML="";

    delete_child_element("a_list_content");

    close_slidebar();

    document.getElementById("a_list").style.width = "300px";
    document.getElementById("map").style.marginLeft = "300px";
    document.getElementById("open_bar").style.marginLeft = "300px";
    document.getElementById("close_bar").style.marginLeft = "300px";
    document.getElementById("open_search_bar").style.marginLeft = "300px";
 
    new_a_list_name.id = e.id;
    new_a_list_name.className = "a_list_title";
    new_a_list_name.innerHTML = e.innerHTML;

    let user_a_list_icon = document.getElementsByClassName("user_a_list_icon")[0];
    user_a_list_icon.src = e.parentElement.children[0].src;

    let select_place ={
      access_token : localStorage.getItem("access_token"),
      list_name : e.innerHTML
    }
    console.log(select_place);

    render_a_list_all_place_name(select_place);

}

function confirm_delete() {
    
    let remove = confirm("確定是否刪除此清單?");
    if(remove == true){
      delete_a_list();
    }
}

function open_list_input() {
    if(localStorage.getItem("access_token")== undefined){
      alert("! 欲使用此功能，請先登入");
    }else{
      document.getElementById("input_list_name").style.width = "100%";
    }
}

function open_list_edit(e) {
    if(localStorage.getItem("access_token")== undefined){
      alert("! 欲使用此功能，請先登入");
    }else{
      document.getElementById("edit_list_name").style.width = "100%";
      document.getElementById("list_name_edit").value = e.parentElement.children[1].innerHTML;
    }
}

function close_list_input_and_edit() {
    document.getElementById("input_list_name").style.width = "0";
    document.getElementById("edit_list_name").style.width = "0";
}


// 選擇不同模式下 input 的 placeholder 會改變
function switch_for_search_condition (){
   
    let search_condition = document.getElementsByClassName("checkbox")[0];

    if(search_condition.checked == false){
      document.getElementById("search_list_and_place_input").placeholder = "搜尋他人清單"
    }else{
      document.getElementById("search_list_and_place_input").placeholder = "搜尋地點"
    }

}

render_user_all_lists_name();