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

# Set the path to the cstr folder in the user's home directory
CSTR_DIR="$HOME/cstr"

# Check if the folder ~/cstr exists
if [ ! -d "$CSTR_DIR" ]; then
    echo "$CSTR_DIR does not exist. Creating directory and cloning repository..."

    # Create the directory
    mkdir -p "$CSTR_DIR"

    # Clone only the 'cli' folder from the repository
    git clone --depth=1 --filter=blob:none --no-checkout https://github.com/sahilbishnoi156/cstr "$CSTR_DIR"
    cd "$CSTR_DIR" || exit
    git sparse-checkout init --cone
    git sparse-checkout set clitool
    git checkout
else
    echo "$CSTR_DIR exists."

    # Check if ~/cstr/clitool folder exists
    if [ ! -d "$CSTR_DIR/clitool" ]; then
        echo "$CSTR_DIR/clitool does not exist. Cloning 'clitool' folder from repository..."

        # Clone only the 'clitool' folder from the repository
        cd "$CSTR_DIR" || exit
        git sparse-checkout set clitool
        git checkout
    else
        echo "$CSTR_DIR/clitool already exists."
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
cd "$CSTR_DIR/clitool" || exit
gcc -Iinclude -o bin/cstr src/main.c -L. lib/cstrlibrary.a -lncurses -ljson-c -lcurl

# Create a symbolic link for the executable
sudo ln -sf "$CSTR_DIR/clitool/bin/cstr" /usr/local/bin/cstr

# creating manual for command
echo "Installing manual page"
sudo cp "$CSTR_DIR/clitool/man/cstr.1" /usr/share/man/man1/

# updating manul page
echo "Updating the Manual Page Database"
sudo mandb

echo "Setup complete. The 'cstr' executable is available globally."
