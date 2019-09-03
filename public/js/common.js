  
function signin_or_profile(){
    if(localStorage.getItem("access_token") == null){
        window.location.href="/signin.html";
    }else{
        window.location.href="/profile.html";
    }
}