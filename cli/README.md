# CSTR Command Tool

## Overview

A simple C program to manage and retrieve shell commands with additional features like adding descriptions and storing commands locally.

## Usage

- Add a command: `./bin/cstr add "ls -la"`
- Add all history commands: `./bin/cstr add all`
- Show the manual: `./bin/cstr man`
- Log in to the service: `./bin/cstr login`
- Find a specific command:
  - By command name: `./bin/cstr find one "ls -la"`
  - By directory: `./bin/cstr find dir "/path/to/directory"` (optional: current directory if not specified)
  - By source: `./bin/cstr find source "shell"`
  - By tag: `./bin/cstr find tag "utility"`
  - Retrieve all commands: `./bin/cstr find all`
  - By alias: `./bin/cstr find alias "list"`
  - By date: `./bin/cstr find date "10 days"`, `./bin/cstr find date "1 month"`, `./bin/cstr find date "today"`
- Fetch the latest data from the service: `./bin/cstr fetch`
- Push local changes to the service: `./bin/cstr push`

## Structure

- `src/`: Source code files.
- `include/`: Header files.
- `data/`: JSON file for storing commands.

## Compilation

- Compile the project with: `gcc -Iinclude -Wall -o bin/cstr src/main.c src/commands.c src/auth.c src/utils.c src/get_send_data.c -lcurl -ljson-c`

## License

This project is licensed under the MIT License.
