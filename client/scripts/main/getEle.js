// Helper functions to get elements with error handling
function querySelectorAllOrThrow(selector) {
    const elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) {
        throw new Error(
            `No elements found for selector "${selector}".`
        );
    }
    return elements;
}

function querySelectorOrThrow(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(
            `Element with selector "${selector}" not found.`
        );
    }
    return element;
}

// Getting required elements
const mainDiv = querySelectorOrThrow('#main_div');

// Get Private elements
const privateNav = querySelectorOrThrow('#private_nav');
const privateSection = querySelectorOrThrow('#private_section');
const privateButtons = querySelectorAllOrThrow('.private_button');

// Get Public elements
const publicNav = querySelectorOrThrow('#public_nav');
const publicSection = querySelectorOrThrow('#public_section');
const publicButtons = querySelectorAllOrThrow('.public_button');
const contentArea = querySelectorOrThrow('#content-area');
const sidebarButtons = querySelectorAllOrThrow('.sidebar-btn');
