#ifndef UTIL_H
#define UTIL_H

// Declare external constants
extern const char *BACKEND_URL;
extern const char *PARENT_DIRECTORY;
extern char ENV[1024];
extern char COMMANDS_DATA[256];
extern char BASH_HISTORY[256];
extern const int NUM_OPTIONS_FOR_SEARCH_ACTION;
extern const char *OPTIONS_FOR_SEARCH_ACTION[];
extern char GET_ALL_COMMANDS_LIMIT[256];
extern char GET_COMMANDS_BY_FIELD[256];
extern char GET_ALL_COMMANDS[256];
extern char CREATE_COMMAND_URL[256];
extern const char *AUTH_TOKEN;
extern char LOGIN_URL[256];
extern char VERIFY_TOKEN_URL[256];

// Function declarations
void initialize_environment();
void set_file_paths();
void show_manual();
void set_urls();
void init_auth_token();

#endif
