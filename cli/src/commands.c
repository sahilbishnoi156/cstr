#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <json-c/json.h>
#include <commands.h>
#include <curl/curl.h>
#include <unistd.h>

#define MAX_LINE_LENGTH 1024

const char *DATA_FILE_NAME = "./data/commands.json";
const char *HISTORY_FILE = "/.bash_history";

// Define a function to get input from the user for a string field
char *get_string_input(const char *prompt, const char *default_value, bool required)
{
    char *input = malloc(1024 * sizeof(char));
    if (!input)
    {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);
    }

    if (required)
    {
        printf("%s (required) : ", prompt);
    }
    else
    {
        printf("%s (default: \"%s\") : ", prompt, default_value);
    }
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
int get_integer_input(const char *prompt, int default_val)
{
    int input;
    char *endptr;

    while (1)
    {
        printf("%s (default: %d) : ", prompt, default_val);
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

        // If the input is empty, return default_val
        if (strlen(line) == 0)
        {
            free(line);
            return default_val;
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

// Function to add a command locally
void add_command_locally(json_object *command_input)
{
    // Create command object from user input
    json_object *command = command_input ? command_input : create_command_object("", "", NULL, 0, "", 0, "shell", NULL);

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
    fprintf(file, "%s\n", json_object_to_json_string(commands_array)); // for development purposes
    fclose(file);

    // Free the JSON objects
    json_object_put(commands_array);

    printf("\nCommand added successfully.\n");
}

// Define a function to create a JSON object with optional parameters
json_object *create_command_object(
    char label_input[],
    char description_input[],
    json_object *tags_input,
    int execution_count_input,
    char command_output_input[],
    int exit_status_input,
    char source_input[],
    json_object *aliases_input)
{
    json_object *command = json_object_new_object();
    if (!command)
    {
        fprintf(stderr, "Failed to create JSON object\n");
        exit(EXIT_FAILURE);
    }

    // If the label is provided, use it, otherwise ask for input
    if (label_input && strlen(label_input) > 0)
    {
        printf("Command : %s\n", label_input);
    }
    else
    {
        char *label = get_string_input("Command", label_input, true);
        json_object_object_add(command, "label", json_object_new_string(label));
        free(label);
    }

    // Same for description
    char *description = get_string_input("Description", description_input, false);
    json_object_object_add(command, "description", json_object_new_string(description));
    free(description);

    // For tags, use the provided tags_input or ask for input
    json_object *tags = tags_input ? tags_input : get_array_input("Tags (one per line, empty line to finish)");
    json_object_object_add(command, "tags", tags);

    // For execution count, use the provided value or get user input
    int execution_count = get_integer_input("Execution count", execution_count_input);
    json_object_object_add(command, "execution_count", json_object_new_int(execution_count == 0 ? 1 : execution_count));

    // For working directory, verify and either use the input or ask
    char cwd[1024];
    if (getcwd(cwd, sizeof(cwd)) == NULL)
    {
        fprintf(stderr, "Failed to get current working directory\n");
        exit(EXIT_FAILURE);
    }
    char *working_directory = verify_cwd(get_string_input("Working directory", cwd, false));
    json_object_object_add(command, "working_directory", json_object_new_string(working_directory));
    free(working_directory);

    // Same logic for command output
    char *command_output = get_string_input("Command output", command_output_input, false);
    json_object_object_add(command, "command_output", json_object_new_string(command_output));
    free(command_output);

    // For exit status
    int exit_status = get_integer_input("Exit status", exit_status_input);
    json_object_object_add(command, "exit_status", json_object_new_int(exit_status));

    // For source
    char *source = get_string_input("Source", source_input, false);
    json_object_object_add(command, "source", json_object_new_string(source));
    free(source);

    // For aliases
    json_object *aliases = aliases_input ? aliases_input : get_array_input("Aliases (one per line, empty line to finish)");
    json_object_object_add(command, "aliases", aliases);

    return command;
}

void add_commands_from_history(char *limit_string)
{
    // Verifying if limit is in correct format
    if (strlen(limit_string) == 0)
    {
        printf("Invalid command\n");
        exit(EXIT_FAILURE);
    }

    char *endptr;

    // Converting the input to an integer
    int limit_int = strtol(limit_string, &endptr, 10);

    // If the input is not a valid integer, print an error message and retry
    if (endptr == limit_string || *endptr != '\0')
    {
        printf("Invalid attribute \"%s\"\n", limit_string);
        exit(EXIT_FAILURE);
    }

    char **lines = get_lines_from_history_file(limit_int);

    // Process lines and create command objects
    for (int i = 0; i < limit_int; i++)
    {

        // Remove the newline character from the end of the line
        lines[i][strcspn(lines[i], "\n")] = 0;

        // Create command JSON object only with label (optional parameters are NULL)
        json_object *command = create_command_object(
            lines[i], // label from history
            "",       // description
            NULL,     // tags
            0,        // execution count
            "",       // command output
            0,        // exit status
            "shell",  // source
            NULL      // aliases
        );
        // Add the command to the JSON array

        add_command_locally(command);
        printf("\n");
    }

    // Free memory
    for (int i = 0; i < limit_int; i++)
    {
        free(lines[i]);
    }
    free(lines);

    printf("Everything done successfully.\n");
}

char **get_lines_from_history_file(int limit)
{
    // Open the history file
    char history_file_path[256];
    snprintf(history_file_path, sizeof(history_file_path), "%s/%s", getenv("HOME"), HISTORY_FILE);

    // opening history file
    FILE *file = fopen(history_file_path, "r");
    if (file == NULL)
    {
        printf("Could not open %s file \n", history_file_path);
        exit(EXIT_FAILURE);
    }

    // Initialize the head of the linked list
    Line *head = NULL;

    // Read the file line by line
    char buffer[MAX_LINE_LENGTH];
    while (fgets(buffer, MAX_LINE_LENGTH, file) != NULL)
    {
        // Create a new line
        Line *new_line = (Line *)malloc(sizeof(Line));
        new_line->data = (char *)malloc(strlen(buffer) + 1);
        strcpy(new_line->data, buffer);
        new_line->next = head;

        // Update the head
        head = new_line;
    }

    // Close the file
    fclose(file);

    // Print the last n lines
    int count = 0;
    Line *current = head;

    char **lines = malloc(limit * sizeof(char *));

    int i = 0;
    while (current != NULL && count < limit)
    {
        lines[i] = malloc(strlen(current->data) + 1);
        strcpy(lines[i], current->data);
        i++;
        current = current->next;
        count++;
    }

    // Free the memory
    current = head;
    while (current != NULL)
    {
        Line *next = current->next;
        free(current->data);
        free(current);
        current = next;
    }
    return lines;
}