#!/bin/bash


# Function to install libraries for Ubuntu/Debian-based distributions
install_ubuntu_debian() {
    sudo apt update
    sudo apt install -y libcurl4-openssl-dev libjson-c-dev libncurses5-dev libncursesw5-dev
}

# Function to install libraries for Fedora-based distributions
install_fedora() {
    sudo dnf install -y libcurl-devel json-c-devel ncurses-devel
}

# Function to install libraries for Arch-based distributions
install_arch() {
    sudo pacman -S --noconfirm curl json-c ncurses
}

# Check if the platform is Linux
if [ "$(uname)" != "Linux" ]; then
    echo "This script is only for Linux platforms."
    exit 1
fi

# Check if the script is being run from the parent directory 'cli/'
if [ ! -d "./src" ] || [ ! -d "./include" ]; then
    echo "Error: Please run this script from the parent directory 'cli/'."
    exit 1
fi

# Set up directories (relative to the script location)
SRC_DIR="./src"
INCLUDE_DIR="./include"
LIB_DIR="./build/lib"
TOOL_LIB_DIR="../clitool/lib"  # Adjust this path as necessary
OBJ_DIR="./build/obj"
BIN_DIR="./bin"

# Create necessary directories if they don't exist
mkdir -p $LIB_DIR
mkdir -p $OBJ_DIR
mkdir -p $TOOL_LIB_DIR


# Detect the Linux distribution
if [ -f /etc/debian_version ]; then
    install_ubuntu_debian
elif [ -f /etc/fedora-release ]; then
    install_fedora
elif [ -f /etc/arch-release ]; then
    install_arch
else
    echo "Unsupported Linux distribution."
    exit 1
fi

# Compile each C file into an object file
echo "Compiling source files..."
gcc -c $SRC_DIR/auth.c -o $OBJ_DIR/auth.o -I $INCLUDE_DIR
gcc -c $SRC_DIR/commands.c -o $OBJ_DIR/commands.o -I $INCLUDE_DIR
gcc -c $SRC_DIR/fetch_push.c -o $OBJ_DIR/fetch_push.o -I $INCLUDE_DIR
gcc -c $SRC_DIR/get.c -o $OBJ_DIR/get.o -I $INCLUDE_DIR
gcc -c $SRC_DIR/utils.c -o $OBJ_DIR/utils.o -I $INCLUDE_DIR

# Create a static library from the object files
echo "Creating static libraries..."
ar rcs $LIB_DIR/cstrlibrary.a $OBJ_DIR/auth.o $OBJ_DIR/commands.o $OBJ_DIR/fetch_push.o $OBJ_DIR/get.o $OBJ_DIR/utils.o
ar rcs $TOOL_LIB_DIR/cstrlibrary.a $OBJ_DIR/auth.o $OBJ_DIR/commands.o $OBJ_DIR/fetch_push.o $OBJ_DIR/get.o $OBJ_DIR/utils.o

# Compile main.c and link with the static library to create the final executable
echo "Building the executable..."
gcc $SRC_DIR/main.c -o $BIN_DIR/cstr -I $INCLUDE_DIR -L. $LIB_DIR/cstrlibrary.a -lncurses -lcurl -ljson-c

echo "Build complete!"
