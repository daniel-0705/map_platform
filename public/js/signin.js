// facebook login function
// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
    // Logged into your app and Facebook.
    testAPI();
    } else {
    // The person is not logged into your app or we are unable to tell.
    document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
        console.log(response.authResponse.accessToken);
        
        var xhrt = new XMLHttpRequest();
        //使用HTTP POST请求与服务器交互数据
        xhrt.open("POST", "api/user/signin");
        //设置发送数据的请求格式
        xhrt.setRequestHeader('Content-Type', 'application/json');
        
        xhrt.send(JSON.stringify({ 
            "provider": "facebook",
            "access_token": response.authResponse.accessToken
            })
        );

        xhrt.onreadystatechange=function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("26848");
                console.log(xhrt.response);
                if(XMLHttpRequestEventTarget.response == "error"){
                    alert("! 找不到此使用者資訊，請重新註冊");
                }else{
                    let user_data = JSON.parse(xhrt.response);
                    console.log(user_data);
                    localStorage.setItem("access_token",user_data.data.access_token);
                    window.location.href="/";
                }
                
            }
        }
    });
}

window.fbAsyncInit = function() {
    FB.init({
    appId      : '330988461138069',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v3.3' // The Graph API version to use for the call
    });

    // Now that we've initialized the JavaScript SDK, we call 
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
    });

};

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
}
    
    
                
        

//sign in function         

function set_header() {

    if(document.getElementById("email").value == ""){
        alert("! 請輸入電子郵件地址");
    }else if(document.getElementById("password").value == '' ){
        alert("! 請輸入密碼");
    }else{
        var xhr = new XMLHttpRequest();
        //使用HTTP POST请求与服务器交互数据
        xhr.open("POST", "api/user/signin");
        //设置发送数据的请求格式
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.send(JSON.stringify({
            "provider": "native",
            "email": document.getElementById("email").value, 
            "password": document.getElementById("password").value})
        );

        xhr.onreadystatechange=function() {
            if (this.readyState == 4 && this.status == 200) {
            console.log(xhr.response)
                if(xhr.response == "error"){
                    alert("! 找不到此使用者資訊，請重新註冊");
                }else{
                    let user_data = JSON.parse(xhr.response);
                    console.log(user_data);
                    localStorage.setItem("access_token",user_data.data.access_token);
                    window.location.href="/";
                }
                
            }
        }
    }
}

