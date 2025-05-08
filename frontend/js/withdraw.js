document.addEventListener('DOMContentLoaded', function() {
  const withdrawButton = document.querySelector('.withdraw-container button');
  
  fetch('http://127.0.0.1:5000//dashboard', {
    method: 'GET',
    credentials: "include", 
    headers: {
        'Content-Type': 'application/json'
    }})
    .then(response => response.json())
    .then(data => {
    if (data.err) {
        console.log(data.log)          
        if(data.err == "unauthorized"){
            window.location.href = '../loginpage.html';
        }else{
          window.location.href = '../html/err_page.html';
        }      
    }
  })
  .catch(error => {
      window.location.href = '../html/err_page.html';
  });
  if (withdrawButton) {
    withdrawButton.addEventListener('click', function() {
          const amount = document.getElementById('amount').value;
          const cardNumber = document.getElementById('cardNumber').value;
          
          fetch('http://127.0.0.1:5000/payment', {
              method: 'POST', 
              credentials: "include",
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  "card_number": cardNumber,
                  "amount" : amount ,
                  "type":"withdraw"

              })  
            })
            .then(response => {
              if (response.status === 402) {
                window.location.href = '../loginpage.html';
              }
              return response.json();  
          }) 
            .then(data => {
              if(data.err){
                alert(data.err)
              }
              setTimeout(()=>{
                window.location.href = '../DashBoard/dashboard.html';
              },3000)
              alert("your balance was updated successfully")
              console.log('Success:', data); 
            })
            .catch(error => {
              window.location.href = '../html/err_page.html';
            });
      });
  }
});