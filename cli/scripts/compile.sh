#!/bin/bash

# Check if the script is being run from the parent directory 'cli/'
if [ ! -d "./src" ] || [ ! -d "./include" ]; then
    echo "Error: Please run this script from the parent directory 'cli/'."
    exit 1
fi

SRC_DIR="./src"
BIN_DIR="./bin"
INCLUDE_DIR="./include"

# Compile all c files main.c 
echo "Building the executable..."
gcc -I $INCLUDE_DIR -Wall $SRC_DIR/main.c $SRC_DIR/commands.c $SRC_DIR/auth.c $SRC_DIR/utils.c $SRC_DIR/fetch_push.c $SRC_DIR/get.c -o $BIN_DIR/cstr -lncurses -lcurl -ljson-c


echo "Compilation complete"
