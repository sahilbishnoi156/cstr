# CSTR Command Tool

## Overview

A simple C program to manage and retrieve shell commands with additional features like adding descriptions and storing commands locally.

## Usage

- Add a command: `./bin/cstr add`
- Add all history commands: `./bin/cstr add <limit>` (limit is the number of commands you want to add)
- Show the manual: `./bin/cstr man`
- Log in to the service: `./bin/cstr login`
- Find a specific command: `./bin/cstr get`
  - Available options:-
  - All: `To get all commands` (limit is 10. use website to see all commands)
  - Source: `To search commands by source"`
  - Directory: `To search commands by working_directory"`
  - Tags: `To search commands by tags`
  - Alias: `To search commands by aliases`
- Fetch the latest data from the service: `./bin/cstr fetch`
- Push local changes to the service: `./bin/cstr push`

## Structure

- `src/`: Source code files.
- `include/`: Header files.
- `data/`: JSON file for storing commands.
- `bin/` : Executable file

## Compilation

- Compile the project with: `gcc -Iinclude -Wall -o bin/cstr src/main.c src/commands.c src/auth.c src/utils.c src/fetch_push.c src/get.c -lcurl -ljson-c -lncurses`

## License

This project is licensed under the MIT License.
