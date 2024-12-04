This is the repository for Group 6B's project in CSCI 467.

# Table of Contents
1. [Project Statement](csci467ProjectStatement.md)
2. [Project Notes](csci467ProjectNotes.md)
3. [Backend Quickstart](#backend-quick-start-guide)
4. [Frontend Quickstart](#frontend-quickstart-guide)

# Backend Quick Start Guide

Follow these steps to set up and run the **Quote System Backend** on your local machine.

## Prerequisites

Ensure you have the following installed:

- **Node.js**
   - Version 20.18.1
- **npm** 
   - Should be installed with node.js
- **MySQL** 
   - Install MySQL community
- **Git**

## Installation Steps

1. **Clone the Repository**

   Open your terminal and run:

   ```
   git clone https://github.com/robalobalubob/csci467Project.git
   cd quote-system-backend
   ```

2. **Install Dependencies**

   Install the necessary npm packages:

   ```
   npm install
   ```

   Note: Only run when in the quote-system-backend directory.
   
3. **Configure Environment Variables**

   - **Create a `.env` File**

     In the root directory of the project, create a file named `.env`:

     ```
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
      EMAIL_USER=csci467.6b.sender@gmail.com
      EMAIL_PASS=email_pass
      ```

      **Important:** Replace `your_mysql_password` with your actual MySQL password. Replace email_pass with correct password. Not given here to avoid disclosure.

4. **Set Up the Database**

   - **Start MySQL Server**

     Install MySQL community edition and run through the set up.

     Ensure that your MySQL server is running.

   - **Create the Database**

     Log into MySQL:

     ```
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

   ```
   npx sequelize-cli db:seed:all
   ```

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

- **Port Configuration:** If port `3000` is already in use, you can change the `PORT` variable in the `.env` file to another available port.

# Frontend Quickstart Guide
## This guide assumes you went throught the Backend Quickstart Guide

1. **Setup Node**
   
   Navigate into each frontend directory.

   ```bash
   cd admin-frontend
   ```

   ```bash
   cd quote-frontend
   ```

   ```bash
   cd internal-interfaces
   ```
   In each directory run:

   ```
   npm install
   ```
2. **Start Each React Instance**

   In each directory run the following command:

   ```bash
   npm start
   ```

   Since the default port for react apps is 3000, it will prompt you to use a different port.
   ```bash
   Would you like to run the app on another port instead? (y/n)
   ```
   Input y and it will run on the next available port.

   Repeat for each react instance.
   
   **Important:** The order in which you start each react instance will impact the port it is running on.
   For simplicity I recommend following the order above: admin-frontend, quote-frontend, internal-interfaces.

3. **Access Frontends**

   If you follow the above order then the applications should be:
   * [Admin-frontend](http://localhost:3001/)
   * [Quote-frontend](http://localhost:3002/)
   * [Internal-interfaces](http://localhost:3003/)
