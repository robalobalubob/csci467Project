This is the repository for Group 6B's project in CSCI 467.

# Table of Contents
1. [Project Statement](csci467ProjectStatement.md)
2. [Project Notes](csci467ProjectNotes.md)
# Quick Start Guide

Follow these steps to set up and run the **Quote System Backend** on your local machine.

## Prerequisites

Ensure you have the following installed:

- **Node.js** 
- **npm** 
- **MySQL** 
- **Git**

## Installation Steps

1. **Clone the Repository**

   Open your terminal and run:

   ```bash
   git clone https://github.com/yourusername/quote-system-backend.git
   cd quote-system-backend
   ```

2. **Install Dependencies**

   Install the necessary npm packages:

   ```bash
   npm install
   ```
   Note: Only run when in the quote-system-backend directory.
3. **Configure Environment Variables**

   - **Create a `.env` File**

     In the root directory of the project, create a file named `.env`:

     ```bash
     touch .env
     ```

   - **Add the Following Variables to `.env`**

     Open the `.env` file in your preferred text editor and add:

     ```env
     # Database Configuration
     DB_USERNAME=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=quote_system
     DB_HOST=127.0.0.1
     DB_PORT=3306
     ```

     **Important:** Replace `your_mysql_password` with your actual MySQL password.

4. **Set Up the Database**

   - **Start MySQL Server**

     Ensure that your MySQL server is running.

   - **Create the Database**

     Log into MySQL:

     ```bash
     mysql -u root -p
     ```
     On Windows open mySQL Command Line Client and enter the password.
     
     Once logged in, create the database:

     ```sql
     CREATE DATABASE IF NOT EXISTS quote_system;
     EXIT;
     ```

5. **Run Database Migrations**

   Apply the Sequelize migrations to set up the database schema:

   ```bash
   npx sequelize db:migrate
   ```

6. **(Optional) Seed the Database**

   NOT YET IMPLEMENTED

7. **Start the Development Server**

   Launch the server using `nodemon` for automatic restarts on code changes:

   ```bash
   npm run dev
   ```

   **Expected Output:**

   ```
   Database connected...
   Server is running on port 3000
   ```

8. **Access the API**

   The backend API is now running at: [http://localhost:3000/api](http://localhost:3000/api)

## Additional Notes

- **Environment Variables:** Ensure that the `.env` file is **never** committed to the repository. This is already handled by the `.gitignore` file.
  
- **Database Credentials:** It's recommended to use a dedicated MySQL user with limited privileges for better security.

- **Port Configuration:** If port `3000` is already in use, you can change the `PORT` variable in the `.env` file to another available port.
