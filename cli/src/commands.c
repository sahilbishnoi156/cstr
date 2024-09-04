#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <json-c/json.h>
#include <commands.h>
#include <curl/curl.h>
#include <unistd.h>

const char *DATA_FILE_NAME = "./data/commands.json";
const char *HISTORY_FILE = "~/.bash_history";

// Define a function to get input from the user for a string field
char *get_string_input(const char *prompt, const char *default_value, bool required)
{
    char *input = malloc(1024 * sizeof(char));
    if (!input)
    {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);
    }

    printf("%s: ", prompt);
    if (fgets(input, 1024, stdin) != NULL)
    {
        // Remove the newline character from the end of the input
        input[strcspn(input, "\n")] = 0;
    }

    // If the input is empty, set it to the default value
    if (strlen(input) == 0)
    {
        if (required)
        {
            printf("%s is required.\n", prompt);
            free(input);
            return get_string_input(prompt, default_value, required);
        }
        else
        {
            free(input);
            input = malloc(strlen(default_value) + 1);
            if (!input)
            {
                fprintf(stderr, "Memory allocation failed\n");
                exit(EXIT_FAILURE);
            }
            strcpy(input, default_value);
        }
    }

    return input;
}

// Define a function to get input from the user for an integer field
int get_integer_input(const char *prompt)
{
    int input;
    char *endptr;

    while (1)
    {
        printf("%s: ", prompt);
        char *line = malloc(256 * sizeof(char));
        if (!line)
        {
            fprintf(stderr, "Memory allocation failed\n");
            exit(EXIT_FAILURE);
        }
        if (fgets(line, 256, stdin) != NULL)
        {
            // Remove the newline character from the end of the input
            line[strcspn(line, "\n")] = 0;
        }

        // If the input is empty, return 0
        if (strlen(line) == 0)
        {
            free(line);
            return 0;
        }

        // converting the input to an integer
        input = strtol(line, &endptr, 10);

        // If the input is not a valid integer, print an error message and retry
        if (endptr == line || *endptr != '\0')
        {
            printf("Invalid input\n");
            free(line);
            continue;
        }

        free(line);
        return input;
    }
}

// Define a function to get input from the user for an array field
json_object *get_array_input(const char *prompt)
{
    // creating a json object array
    json_object *array = json_object_new_array();
    if (!array)
    {
        fprintf(stderr, "Failed to create JSON array\n");
        exit(EXIT_FAILURE);
    }

    printf("%s: ", prompt);

    // Read input until the user enters an empty line
    while (1)
    {
        char *input = malloc(256 * sizeof(char));
        if (!input)
        {
            fprintf(stderr, "Memory allocation failed\n");
            exit(EXIT_FAILURE);
        }
        if (fgets(input, 256, stdin) != NULL)
        {
            // Remove the newline character from the end of the input
            input[strcspn(input, "\n")] = 0;
        }

        // If the input is empty, break the loop
        if (strlen(input) == 0)
        {
            free(input);
            break;
        }

        // Add the input to the array
        json_object_array_add(array, json_object_new_string(input));
        free(input);
    }

    return array;
}

// get pwd
char *verify_cwd(char *working_directory)
{
    char cwd[1024];
    if (getcwd(cwd, sizeof(cwd)) != NULL)
    {
        if (working_directory && strlen(working_directory) > 0)
        {
            // Check if the working directory is valid
            if (chdir(working_directory) != 0)
            {
                fprintf(stderr, "Invalid working directory: %s\n", working_directory);
                free(working_directory);
                return verify_cwd(get_string_input("Working directory", "", false));
            }
            chdir(cwd); // Change back to the original working directory
            return working_directory;
        }
        else
        {
            free(working_directory);
            working_directory = malloc(strlen(cwd) + 1);

            if (!working_directory)
            {
                fprintf(stderr, "Memory allocation failed\n");
                exit(EXIT_FAILURE);
            }

            strcpy(working_directory, cwd);
            return working_directory;
        }
    }
    else
    {
        fprintf(stderr, "Failed to get current working directory\n");
        exit(EXIT_FAILURE);
    }
}

// Define a function to create a JSON object from user input
json_object *create_command_object()
{
    json_object *command = json_object_new_object();
    if (!command)
    {
        fprintf(stderr, "Failed to create JSON object\n");
        exit(EXIT_FAILURE);
    }

    char *label = get_string_input("Command", "", true);
    json_object_object_add(command, "label", json_object_new_string(label));
    free(label);

    char *description = get_string_input("Description", "", false);
    json_object_object_add(command, "description", json_object_new_string(description));
    free(description);

    json_object *tags = get_array_input("Tags (one per line, empty line to finish)");
    json_object_object_add(command, "tags", tags);

    int execution_count = get_integer_input("Execution count");
    json_object_object_add(command, "execution_count", json_object_new_int(execution_count == 0 ? 1 : execution_count));

    char *working_directory = verify_cwd(get_string_input("Working directory", "", false));
    json_object_object_add(command, "working_directory", json_object_new_string(working_directory));
    free(working_directory);

    char *command_output = get_string_input("Command output", "", false);
    json_object_object_add(command, "command_output", json_object_new_string(command_output));
    free(command_output);

    int exit_status = get_integer_input("Exit status: ");
    json_object_object_add(command, "exit_status", json_object_new_int(exit_status));

    char *source = get_string_input("Source", "shell", false);
    json_object_object_add(command, "source", json_object_new_string(source));
    free(source);

    json_object *aliases = get_array_input("Aliases (one per line, empty line to finish)");
    json_object_object_add(command, "aliases", aliases);

    return command;
}

// Function to add a command locally
void add_command_locally()
{
    // Create command object from user input
    json_object *command = create_command_object();
    printf("%s\n", json_object_to_json_string(command));

    // Path to the JSON file containing all commands

    // Read the existing JSON file
    FILE *file = fopen(DATA_FILE_NAME, "r");
    if (!file)
    {
        fprintf(stderr, "Failed to open file: %s\n", DATA_FILE_NAME);
        json_object_put(command);
        return;
    }

    // Read the file content into a buffer
    fseek(file, 0, SEEK_END);
    long file_size = ftell(file);
    fseek(file, 0, SEEK_SET);
    char *file_content = malloc(file_size + 1);
    if (!file_content)
    {
        fprintf(stderr, "Memory allocation failed\n");
        fclose(file);
        json_object_put(command);
        exit(EXIT_FAILURE);
    }
    fread(file_content, 1, file_size, file);
    file_content[file_size] = '\0';
    fclose(file);

    // Parse the JSON content
    json_object *commands_array = json_tokener_parse(file_content);
    free(file_content);
    if (!commands_array)
    {
        fprintf(stderr, "Failed to parse JSON content\n");
        json_object_put(command);
        return;
    }

    // Add the new command to the array
    json_object_array_add(commands_array, command);

    // Write the updated JSON array back to the file
    file = fopen(DATA_FILE_NAME, "w");
    if (!file)
    {
        fprintf(stderr, "Failed to open file: %s\n", DATA_FILE_NAME);
        json_object_put(commands_array);
        return;
    }
    fprintf(file, "%s\n", json_object_to_json_string(commands_array));
    fclose(file);

    // Free the JSON objects
    json_object_put(commands_array);

    printf("Command added successfully.\n");
}

void get_commands_from_history(int limit)
{
    // Open the history file
    FILE *fp = fopen(HISTORY_FILE, "r");
    if (fp == NULL)
    {
        perror("Error opening history file");
        return 1;
    }

    // Seek to the end of the file
    fseek(fp, 0, SEEK_END);
    long file_size = ftell(fp);

    // Allocate memory to store the lines
    char **lines = malloc(limit * sizeof(char *));
    for (int i = 0; i < limit; i++)
    {
        lines[i] = malloc(1024 * sizeof(char));
    }

    // Read the specified number of lines from the bottom
    int lines_read = 0;
    while (lines_read < limit)
    {
        fseek(fp, file_size - 1024, SEEK_SET);
        char line[1024];
        fgets(line, 1024, fp);
        line[strcspn(line, "\n")] = 0; // remove newline character

        // Store the line in the array
        strcpy(lines[lines_read], line);
        lines_read++;

        // Move to the previous line
        file_size -= strlen(line) + 1; // +1 for newline character
    }

    // Close the history file
    fclose(fp);

    // Print the read lines
    for (int i = 0; i < limit; i++)
    {
        printf("%s\n", lines[i]);
    }

    // Free the allocated memory
    for (int i = 0; i < limit; i++)
    {
        free(lines[i]);
    }
    free(lines);

    return 0;
}