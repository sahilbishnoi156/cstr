#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>
#include <json-c/json.h>
#include "auth.h"
#include "get_send_data.h"

#define MAX_CHUNK_SIZE 10

// Function to read the commands.json file
void update_json_data()
{
    FILE *file = fopen("./data/commands.json", "r+"); // Open in read/write mode
    if (!file)
    {
        perror("Error opening file\n");
        exit(EXIT_FAILURE);
    }

    // Seek to the end of the file to get its length
    fseek(file, 0, SEEK_END);
    long length = ftell(file);
    fseek(file, 0, SEEK_SET);

    // Allocate memory for the file content
    char *data = (char *)malloc(length + 1);
    if (!data)
    {
        perror("Memory allocation error\n");
        fclose(file);
        exit(EXIT_FAILURE);
    }

    // Read the file content into the buffer
    fread(data, 1, length, file);
    data[length] = '\0';

    // changing all occurrences of "false" to "true"
    char *ptr = data;
    while ((ptr = strstr(ptr, "false")) != NULL)
    {
        strncpy(ptr, "true ", 5);
        ptr += 5;
    }

    // Move the file pointer to the beginning and write the modified data back to the file
    fseek(file, 0, SEEK_SET);
    fwrite(data, 1, length, file);

    fclose(file);
}
// Function to read the commands.json file
char *read_json_file()
{
    FILE *file = fopen("./data/commands.json", "r");
    if (!file)
    {
        perror("Error opening file\n");
        exit(EXIT_FAILURE);
    }

    // Seek to the end of the file to get its length
    fseek(file, 0, SEEK_END);
    long length = ftell(file);
    fseek(file, 0, SEEK_SET);

    // Allocate memory for the file content
    char *data = (char *)malloc(length + 1);
    if (!data)
    {
        perror("Memory allocation error\n");
        fclose(file);
        exit(EXIT_FAILURE);
    }

    // Read the file content into the buffer
    fread(data, 1, length, file);
    data[length] = '\0';
    fclose(file);

    return data;
}

// Function to make a CURL POST request
void send_curl_post_request(const char *url, const char *json_array, const char *creator_token)
{
    CURL *curl;
    CURLcode res;

    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();
    if (curl)
    {
        struct curl_slist *headers = NULL;

        // Set Content-Type header
        headers = curl_slist_append(headers, "Content-Type: application/json");

        // Set Authorization header with creator token
        char auth_header[256];
        snprintf(auth_header, sizeof(auth_header), "authToken:%s", creator_token);
        headers = curl_slist_append(headers, auth_header);
        if (!headers)
        {
            printf("Error: curl appending headers failed\n");
            curl_easy_cleanup(curl);
            exit(EXIT_FAILURE);
        }

        curl_easy_setopt(curl, CURLOPT_URL, url);

        // Construct the JSON data with curly braces
        size_t json_data_len = strlen(json_array) + 20;
        char *json_data = (char *)malloc(json_data_len);

        if (json_data == NULL)
        {
            fprintf(stderr, "Memory allocation failed\n");
            exit(EXIT_FAILURE);
        }

        snprintf(json_data, json_data_len, "{\"commands\": %s}", json_array);

        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        res = curl_easy_perform(curl);
        if (res != CURLE_OK)
        {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
            curl_easy_cleanup(curl);
            exit(EXIT_FAILURE);
        }
        else
        {
            update_json_data();
        }

        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
}

// Function to filter objects based on "is_globally_avail" and send in chunks
void process_and_send_json(const char *json_data, const char *url)
{
    struct json_object *parsed_json = json_tokener_parse(json_data);
    if (!parsed_json)
    {
        fprintf(stderr, "Error parsing JSON\n");
        exit(EXIT_FAILURE);
    }

    if (!json_object_is_type(parsed_json, json_type_array))
    {
        fprintf(stderr, "Expected an array of objects\n");
        json_object_put(parsed_json); // Free memory
        exit(EXIT_FAILURE);
    }

    int total_objects = json_object_array_length(parsed_json);
    struct json_object *filtered_array = json_object_new_array();

    // Filter objects where "is_globally_avail" is false
    for (int i = 0; i < total_objects; i++)
    {
        struct json_object *obj = json_object_array_get_idx(parsed_json, i);
        struct json_object *is_globally_avail;

        if (json_object_object_get_ex(obj, "is_globally_avail", &is_globally_avail))
        {
            if (!json_object_get_boolean(is_globally_avail))
            {
                json_object_array_add(filtered_array, json_object_get(obj));
            }
        }
    }

    int filtered_objects = json_object_array_length(filtered_array);
    // Check if the filtered array is empty
    if (filtered_objects == 0)
    {
        printf("Everything up to date\n");
        json_object_put(filtered_array); // Free memory
        json_object_put(parsed_json);    // Free memory
        exit(EXIT_SUCCESS);
    }
    int sent_objects = 0;

    while (sent_objects < filtered_objects)
    {
        int remaining = filtered_objects - sent_objects;
        int chunk_size = remaining > MAX_CHUNK_SIZE ? MAX_CHUNK_SIZE : remaining;

        // Create a new JSON array for the chunk
        struct json_object *chunk = json_object_new_array();
        for (int i = 0; i < chunk_size; i++)
        {
            struct json_object *item = json_object_array_get_idx(filtered_array, sent_objects + i);
            json_object_array_add(chunk, json_object_get(item));
        }

        // Convert chunk to string and send it
        const char *chunk_data = json_object_to_json_string(chunk);
        char *token = get_token();
        if (!token)
        {
            free(token);
            printf("Error: Token not found\n");
            exit(EXIT_FAILURE);
        }
        send_curl_post_request(url, chunk_data, token);

        // Clean up
        json_object_put(chunk); // Free memory for the chunk

        sent_objects += chunk_size;
    }

    json_object_put(filtered_array); // Free memory for the filtered array
    json_object_put(parsed_json);    // Free memory for the original JSON array
}

void get_all_commands()
{
    bool is_authenticated = authenticate_user();
    if (!is_authenticated)
    {
        printf("Please login before using this service\n");
        exit(EXIT_SUCCESS);
    }

    CURL *curl;
    CURLcode res;

    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();

    if (curl)
    {
        struct curl_slist *headers = NULL;

        // Set Authorization header with creator token
        char *token = get_token();
        char auth_header[256];
        snprintf(auth_header, sizeof(auth_header), "authToken:%s", token);

        // appending headers to headers
        headers = curl_slist_append(headers, "Content-Type: application/json");

        headers = curl_slist_append(headers, auth_header);

        if (!headers)
        {
            perror("Error: curl appending headers failed\n");
            exit(EXIT_SUCCESS);
        }

        curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3000/api/command/getcommands");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, save_to_file);

        res = curl_easy_perform(curl);

        if (res != CURLE_OK)
        {
            fprintf(stderr, "Server error : %s\n", curl_easy_strerror(res));
            curl_easy_cleanup(curl);
            exit(EXIT_FAILURE);
        }
        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
}

//! saving global commands to local
size_t save_to_file(char *ptr, size_t size, size_t nmemb, void *stream)
{
    // Parse JSON response
    json_object *json = json_tokener_parse(ptr);
    if (json == NULL)
    {
        printf("Error parsing response JSON\n");
        json_object_put(json);
        return size * nmemb;
    }

    // Extract success field
    json_object *error = json_object_object_get(json, "error");
    if (!error)
    {
        // Extract data field
        json_object *data_obj = json_object_object_get(json, "data");
        if (data_obj != NULL)
        {
            // Open the file for writing
            FILE *fp = fopen("./data/commands.json", "w");
            if (!fp)
            {
                perror("Error: Failed to open commands file locally\n");
                json_object_put(json);
                exit(EXIT_FAILURE);
            }

            // Write data to the file
            const char *data = json_object_get_string(data_obj);
            size_t data_len = strlen(data);
            size_t written = fwrite(data, 1, data_len, fp);
            if (written != data_len)
            {
                perror("Error: Failed to write complete data to file\n");
                json_object_put(json);
                fclose(fp);
                exit(EXIT_FAILURE);
            }

            // Close the file
            fclose(fp);
            // Print success message
            printf("Database synced successfully\n");
        }
    }
    else
    {
        printf("Error: %s", json_object_get_string(error));
        exit(EXIT_FAILURE);
    }

    json_object_put(json);

    // Return the total size of the data written
    return size * nmemb;
}