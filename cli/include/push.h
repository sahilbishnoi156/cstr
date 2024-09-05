#ifndef PUSH_H
#define PUSH_H

// Functions
void process_and_send_json(const char *json_data, const char *url);
void send_curl_post_request(const char *url, const char *json_data, const char *creator_token);
char *read_json_file();

#endif // PUSH_H
