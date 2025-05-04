document.addEventListener('DOMContentLoaded', function() {
    const depositButton = document.querySelector('.deposit-container button');

    if (depositButton) {
        depositButton.addEventListener('click', function() {
            const amount = document.getElementById('amount').value;
            const cardNumber = document.getElementById('cardNumber').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            fetch('http://127.0.0.1:5000/payment/?type=deposit', {
                method: 'POST', 
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  'amount': amount
                }) 
              })
              .then(response => response.json()) 
              .then(data => {
                console.log('Success:', data); 
              })
            console.log('Attempting deposit:', { amount, cardNumber, expiryDate, cvv });
            alert('Deposit functionality not yet implemented.');
            // In a real application, you would send this data to a payment gateway.
        });
    }
});