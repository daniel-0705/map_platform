function set_header() {

    if(document.getElementById("name").value == ""){
        alert("! 請輸入名稱");
    }else if(document.getElementById("email").value == ""){
        alert("! 請輸入電子郵件地址");
    }else if(document.getElementById("password").value == '' ){
        alert("! 請輸入密碼");
    }else{
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "api/user/signup");
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

                if(user_data.error){
                    alert(user_data.error)
                }else{
                    localStorage.setItem("access_token",user_data.data.access_token);
                    document.location.href="/main_map.html";
                }
                
            }
        }
    }
}

