document.addEventListener('DOMContentLoaded', function() {
    const withdrawButton = document.querySelector('.withdraw-container button');

    if (withdrawButton) {
        withdrawButton.addEventListener('click', function() {
            const amount = document.getElementById('amount').value;
            const cardHolder = document.getElementById('cardHolder').value;
            const cardNumber = document.getElementById('cardNumber').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            fetch('http://127.0.0.1:5000/payment/?type=withdraw', {
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
            // console.log('Attempting withdrawal:', { amount, cardHolder, cardNumber, expiryDate, cvv });
            // alert('Withdrawal functionality not yet implemented.');
            // In a real application, you would send this data for processing.
        });
    }
});