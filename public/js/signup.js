function set_header() {

    if(document.getElementById("name").value == ""){
        alert("! 請輸入名稱");
    }else if(document.getElementById("email").value == ""){
        alert("! 請輸入電子郵件地址");
    }else if(document.getElementById("password").value == '' ){
        alert("! 請輸入密碼");
    }else{
        var xhr = new XMLHttpRequest();
        //使用HTTP POST请求与服务器交互数据
        xhr.open("POST", "api/user/signup");
        //设置发送数据的请求格式
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.send(JSON.stringify({
            "name": document.getElementById("name").value,
            "email": document.getElementById("email").value, 
            "password": document.getElementById("password").value
        })
        );

        xhr.onreadystatechange=function() {
            if (this.readyState == 4 && this.status == 200) {
            
                let user_data = JSON.parse(xhr.response);

                if(user_data.error == "name duplicate"){
                    alert("! 這個使用者名稱已有人使用，請試試其他名稱。")
                }else if(user_data.error == "email duplicate"){
                    alert("! 這個信箱已有人使用，請試試其他信箱。")
                }else{
                    console.log(user_data);
                    localStorage.setItem("access_token",user_data.data.access_token);
                    document.location.href="/";
                }
                
            }
        }
    }
}

