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
        // First check if it's a 500 error
        if (response.status === 500) {
            return response.json()
                .then(data => {
                    // Display the actual error string from the server
                    throw new Error(data.err || data.error || data.message || "Internal Server Error");
                })
                .catch(jsonError => {
                    // If JSON parsing fails, throw a generic error
                    console.error('JSON parsing error:', jsonError);
                    throw new Error("Internal Server Error: Server response could not be processed");
                });
        }
        // Then handle other non-ok responses
        if (!response.ok) {
            return response.json()
                .then(data => {
                    throw new Error(data.err || "Login failed");
                })
                .catch(jsonError => {
                    // If JSON parsing fails, throw a generic error with status
                    console.error('JSON parsing error:', jsonError);
                    throw new Error(`Login failed: Server returned ${response.status}`);
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