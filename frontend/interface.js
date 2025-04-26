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
document.getElementById("loginbutton").onclick=()=>{
    let lPassword=document.getElementById("password").value; // The l indicates that this is the login password and username
    let lUsername=document.getElementById("username").value;
    console.log(lUsername+lPassword);
}
let f=null;
document.getElementById("signupbutton").onclick=()=>
    {
    let sPassword=document.getElementById("SUpassword").value; // The s indicates that this is the signup password and username
    let sUsername=document.getElementById("SUusername").value;
    let sEmail=document.getElementById("SUemail").value;
    let sLastname=document.getElementById("SUlastname").value;
    let sAddress=document.getElementById("SUaddress").value;
    let sPhoneno=document.getElementById("SUphonenumber").value;
    let Newuser= new user(sUsername,
        sLastname,
        sPassword,
        sEmail,
        sPhoneno,
        sAddress);
        /*if(f==null)
        f=new File(filebits=['sample content'],filename="output.txt");*/
        Newuser.display();
    }
