#ifndef COMMANDS_H
#define COMMANDS_H

#include <stdio.h>
#include <stdbool.h>
#include <json-c/json.h>

// Constants
extern const char *DATA_FILE_NAME;

// Functions
json_object *create_command_object();
void add_command_locally();
json_object *get_array_input(const char *prompt);
char *verify_cwd(char *working_directory);
int get_integer_input(const char *prompt);
char *get_string_input(const char *prompt, const char *default_value, bool required);
#endif // COMMANDS_H
