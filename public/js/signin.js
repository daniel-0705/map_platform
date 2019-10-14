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

        let data ={
            "provider": "facebook",
            "access_token": response.authResponse.accessToken
        }

        ajax ("POST","api/user/signin",data,function(user_data){
            if(user_data.error){
                alert(user_data.error);
            }else{
                console.log(user_data);
                localStorage.setItem("access_token",user_data.data);
                window.location.href="/main_map.html";
            }
        })
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
        let data ={
            "provider": "native",
            "email": document.getElementById("email").value, 
            "password": document.getElementById("password").value
        }

        ajax ("POST","api/user/signin",data,function(user_data){
            if(user_data.error){
                alert(user_data.error);
            }else{
                console.log(user_data);
                localStorage.setItem("access_token",user_data.data);
                window.location.href="/main_map.html";
            }
        })
    }
}