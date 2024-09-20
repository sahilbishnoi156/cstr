// side bar buttons event
sidebarButtons.forEach((button) => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        sidebarButtons.forEach((btn) =>
            btn.classList.remove('active')
        );

        // Add active class to the clicked button
        button.classList.add('active');

        const content = button.getAttribute('data-content');
        updateContent(content);
        contentArea.scrollTo(0, 0);
    });
});
async function deleteCommand(id) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/command/deleteCommand?id=${id}&web=true`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    authToken: `${
                        localStorage.getItem('authtoken') ||
                        sessionStorage.getItem('authtoken')
                    }`,
                },
            }
        );

        const result = await response.json();
        if (result.error) {
            showToast(result.error, true);
        } else {
            showToast('Command Deleted');
            updateContent('my_commands');
        }
    } catch (error) {
        console.error(error);
        showToast('An error occurred', true);
    }
}
function displayResults(commands, ele) {
    ele.innerHTML = `<h2 class="text-xl font-semibold text-white my-4">Results ${
        commands.length || 0
    }</h2>`;
    ele.innerHTML += commands
        .map(
            (command) => `
            <div class="bg-[#23423c] rounded-lg shadow-lg p-6 mb-4">
                <div class="flex justify-between items-start sm:flex-row flex-col mb-2">
                    <h3 class="text-xl font-semibold text-white">${
                        command.label
                    }</h3>
                    <span class="text-sm text-yellow-600">${
                        command.created_at
                    }</span>

                </div>
                <p class="text-gray-300 mb-2">${
                    command.description || 'No description provided'
                }</p>
                <div class="flex flex-wrap gap-2 mb-2">
                    ${command.tags
                        .map(
                            (tag) =>
                                `<span class="bg-[#4a7a6f] text-white px-2 py-1 rounded-md text-sm">${tag}</span>`
                        )
                        .join('')}
                </div>
                <div class="text-sm text-gray-400">
                    <p>Execution count: ${command.execution_count}</p>
                    <p>Last executed: ${
                        command.last_executed_at
                            ? new Date(
                                  command.last_executed_at
                              ).toLocaleString()
                            : 'Never'
                    }</p>
                    <p>Working directory: ${
                        command.working_directory || 'Not specified'
                    }</p>
                    <p>Source: ${
                        command.source || 'Not specified'
                    }</p>
                    <p>Aliases: ${
                        command.aliases.join(', ') || 'None'
                    }</p>
                </div>
                <div><svg xmlns="http://www.w3.org/2000/svg" id="${
                    command.id
                }" class="text-red-400 h-7 w-7 mt-3 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                    <polyline  points="3 6 5 6 21 6"></polyline>
                    <path  d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path  d="M10 11v6"></path>
                    <path  d="M14 11v6"></path>
                    <rect   x="9" y="3" width="6" height="3" rx="1" ry="1"></rect>
                    </svg>
                </div>
            </div>
        `
        )
        .join('');
    commands.forEach((command) => {
        document
            .getElementById(command.id)
            .addEventListener('click', (e) => {
                const isSure = confirm(
                    'Do you really want to delete this command?'
                );
                if (isSure) {
                    deleteCommand(command.id);
                } else {
                    showToast('Delete Cancelled', true);
                }
            });
    });
}

function toggleButton(isDisabled, ele, text) {
    if (isDisabled) {
        ele.setAttribute('disabled', true);
        ele.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...`;
    } else {
        ele.removeAttribute('disabled');
        ele.textContent = text;
    }
}

function updateContent(content) {
    switch (content) {
        case 'home':
            contentArea.innerHTML = d_html.home;
            break;
        case 'cli':
            contentArea.innerHTML = d_html.cli;
            break;
        case 'search':
            contentArea.innerHTML = d_html.search;
            const searchButton =
                document.getElementById('search-button');
            const searchField =
                document.getElementById('search-field');
            const searchValue =
                document.getElementById('search-value');
            const searchResults =
                document.getElementById('search-results');

            searchButton.addEventListener('click', async () => {
                const key = searchField.value;
                const value = searchValue.value;

                if (!value) {
                    showToast('Please enter a search term', true);
                    return;
                }

                searchResults.innerHTML = `<div class="h-[40vh] w-full flex items-center justify-center flex-col"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>Loading</div>`;
                try {
                    const response = await fetch(
                        'http://localhost:3000/api/command/getbyfield?web=true',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                authToken: `${
                                    localStorage.getItem(
                                        'authtoken'
                                    ) ||
                                    sessionStorage.getItem(
                                        'authtoken'
                                    )
                                }`,
                            },
                            body: JSON.stringify({ key, value }),
                        }
                    );

                    const result = await response.json();

                    if (result.error || !result.data) {
                        showToast(
                            result.error || 'No results found',
                            true
                        );
                        searchResults.innerHTML = '';
                    } else {
                        displayResults(result.data, searchResults);
                    }
                } catch (error) {
                    showToast(
                        'An error occurred while searching',
                        true
                    );
                }
            });

            break;

        case 'add':
            contentArea.innerHTML = d_html.add;
            const form = document.getElementById('commandForm');
            const tagInput = document.getElementById('tagInput');
            const aliasInput = document.getElementById('aliasInput');
            const tagContainer =
                document.getElementById('tagContainer');
            const aliasContainer =
                document.getElementById('aliasContainer');

            function addItem(value, container, inputElement) {
                if (value.trim() !== '') {
                    const span = document.createElement('span');
                    span.className =
                        'bg-[#23423c] px-2 py-1 rounded-md text-sm flex items-center';
                    span.innerHTML = `
          ${value}
          <button type="button" class="ml-2 text-xs">
            <i class="fas fa-times"></i>
          </button>
        `;
                    span.querySelector('button').addEventListener(
                        'click',
                        function () {
                            container.removeChild(span);
                        }
                    );
                    container.appendChild(span);
                    inputElement.value = '';
                }
            }

            tagInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem(this.value, tagContainer, this);
                }
            });

            aliasInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem(this.value, aliasContainer, this);
                }
            });
            let isCreatingCommand = false;
            const create_btn = document.getElementById(
                'create_command_btn'
            );

            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                if (isCreatingCommand) return;
                isCreatingCommand = true;
                toggleButton(true, create_btn, 'Create');

                const formData = new FormData(form);
                const tags = Array.from(tagContainer.children).map(
                    (span) => span.textContent.trim()
                );
                const aliases = Array.from(
                    aliasContainer.children
                ).map((span) => span.textContent.trim());

                const commandData = {
                    label: formData.get('label'),
                    description: formData.get('description'),
                    tags: tags,
                    execution_count: 0,
                    command_output: formData.get('commandOutput'),
                    exit_status: 0,
                    source: formData.get('source'),
                    aliases: aliases,
                };
                console.log(commandData);

                try {
                    const response = await fetch(
                        'http://localhost:3000/api/command/createCommand?web=true',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                authToken:
                                    localStorage.getItem(
                                        'authtoken'
                                    ) ||
                                    sessionStorage.getItem(
                                        'authtoken'
                                    ) ||
                                    '',
                            },
                            body: JSON.stringify({
                                command: commandData,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error('Failed to create command');
                    }

                    const result = await response.json();
                    if (result.error || !result.data) {
                        throw new Error(result.error);
                    }
                    showToast('Command Created');
                } catch (error) {
                    console.error(
                        error.message || 'Error creating command',
                        error
                    );
                    showToast('Action Failed', true);
                } finally {
                    isCreatingCommand = false;
                    toggleButton(false, create_btn, 'Create');
                }
            });
            break;
        case 'settings':
            contentArea.innerHTML = d_html.settings;
            const syncToggle = document.getElementById('syncToggle');
            let isSyncing = false;

            async function checkSyncStatus() {
                try {
                    const response = await fetch(
                        'http://localhost:3000/api/auth/sync?status=true',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                authToken:
                                    localStorage.getItem(
                                        'authtoken'
                                    ) ||
                                    sessionStorage.getItem(
                                        'authtoken'
                                    ) ||
                                    '',
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            'Failed to fetch sync status'
                        );
                    }

                    const result = await response.json();
                    syncToggle.checked = result.sync;
                } catch (error) {
                    console.error(
                        error.message ||
                            'Error checking sync status:',
                        error
                    );
                    showToast('Action Failed', true);
                }
            }

            async function handleSyncToggle() {
                if (isSyncing) return;

                isSyncing = true;
                syncToggle.disabled = true;

                try {
                    const response = await fetch(
                        'http://localhost:3000/api/auth/sync',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                authToken:
                                    localStorage.getItem(
                                        'authtoken'
                                    ) ||
                                    sessionStorage.getItem(
                                        'authtoken'
                                    ) ||
                                    '',
                            },
                            body: JSON.stringify({
                                enableSync: syncToggle.checked,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            'Failed to update sync settings'
                        );
                    }

                    const result = await response.json();
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    showToast('Settings Updated');
                } catch (error) {
                    console.error(
                        error.message ||
                            'Error updating sync settings:',
                        error
                    );
                    showToast('Action Failed', true);
                    syncToggle.checked = !syncToggle.checked; // Revert the toggle state
                } finally {
                    isSyncing = false;
                    syncToggle.disabled = false;
                }
            }

            let isResetting = false;
            const resetPasswordBtn = document.getElementById(
                'resetPasswordBtn'
            );
            const resetPasswordForm = document.getElementById(
                'resetPasswordForm'
            );

            async function resetPassword(e) {
                e.preventDefault(); // Prevent form submission
                if (isResetting) return;
                isResetting = true;
                toggleButton(true, resetPasswordBtn, 'Reset');

                // make form
                const formData = new FormData(resetPasswordForm);

                // Define API endpoint
                const apiUrl =
                    'http://localhost:3000/api/auth/resetPass';

                // Define request options
                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        authToken:
                            localStorage.getItem('authtoken') ||
                            sessionStorage.getItem('authtoken') ||
                            '',
                    },
                    body: JSON.stringify({
                        oldpassword: formData.get('oldpassword'),
                        newpassword: formData.get('newpassword'),
                    }),
                };

                // Make API call
                fetch(apiUrl, requestOptions)
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.data) {
                            showToast(data.data || 'Password reset');
                            resetPasswordForm.reset();
                        } else {
                            showToast(
                                data.error ||
                                    'Error resetting password: ',
                                true
                            );
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        showToast(
                            error.message ||
                                'Error resetting password: ',
                            true
                        );
                    })
                    .finally(() => {
                        isResetting = false;
                        toggleButton(
                            false,
                            resetPasswordBtn,
                            'Reset'
                        );
                    });
            }

            resetPasswordForm.addEventListener(
                'submit',
                resetPassword
            );

            // Username update
            const changeUsernameForm =
                document.getElementById('changenameform');
            const changeusernameButton =
                document.getElementById('changenamebtn');
            const usernameInput = document.getElementById('fullname');
            let isUpdatingUsername = false;
            changeUsernameForm.addEventListener(
                'submit',
                async function (e) {
                    e.preventDefault();
                    if (isUpdatingUsername) return;
                    isUpdatingUsername = true;
                    toggleButton(
                        true,
                        changeusernameButton,
                        'Update'
                    );

                    const formData = new FormData(changeUsernameForm);
                    const apiUrl =
                        'http://localhost:3000/api/auth/changename';
                    const requestOptions = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            authToken:
                                localStorage.getItem('authtoken') ||
                                sessionStorage.getItem('authtoken') ||
                                '',
                        },
                        body: JSON.stringify({
                            name: formData.get('name'),
                        }),
                    };

                    fetch(apiUrl, requestOptions)
                        .then((response) => response.json())
                        .then((data) => {
                            if (data.data) {
                                showToast(
                                    data.data || 'Name updated'
                                );
                                usernameInput.value =
                                    formData.get('name');

                                // update session storage
                                const parsedUser = JSON.parse(
                                    sessionStorage.getItem('user')
                                );
                                parsedUser.name =
                                    formData.get('name');
                                sessionStorage.setItem(
                                    'user',
                                    JSON.stringify(parsedUser)
                                );

                                // update navbar
                                currentUserName.textContent =
                                    'Hi ' +
                                    formData.get('name') +
                                    '!';
                            } else {
                                showToast(
                                    data.error ||
                                        'Error updating name: ',
                                    true
                                );
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            showToast(
                                error.message ||
                                    'Error updating name: ',
                                true
                            );
                        })
                        .finally(() => {
                            isUpdatingUsername = false;
                            toggleButton(
                                false,
                                changeusernameButton,
                                'Update'
                            );
                        });
                }
            );

            // set username to field
            const parsedUser = JSON.parse(
                sessionStorage.getItem('user')
            );
            usernameInput.value = parsedUser.name;
            checkSyncStatus();

            // Add event listener for toggle changes
            syncToggle.addEventListener('change', handleSyncToggle);
            break;
        case 'my_commands':
            contentArea.innerHTML = d_html.my_commands;
            document.getElementById(
                'my_command_result'
            ).innerHTML = `<div class="h-[60vh] w-full flex items-center justify-center flex-col"><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>Loading</div>`;
            async function fetchCommands() {
                try {
                    const response = await fetch(
                        'http://localhost:3000/api/command/getcommands?web=true',
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                authToken: `${
                                    localStorage.getItem(
                                        'authtoken'
                                    ) ||
                                    sessionStorage.getItem(
                                        'authtoken'
                                    )
                                }`,
                            },
                        }
                    );

                    const result = await response.json();

                    if (result.error || !result.data) {
                        showToast(
                            result.error || 'No Commands found'
                        );
                    } else {
                        displayResults(
                            result.data,
                            document.getElementById(
                                'my_command_result'
                            )
                        );
                    }
                } catch (error) {
                    console.log(error);
                    showToast(
                        error.message || 'Failed to fetch commands'
                    );
                }
            }
            fetchCommands();
            break;
        default:
            contentArea.innerHTML =
                '<p>Select an option from the sidebar.</p>';
    }
}

// logout button event
logoutButton.addEventListener('click', () => {
    const isSure = confirm('Do you really want to logout?');
    if (isSure) {
        showToast('See you again');
        setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }, 2000);
    } else {
        showToast('Logout Cancelled', true);
    }
});
