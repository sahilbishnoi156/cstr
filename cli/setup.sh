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

# Set the path to the cstrtool folder in the user's home directory
CSTRTOOL_DIR="$HOME/cstrtool"

# Check if the folder ~/cstrtool exists
if [ ! -d "$CSTRTOOL_DIR" ]; then
    echo "$CSTRTOOL_DIR does not exist. Creating directory and cloning repository..."

    # Create the directory
    mkdir -p "$CSTRTOOL_DIR"

    # Clone only the 'cli' folder from the repository
    git clone --depth=1 --filter=blob:none --no-checkout https://github.com/sahilbishnoi156/cstr "$CSTRTOOL_DIR"
    cd "$CSTRTOOL_DIR" || exit
    git sparse-checkout init --cone
    git sparse-checkout set cli
    git checkout
else
    echo "$CSTRTOOL_DIR exists."

    # Check if ~/cstrtool/cli folder exists
    if [ ! -d "$CSTRTOOL_DIR/cli" ]; then
        echo "$CSTRTOOL_DIR/cli does not exist. Cloning 'cli' folder from repository..."

        # Clone only the 'cli' folder from the repository
        cd "$CSTRTOOL_DIR" || exit
        git sparse-checkout set cli
        git checkout
    else
        echo "$CSTRTOOL_DIR/cli already exists."
    fi
fi

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

# Navigate to ~/cstrtool/cli and compile the project
cd "$CSTRTOOL_DIR/cli" || exit
gcc -Iinclude -Wall -o bin/cstr src/main.c src/commands.c src/auth.c src/utils.c src/fetch_push.c src/get.c -lcurl -ljson-c -lncurses

# Create a symbolic link for the executable
sudo ln -sf "$CSTRTOOL_DIR/cli/bin/cstr" /usr/local/bin/cstr

echo "Setup complete. The 'cstr' executable is available globally."
