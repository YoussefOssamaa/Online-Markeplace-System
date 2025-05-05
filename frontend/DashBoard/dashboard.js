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

// Function to fetch user data from the backend
function fetchUserData() {
    fetch('http://127.0.0.1:5000/user/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Important for sending cookies/session data
    })
    .then(response => response.json())
    .then(data => {
        if (data.err) {
            console.error('Error fetching user data:', data.err);
            // If there's an error, try to use data from session storage
            updateUserProfile();
        } else if (data.success && data.profile) {
            // Update session storage with fresh data
            sessionStorage.setItem('userData', JSON.stringify(data.profile));
            // Update the UI
            updateUserProfile();
        } else {
            // Fallback to session storage data
            updateUserProfile();
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        // On error, still try to use session storage data
        updateUserProfile();
    });
}

// Function to update the user profile information
function updateUserProfile() {
    // Get user data from session storage or local storage
    const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
    
    // Get the elements to update
    const usernameElement = document.getElementById('username');
    const balanceElement = document.getElementById('balance');
    const purchasedItemsElement = document.getElementById('purchasedItems');
    
    // Update the elements with user data if available
    if (usernameElement && userData.name) {
        usernameElement.textContent = userData.name;
    }
    
    if (balanceElement) {
        // Use user's balance if available, otherwise use default $250.00
        const balance = userData.balance !== undefined ? userData.balance : 250.00;
        balanceElement.textContent = `$${balance.toFixed(2)}`;
    }
    
    if (purchasedItemsElement) {
        // Use user's purchased items count if available, otherwise use default 0
        const purchasedItems = userData.purchasedItems !== undefined ? userData.purchasedItems : 0;
        purchasedItemsElement.textContent = purchasedItems;
    }
}
