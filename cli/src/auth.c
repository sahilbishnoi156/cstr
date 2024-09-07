#include "auth.h"
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>
#include <stdio.h>
#include <json-c/json.h>
#include "utils.h"

const char *TOKEN_NAME = "AUTH_TOKEN";

//! Get token from env file
char *get_token()
{
    FILE *envFile = fopen(ENV, "r");
    if (!envFile)
    {
        printf("FAILED TO OPEN ENV FILE\n");
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

//! Authenticate user from token
bool authenticate_user()
{
    if (!AUTH_TOKEN)
    {
        return false;
    }
    CURL *curl;
    CURLcode res;

    // Create a CURL handle
    curl = curl_easy_init();
    if (!curl)
    {
        return false;
    }

    // For printing response
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, verify_token);

    // Set the API endpoint URL
    curl_easy_setopt(curl, CURLOPT_URL, VERIFY_TOKEN_URL);

    // Make the POST API call
    res = curl_easy_perform(curl);
    if (res != CURLE_OK)
    {
        fprintf(stderr, "cURL error: %s\n", curl_easy_strerror(res));
        exit(1);
    }

    // Clean up
    curl_easy_cleanup(curl);
    return true;
}

//! Saving auth token locally
size_t verify_token(char *ptr, size_t size, size_t nmemb, void *stream)
{
    // Parse JSON response
    json_object *json = json_tokener_parse(ptr);
    if (json == NULL)
    {
        printf("Error parsing response JSON\n");
        json_object_put(json);
        exit(EXIT_FAILURE);
    }

    // Extract success field
    json_object *error = json_object_object_get(json, "error");
    if (error)
    {
        printf("%s\n", json_object_get_string(error));
        json_object_put(json);
        exit(EXIT_FAILURE);
    }

    json_object_put(json);

    // Return the total size of the data written
    return size * nmemb;
}

//! login input
User *login_input()
{
    User *user = malloc(sizeof(User));
    if (!user)
    {
        printf("Memory allocation failed. Exiting.\n");
        exit(1);
    }

    user->email = malloc(1024);
    user->password = malloc(1024);
    if (!user->email || !user->password)
    {
        printf("Memory allocation failed. Exiting.\n");
        free(user->email);
        free(user->password);
        free(user);
        exit(1);
    }

    printf("Email: ");
    fgets(user->email, 1024, stdin);
    user->email[strcspn(user->email, "\n")] = 0;

    printf("Password: ");
    fgets(user->password, 1024, stdin);
    user->password[strcspn(user->password, "\n")] = 0;

    if (strlen(user->email) == 0 || strlen(user->password) == 0)
    {
        printf("Email and password cannot be empty. Try again.\n");
        free(user->email);
        free(user->password);
        free(user);
        return login_input();
    }

    return user;
}

//! login
void login()
{
    // Verifying if already logged in
    bool isAuthenticated = authenticate_user();
    if (isAuthenticated)
    {
        printf("Already logged In\n");
        return;
    }

    User *user = login_input();

    // Making login api call
    CURL *curl;
    CURLcode res;

    // Create a CURL handle
    curl = curl_easy_init();

    if (!curl)
    {
        printf("Curl can not be initalized.\n");
        exit(1);
    }

    // Variables for api call
    char userData[1024];

    // Set the API endpoint URL
    curl_easy_setopt(curl, CURLOPT_URL, LOGIN_URL);

    // Set the request method to POST
    curl_easy_setopt(curl, CURLOPT_POST, 1L);

    // Set the request headers
    struct curl_slist *headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    if (!headers)
    {
        printf("Error: curl appending headers failed\n");
        curl_easy_cleanup(curl);
        exit(EXIT_FAILURE);
    }
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

    // Set the request body
    sprintf(userData, "{\"email\":\"%s\",\"password\":\"%s\"}", user->email, user->password);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, userData);

    // For printing response
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, validate_login_response);

    // Make the POST API call
    res = curl_easy_perform(curl);
    if (res != CURLE_OK)
    {
        fprintf(stderr, "cURL error: %s\n", curl_easy_strerror(res));
        exit(EXIT_FAILURE);
    }
    // Clean up
    curl_easy_cleanup(curl);
    curl_slist_free_all(headers);
}

//! Save token in env file
void save_token_to_env(const char *token)
{
    FILE *envFile = fopen(ENV, "a");
    if (!envFile)
    {
        printf("Error opening file for writing\n");
        return;
    }

    fprintf(envFile, "\n%s=\"%s\"\n", TOKEN_NAME, token);

    fclose(envFile);
}

//! Saving auth token locally
size_t validate_login_response(char *ptr, size_t size, size_t nmemb, void *stream)
{
    // Parse JSON response
    json_object *json = json_tokener_parse(ptr);
    if (json == NULL)
    {
        printf("Error parsing JSON\n");
        json_object_put(json);
        return size * nmemb;
    }

    // Extract success field
    json_object *success = json_object_object_get(json, "success");
    if (success != NULL)
    {
        int success_value = json_object_get_boolean(success);
        if (!success_value)
        {
            json_object *error = json_object_object_get(json, "error");
            const char *error_message = json_object_get_string(error);
            printf("Error: %s\n", error_message);
        }
        else
        {
            // Extract authtoken field
            json_object *authtoken = json_object_object_get(json, "authtoken");
            if (authtoken != NULL)
            {
                const char *authtoken_value = json_object_get_string(authtoken);
                save_token_to_env(authtoken_value);
                printf("Logged in successfully.\n");
            }
        }
    }

    json_object_put(json);
    return size * nmemb;
}