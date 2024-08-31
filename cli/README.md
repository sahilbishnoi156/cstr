# CSTR Command Tool

## Overview

A simple C program to manage and retrieve shell commands with additional features like adding descriptions and storing commands locally.

## Usage

- Add a command: `./bin/cstr add "ls -la"`
- Show a command: `./bin/cstr show "ls -la"`

## Structure

- `src/`: Source code files.
- `include/`: Header files.
- `data/`: JSON file for storing commands.

## Compilation

- Compile the project with: `gcc -Iinclude -Wall -o bin/cstr src/main.c src/commands.c src/utils.c -l curl`

## License

This project is licensed under the MIT License.
