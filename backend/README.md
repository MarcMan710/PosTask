# PosTask Backend

This is the backend service for the PosTask application. It provides a RESTful API for managing tasks, projects, and other resources.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PosTask/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration
1. Create a `.env` file in the root of the backend directory with the following variables:
   ```
   PORT=5000
   DATABASE_URL=postgres://username:password@localhost:5432/postask
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
   Replace `username`, `password`, and `your_jwt_secret` with your actual values.

## Running the Application
- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm run build
  npm start
  ```

## API Documentation
The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all endpoints, request/response schemas, and authentication requirements.

### Example API Endpoints
- **Create a Task:**
  - **POST** `/api/v1/tasks`
  - **Body:**
    ```json
    {
      "title": "New Task",
      "description": "Task description",
      "status": "pending",
      "due_date": "2023-12-31",
      "priority": "medium",
      "tags": [1, 2],
      "is_recurring": false
    }
    ```

- **Get All Tasks:**
  - **GET** `/api/v1/tasks`

- **Get Task by ID:**
  - **GET** `/api/v1/tasks/:id`

- **Update a Task:**
  - **PUT** `/api/v1/tasks/:id`
  - **Body:** Same as create task.

- **Delete a Task:**
  - **DELETE** `/api/v1/tasks/:id`

- **Reorder Tasks:**
  - **POST** `/api/v1/tasks/reorder`
  - **Body:**
    ```json
    {
      "positions": [
        { "id": 1, "order": 0 },
        { "id": 2, "order": 1 }
      ]
    }
    ```

## Development
- The project uses TypeScript. Run the following command to watch for changes:
  ```bash
  npm run watch
  ```

## Testing
- Run tests using Jest:
  ```bash
  npm test
  ```

## Contributing
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them.
4. Push your branch and create a pull request.

## License
This project is licensed under the ISC License. 