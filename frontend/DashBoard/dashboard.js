document.addEventListener("DOMContentLoaded", () => {
    // Fetch user data when the page loads
    fetchUserData();
    
    const propCards = document.querySelectorAll('.prop');

    propCards.forEach((card) => {
        card.style.cursor = "pointer";

        card.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior

            const linkElement = card.querySelector('a.setting-box');
            if (linkElement && linkElement.href) {
                window.open(linkElement.href, '_blank'); // Open in new tab
            }
        });
    });
});

// // Function to fetch user data from the backend
function fetchUserData() {
    fetch('http://127.0.0.1:5000//dashboard', {
        method: 'GET',
        credentials: "include", 
        headers: {
            'Content-Type': 'application/json'
        }})
    .then(response => response.json())
    .then(data => {
        if (data.err) {
            
            if(data.err == "unauthorized"){
                window.location.href = '../loginpage.html';
            }else{
                window.location.href = '../html/err_page.html';

            }      
        } else {
            console.log(data)
            updateUserProfile(data)
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        window.location.href = '../html/err_page.html';
    });
}

// Function to update the user profile information
function updateUserProfile(userData) {
    // Get user data from session storage or local storage
    // const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
    
    // Get the elements to update
    const usernameElement = document.getElementById('username');
    const balanceElement = document.getElementById('balance');
    const purchasedItemsElement = document.getElementById('purchasedItems');
    
    // Update the elements with user data if available
    if (usernameElement && userData.username) {
        usernameElement.textContent = userData.username;
    }
    
    if (balanceElement) {
        // Use user's balance if available, otherwise use default $250.00
        const balance = userData.balance !== undefined ? userData.balance : 200.00;
        balanceElement.textContent = `$${balance.toFixed(2)}`;
    }
    
    if (purchasedItemsElement) {
        // Use user's purchased items count if available, otherwise use default 0
        const purchasedItems = userData.purchasedItems !== undefined ? userData.purchasedItems : 0;
        purchasedItemsElement.textContent = purchasedItems;
    }
}
