function statusChangeCallback(response) {
    if (response.status === "connected") {
        testAPI();
    } else {
        document.getElementById("status").innerHTML = "Please log " + "into this app.";
    }
}

function checkLoginState() {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);

        const data = {
            provider: "facebook",
            access_token: response.authResponse.accessToken
        };

        ajax("POST", "api/user/signin", data, function (user_data) {
            if (user_data.error) {
                alert(user_data.error);
            } else {
                localStorage.setItem("access_token", user_data.data);
                window.location.href = "/main_map.html";
            }
        });
    });
}

window.fbAsyncInit = function () {
    FB.init({
        appId: "330988461138069",
        cookie: true, // enable cookies to allow the server to access
        xfbml: true, // parse social plugins on this page
        version: "v3.3" // The Graph API version to use for the call
    });

    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
};

// Load the SDK asynchronously
(function (d, s, id) {
    var js,
        fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

function testAPI() {
    FB.api("/me", function (response) {
        document.getElementById("status").innerHTML = `Thanks for logging in, ${response.name}!`;
    });
}

//sign in function

function set_header() {
    if (document.getElementById("email").value == "") {
        alert("! 請輸入電子郵件地址");
    } else if (document.getElementById("password").value == "") {
        alert("! 請輸入密碼");
    } else {
        const data = {
            provider: "native",
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        ajax("POST", "api/user/signin", data, function (user_data) {
            if (user_data.error) {
                alert(user_data.error);
            } else {
                localStorage.setItem("access_token", user_data.data);
                window.location.href = "/main_map.html";
            }
        });
    }
}
