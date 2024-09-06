#ifndef GET_H
#define GET_H

// Functions
const char *select_option_to_get_command(const char *options[], int num_options, const char *prompt);

void curl_to_get_command(const char *url, const char *json_data, const char *creator_token);

size_t validate_response(char *ptr, size_t size, size_t nmemb, void *stream);
void get_commands();
#endif // GET_H
