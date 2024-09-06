#include <ncurses.h>
#include <stdio.h>
#include <stdlib.h>
#include <curl/curl.h>
#include "auth.h"
#include "get.h"
#include "commands.h"
#include <json-c/json.h>
#include <string.h>

const int NUM_OPTIONS = 6;
const char *options[] = {"All", "label", "source", "tags", "aliases", "working_directory"};

// Function to display the menu and handle user input
const char *select_option_to_get_command(const char *options[], const int num_options, const char *prompt)
{
    // Initialise ncurses
    initscr();
    noecho();
    curs_set(0);
    keypad(stdscr, TRUE);

    int cursor_pos = 0;
    int selected = -1;
    int start_y, start_x;

    // Get the current cursor position
    getyx(stdscr, start_y, start_x);

    while (1)
    {
        // clear screen
        clear();

        // Move to the starting position
        move(start_y, start_x);

        // Display instructions
        mvprintw(start_y, start_x, "INSTRUCTIONS:-\nPress \"up\" or \"down\" arrow keys to choose between options.\nPress Enter to select the option.\nPress 'q' to exit.\n\n%s", prompt);

        // Display the options
        for (int i = 0; i < num_options; i++)
        {
            if (i == cursor_pos)
            {
                // Highlight the selected option
                attron(A_REVERSE);
                mvprintw(start_y + 6 + i, start_x, options[i]);
                attroff(A_REVERSE);
            }
            else
            {
                mvprintw(start_y + 6 + i, start_x, options[i]);
            }
        }

        // Refresh the screen to show changes
        refresh();

        // Get user input
        int c = getch();

        // Handle arrow keys and 'q' key
        if (c == KEY_UP)
        {
            cursor_pos = (cursor_pos - 1 + num_options) % num_options;
        }
        else if (c == KEY_DOWN)
        {
            cursor_pos = (cursor_pos + 1) % num_options;
        }
        else if (c == 'q' || c == 'Q')
        {
            // Exit the program
            endwin();
            printf("Action cancelled.\n");
            exit(0);
        }
        else if (c == '\n')
        {
            // Enter key
            selected = cursor_pos;
            break;
        }
    }

    // Clear the screen and display the selected option
    clear();
    refresh();
    // End ncurses mode
    endwin();

    return options[selected];
}

// make a post api request with
// Function to make a CURL POST request
void curl_to_get_command(const char *url, const char *json_data, const char *creator_token)
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
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_data);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, validate_response);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        res = curl_easy_perform(curl);
        if (res != CURLE_OK)
        {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
            curl_easy_cleanup(curl);
            exit(EXIT_FAILURE);
        }

        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
}

//! validating comming response
size_t validate_response(char *ptr, size_t size, size_t nmemb, void *stream)
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
            // Write data to terminal in formatted version
            const char *formatted_json = json_object_to_json_string_ext(data_obj, JSON_C_TO_STRING_PRETTY);
            printf("%s\n", formatted_json);
        }
    }
    else
    {
        printf("Error: %s\n", json_object_get_string(error));
        exit(EXIT_FAILURE);
    }

    json_object_put(json);

    // Return the total size of the data written
    return size * nmemb;
}

// get all user commands
void get_all_user_commands(const char *url)
{
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

        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, validate_response);

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

// main function to get commands
void get_commands()
{

    const char *selected_option = select_option_to_get_command(options, NUM_OPTIONS, "Get command by:-");

    if (strcmp(selected_option, "All") == 0)
    {
        char *verification = get_string_input("You can only get 10 commands in terminal. To get all use \"fetch\" action and check commands.json file. Or visit our website.\nDo you want to continue? (y/n)", "n", false);
        if (strcmp(verification, "y") == 0 || strcmp(verification, "Y") == 0)
        {
            get_all_user_commands("http://localhost:3000/api/command/getcommands?limit=10");
            exit(EXIT_SUCCESS);
        }
        else
        {
            printf("Action cancelled\n");
            exit(EXIT_SUCCESS);
        }
    }

    // Take input
    printf("Enter %s : ", selected_option);
    char *input = malloc(1024 * sizeof(char));
    if (!input)
    {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);
    }
    if (fgets(input, 1024, stdin) != NULL)
    {
        // Remove the newline character from the end of the input
        input[strcspn(input, "\n")] = 0;
    }

    // create data to make api call
    const char *url = "http://localhost:3000/api/command/getbyfield";
    char *token = get_token();
    if (!token)
    {
        printf("Token not found\n");
        exit(EXIT_FAILURE);
    }

    char data[256];
    snprintf(data, sizeof(data), "{\"key\" : \"%s\", \"value\" : \"%s\"}", selected_option, input);

    // make a post api call
    curl_to_get_command(url, data, token);
}
