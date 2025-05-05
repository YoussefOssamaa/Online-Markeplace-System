document.addEventListener('DOMContentLoaded', function() {
    // Fetch user data when the page loads
    fetchUserData();
    
    const changePhotoButton = document.querySelector('.profile-photo button:nth-child(2)');
    const removePhotoButton = document.querySelector('.profile-photo button.remove');
    const saveChangesButton = document.querySelector('.actions button.save');
    const cancelButton = document.querySelector('.actions button.cancel');

    if (changePhotoButton) {
        changePhotoButton.addEventListener('click', function() {
            alert('Implement profile photo change functionality here.');            
        });
    }

    if (removePhotoButton) {
        removePhotoButton.addEventListener('click', function() {
            alert('Implement profile photo removal functionality here.');
        });
    }

    if (saveChangesButton) {
        saveChangesButton.addEventListener('click', function() {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const notificationsNewMessages = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(1)').checked;
            const notificationsOrderUpdates = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(3)').checked;
            const marketingCommunications = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(5)').checked;

            // Validate password change
            if (newPassword && !currentPassword) {
                alert('Please enter your current password to change your password.');
                return;
            }

            if (newPassword && newPassword !== confirmNewPassword) {
                alert('New password and confirmation do not match.');
                return;
            }

            console.log('Saving changes:', { 
                passwordChange: newPassword ? true : false,
                notificationsNewMessages, 
                notificationsOrderUpdates, 
                marketingCommunications 
            });
            
            alert('Account settings saved (implementation needed).');
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            alert('Discarding changes (implementation needed).');
        });
    }
});

// Function to fetch user data from the backend
function fetchUserData() {
    fetch('http://127.0.0.1:5000/user/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' 
    })
    .then(response => response.json())
    .then(data => {
        if (data.err) {
            console.error('Error fetching user data:', data.err);
            // If there's an error, try to use data from session storage
            updateAccountInfo();
        } else if (data.success && data.profile) {
            // Update session storage with fresh data
            sessionStorage.setItem('userData', JSON.stringify(data.profile));
            // Update the UI
            updateAccountInfo(data.profile);
            // Pre-fill personal information fields
            prefillPersonalInfo(data.profile);
        } else {
            // Fallback to session storage data
            updateAccountInfo();
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        // On error, still try to use session storage data
        updateAccountInfo();
    });
}

// Function to update account information sections
function updateAccountInfo(profileData) {
    // If no profile data is provided, try to get it from session storage
    if (!profileData) {
        const storedData = sessionStorage.getItem('userData');
        if (storedData) {
            profileData = JSON.parse(storedData);
        } else {
            // No data available
            return;
        }
    }

    // Update balance
    const balanceElement = document.getElementById('userBalance');
    if (balanceElement && profileData.balance !== undefined) {
        balanceElement.textContent = profileData.balance.toFixed(2);
    }

    // Update purchased items list
    updateItemsList('purchasedItemsList', profileData.purchasedItems || []);
    
    // Update sold items list
    updateItemsList('soldItemsList', profileData.soldItems || []);
    
    // Update items for sale list
    updateItemsList('itemsForSaleList', profileData.itemsToSell || []);
}

// Function to update an items list
function updateItemsList(listId, items) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;

    // Clear current content
    listElement.innerHTML = '';

    // If no items, show a message
    if (!items || items.length === 0) {
        listElement.innerHTML = '<div class="no-items">No items found.</div>';
        return;
    }

    // Add each item to the list
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';

        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        itemInfo.textContent = item.description || 'Unknown Item';

        const itemPrice = document.createElement('div');
        itemPrice.className = 'item-price';
        itemPrice.textContent = `$${item.price ? item.price.toFixed(2) : '0.00'}`;

        itemCard.appendChild(itemInfo);
        itemCard.appendChild(itemPrice);
        listElement.appendChild(itemCard);
    });
}

// Function to pre-fill personal information fields
function prefillPersonalInfo(profileData) {
    if (!profileData) return;
    
    // Handle name fields
    if (profileData.name) {
        // Split the full name into first and last name
        const nameParts = profileData.name.split(' ');
        if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            const firstNameInput = document.getElementById('firstName');
            const lastNameInput = document.getElementById('lastName');
            
            if (firstNameInput) firstNameInput.value = firstName;
            if (lastNameInput) lastNameInput.value = lastName;
        }
    }
    
    // Handle email field
    const emailInput = document.getElementById('email');
    if (emailInput && profileData.email) {
        emailInput.value = profileData.email;
    }
    
    // Handle phone field if available
    const phoneInput = document.getElementById('phone');
    if (phoneInput && profileData.phone) {
        phoneInput.value = profileData.phone;
    }
    

    if (profileData.preferences) {
        const newMessagesCheckbox = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(1)');
        const orderUpdatesCheckbox = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(3)');
        const marketingCheckbox = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(5)');
        
        if (newMessagesCheckbox && profileData.preferences.newMessages !== undefined) {
            newMessagesCheckbox.checked = profileData.preferences.newMessages;
        }
        
        if (orderUpdatesCheckbox && profileData.preferences.orderUpdates !== undefined) {
            orderUpdatesCheckbox.checked = profileData.preferences.orderUpdates;
        }
        
        if (marketingCheckbox && profileData.preferences.marketing !== undefined) {
            marketingCheckbox.checked = profileData.preferences.marketing;
        }
    }
}