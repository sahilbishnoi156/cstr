// login button event
sidebarButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const content = button.getAttribute('data-content');
        updateContent(content);
    });
});

function updateContent(content) {
    switch (content) {
        case 'home':
            contentArea.innerHTML =
                '<h2 class="text-2xl mb-4">Home</h2><p>Welcome to your dashboard!</p>';
            break;
        case 'add':
            contentArea.innerHTML =
                '<h2 class="text-2xl mb-4">Add New</h2><p>Here you can add new items.</p>';
            break;
        case 'search':
            contentArea.innerHTML =
                '<h2 class="text-2xl mb-4">Search</h2><p>Search for items here.</p>';
            break;
        case 'settings':
            contentArea.innerHTML =
                '<h2 class="text-2xl mb-4">Settings</h2><p>Adjust your settings here.</p>';
            break;
        default:
            contentArea.innerHTML =
                '<p>Select an option from the sidebar.</p>';
    }
}
