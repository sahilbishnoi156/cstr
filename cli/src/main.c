#include <stdio.h>
#include <string.h>
#include <json-c/json.h>
#include <utils.h>
#include "auth.h"
#include "fetch_push.h"
#include "commands.h"
#include "get.h"

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
    else if (strcmp(action, "get") == 0)
    {
        get_commands();
    }
    else if (strcmp(action, "fetch") == 0 && argc == 2)
    {
        char input;
        printf("All the local commands will be lost after this action. ");
        printf("Please use \"push\" action beforehead to confirm if any unstaged commands exists.\n");
        printf("Do you still want to continue? (Y/N) : ");
        scanf("%c", &input);
        if (input == 'y' || input == 'Y')
        {
            get_all_commands();
        }
        else
        {
            printf("Action cancelled\n");
        }
    }
    else if (strcmp(action, "push") == 0 && argc == 2)
    {
        bool is_authenticated = authenticate_user();
        if (!is_authenticated)
        {
            printf("Please login before using this service.\n");
            return 1;
        }
        const char *url = "http://localhost:3000/api/command/createCommands";

        // Read the commands.json file
        char *json_data = read_json_file();

        // Process and send JSON data in chunks
        process_and_send_json(json_data, url);

        // Free the JSON data
        free(json_data);
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