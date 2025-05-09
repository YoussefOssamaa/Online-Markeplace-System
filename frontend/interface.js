/** Online Market Place System
 * Features: Create a new account so we need a class for accounts
 * Features: Login to your account so we need a login interface for this
 */
class User {
    constructor(username="", lastname="", password="", email="", phone_number="", address="") {
        this.username = username;
        this.password = password;
        this.email = email;
        this.lastname = lastname;
        this.address = address;
        this.phone_number = phone_number;
    }

    getId() {}

    display() {
        console.log(this.username);
    }
}

const login_button = document.getElementById("loginbutton");

login_button.onclick = (e) => {
    e.preventDefault();
    let lPassword = document.getElementById("password").value;
    let lUsername = document.getElementById("username").value;
    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'email': lUsername,
            'password': lPassword
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.err || "Login failed");
            });
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.success) {

            window.location.href = 'DashBoard/dashboard.html';
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert("Login failed: " + error.message);
    });
}