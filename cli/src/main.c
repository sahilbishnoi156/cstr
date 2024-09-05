#include <stdio.h>
#include "auth.h"
#include <string.h>
#include "commands.h"
#include <json-c/json.h>
#include <utils.h>

int main(int argc, char *argv[])
{
    char *action;
    char *attribute;

    if (argc < 2)
    {
        printf("Invalid arguments.\n");
        return 1;
    }
    if (argc >= 2)
    {
        action = argv[1];
    }
    if (argc >= 3)
    {
        attribute = argv[2];
    }

    if (strcmp(action, "add") == 0 && argc == 2)
    {
        add_command_locally(NULL);
    }
    else if (strcmp(action, "add") == 0 && attribute && argc == 3)
    {
        add_commands_from_history(attribute);
    }
    else if (strcmp(action, "man") == 0 && argc == 2)
    {
        show_manual();
    }
    else if (strcmp(action, "login") == 0 && argc == 2)
    {
        login();
    }
    else if (strcmp(action, "get") == 0 && argc == 3)
    {
        printf("Working on it\n");
    }
    else if (strcmp(action, "fetch") == 0)
    {
        printf("Working on it\n");
    }
    else if (strcmp(action, "push") == 0)
    {
        printf("Working on it\n");
    }
    else
    {
        printf("Invalid action: \" ");
        for (int i = 0; i < argc; i++)
        {
            printf("%s ", argv[i]);
        }
        printf("\"\n");
        return 1;
    }
    return 0;
}