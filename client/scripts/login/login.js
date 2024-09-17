// Helper functions to get elements with error handling

function querySelectorOrThrow(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(
            `Element with selector "${selector}" not found.`
        );
    }
    return element;
}

const loginForm = querySelectorOrThrow('#login-form');
const signin_btn = querySelectorOrThrow('#signin_btn');

// Event listener for the login form
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Disable the sign-in button and show the spinner
    signin_btn.disabled = true; // Disable the button
    signin_btn.innerHTML = `<span class="svg-spinners--ring-resize"></span>`; // Show spinner
    signin_btn.style.backgroundColor = '#353535';

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Simulate the login process
    handleLogin(data);
});

// Function to handle signup (optional)
function handleLogin(formData) {
    const url = 'http://localhost:3000' + '/api/auth/login';
    // Example: Send formData to an API endpoint
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                if (formData.remember) {
                    localStorage.setItem('authtoken', data.authtoken);
                } else {
                    sessionStorage.setItem(
                        'authtoken',
                        data.authtoken
                    );
                }
                showToast('Login successful', false);
                setTimeout(function () {
                    window.location.href = '/html';
                }, 1000);
            } else if (data.errors && Array.isArray(data.errors)) {
                displayFieldErrors(data.errors);
            } else {
                showToast(
                    data.error || 'An error occurred during signup',
                    true
                );
            }
        })
        .catch((error) => {
            showToast('Error during signup: ' + error.message, true);
        })
        .finally(() => {
            // Re-enable the button after the login process is done
            signin_btn.disabled = false;
            signin_btn.innerHTML = 'Sign In'; // Reset button text
            signin_btn.style.backgroundColor = '#087452';
        });
}

// Function to display field-specific errors
function displayFieldErrors(errors) {
    errors.forEach((error) => {
        const errorElement = document.querySelector(
            `#${error.path}_error`
        );
        if (errorElement) {
            errorElement.textContent = error.msg;
        } else {
            showToast(error.msg, true);
        }
    });
}

// Function to clear previous error messages
function clearErrors() {
    document
        .querySelectorAll('.text-red-400')
        .forEach((el) => (el.textContent = ''));
}

// Check authentication token
function checkAuthToken() {
    const authToken =
        localStorage.getItem('authtoken') ||
        sessionStorage.getItem('authtoken');
    if (authToken) {
        window.location.href = '/html';
    }
}

// Call the function to check authentication on page load
checkAuthToken();
