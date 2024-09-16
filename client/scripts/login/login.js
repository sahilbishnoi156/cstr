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

// Event listener for the login form
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted:', data);
    // Here you would typically handle the signup logic
});
