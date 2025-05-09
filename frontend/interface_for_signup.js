const signup_button = document.getElementById("signupbutton");
signup_button.onclick=(e)=>
    {
        e.preventDefault()
        let sPassword=document.getElementById("SUpassword").value;
        let sUsername=document.getElementById("SUusername").value;
        let sEmail=document.getElementById("SUemail").value;
        let sLastname=document.getElementById("SUlastname").value;
        let sAddress=document.getElementById("SUaddress").value;
        let sPhoneno=document.getElementById("SUphonenumber").value;
        
        // Validate password length (must be at least 6 characters)
        if (sPassword.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }
        
        fetch('http://127.0.0.1:5000/sign_up', {
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "first_name":sUsername,
                "last_name":sLastname,
                "email":sEmail,
                "password":sPassword,
                "address":sAddress,
                "phone_number":sPhoneno
            }) 
        })
        .then(response => response.json()) 
        .then(data => {
            console.log(data);
            if(data.success) {
                window.location.href = 'loginpage.html';
            } else if(data.err) {
                alert("Signup failed: " + (typeof data.err === 'object' ? JSON.stringify(data.err) : data.err));
            }
        })
        .catch(error => {
            console.error('Signup error:', error);
            alert("Signup failed: Network error");
        });
}
// http://127.0.0.1:5000