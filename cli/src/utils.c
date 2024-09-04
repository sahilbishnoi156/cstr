#include <stdio.h>
#include "utils.h"

void show_manual()
{
    printf("CSTR Command Tool Manual\n"
           "=========================\n"
           "\n"
           "The CSTR Command Tool provides a range of commands to manage and interact with your shell commands.\n"
           "The following commands are available:\n"
           "\n"
           "  **add**          Add a new command\n"
           "  **add all**      Add all history commands\n"
           "  **man**          Display this manual\n"
           "  **login**        Log in to the service\n"
           "  **get**         Get a specific command\n"
           "    - **get one <command_name>**    Get a command by its name\n"
           "    - **get dir <directory>**       Get commands by directory (optional: current directory if not specified)\n"
           "    - **get source <source_name>**  Get commands by source\n"
           "    - **get tag <tag_name>**        Get commands by tag\n"
           "    - **get all**                   Retrieve all commands\n"
           "    - **get alias <alias_name>**    Get commands by alias\n"
           "    - **get date <time_period>**    Get commands saved in the last 'n' days, '1 month', or 'today'\n"
           "  **fetch**        Retrieve the latest data from the service\n"
           "  **push**         Push local changes to the service\n"
           "\n"
           "For more information on each command, please refer to the corresponding help section.\n");
}