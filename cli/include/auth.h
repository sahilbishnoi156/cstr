#ifndef UTILS_H
#define UTILS_H

#include <stdio.h>
#include <stdbool.h>

// Constants
extern const char *FILE_NAME;
extern const char *TOKEN_NAME;
extern const char *AUTHENTICATE_API;

// Define the user structure
typedef struct
{
    char *email;
    char *password;
} User;

// Functions
char *get_token();
bool authenticate_user();
void save_token_to_env(const char *token);
size_t validate_login_response(char *ptr, size_t size, size_t nmemb, void *stream);
size_t print_decoded_token(char *ptr, size_t size, size_t nmemb, void *stream);
int login();
User *login_input();
#endif // UTILS_H
