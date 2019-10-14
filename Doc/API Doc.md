# mapBook-API-Doc

### Host Name

daniel0705.com


### Response Object

* `Places Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| map_id | Number | Place id. |
| name | String | Place name. |
| address | String | Place address. |
| longitude | String | Place longitude. |
| latitude | String | Place latitude. |
| place_icon | String | Place icon. |
| information | String | Place information. |
| category | String | Place category. |


* `User_places Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| No | Number | Autoincrement number. |
| user_name | String | User name. |
| list_name | String | List name. |
| list_icon | String | List icon. |
| appear_list | String | List appears or not. |
| place_name | String | Place name. |
| place_order | String | Place order. |
| longitude | String | Place longitude. |
| latitude | String | Place latitude. |
| information | String | Place information.|

* `User_places_and_exist Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| No | Number | Autoincrement number. |
| user_name | String | User name. |
| list_name | String | List name. |
| list_icon | String | List icon. |
| appear_list | String | List appears or not. |
| place_name | String | Place name. |
| place_order | String | Place order. |
| longitude | String | Place longitude. |
| latitude | String | Place latitude. |
| information | String | Place information.|
| place_is_exist | Number | Place exists or not|

* `List Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| list_id | Number | List id. |
| category | String | List for public or private. |
| user_name | String | User name. |
| list_name | String | List name. |
| list_icon | String | List icon. |
| appear_list | String | List appears or not. |
| copy_number | Number | Frequences of copies |



---

### Map API

* **End Point:** `/map`

* **Method:** `GET`

* **Request Example:**

  `https://[HOST_NAME]/api/map`
  
* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Authorization | String | Access token preceding `Bearer `. For example: `Bearer x48aDD534da8ADSD1XC4SD5S`. |
  

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| user_places (Optional)| Array | Array of `User_places Object`. |
| places  | Array | Array of `Places Object`. |

* **Success Response Example:**

```
{
    "user_places": [
        {
            "No": 1308,
            "user_name": "daniel",
            "list_name": "951",
            "list_icon": "black",
            "appear_list": "true",
            "place_name": "欣欣秀泰影城",
            "place_order": 2287,
            "longitude": 121.5256013,
            "latitude": 25.0542103,
            "information": null
        },
        ...
    ],
    "places": [
        {
            "map_id": 1,
            "name": "國立國父紀念館",
            "address": "臺北市信義區仁愛路四段505號",
            "longitude": 121.5602452,
            "latitude": 25.0400306,
            "place_icon": "museum",
            "information": "全部免費",
            "category": "博物館"
        },
        ...
    ]
}
        
```

---

### User List API 

* **End Point:** `/list`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/user/list`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| category | String | `"true"` or `"false"` for public or private list|
| list_name | String | List name |
| list_icon | String | List color |

* **Request Body Example:**

```
{
    "data": {
        "category": "true",
        "list_name": "123",
        "list_icon": "yellow"
    }
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| success | String | Insert list OK. |

* **Success Response Example:**

```
{
    "success": "insert list OK"
}
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 清單名稱重複，請重新命名。"
};
```

----

### User List API 

* **End Point:** `/list`

* **Method:** `PUT`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/user/list`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| list_id | Number | List id|
| category | String | `"true"` or `"false"` for public or private list|
| list_icon | String | List color |

* **Request Body Example:**

```
{
    "data": {
        "list_id": 123,
        "category": "true",
        "list_name": "123",
        "list_icon": "yellow"
    }
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| success | String | Update list OK. |
| data | Array | Array of `User_places Object`. |

* **Success Response Example:**

```
{
    "success": "update OK",
    "data": [
                {
                    "No": 1308,
                    "user_name": "daniel",
                    "list_name": "951",
                    "list_icon": "black",
                    "appear_list": "true",
                    "place_name": "欣欣秀泰影城",
                    "place_order": 2287,
                    "longitude": 121.5256013,
                    "latitude": 25.0542103,
                    "information": null
                },
            ...
        ]
}
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 清單名稱重複，請重新命名。"
};
```

----

### User List API 

* **End Point:** `/list/appear`

* **Method:** `PUT`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/user/list/appear`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| list_id | Number | List id|
| list_name | String | List name |
| appear_list | String | `"true"` or `"false"` for displaying or hiding list |

* **Request Body Example:**

```
{
    "data": {
        "list_id": 123,
        "list_name": "test123",
        "appear_list": "true"
    }
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| success | String | Update list dispaly or hide. |
| data | Array | Array of `User_places_and_exist Object`. |

* **Success Response Example:**

```
{
    "success": "update true",
    "data": [
            {
                "No": 1308,
                "user_name": "daniel",
                "list_name": "951",
                "list_icon": "black",
                "appear_list": "true",
                "place_name": "欣欣秀泰影城",
                "place_order": 2287,
                "longitude": 121.5256013,
                "latitude": 25.0542103,
                "information": null,
                "place_is_exist": 5
            },
            ...
        ]
}
```



----

### User List API 

* **End Point:** `/list`

* **Method:** `DELETE`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/user/list/appear`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| list_id | Number | List id|
| list_name | String | List name |

* **Request Body Example:**

```
{
    "data": {
        "list_id": 123,
        "list_name": "test123"
    }
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| success | String | Delete list . |
| data | Array | Array of `User_places_and_exist Object`. |

* **Success Response Example:**

```
{
    "success": "update true",
    "data": [
                {
                    "No": 1308,
                    "user_name": "daniel",
                    "list_name": "951",
                    "list_icon": "black",
                    "appear_list": "true",
                    "place_name": "欣欣秀泰影城",
                    "place_order": 2287,
                    "longitude": 121.5256013,
                    "latitude": 25.0542103,
                    "information": null,
                    "place_is_exist": 5
                },
                ...
        ]
}
```
* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 清單不存在。"
}
```


---

### User Place API 

* **End Point:** `/place`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/user/place`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| list_name | String | List name |
| place_name | String | Place name |
| place_order | Number | Place order |

* **Request Body Example:**

```
{
    "data": {
        "list_name": "123",
        "place_name": "欣欣秀泰影城",
        "place_order": 2548
    }
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| data | Array | Array of `User_places Object`.  |

* **Success Response Example:**

```
{
    "data": [
                {
                    "No": 1308,
                    "user_name": "daniel",
                    "list_name": "951",
                    "list_icon": "black",
                    "appear_list": "true",
                    "place_name": "欣欣秀泰影城",
                    "place_order": 2287,
                    "longitude": 121.5256013,
                    "latitude": 25.0542103,
                    "information": null,
                    "place_is_exist": 5
                }
            ]
}
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 此地點已收藏。"
}
```

----


### User Place API 

* **End Point:** `/place/show`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/user/place/show`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| list_name | String | List name |

* **Request Body Example:**

```
{
    "data": {
        "list_name": "123"
    }
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| data | Array | Array of `User_places Object`.  |

* **Success Response Example:**

```
{
    "data": [
                {
                    "No": 1308,
                    "user_name": "daniel",
                    "list_name": "951",
                    "list_icon": "black",
                    "appear_list": "true",
                    "place_name": "欣欣秀泰影城",
                    "place_order": 2287,
                    "longitude": 121.5256013,
                    "latitude": 25.0542103,
                    "information": null,
                    "place_is_exist": 5
                },
                ....
        ]
}
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 此地點已收藏。"
}
```

----

### User Place API 

* **End Point:** `/place`

* **Method:** `DELETE`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/user/place`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| list_name | String | List name |
| place_name | String | Place name |
| place_order | Number | Place order |

* **Request Body Example:**

```
{
    "data": {
        "list_name": "123",
        "place_name": "欣欣秀泰影城",
        "place_order": 2548
    }
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| success | String | Delete list . |
| check_place_is_exist | Number | Check place exists or not.  |

* **Success Response Example:**

```
{
    "success": "delete OK",
    "check_place_is_exist": 5
}
```


----


### User All Lists API 

* **End Point:** `/result`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/user/result`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| place_name | String | Place name. |

* **Request Body Example:**

```
{
    "data":{
        "place_name" : "故宮博物館"
    }
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| data | Array | Array of `List Object`.  |

* **Success Response Example:**

```
{
    "data":[
                {
                    "list_id": 125,
                    "category": "true"
                    "user_name": "daniel",
                    "list_name": "951",
                    "list_icon": "black",
                    "appear_list": "true",
                    "copy_number": 5
                },
                ....
        ]
}
```

----


### User Signup API 

* **End Point:** `/signup`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/user/signup`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| name | String | Name. |
| email | String | Email. |
| password | String | Password. |

* **Request Body Example:**

```
{
    
    "name": "daniel",
    "email": "test123@test.com",
    "password": "password123",
    
}
```

* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| data | String | User access token.  |

* **Success Response Example:**

```
{
    "data": "EAACEdEose0cBAHc6hv9kK8bMNs4XTrT0kVC1RgDZCVBptXW12AI"
}
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 這個使用者名稱已有人使用，請試試其他名稱。"
}
```
or
```
{
    "error": "! 這個信箱已有人使用，請試試其他信箱。"
}
```
or
```
{
    "error": "! 系統出現錯誤，請重新整理。"
}
```

----

### User Signin API 

* **End Point:** `/signin`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/user/signin`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| provider | String | Only accept `native` or `facebook`. |
| email | String | Required if provider set to `native`. |
| password | String | Required if provider set to `native`. |
| access_token | String | Access token from facebook. Required if provider set to `facebook` |


* **Request Body Example:**

```
{
    
    "provider": "native",
    "email": "test123@test.com",
    "password": "password123",
    
}
```
or

```
{
    
    "provider": "facebook",
    "access_token": "EAACEdEose0cBAHc6hv9kK8bMNs4XTrT0kVC1RgDZCVBptXW12AI"
    
}
```


* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| data | String | User access token.  |

* **Success Response Example:**

```
{
    "data": "EAACEdEose0cBAHc6hv9kK8bMNs4XTrT0kVC1RgDZCVBptXW12AI"
}
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 查無此使用者，請重新註冊。"
}
```

---

### Search List API 

* **End Point:** `/search/list`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/search/list`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| data | String | Search list keywords. |


* **Request Body Example:**

```
{
    
    "data: "電影院"
    
}
```



* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| data | Array | Array of `List Object`.  |

* **Success Response Example:**

```
{
    "data":[
                {
                    "list_id": 125,
                    "category": "true"
                    "user_name": "daniel",
                    "list_name": "951",
                    "list_icon": "black",
                    "appear_list": "true",
                    "copy_number": 5
                },
                ....
        ]
}
```


---


### Search Place API 

* **End Point:** `/search/place`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/search/place`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| data | String | Search places keywords. |


* **Request Body Example:**

```
{
    
    "data: "國父紀念館"
    
}
```



* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| data | Array | Array of `Places Object`.  |

* **Success Response Example:**

```
{
    "data":[
                {
                    "map_id": 1,
                    "name": "國立國父紀念館",
                    "address": "臺北市信義區仁愛路四段505號",
                    "longitude": 121.5602452,
                    "latitude": 25.0400306,
                    "place_icon": "museum",
                    "information": "全部免費",
                    "category": "博物館"
                },
                ...
            ]
}
```


---

### Copy Public List API 

* **End Point:** `/copy`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/copy`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| list_id | Number | List id. |
| list_name | String | List name. |


* **Request Body Example:**

```
{
    
    "list_id": 202,
    "list_name": "list123"
    
}
```



* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| success | String | Copy list OK.  |
| data | Array | Array of `User_places Object`.  |

* **Success Response Example:**

```
{
    "success": "copy OK",
    "data": [
                {
                    "No": 1308,
                    "user_name": "daniel",
                    "list_name": "951",
                    "list_icon": "black",
                    "appear_list": "true",
                    "place_name": "欣欣秀泰影城",
                    "place_order": 2287,
                    "longitude": 121.5256013,
                    "latitude": 25.0542103,
                    "information": null
                },
                ...
        ]
}
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 複製清單名稱與您的清單名稱重複，請更改名稱。"
}
```


---

### Show Public List API 

* **End Point:** `/show/list`

* **Method:** `POST`

* **Request Example:**

  `https://[HOST_NAME]/api/map_list/show/list`

* **Request Headers:**

| Field | Type | Description |
| :---: | :---: | :---: |
| Content-Type | String | Only accept `application/json`. |

* **Request Body**

| Field | Type | Description |
| :---: | :---: | :---: |
| list_id | Number | List id. |
| list_name | String | List name. |


* **Request Body Example:**

```
{
    
    "list_id": 202,
    "list_name": "list123",
    
}
```



* **Success Response: 200**

| Field | Type | Description |
| :---: | :---: | :--- |
| data | Array | Array of `User_places Object`.  |

* **Success Response Example:**

```
{
    "success": "copy OK",
    "data": [
                {
                    "No": 1308,
                    "user_name": "daniel",
                    "list_name": "951",
                    "list_icon": "black",
                    "appear_list": "true",
                    "place_name": "欣欣秀泰影城",
                    "place_order": 2287,
                    "longitude": 121.5256013,
                    "latitude": 25.0542103,
                    "information": null
                },
                ...
        ]
}
```

* **Error Response: 4XX**

| Field | Type | Description |
| :---: | :---: | :---: |
| error | String | Error message. |


* **Error Response Example:**
```
{
    "error": "! 該清單已被刪除，無法顯示，請再重新搜尋。"
}
```
