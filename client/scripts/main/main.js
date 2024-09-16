// Function to show/hide private elements
function togglePrivateElements() {
    privateNav.style.display = 'flex';
    privateSection.style.display = 'flex';
    privateButtons.forEach((button) => {
        button.style.display = 'flex';
    });
}

function togglePublicElements(isAuthenticated) {
    publicNav.style.display = 'none';
    publicSection.style.display = 'none';
    publicButtons.forEach((button) => {
        button.style.display = 'none';
    });
}

// Check authentication token
function checkAuthToken() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        togglePrivateElements();
        togglePublicElements();
    }
}

// Call the function to check authentication on page load
checkAuthToken();
