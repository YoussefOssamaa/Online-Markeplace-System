document.addEventListener('DOMContentLoaded', function() {
    const changePhotoButton = document.querySelector('.profile-photo button:nth-child(2)');
    const removePhotoButton = document.querySelector('.profile-photo button.remove');
    const saveChangesButton = document.querySelector('.actions button.save');
    const cancelButton = document.querySelector('.actions button.cancel');

    if (changePhotoButton) {
        changePhotoButton.addEventListener('click', function() {
            alert('Implement profile photo change functionality here.');
            // In a real application, you would trigger a file input or a modal.
        });
    }

    if (removePhotoButton) {
        removePhotoButton.addEventListener('click', function() {
            alert('Implement profile photo removal functionality here.');
            // You might want to confirm with the user before removing.
        });
    }

    if (saveChangesButton) {
        saveChangesButton.addEventListener('click', function() {
            // In a real application, you would collect the form data
            // and send it to a server to update the account settings.
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const notificationsNewMessages = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(1)').checked;
            const notificationsOrderUpdates = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(3)').checked;
            const marketingCommunications = document.querySelector('.notification-preferences input[type="checkbox"]:nth-child(5)').checked;

            console.log('Saving changes:', { firstName, lastName, email, phone, newPassword, confirmNewPassword, notificationsNewMessages, notificationsOrderUpdates, marketingCommunications });
            alert('Account settings saved (implementation needed).');
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            alert('Discarding changes (implementation needed).');
            // You might want to navigate the user back or reset the form.
        });
    }
});