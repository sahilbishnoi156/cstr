#ifndef UTILS_H
#define UTILS_H

#include <stdio.h>
#include <stdbool.h>

// Constants
extern const char *FILE_NAME;
extern const char *TOKEN_NAME;
extern const char *AUTHENTICATE_API;

bool authenticate_user();
size_t write_data(char *ptr, size_t size, size_t nmemb, void *stream);

#endif // UTILS_H
