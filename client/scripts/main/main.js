// Function to show/hide private elements
function togglePrivateElements() {
    privateNav.style.display = 'flex';
    privateSection.style.display = 'flex';
    privateButtons.forEach((button) => {
        button.style.display = 'flex';
    });
}

function togglePublicElements() {
    publicNav.style.display = 'none';
    publicSection.style.display = 'none';
}

// Check authentication token
async function checkAuthToken() {
    const authToken =
        localStorage.getItem('authtoken') ||
        sessionStorage.getItem('authtoken');

    const user = sessionStorage.getItem('user');
    if (localStorage.getItem('error')) {
        window.location.href = './error.html';
        return; // Stop further execution
    }

    if (authToken && !user) {
        try {
            // Verify token by making an API call
            const url = 'http://localhost:3000/api/auth/authenticate';
            const response = await fetch(url + `?token=${authToken}`);
            const data = await response.json();

            if (!data || data.error) {
                console.error(data.error || 'Invalid token');
                localStorage.setItem(
                    'error',
                    data.error || 'Authentication failed'
                );
                window.location.href = './error.html';
            } else {
                // Store the user data in sessionStorage
                sessionStorage.setItem(
                    'user',
                    JSON.stringify(data.data.creator)
                );
                localStorage.removeItem('error');

                // Update UI for authenticated user
                currentUserName.textContent =
                    'Hi ' + data.data.creator.name + '!';
                togglePrivateElements();
                togglePublicElements();
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            localStorage.setItem('error', 'Authentication error');
            window.location.href = './error.html';
        }
    } else if (user) {
        // If user info is in sessionStorage, display it
        const parsedUser = JSON.parse(user);
        currentUserName.textContent = 'Hi ' + parsedUser.name + '!';
        togglePrivateElements();
        togglePublicElements();
    }
}

// Call the function to check authentication on page load
checkAuthToken();
