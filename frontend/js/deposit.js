document.addEventListener('DOMContentLoaded', function() {
    const depositButton = document.querySelector('.deposit-container button');

    if (depositButton) {
        depositButton.addEventListener('click', function() {
            const amount = document.getElementById('amount').value;
            const cardNumber = document.getElementById('cardNumber').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;

            console.log('Attempting deposit:', { amount, cardNumber, expiryDate, cvv });
            alert('Deposit functionality not yet implemented.');
            // In a real application, you would send this data to a payment gateway.
        });
    }
});