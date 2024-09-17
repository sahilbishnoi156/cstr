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

const signUpForm = querySelectorOrThrow('#signup-form');
const signup_btn = querySelectorOrThrow('#signup_btn');

// Event listener for the signup form
signUpForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get the form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // verifying password
    if (data.password !== data.confirmPassword) {
        showToast('Passwords do not match', true);
        return;
    }

    // Disable the sign-in button and show the spinner
    signup_btn.disabled = true; // Disable the button
    signup_btn.innerHTML = `<span class="svg-spinners--ring-resize"></span>`; // Show spinner
    signup_btn.style.backgroundColor = '#353535';

    // Call the function to handle signup
    handleSignup(data);
});

// Function to handle signup
function handleSignup(formData) {
    const url = 'http://localhost:3000/api/auth/createuser';

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
                showToast('Signup successful', false);
                setTimeout(function () {
                    window.location.href = './login.html';
                }, 2000);
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
            signup_btn.disabled = false;
            signup_btn.innerHTML = 'Sign In'; // Reset button text
            signup_btn.style.backgroundColor = '#087452';
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
