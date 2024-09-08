#include <stdio.h>
#include "utils.h"
#include <stdlib.h>
#include <unistd.h>
#include <limits.h>
#include <libgen.h> // for dirname
#include <string.h>
#include "auth.h"

// constants
const char *BACKEND_URI = "https://cstr.onrender.com/api";
const char *PARENT_DIRECTORY;
char ENV[1024];
char COMMANDS_DATA[256];
char BASH_HISTORY[256];
const int NUM_OPTIONS_FOR_SEARCH_ACTION = 6;
const char *OPTIONS_FOR_SEARCH_ACTION[] = {"All", "label", "source", "tags", "aliases", "working_directory"};
char GET_ALL_COMMANDS_LIMIT[256];
char GET_ALL_COMMANDS[256];
char GET_COMMANDS_BY_FIELD[256];
char CREATE_COMMAND_URL[256];
char VERIFY_TOKEN_URL[256];
char LOGIN_URL[256];
const char *AUTH_TOKEN;

void init_auth_token()
{
    AUTH_TOKEN = get_token();

    // now generate urls
    set_urls();
}

void initialize_environment()
{
    // Buffer to store the path of the executable
    char exe_path[256];

    // Read the symbolic link to get the executable's location
    ssize_t len = readlink("/proc/self/exe", exe_path, sizeof(exe_path) - 1);
    if (len == -1)
    {
        fprintf(stderr, "Failed to resolve executable path\n");
        exit(EXIT_FAILURE);
    }

    // Null-terminate the string
    exe_path[len] = '\0';

    // Get the directory name from the executable path (removes the last part, i.e., 'bin')
    char *exe_dir = dirname(exe_path);

    exe_dir[strlen(exe_dir) - 4] = '\0';

    // Now exe_dir contains the path without 'bin'
    PARENT_DIRECTORY = exe_dir;

    // now setting file paths
    set_file_paths();
}

void show_manual()
{
    printf("CSTR Command Tool Manual\n"
           "=========================\n"
           "\n"
           "The CSTR Command Tool provides a range of commands to manage and interact with your shell commands.\n"
           "The following commands are available:\n"
           "\n"
           "  **add**          Add a new command\n"
           "  **add <limit>**  Add commands from history with a limit (e.g., add 10)\n"
           "  **man**          Display this manual\n"
           "  **login**        Log in to the cloud service to access global files\n"
           "  **get**          Fetch commands based on criteria:\n"
           "    - **get all**          Retrieve all commands (default limit is 10)\n"
           "    - **get source <source_name>**  Search by command source\n"
           "    - **get directory <directory>** Search by working directory\n"
           "    - **get tags <tag_name>** Search by tags\n"
           "    - **get aliases <alias_name>** Search by command aliases\n"
           "  **fetch**        Retrieve the latest command data from the cloud service\n"
           "  **push**         Push local command data to the cloud service\n"
           "\n"
           "For more information on each command, please refer to the corresponding help section or check the README file.\n");
}

void set_file_paths()
{
    // ENV
    snprintf(ENV, sizeof(ENV), "%s/.env", PARENT_DIRECTORY);

    // COMMANDS_DATA
    snprintf(COMMANDS_DATA, sizeof(COMMANDS_DATA), "%s/data/commands.json", PARENT_DIRECTORY);

    // BASH_HISTORY
    snprintf(BASH_HISTORY, sizeof(BASH_HISTORY), "%s/.bash_history", getenv("HOME"));

    // generate token
    init_auth_token();
}

void set_urls()
{
    // GET_ALL_COMMANDS_LIMIT
    snprintf(GET_ALL_COMMANDS_LIMIT, sizeof(GET_ALL_COMMANDS_LIMIT), "%s/command/getcommands?limit=10", BACKEND_URI);
    snprintf(GET_ALL_COMMANDS, sizeof(GET_ALL_COMMANDS), "%s/command/getcommands", BACKEND_URI);

    // URL FOR GET COMMANDS BY FIELD
    snprintf(GET_COMMANDS_BY_FIELD, sizeof(GET_COMMANDS_BY_FIELD), "%s/command/getbyfield", BACKEND_URI);

    // CREATE_COMMAND_URL
    snprintf(CREATE_COMMAND_URL, sizeof(CREATE_COMMAND_URL), "%s/command/createCommands", BACKEND_URI);

    // VERIFY_TOKEN_URL
    snprintf(VERIFY_TOKEN_URL, sizeof(VERIFY_TOKEN_URL), "%s/auth/authenticate?token=%s", BACKEND_URI, AUTH_TOKEN);

    // LOGIN_URL
    snprintf(LOGIN_URL, sizeof(LOGIN_URL), "%s/auth/login", BACKEND_URI);
}
