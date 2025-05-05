//start
/** Online Market Place System 
 *  Features: Create a new account so we need a class for accounts 
 *  Features: Login to your account so we need a login interface for this  
 */
class user {

    constructor(username="",lastname="",password="",email="",phone_number="",address="") {
        this.username=username;
        this.password=password;
        this.email=email;
        this.lastname=lastname;
        this.address=address;
        this.phone_number=phone_number;
    }
    /**
     * 
     */
    getId() {
        
    }
    display(){
        console.log(this.username);
    }
}
const login_button = document.getElementById("loginbutton");

login_button.onclick= (e)=>{
    e.preventDefault()
    let lPassword=document.getElementById("password").value; // The l indicates that this is the login password and username
    let lUsername=document.getElementById("username").value;
    fetch('http://127.0.0.1:5000/login', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'username' : lUsername,
            'password' : lPassword
        }) 
    })
      .then(response => response.json()) 
      // In the login button onclick handler:
      .then(data => {
          console.log(data);
          if(data.success) {
              // Store user data from the server response
              const userData = data.userData || {
                  name: lUsername,
                  balance: 250.00,  // Default balance 
                  purchasedItems: 0  // Default purchased items count 
              };
              sessionStorage.setItem('userData', JSON.stringify(userData));
              
              // Redirect to dashboard on successful login
              window.location.href = './DashBoard/dashboard.html';
          } else if(data.err) {
              // Display error message to user
              alert("Login failed: " + data.err);
          }
      })
      .catch(error => {
          console.error('Login error:', error);
          alert("Login failed: Network error");
      });
}
