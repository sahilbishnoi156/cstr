<img src="https://readme.so/readme.svg" alt="Command Management" width="40" style="position:relative; top:10px;"/> <span style="font-size:30px"> Cstr - command store</span>

## About

`cstr` is a command-line tool built in C that helps users manage shell command history. It allows you to add, search, and synchronize commands with a remote service. Commands can be stored locally or fetched from a cloud-based database.

# \*\*\*Important\*\*\*

**This tool is only built for linux environment at least for now. So it is strongly recommended do not use this in windows or mac or you might loose you system files.**

## 📒 Index

- [Usage](#zap-usage)
  - [Overview](#beginner-overview)
  - [Installation](#electric_plug-installationbuildsetup)
  - [Commands](#package-commands)
- [Development](#wrench-development)
  - [Pre-Requisites](#notebook-pre-requisites)
  - [Installation of libraries](#package-Installation-of-Required-Libraries)
  - [Development Environment](#nut_and_bolt-development-environment)
  - [File Structure](#file_folder-file-structure)
  - [Deployment](#rocket-deployment)
- [Community](#cherry_blossom-community)
  - [Contribution](#fire-contribution)
  - [Branches](#cactus-branches)
  - [Guideline](#exclamation-guideline)
- [FAQ](#question-faq)
- [Resources](#page_facing_up-resources)
- [Credit/Acknowledgment](#star2-creditacknowledgment)

## :zap: Usage

### :beginner: overview

This project provides an executable binary that can perform various tasks related to command management. Below are some common use cases:

- Add a command: `./bin/cstr add`
- Add history commands (with a limit of 10): `./bin/cstr add <limit>`
- View manual: `./bin/cstr man`
- Log in to the service to access global files: `./bin/cstr login`
- Search commands using specific attributes: `./bin/cstr get`
  - Available options:
    - `all`: Retrieve all commands (default limit is 10)
    - `source`: Search by command source
    - `directory`: Search by working directory
    - `tags`: Search by tags
    - `aliases`: Search by command aliases
- Fetch data from the cloud service: `./bin/cstr fetch`
- Push local changes to the cloud: `./bin/cstr push`

### :electric_plug: Installation/Build/Setup

- ### Run locally

  - Clone the repository:

    `$ git clone "https://github.com/sahilbishnoi156/cstr"`

  - Start backend server

    - Navigate to server directory

      `$ cd cstr/server`

    - Install dependencies

      `$ npm i`

    - Setup environment variables

      `$ vim cstr/server/.env`

    - Start the server

      `$ npm run start`

  - Navigate to c project directory

    `$ cd cstr/cli`

  - ### Build using script

    - Run build script (it will install the required libraries, build the library, generate the executable file)

      `$ ./scripts/build-library.sh`

    - Run the executable file

      `$ ./bin/cstr <action>`

  - ### Compile using script

    - [Install required libraries](#package-Installation-of-Required-Libraries)

    - Run compile script

      `$ ./scripts/compile.sh`

    - Run the executable file

      `$ ./bin/cstr <action>`

  - ### Compile manually

    - Compile all .c files

      `$ gcc -Iinclude -Wall -o bin/cstr src/main.c src/commands.c src/auth.c src/utils.c src/fetch_push.c src/get.c -lcurl -ljson-c -lncurses`

    - Compile with library (you must run `build-library.sh` script before)

      `$ gcc -Iinclude -o bin/cstr src/main.c -L. lib/cstrlibrary.a -lncurses -ljson-c -lcurl`

- Create symbolic link for your executable file

  `$ ln -sf "$HOME/cstr/clitool/bin/cstr" /usr/local/bin/cstr`

- ## Getting errors ?

  - `json-c/json.h` / `curl/curl.h` / `ncurses.h` : No such file or directory

    - Sol- Ensure that all the needed libraries are installed.

  - Curl error : can not connect to server

    - Sol- Start the backend server

  - Failed to parse JSON content

    - Sol - Ensure your `data/commands.json` file is not empty and contain formatted data or `[]`.

- ### Using cstr clitool

  - [Download script file](https://firebasestorage.googleapis.com/v0/b/dropbox-clone-2de2b.appspot.com/o/users%2Fuser_2ciZaSDYBHaCi49X89L0Gr2MX1i%2Ffiles%2F5LZ5FcD4HuUSYu1TMdho?alt=media&token=a991d80a-173e-426c-bd06-3b71e7eb3af3)
  - Give file permission to execute

    `$ chmod +x script.sh`

  - Run the file : this will install the tool on your system

    `$ ./script.sh`

  - use the tool

    `$ cstr <action>`

### :package: Commands

To execute the program, use the following commands:

#### use `cstr` if using clitool or `./bin/cstr` if running locally

- `cstr add`: Adds a new command locally.
- `cstr add <limit>`: Adds commands from the history with a specified limit.
- `cstr man`: Shows the manual for the tool.
- `cstr login`: Logs in to the cloud service.
- `cstr get`: Fetches commands based on criteria (source, directory, tags, alias).
- `cstr fetch`: Fetches the latest command data from the cloud.
- `cstr push`: Pushes local command data to the cloud.

## :wrench: Development

### :notebook: Pre-Requisites

To develop and contribute to this project, make sure you have the following tools installed:

- Linux
- GCC compiler
- `json-c` library for JSON parsing
- `libcurl` library for make http request
- `ncurses` library to move the cursor, create windows, produce colors, play with mouse etc
- `nodejs` only if you are running it locally

### :package: Installation of Required Libraries

To run this project, you'll need to install the following libraries: `libcurl`, `json-c`, and `ncurses`. Use the appropriate commands based on your Linux distribution:

#### For Ubuntu/Debian-based distributions:

```bash
sudo apt update
sudo apt install libcurl4-openssl-dev libjson-c-dev libncurses5-dev libncursesw5-dev
```

#### For Fedora-based distributions:

```bash
sudo dnf install libcurl-devel json-c-devel ncurses-devel
```

#### For Arch-based distributions:

```bash
sudo pacman -S curl json-c ncurses
```

### :nut_and_bolt: Development Environment

To set up the development environment:

1. Clone the project repository.
2. Ensure all dependencies (`json-c` , `libcurl`, `ncurses`) are installed.
3. Ensure all environment variable for server is set.
4. Compile the project using the `make` command.

### :file_folder: File Structure

```

| No  | File Name            | Details                              |
| --- | -------------------- | ------------------------------------ |
| 1   | `bin/cstr`           | Compiled executable binary           |
| 2   | `data/commands.json` | Local JSON file for storing commands |
| 3   | `include/`           | Header files for different modules   |
| 4   | `src/`               | Source code implementation           |
.
├── bin
│   └── cstr
├── data
│   └── commands.json
├── include
│   ├── auth.h
│   ├── commands.h
│   ├── fetch_push.h
│   ├── get.h
│   └── utils.h
├── src
|   ├── auth.c
|   ├── commands.c
|   ├── fetch_push.c
|   ├── get.c
|   ├── main.c
|    └── utils.c
├── README.md
├── .env
```

### :rocket: Deployment

For deployment, simply copy the compiled binary (`bin/cstr`) to the desired system, ensuring all required libraries (`json-c`, `curl`, `ncurses`) are available.

## :cherry_blossom: Community

### :fire: Contribution

Your contributions are always welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch (e.g., `feat-new-feature`).
3. Submit a pull request.

### :cactus: Branches

- `master`: Production-ready code.
- `stage`: Development and testing branch.

### :exclamation: Guideline

Follow the C coding guidelines and ensure your code passes any existing tests.

## :question: FAQ

- **How do I reset the command history?**  
  Delete the `data/commands.json` file.

- **What if the commands do not sync?**  
  Ensure you are logged in by using the `./bin/cstr login` command.

## :page_facing_up: Resources

- [JSON-C Documentation](https://github.com/json-c/json-c/wiki)
- [LIBCURL Documentation](https://curl.se/libcurl/c/)
- [NCURSES Documentation](https://tldp.org/HOWTO/NCURSES-Programming-HOWTO/)
- [GCC Compiler Documentation](https://gcc.gnu.org/)

## :star2: Credit/Acknowledgment

Developed by [@sahilbishnoi](https://github.com/sahilbishnoi156)
