#include "utils.h"
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>

const char *FILE_NAME = ".env";
const char *TOKEN_NAME = "AUTH_TOKEN";
const char *AUTHENTICATE_API = "https://localhost:3000/api/auth/authenticate";

char *getToken()
{
    FILE *envFile = fopen(FILE_NAME, "r");
    if (!envFile)
    {
        return NULL;
    }

    char env_line[1024];
    while (fgets(env_line, sizeof(env_line), envFile))
    {
        char *token = strtok(env_line, "=");
        if (token && strcmp(token, TOKEN_NAME) == 0)
        {
            token = strtok(NULL, "\n");
            if (token == NULL)
            {
                break;
            }
            fclose(envFile);
            char *token_str = strtok(token, "\"");
            if (!token_str)
            {
                return NULL;
            }
            return strdup(token_str);
        }
    }

    fclose(envFile);
    return NULL;
}

bool authenticate_user()
{
    char *token = getToken();
    if (!token)
    {
        free(token);
        printf("Authentication token not found\n");
        return false;
    }

    CURL *curl;
    CURLcode res;

    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();
    if (!curl)
    {
        free(token);
        return false;
    }

    char url[1024];
    snprintf(url, sizeof(url), "%s?token=%s", AUTHENTICATE_API, token);

    curl_easy_setopt(curl, CURLOPT_URL, url);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_data);
    res = curl_easy_perform(curl);
    if (res != CURLE_OK)
    {
        fprintf(stderr, "cURL error: %s\n", curl_easy_strerror(res));
        free(token);
        return false;
    }
    curl_easy_cleanup(curl);
    curl_global_cleanup();
    free(token);
    return true;
}

size_t write_data(char *ptr, size_t size, size_t nmemb, void *stream)
{
    return size * nmemb;
}