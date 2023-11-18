# TaskManager
Task Manager App

#### Video Demo: https://www.youtube.com/watch?v=du5_ZdjkSTc

#### Description: Task Manager is a web application that allows users to sign up, log in, create, manage, edit, delete and organize their tasks. This application provides a simple and intuitive way to keep track of tasks, set due dates, and monitor task status.

Table of Contents

    Features
    Getting Started
    Usage
    Sorting and Filtering
    Contributing

Features

    User registration and authentication.
    Task creation with title, description, due date, and status (e.g., in progress, completed).
    Task listing, editing, and deletion.
    User sessions for logged-in users.
    Simple and intuitive user interface.

Getting Started

To run the Task Manager App locally, follow these steps:

    Clone the repository:

    bash

git clone https://github.com/OdongMartin/TaskManager.git

Install dependencies:

bash

cd TaskManager
npm install

Set up the database:

    Create a MongoDB database and configure the connection in the app (update config.js or .env).

Start the application:

bash

    npm start

    Open the app:

    Access the app in your web browser at http://localhost:3000.

Usage

    User Registration and Authentication:
        Sign up with a new account or log in with an existing one.

    Task Creation:
        Click "Create Task" to add a new task.
        Enter the task details, such as title, description, due date, and status.
        Click "Create Task" to save the task.

    Task Listing:
        View your task list, including title, description, due date, and status.

    Task Editing:
        Click "Edit" on a task to modify its details.
        Update the task's title, description, due date, and status.
        Click "Edit task" to save the modifications.

    Task Deletion:
        Click "Delete" on a task to remove it from the list.

    Task Status Update:
        Change the status of a task (e.g., from "in progress" to "completed").

Contributing

We welcome contributions to improve the Task Manager App. If you'd like to contribute, please follow these steps:

    Fork the repository.
    Create a new branch for your feature or bug fix.
    Make your changes and commit them.
    Push your changes to your fork.
    Create a pull request to the main repository.