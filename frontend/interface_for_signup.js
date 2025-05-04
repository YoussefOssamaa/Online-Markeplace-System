const signup_button = document.getElementById("signupbutton");
signup_button.onclick=(e)=>
    {
        console.log("a7a")
        e.preventDefault()
        let sPassword=document.getElementById("SUpassword").value; // The s indicates that this is the signup password and username
        let sUsername=document.getElementById("SUusername").value;
        let sEmail=document.getElementById("SUemail").value;
        let sLastname=document.getElementById("SUlastname").value;
        let sAddress=document.getElementById("SUaddress").value;
        let sPhoneno=document.getElementById("SUphonenumber").value;
        // let Newuser= new user(sUsername,
        //     sLastname,
        //     sPassword,
        //     sEmail,
        //     sPhoneno,
        //     sAddress);
        //     /*if(f==null)
        //     f=new File(filebits=['sample content'],filename="output.txt");*/
        // Newuser.display();
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
            console.log( data); 
        })
}
// http://127.0.0.1:5000