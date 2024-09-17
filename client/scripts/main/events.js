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

function updateContent(content) {
    switch (content) {
        case 'home':
            contentArea.innerHTML = `<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <!-- Hero Section -->
                        <section id="hero"
                            class="relative min-h-[80vh] flex flex-col justify-center items-center py-12 sm:py-16 snap-start">
                            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">Manage Commands
                                Easily with cstr</h1>
                            <p class="text-base sm:text-lg md:text-xl mb-8 text-center max-w-2xl">
                                A tool for saving, organizing, and accessing commands via both a web interface and CLI.
                                Seamlessly manage your frequently used commands, retrieve history, and more!
                            </p>
                            <a href="#"
                                class="bg-[#23423c] cursor-pointer text-white px-5 hover:px-7 duration-150 py-3 rounded-md text-lg font-semibold">
                                Add Command
                            </a>
                            <a href="#about" class=" absolute bottom-4 animate-bounce">
                                <svg class="w-6 h-6 text-white" fill="none" stroke-linecap="round"
                                    stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                                </svg>
                            </a>
                        </section>

                        <!-- What the Project is About -->
                        <section id="about"
                            class="relative min-h-[80vh] flex flex-col justify-center items-center py-12 sm:py-16 snap-start">
                            <h2 class="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center">What is CSTR?
                            </h2>
                            <p class="text-base sm:text-lg md:text-xl leading-relaxed text-center max-w-2xl">
                                The <strong>cstr</strong> project provides a versatile platform for saving and managing
                                shell commands, whether you're working locally on the CLI or prefer the convenience
                                of a web interface. With <strong>cstr</strong>, you can easily store commands, add
                                aliases, retrieve command histories, and more, all from one tool.
                            </p>
                            <a href="#use-cases" class="absolute bottom-4 animate-bounce">
                                <svg class="w-6 h-6 text-white" fill="none" stroke-linecap="round"
                                    stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                                </svg>
                            </a>
                        </section>

                        <!-- Use Cases Section -->
                        <section id="use-cases"
                            class="relative min-h-[85vh] flex flex-col justify-center items-center py-12 sm:py-16 snap-start">
                            <h2 class="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center">Use Cases</h2>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
                                <div class="p-6 bg-[#23423c] rounded-md">
                                    <h3 class="text-lg sm:text-xl md:text-2xl font-semibold mb-4">Streamline
                                        Development</h3>
                                    <p class="text-sm sm:text-base">
                                        Use <strong>cstr</strong> to manage commands that you frequently run during
                                        development. Quickly add new commands, retrieve them later, and avoid repetitive
                                        typing.
                                    </p>
                                </div>

                                <div class="p-6 bg-[#23423c] rounded-md">
                                    <h3 class="text-lg sm:text-xl md:text-2xl font-semibold mb-4">Team Collaboration
                                    </h3>
                                    <p class="text-sm sm:text-base">
                                        Share important commands with your team. Store commands in a central repository
                                        and allow others to access them, making it easier for team members to run common
                                        scripts.
                                    </p>
                                </div>

                                <div class="p-6 bg-[#23423c] rounded-md">
                                    <h3 class="text-lg sm:text-xl md:text-2xl font-semibold mb-4">Project Setup
                                        Automation</h3>
                                    <p class="text-sm sm:text-base">
                                        Save commands for setting up projects, such as installing dependencies or
                                        setting up environments. You can easily push the setup commands to the CLI and
                                        website for seamless access.
                                    </p>
                                </div>

                                <div class="p-6 bg-[#23423c] rounded-md">
                                    <h3 class="text-lg sm:text-xl md:text-2xl font-semibold mb-4">Data Retrieval</h3>
                                    <p class="text-sm sm:text-base">
                                        Retrieve old command histories across projects. <strong>cstr</strong> helps you
                                        keep track of useful commands and reuse them across different environments.
                                    </p>
                                </div>
                            </div>
                            <a href="#hero" class="absolute bottom-4 animate-bounce">
                                <svg class="w-6 h-6 text-white" fill="none" stroke-linecap="round"
                                    stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                                </svg>
                            </a>
                        </section>
                    </div>
`;
            break;
        case 'cli':
            contentArea.innerHTML = `<div class="mx-auto">
                        <h1 class="text-6xl font-bold mb-6">CSTR - CLI</h1>
                        <div  class="text-red-500 mb-6"><h2 class="text-4xl">***IMPORTANT***</h2>
                        <p>This tool is only built for linux environment at least for now. So it is strongly recommended
                            do not use this in windows or mac or you might loose you system files.</p></div>
                        <div class="mb-8">
                            <h2 class="text-4xl font-semibold mb-4">Usage</h2>
                            <p class="mb-3">Below are some common use cases:</p>
                            <ul class="list-disc pl-8">
                                <li class="mb-4"><strong class="p-1 rounded-md bg-[#23423c]">cstr add</strong>: Add a
                                    new
                                    command</li>
                                <li class="mb-4"><strong class="p-1 rounded-md bg-[#23423c]">cstr add
                                        &lt;limit&gt;</strong>:
                                    Add history
                                    commands (with a limit of
                                    10)</li>
                                <li class="mb-4"><strong class="p-1 rounded-md bg-[#23423c]">cstr man</strong>: View
                                    manual
                                </li>
                                <li class="mb-4"><strong class="p-1 rounded-md bg-[#23423c]">cstr login</strong>: Log in
                                    to the
                                    service to
                                    access global files</li>
                                <li class="mb-4"><strong class="p-1 rounded-md bg-[#23423c]">cstr get</strong>: Search
                                    commands
                                    using
                                    specific attributes</li>
                                <li class="mb-4"><strong class="p-1 rounded-md bg-[#23423c]">cstr fetch</strong>: Fetch
                                    data
                                    from the cloud
                                    service</li>
                                <li class="mb-4"><strong class="p-1 rounded-md bg-[#23423c]">cstr push</strong>: Push
                                    local
                                    changes to the
                                    cloud</li>
                            </ul>
                        </div>

                        <div class="mb-8">
                            <h2 class="text-4xl font-semibold mb-4">Installation</h2>
                            <p class="text-2xl">Run Locally:</p>
                            <ol class="list-decimal pl-8">
                                <li class="my-3">Clone the repository:
                                    <br>
                                    <code
                                        class="p-1 rounded-md bg-[#23423c]">$ git clone "https://github.com/sahilbishnoi156/cstr"</code>
                                </li>
                                <li class="my-3">Start backend server:
                                    <ol class="list-decimal pl-8">
                                        <li class="mb-4">Navigate to server directory: <br> <code
                                                class="p-1 rounded-md bg-[#23423c]">$ cd cstr/server</code></li>
                                        <li class="mb-4">Install dependencies: <br> <code
                                                class="p-1 rounded-md bg-[#23423c]">$ npm i</code></li>
                                        <li class="mb-4">Setup environment variables: <br> <code
                                                class="p-1 rounded-md bg-[#23423c]">$ vim cstr/server/.env</code></li>
                                        <li class="mb-4">Start the server: <br> <code
                                                class="p-1 rounded-md bg-[#23423c]">$ npm run start</code></li>
                                    </ol>
                                </li>
                                <li class="my-3">Navigate to C project directory: <br> <code
                                        class="p-1 rounded-md bg-[#23423c]">$ cd cstr/cli</code></li>
                                <li class="my-3">Build using script:
                                    <ol class="list-decimal pl-8">
                                        <li class="mb-4">Run build script: <br> <code
                                                class="p-1 rounded-md bg-[#23423c]">$ ./scripts/build-library.sh</code>
                                        </li>
                                        <li class="mb-4">Run the executable file: <br> <code
                                                class="p-1 rounded-md bg-[#23423c]">$ ./bin/cstr &lt;action&gt;</code>
                                        </li>
                                    </ol>
                                </li>
                                <li class="my-3">Compile using script:
                                    <ol class="list-decimal pl-8">
                                        <li class="mb-4">Run compile script: <br> <code
                                                class="p-1 rounded-md bg-[#23423c]">$ ./scripts/compile.sh</code></li>
                                        <li class="mb-4">Run the executable file: <br> <code
                                                class="p-1 rounded-md bg-[#23423c]">$ ./bin/cstr &lt;action&gt;</code>
                                        </li>
                                    </ol>
                                </li>
                                <li class="my-3">Compile manually:
                                    <ol class="list-decimal pl-8">
                                        <li class="mb-4">Compile all .c files : <br>
                                            <code
                                                class="p-1 rounded-md bg-[#23423c]">$ gcc -Iinclude -Wall -o bin/cstr/  src/main.c src/commands.c src/auth.c src/utils.c src/fetch_push.c src/get.c -lcurl -ljson-c -lncurses</code>
                                        </li>
                                        <li class="mb-4">Compile with library (First run build-library.sh script to make library) : <br>
                                            <code
                                                class="p-1 rounded-md bg-[#23423c]">$ gcc -Iinclude -o bin/cstr src/main.c -L. lib/cstrlibrary.a -lncurses -ljson-c -lcurl</code>
                                        </li>
                                    </ol>
                                </li>
                            </ol>
                            <p class="text-2xl">Download CLI script:</p>
                            <div class="mt-2 "><a download href="https://firebasestorage.googleapis.com/v0/b/dropbox-clone-2de2b.appspot.com/o/users%2Fuser_2ciZaSDYBHaCi49X89L0Gr2MX1i%2Ffiles%2F5LZ5FcD4HuUSYu1TMdho?alt=media&token=a991d80a-173e-426c-bd06-3b71e7eb3af3"
                                    class="bg-[#23423c] hover:bg-green-800 duration-150 cursor-pointer text-white px-4 hover:px-6 py-2 rounded-md text-md font-semibold">
                                    Download CLI
                                </a></div>

                        </div>

                        <div class="mb-8">
                            <h2 class="text-4xl font-semibold mb-4">Troubleshooting</h2>
                            <p class="">If you encounter issues, try the following steps:</p>
                            <ul class="list-disc pl-8">
                                <li>Ensure the CLI is installed correctly and executable.</li>
                                <li>Check your internet connection for fetching or pushing data.</li>
                                <li>Consult the <strong>./bin/cstr man</strong> for detailed command usage.</li>
                            </ul>
                        </div>

                        <div class="mb-8">
                            <h2 class="text-4xl font-semibold mb-4">Development</h2>
                            <p class="">To develop and contribute to this project, make sure you have the following
                                tools installed:</p>
                            <ul class="list-disc pl-8">
                                <li>Linux</li>
                                <li>GCC compiler</li>
                                <li><code>json-c</code> library for JSON parsing</li>
                                <li><code>libcurl</code> library for making HTTP requests</li>
                                <li><code>ncurses</code> library to move the cursor, create windows, produce colors,
                                    play with mouse etc
                                </li>
                                <li><code>nodejs</code> only if you are running it locally</li>
                            </ul>
                        </div>
`;
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
