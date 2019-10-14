
function set_header() {

    if(document.getElementById("name").value == ""){
        alert("! 請輸入名稱");
    }else if(document.getElementById("email").value == ""){
        alert("! 請輸入電子郵件地址");
    }else if(document.getElementById("password").value == '' ){
        alert("! 請輸入密碼");
    }else{

        let data ={
            "name": document.getElementById("name").value,
            "email": document.getElementById("email").value, 
            "password": document.getElementById("password").value
        }

        ajax ("POST","api/user/signup",data,function(user_data){
            if(user_data.error){
                alert(user_data.error);
            }else{
                localStorage.setItem("access_token",user_data.data);
                document.location.href = "/main_map.html";
            }
        })
    }
}