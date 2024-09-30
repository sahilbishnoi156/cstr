# Command Management Web Interface

## Overview

This web interface is part of the Command Management project, providing a user-friendly way to interact with the command storage and management system. It consists of three main pages: index.html, login.html, and signup.html, offering various features for command management and user account handling.

## Features

### Authentication

- User registration (signup.html)
- User login (login.html)
- JWT token-based authentication (stored in localStorage)

### Main Interface (index.html)

1. **Sidebar Navigation**

   - Allows switching between different components

2. **Home Component**

   - Project idea overview
   - CLI script download link

3. **Command Management**

   - View all commands
   - Search commands based on various options:
     - Source
     - Directory
     - Tags
     - Aliases
   - Upload new commands

4. **Documentation**

   - Comprehensive guide for using the CLI tool

5. **Settings**
   - Update profile username
   - Reset password

## Pages

### 1. index.html

The main page of the application, featuring:

- Sidebar for navigation between components
- Dynamic content area for displaying different components

### 2. login.html

User login page:

- Email and password input fields
- Login button
- Link to signup page for new users

### 3. signup.html

New user registration page:

- Fields for username, email, and password
- Sign up button
- Link to login page for existing users

## Technical Details

### Frontend Technologies

- HTML5
- Tailwind CSS for styling
- JavaScript for dynamic content and interactions

### Backend Integration

- Authentication is handled by the backend server
- JWT tokens are used for maintaining user sessions
- Tokens are stored in the browser's localStorage for persistent login

### API Interactions

- The frontend communicates with the backend API for all data operations
- AJAX calls are used for seamless user experience without page reloads

## Setup and Installation

1. Clone the repository:
   `git clone https://github.com/sahilbishnoi156/cstr/tree/main/client`

2. Navigate to the project directory:

3. Open `html/index.html` in a web browser to view the main interface.

4. Ensure the backend server is running and properly configured for API interactions.

## Usage

1. Start by signing up for a new account or logging in if you already have one.
2. Once logged in, you'll be redirected to the main interface (index.html).
3. Use the sidebar to navigate between different components:

- Home: View project overview and download CLI tool
- Commands: Manage and search your stored commands
- Documentation: Access CLI tool usage guide
- Settings: Update your profile or reset password

## Development

To modify or extend the web interface:

1. Edit the HTML files (`index.html`, `login.html`, `signup.html`) for structural changes.
2. Modify the CSS (Tailwind classes) for styling adjustments.
3. Update JavaScript files for changes in functionality or API interactions.

## Security Notes

- Ensure all API calls use HTTPS to protect data in transit.
- JWT tokens are stored in localStorage. While convenient, be aware of XSS vulnerabilities.
- Implement proper CORS policies on the backend to restrict unauthorized access.

## Contributing

Contributions to improve the web interface are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes and commit (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a new Pull Request

## License

[Specify your license here]

---

For more information or support, please contact [Your Contact Information].
