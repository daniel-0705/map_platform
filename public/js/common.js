/* eslint-disable camelcase */
function user_status() {
    const user_state = document.querySelectorAll("li > a");

    if (localStorage.getItem("access_token") == null) {
        user_state[2].innerHTML = "Sign in";
    } else {
        user_state[2].innerHTML = "Logout";
    }
}

function signin_or_out() {
    const user_state = document.querySelectorAll("li > a");

    if (localStorage.getItem("access_token") == null) {
        window.location.href = "/signin.html";
    } else {
        localStorage.removeItem("access_token");

        user_state[2].innerHTML = "Logout";

        window.location.href = "/";
    }
}

user_status();
