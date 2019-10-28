/* eslint-disable func-names */
/* eslint-disable camelcase */
window.addEventListener("load", function (event) {
    initMap();
});

let map;
let oms; // 設定 spiderfy的全域變數
const markers = []; // map 上所有公開的地點
let user_markers = []; // 使用者自己所有的地點
let zoom; // 設定 zoom 的全域變數
let infoWindow; // 設定 infoWindow 的全域變數
let search_marker; // 設定 搜尋的 marker 的全域變數

function initMap() {
    // new map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 25.033499866, lng: 121.558997764 },
        zoom: 13,
        options: {
            clickableIcons: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        },
        styles: [
            { elementType: "labels", stylers: [{ visibility: "off" }] }, // 到時候要把這調成 off
            { featureType: "road", elementType: "labels", stylers: [{ visibility: "on" }] },
            { featureType: "transit.station", elementType: "labels", stylers: [{ visibility: "on" }] },
            {
                featureType: "transit.station.bus",
                elementType: "labels",
                stylers: [{ visibility: "on" }]
            },
            { featureType: "water", elementType: "labels", stylers: [{ visibility: "on" }] }
        ]
    });
    render_map_and_user_all_place();

    // 依據 zoom 的大小 決定地圖顯示多少地標
    google.maps.event.addListener(map, "zoom_changed", function () {
        zoom = map.getZoom();

        for (let i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);

            if (zoom > 12) {
                if (
                    markers[i].category.includes("廢棄物處理場") ||
                    markers[i].category.includes("環境教育機構") ||
                    markers[i].category.includes("休閒農場") ||
                    markers[i].category.includes("健康服務中心") ||
                    markers[i].category.includes("藝文館所") ||
                    markers[i].category.includes("運動中心")
                ) {
                    markers[i].setVisible(true);
                }
            }

            if (zoom > 13) {
                if (
                    markers[i].category.includes("區公所") ||
                    markers[i].category.includes("夜市") ||
                    markers[i].category.includes("電影院") ||
                    markers[i].category.includes("獨立書店") ||
                    markers[i].category.includes("博物館") ||
                    markers[i].category.includes("環保旅店")
                ) {
                    markers[i].setVisible(true);
                }
            }
            if (zoom > 14) {
                if (
                    markers[i].category.includes("圖書館") ||
                    markers[i].category.includes("文化資產") ||
                    markers[i].category.includes("郵局") ||
                    markers[i].category.includes("健康服務中心")
                ) {
                    markers[i].setVisible(true);
                }
            }
            if (zoom > 15) {
                if (
                    markers[i].category.includes("醫院") ||
                    markers[i].category.includes("診所") ||
                    markers[i].category.includes("牙醫") ||
                    markers[i].category.includes("電子遊戲場") ||
                    markers[i].category.includes("藥局") ||
                    markers[i].category.includes("眼科") ||
                    markers[i].category.includes("學校") ||
                    markers[i].category.includes("旅館")
                ) {
                    markers[i].setVisible(true);
                }
            }

            if (zoom > 16) {
                if (
                    markers[i].category.includes("社區資源回收站") ||
                    markers[i].category.includes("電動機車充電") ||
                    markers[i].category.includes("拖吊場") ||
                    markers[i].category.includes("護理所") ||
                    markers[i].category.includes("復健")
                ) {
                    markers[i].setVisible(true);
                }
            }
        }
    });
}

// 選擇收藏後會出現清單選項
function select_list(e) {
    if (localStorage.getItem("access_token") == undefined) {
        alert("! 欲使用此功能，請先登入");
    } else {
        const a_place_title = document.getElementsByClassName("a_place_title")[0];

        a_place_title.innerHTML = e.parentElement.children[0].innerHTML;
        a_place_title.id = e.parentElement.children[0].id;

        document.getElementById("a_place").style.width = "300px";
        document.getElementById("map").style.marginLeft = "300px";
        document.getElementById("open_bar").style.marginLeft = "300px";
        document.getElementById("close_bar").style.marginLeft = "300px";
        document.getElementById("open_search_bar").style.marginLeft = "300px";

        delete_child_element("a_place_content");

        const list_data = {
            data: {
                place_name: a_place_title.innerHTML
            }
        };
        render_collection_list_or_not(list_data);
    }
}

function delete_place_function(list_data) {
    ajax("delete", "/api/map_list/user/place", list_data, function (response_data) {
        if (response_data.check_place_is_exist == 0) {
            markers[list_data.data.place_order].setMap(map); // 把原本的地標 調回來
        }

        // 為了在搜尋列 顯示地點名稱時知道順序 所以只好用迴圈的方式找出該地名的順序
        let marker_order;
        for (let j = 0; j < user_markers.length; j++) {
            if (
                user_markers[j].name == list_data.data.place_name &&
                user_markers[j].list == list_data.data.list_name
            ) {
                marker_order = j;
            }
        }
        console.log("list_data", list_data)
        console.log("response_data", response_data)
        console.log(marker_order)
        user_markers[marker_order].setMap(null); // 把使用者先前存的的地標隱藏

        const select_place = {
            list_name: list_data.data.list_name
        };
        // 使用者按下移除後，會顯現收藏的清單名稱及內容
        delete_child_element("a_list_content");
        render_a_list_all_place_name(select_place);

        infoWindow.close(); // 做完動作後要把地標視窗關掉
    });
}

function delete_user_place(e) {
    const place_data = {
        list_name: e.parentElement.parentElement.parentElement.children[0].children[1].innerHTML,
        place_name: e.parentElement.children[0].innerHTML,
        place_order: e.parentElement.children[0].id.split("_")[2]
    };

    const list_data = {
        data: place_data
    };

    delete_place_function(list_data);
}

function store_place_in_list(e) {
    const place_data = {
        list_name: e.parentElement.children[1].innerHTML,
        place_name: e.parentElement.parentElement.parentElement.children[0].children[0].innerHTML,
        place_order: e.parentElement.parentElement.parentElement.children[0].children[0].id
    };

    if (e.innerHTML == "收藏") {
        const list_data = {
            data: place_data
        };

        ajax("post", "/api/map_list/user/place", list_data, function (response_data) {
            response_data = response_data.data;
            // 新增收藏地點
            const marker = new google.maps.Marker({
                position: {
                    lat: Number(response_data[0].latitude),
                    lng: Number(response_data[0].longitude)
                },
                icon: {
                    url: `/img/${response_data[0].list_icon}.png`
                },
                animation: google.maps.Animation.DROP,
                zIndex: 100000,
                map: map
            });

            const user_place_index = user_markers.length;

            // 資訊是空的時候，不要顯示 null
            if (response_data[0].information == null) {
                response_data[0].information = "";
            }

            marker.content = `
        <div class = "infowindow_container">
          <h1 class = "infowindow_title" id = ${response_data[0].place_order}>${response_data[0].place_name}</h1>
          <p class = "infowindow_content" id = ${user_place_index}>${response_data[0].information}</p>
          <br>
          <buttom class = "choice_list" id =${response_data[0].latitude}_${response_data[0].longitude} style = "cursor:pointer" onclick = "select_list(this)">已收藏</buttom>
        </div>
        `;
            infoWindow = new google.maps.InfoWindow();

            e.id = user_place_index; // 判斷使用者新增的地點是排第幾個，方便之後 set null

            // 定義每個地標屬於的清單
            marker.list = response_data[0].list_name;
            // 定義每個地標屬於的地名
            marker.name = response_data[0].place_name;

            oms.addMarker(marker);
            google.maps.event.addListener(marker, "spider_click", function (e) {
                infoWindow.setContent(this.content);
                infoWindow.open(this.getMap(), this);

                close_a_place_slidebar(); // 使用者點擊其他地方時關掉地點收藏的畫面
            });

            infoWindow.close();
            google.maps.event.addListener(map, "click", function () {
                infoWindow.close();
                close_a_place_slidebar(); // 使用者點擊其他地方時關掉地點收藏的畫面
            });

            // 使用者按下收藏後，會顯現收藏的清單名稱及內容
            const new_a_list_name = document.getElementsByClassName("a_list_title")[0];
            new_a_list_name.innerHTML = response_data[0].list_name;
            delete_child_element("a_list_content");
            render_a_list_all_place_name(place_data);

            user_markers.push(marker);
            markers[response_data[0].place_order].setMap(null); // 把原本的地標 隱藏
        });

        e.innerHTML = "移除";
    } else {
        const list_data = {
            data: place_data
        };

        ajax("delete", "/api/map_list/user/place", list_data, function (response_data) {
            if (response_data.check_place_is_exist == 0) {
                markers[place_data.place_order].setMap(map); // 把原本的地標 調回來
            }

            // 區別移除的點是當下存的還是之前存的
            if (e.id == "") {
                // 為了在搜尋列 顯示地點名稱時知道順序 所以只好用迴圈的方式找出該地名的順序
                let marker_order;
                for (let j = 0; j < user_markers.length; j++) {
                    if (user_markers[j].name == place_data.place_name) {
                        marker_order = j;
                    }
                }

                user_markers[marker_order].setMap(null); // 把使用者先前存的的地標隱藏
                // 使用者按下移除後，會顯現收藏的清單名稱及內容
                delete_child_element("a_list_content");
                render_a_list_all_place_name(place_data);

                infoWindow.close(); // 做完動作後要把地標視窗關掉
            } else {
                user_markers[e.id].setMap(null); // 把使用者當下存的地標隱藏

                // 使用者按下移除後，會顯現收藏的清單名稱及內容
                delete_child_element("a_list_content");
                render_a_list_all_place_name(place_data);

                infoWindow.close(); // 做完動作後要把地標視窗關掉
            }
        });

        e.innerHTML = "收藏";
    }
}

function render_map_and_user_all_place() {
    ajax("get", "/api/map", null, function (response_data) {
        infoWindow = new google.maps.InfoWindow();
        oms = new OverlappingMarkerSpiderfier(map, {
            markersWontMove: true,
            markersWontHide: true,
            nearbyDistance: 1,
            circleSpiralSwitchover: Infinity,
            circleFootSeparation: 50
        });

        // all_marker_data
        for (let i = 0; i < response_data.places.length; i++) {
            const marker = new google.maps.Marker({
                position: {
                    lat: Number(response_data.places[i].latitude),
                    lng: Number(response_data.places[i].longitude)
                },
                icon: {
                    url: `/img/${response_data.places[i].place_icon}.png`
                },
                zIndex: -1,
                map: map
            });

            // 資訊是空的時候，不要顯示 null
            if (response_data.places[i].information == null) {
                response_data.places[i].information = "";
            }

            // id = i 是用位置坐定位，當知道每個地點的順序後，因為公用地點的數量不會變，所以可以用位置來決定哪個地點 null
            marker.content = `
        <div class = "infowindow_container">
          <h1 class = "infowindow_title" id = ${i}>${response_data.places[i].name}</h1>
          <p class = "infowindow_content">${response_data.places[i].information}</p>
          <br>
          <buttom class = "choice_list" id =${response_data.places[i].latitude}_${response_data.places[i].longitude} style = "cursor:pointer" onclick = "select_list(this)">收藏</buttom>
        </div>
      `;

            // 定義每個地標屬於的分類
            marker.category = response_data.places[i].category;
            // 定義每個地標屬於的地名
            marker.name = response_data.places[i].name;

            oms.addMarker(marker);
            google.maps.event.addListener(marker, "spider_click", function () {
                infoWindow.setContent(this.content);
                infoWindow.open(this.getMap(), this);

                close_a_place_slidebar(); // 使用者點擊其他地方時關掉地點收藏的畫面
            });

            markers.push(marker);

            if (
                marker.category.includes("廢棄物處理場") ||
                marker.category.includes("環境教育機構") ||
                marker.category.includes("休閒農場") ||
                marker.category.includes("健康服務中心") ||
                marker.category.includes("藝文館所") ||
                marker.category.includes("運動中心")
            ) {
                marker.setVisible(true);
            } else {
                marker.setVisible(false); // 先隱藏 看不到地標
            }
        }
        render_user_all_place(response_data.user_places);
    });
}

function render_user_all_place(user_all_place) {
    console.log("user_all_place", user_all_place)
    console.log("user_all_place.length", user_all_place.length)
    for (let i = 0; i < user_all_place.length; i++) {
        const marker = new google.maps.Marker({
            position: {
                lat: Number(user_all_place[i].latitude),
                lng: Number(user_all_place[i].longitude)
            },
            icon: {
                url: `/img/${user_all_place[i].list_icon}.png`
            },
            zIndex: -1,
            map: map
        });

        // 資訊是空的時候，不要顯示 null
        if (user_all_place[i].information == null) {
            user_all_place[i].information = "";
        }

        marker.content = `
      <div class = "infowindow_container">
        <h1 class ="infowindow_title" id = ${user_all_place[i].place_order}>${user_all_place[i].place_name}</h1>
        <p class ="infowindow_content" id = ${i}>${user_all_place[i].information}</p>
        <br>
        <buttom class = "choice_list" id = ${user_all_place[i].latitude}_${user_all_place[i].longitude} style = "cursor:pointer" onclick = "select_list(this)">已收藏</buttom>
      </div>
    `;

        // 定義每個地標屬於的清單
        marker.list = user_all_place[i].list_name;
        // 定義每個地標屬於的地名
        marker.name = user_all_place[i].place_name;

        oms.addMarker(marker);
        google.maps.event.addListener(marker, "spider_click", function () {
            infoWindow.setContent(this.content);
            infoWindow.open(this.getMap(), this);

            close_a_place_slidebar(); // 使用者點擊其他地方時關掉地點收藏的畫面
        });
        markers[user_all_place[i].place_order].setMap(null); // 將相對應的公用地點 隱藏
        user_markers.push(marker);

        // 如果是隱藏的清單要隱藏，並讓公用地點回復原狀
        if (user_all_place[i].appear_list == "false") {
            user_markers.map(item => {
                if (item.list == user_all_place[i].list_name) {
                    item.setMap(null);
                    markers[user_all_place[i].place_order].setMap(map);
                }
            });
        }
    }

    google.maps.event.addListener(map, "click", function () {
        infoWindow.close();
        close_a_place_slidebar(); // 使用者點擊其他地方時關掉地點收藏的畫面
        search_marker.setMap(null); // 使用者點擊其他地方時關掉紅色的搜尋地標
    });
}

function delete_a_list() {
    const a_list_title = document.getElementsByClassName("a_list_title")[0];

    const delete_list = {
        list_id: a_list_title.id,
        list_name: a_list_title.innerHTML
    };
    const list_data = {
        data: delete_list
    };

    ajax("delete", "/api/map_list/user/list", list_data, function (response_data) {
        close_slidebar();

        delete_child_element("user_own_list_content");

        render_user_all_lists_name();

        // 將刪除的清單隱藏後，顯示那些原本被隱藏的公用地點
        user_markers.map(item => {
            if (item.list == response_data.data[0].list_name) {
                item.setMap(null);
            }
        });
        for (let i = 0; i < response_data.data.length; i++) {
            // ==0 代表沒有其他點了，所以可以顯示
            if (response_data.data[i].place_is_exist == 0) {
                markers[response_data.data[i].place_order].setMap(map);
            }
        }
    });
}

function appear_list_or_not(e) {
    const list_name = e.parentElement.parentElement.children[1].innerHTML;
    const list_id = e.parentElement.parentElement.children[1].id;

    const update_list = {
        list_id: list_id,
        list_name: list_name,
        appear_list: e.checked
    };

    const list_data = {
        data: update_list
    };

    ajax("put", "/api/map_list/user/list/appear", list_data, function (response_data) {
        if (response_data.success == "update false") {
            // 將選到的清單隱藏後，顯示那些原本被隱藏的公用地點
            user_markers.map(item => {
                if (item.list == response_data.data[0].list_name) {
                    item.setMap(null);
                }
            });

            for (let i = 0; i < response_data.data.length; i++) {
                // ==0 代表沒有其他點了，所以可以顯示
                if (response_data.data[i].place_is_exist == 0) {
                    markers[response_data.data[i].place_order].setMap(map);
                }
            }
        } else {
            // 抓出使用者的地標，從後面開始抓，理論上最後面的是最新的，也避免刪掉的點 再次顯示的問題
            for (let i = 0; i < response_data.data.length; i++) {
                for (let j = user_markers.length - 1; j >= 0; j--) {
                    if (
                        user_markers[j].name == response_data.data[i].place_name &&
                        user_markers[j].list == response_data.data[i].list_name
                    ) {
                        user_markers[j].setMap(map);
                        break;
                    }
                }
            }

            // 公用地點要隱藏
            for (let i = 0; i < response_data.data.length; i++) {
                markers[response_data.data[i].place_order].setMap(null);
            }
        }
    });
}

function send_edit_list_name() {
    const update_list = {
        list_id: document.getElementsByClassName("a_list_title")[0].id,
        category: document.querySelector("input[name=\"edit_category\"]:checked").value,
        list_icon: document.querySelector("input[name=\"edit_pattern\"]:checked").value
    };

    if (
        document.getElementsByClassName("a_list_title")[0].innerHTML !=
        document.getElementsByName("list_name_edit")[0].value
    ) {
        update_list.list_name = document.getElementsByName("list_name_edit")[0].value;
    }

    if (document.getElementsByName("list_name_edit")[0].value == "") {
        alert("! 請輸入清單名稱");
        return;
    }

    const list_data = {
        data: update_list
    };

    ajax("put", "/api/map_list/user/list", list_data, function (response_data) {
        delete_child_element("user_own_list_content");
        render_user_all_lists_name();
        close_list_input_and_edit();

        // 隱藏使用者的地點後在消除使用者地點的陣列
        user_markers.map(item => {
            item.setMap(null);
        });

        user_markers = [];

        render_user_all_place(response_data.data);

        // //最後改完名字 跟 地標 要同步顯示
        document.getElementsByClassName("a_list_title")[0].innerHTML = document.getElementsByName(
            "list_name_edit"
        )[0].value;
        document.getElementsByClassName(
            "user_a_list_icon"
        )[0].src = `/img/${update_list.list_icon}.png`;
    });
}

let switch_for_public_list_map;
let user_public_list_markers = [];
function show_and_open_public_list(e) {
    if (switch_for_public_list_map != 0) {
        const select_one_list = {
            list_id: e.id,
            list_name: e.innerHTML
        };

        const list_data = {
            data: select_one_list
        };

        ajax("post", "/api/map_list/show/list", list_data, function (response_data) {
            response_data = response_data.data;
            // 確定結果無誤再打開 slidebar 比較好
            document.getElementById("a_public_list").style.width = "300px";
            document.getElementById("map").style.marginLeft = "300px";
            document.getElementById("open_bar").style.marginLeft = "300px";
            document.getElementById("close_bar").style.marginLeft = "300px";
            document.getElementById("open_search_bar").style.marginLeft = "300px";

            const public_list_name = document.querySelector("#a_public_list_name >p");

            public_list_name.innerHTML = e.innerHTML;
            public_list_name.id = e.id;
            public_list_name.setAttribute("onclick", "show_and_open_public_list(this)");

            delete_child_element("a_public_list_content");

            // 製作新的public place 的內容 p
            const parent_place = document.getElementsByClassName("a_public_list_content")[0];

            if (response_data.length == 0) {
                const new_place_name = document.createElement("p");
                new_place_name.className = "no_content_in_list";
                new_place_name.innerHTML = "噢不，該使用者尚未收藏地點";
                parent_place.appendChild(new_place_name);

                const new_place_name_1 = document.createElement("p");
                new_place_name_1.className = "no_content_in_list";
                new_place_name_1.innerHTML = "點選右邊的放大鏡";
                parent_place.appendChild(new_place_name_1);

                const new_place_name_2 = document.createElement("p");
                new_place_name_2.className = "no_content_in_list";
                new_place_name_2.innerHTML = "看看其他人的清單吧 : )";
                parent_place.appendChild(new_place_name_2);

                return;
            }

            for (let i = 0; i < response_data.length; i++) {
                const new_place_name = document.createElement("p");
                new_place_name.className = "user_place_name";
                new_place_name.innerHTML = response_data[i].place_name;
                new_place_name.id =
                    response_data[i].longitude +
                    "_" +
                    response_data[i].latitude +
                    "_" +
                    response_data[i].place_order;
                new_place_name.setAttribute("onClick", "change_center_to_place(this)");
                parent_place.appendChild(new_place_name);
            }

            infoWindow = new google.maps.InfoWindow();
            for (let i = 0; i < response_data.length; i++) {
                // 顯示公開的使用者的收藏地點
                const marker = new google.maps.Marker({
                    position: {
                        lat: Number(response_data[i].latitude),
                        lng: Number(response_data[i].longitude)
                    },
                    icon: {
                        url: "/img/point.png"
                    },
                    animation: google.maps.Animation.DROP,
                    zIndex: 5,
                    map: map
                });

                // 資訊是空的時候，不要顯示 null
                if (response_data[i].information == null) {
                    response_data[i].information = "";
                }

                marker.content = `
          <div class = "infowindow_container">
            <h1 class = "infowindow_title">${response_data[i].place_name}</h1>
            <p class = "infowindow_content">${response_data[i].information}</p>
          </div>
        `;

                user_public_list_markers.push(marker);
                oms.addMarker(marker);
                google.maps.event.addListener(marker, "spider_click", function () {
                    infoWindow.setContent(this.content);
                    infoWindow.open(this.getMap(), this);
                });

                google.maps.event.addListener(map, "click", function () {
                    infoWindow.close();
                });
            }

            switch_for_public_list_map = 0;
        });
    } else {
        // 使用者時，要把座標跟值隱藏掉，所以在返回清單搜尋時要把值設回預設，不要顯示公開清單的地點
        user_public_list_markers.map(item => {
            item.setMap(null);
        });
        user_public_list_markers = [];
        switch_for_public_list_map = 1;
    }
}

function copy_other_list(e) {
    if (localStorage.getItem("access_token") == undefined) {
        alert("! 欲使用此功能，請先登入");
        return;
    }

    const a_public_list_name = e.parentElement.children[1];

    const copy_list = {
        list_id: a_public_list_name.id,
        list_name: a_public_list_name.innerHTML
    };
    const list_data = {
        data: copy_list
    };

    ajax("post", "/api/map_list/copy", list_data, function (response_data) {
        alert("複製成功");
        delete_child_element("user_own_list_content");
        render_user_all_lists_name();
        render_user_all_place(response_data.data);
    });
}

function change_center_to_place(e) {
    // 清除上一個顯示的地點
    if (search_marker) {
        search_marker.setMap(null);
    }

    map.setZoom(15);

    map.panTo({ lat: Number(e.id.split("_")[1]), lng: Number(e.id.split("_")[0]) });

    search_marker = new google.maps.Marker({
        position: { lat: Number(e.id.split("_")[1]), lng: Number(e.id.split("_")[0]) },
        icon: {
            url: "/img/point2.png",
            zIndex: 10
        },
        map: map
    });

    search_marker.content = `
  <div class = "infowindow_container">
    <h1 class = "infowindow_title" id = ${e.id.split("_")[2]} >${e.innerHTML}</h1>
    <br>
    <buttom class = "choice_list" id = ${e.id.split("_")[1]}_${
        e.id.split("_")[0]
        } style = "cursor:pointer" onclick = "select_list(this)">收藏</buttom>
  </div>
  `;

    const search_place_infoWindow = new google.maps.InfoWindow();

    // 直接顯示資訊
    search_place_infoWindow.setContent(search_marker.content);
    search_place_infoWindow.open(search_marker.getMap(), search_marker);

    google.maps.event.addListener(search_marker, "click", function () {
        search_place_infoWindow.setContent(this.content);
        search_place_infoWindow.open(this.getMap(), this);

        close_a_place_slidebar(); // 使用者點擊其他地方時關掉地點收藏的畫面
    });

    google.maps.event.addListener(map, "click", function () {
        search_place_infoWindow.close();
    });
}

function open_slidebar() {
    close_slidebar();

    document.getElementById("search_list_and_place").style.width = "300px";
    document.getElementById("map").style.marginLeft = "300px";
    document.getElementById("open_bar").style.marginLeft = "300px";
    document.getElementById("close_bar").style.marginLeft = "300px";
    document.getElementById("open_search_bar").style.marginLeft = "300px";

    // 使用者跳出公開單一清單頁面時，要把座標跟值隱藏掉，所以在返回清單搜尋時要把值設回預設，不要顯示公開清單的地點
    user_public_list_markers.map(item => {
        item.setMap(null);
    });
    user_public_list_markers = [];
    switch_for_public_list_map = 1;
}

function open_user_list_bar() {
    close_slidebar();

    document.getElementById("user_own_list").style.width = "300px";
    document.getElementById("map").style.marginLeft = "300px";
    document.getElementById("open_bar").style.marginLeft = "300px";
    document.getElementById("close_bar").style.marginLeft = "300px";
    document.getElementById("open_search_bar").style.marginLeft = "300px";

    // 使用者跳出公開單一清單頁面時，要把座標跟值隱藏掉，所以在返回清單搜尋時要把值設回預設，不要顯示公開清單的地點
    user_public_list_markers.map(item => {
        item.setMap(null);
    });
    user_public_list_markers = [];
    switch_for_public_list_map = 1;
}
