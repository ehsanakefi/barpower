# Technical Document Portal

## Overview
This project is a technical document portal that allows users to manage and search for documents based on their titles and metadata. It is built using Node.js, Express, and PostgreSQL, with Prisma/TypeORM for database interactions.

## Features
- User authentication (registration and login)
- Document management (add, retrieve, and search documents)
- Title-based search functionality
- Middleware for authentication and validation
- Logging utility for application events

## Project Structure
```
docpower-backend
├── src
│   ├── app.ts
│   ├── controllers
│   │   ├── auth.controller.ts
│   │   ├── document.controller.ts
│   │   └── search.controller.ts
│   ├── middleware
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models
│   │   ├── User.ts
│   │   └── Document.ts
│   ├── routes
│   │   ├── auth.routes.ts
│   │   ├── document.routes.ts
│   │   └── search.routes.ts
│   ├── services
│   │   ├── auth.service.ts
│   │   ├── document.service.ts
│   │   └── search.service.ts
│   ├── database
│   │   ├── connection.ts
│   │   └── migrations
│   ├── types
│   │   └── index.ts
│   └── utils
│       ├── logger.ts
│       └── validation.ts
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── tests
│   ├── controllers
│   ├── services
│   └── utils
├── package.json
├── tsconfig.json
├── .env.example
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL
- Docker (optional, for containerized setup)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd docpower-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database.
   - Update the `.env` file with your database connection details.

4. Run migrations:
   ```
   npx prisma migrate dev
   ```

5. Seed the database (optional):
   ```
   npx prisma db seed
   ```

### Running the Application
To start the application, run:
```
npm start
```

### API Endpoints
- **Authentication**
  - `POST /auth/register`: Register a new user
  - `POST /auth/login`: Log in an existing user

- **Document Management**
  - `POST /documents`: Add a new document
  - `GET /documents`: Retrieve all documents

- **Search**
  - `GET /search`: Search for documents by title

## Testing
Run tests using:
```
npm test
```

## License
This project is licensed under the MIT License.