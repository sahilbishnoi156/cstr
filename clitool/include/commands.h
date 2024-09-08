#ifndef COMMANDS_H
#define COMMANDS_H

#include <stdio.h>
#include <stdbool.h>
#include <json-c/json.h>

// using linklist to read the file because we don't know the number of lines in the file
// Structure to represent a line
typedef struct Line
{
    char *data;
    struct Line *next;
} Line;

// create json object of command and take input
json_object *create_command_object(
    char label_input[],
    char description_input[],
    json_object *tags_input,
    int execution_count_input,
    char command_output_input[],
    int exit_status_input,
    char source_input[],
    json_object *aliases_input);

// taking input from user
json_object *get_array_input(const char *prompt);
int get_integer_input(const char *prompt, int default_val);
char *get_string_input(const char *prompt, const char *default_value, bool required);

// verifying current directory
char *verify_cwd(char *working_directory);

// add command to commands.json file
void add_command_locally(json_object *command);

// add from history command functions
void add_commands_from_history(char *limit_string);
char **get_lines_from_history_file(int limit);

#endif // COMMANDS_H
