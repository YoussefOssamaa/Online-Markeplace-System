document.addEventListener('DOMContentLoaded', function() {
  const withdrawButton = document.querySelector('.withdraw-container button');
  
  fetch('http://127.0.0.1:5000/dashboard', { // Fixed double slash
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
          // Display error instead of redirecting
          alert("Error: " + data.err);
          // window.location.href = '../html/err_page.html';
        }      
    }
  })
  .catch(error => {
      // Display error instead of redirecting
      console.error('Error:', error);
      
      // Check if it's a network-related error
      if (error.message === 'Failed to fetch') {
          alert("Network error: Unable to connect to the server. Please check your internet connection and verify the server is running.");
      } else {
          // Display the original error message
          alert("Error: " + error.message);
      }
      // window.location.href = '../html/err_page.html';
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
                alert(data.err);
              } else if(data.success) {
                alert("Your balance was updated successfully");
                setTimeout(()=>{
                  window.location.href = '../DashBoard/dashboard.html';
                }, 2000); // Reduced timeout for better UX
              }
              console.log('Success:', data); 
            })
            .catch(error => {
              // Display error instead of redirecting
              console.error('Error:', error);
              
              // Check if it's a network-related error
              if (error.message === 'Failed to fetch') {
                  alert("Network error: Unable to connect to the server. Please check your internet connection and verify the server is running.");
              } else {
                  // Display the original error message
                  alert("Error: " + error.message);
              }
            });
    });
  }
});