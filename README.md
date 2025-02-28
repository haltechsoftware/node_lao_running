# Lao Running API

A Node.js API server for the Lao Running application.

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm 6.x or later
- PostgreSQL 12.x or later

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file
4. Run database migrations:
   ```
   npx sequelize-cli db:migrate
   ```
5. (Optional) Seed the database:
   ```
   npx sequelize-cli db:seed:all
   ```
6. Start the server:
   ```
   npm start
   ```

For development with auto-reloading:

```
npm run dev
```

## API Documentation

The API documentation is available via Swagger UI when the server is running:

```
http://localhost:3000/api-docs
```

The Swagger documentation files are:

- `swagger.yaml` - Main API endpoints definitions
- `swagger-extensions.yaml` - Extended documentation with examples
- `swagger-models.yaml` - Detailed model definitions

## Project Structure

```
.
├── app/
│   ├── controllers/     # Route controllers
│   ├── helpers/         # Helper functions
│   ├── middlewares/     # Custom middleware
│   └── validations/     # Input validation
├── config/              # Configuration files
├── models/              # Sequelize models
├── routes/              # Express routes
└── seeders/             # Database seeders
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. To authenticate, include the token in the Authorization header:

```
Authorization: Bearer <token>
```

You can obtain a token by using the login endpoint:

```
POST /api/v1/auth/login
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reloading
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run seed` - Run database seeders

## Environment Variables

Important environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development, test, production)
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` - Database connection details
- `JWT_SECRET` - Secret for JWT tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary credentials for image uploads
- `BCEL_MCID` - BCEL merchant ID for payments

## Common Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user

### Runners

- `GET /api/v1/runner` - Get all runners
- `GET /api/v1/runner/profile` - Get runner profile
- `PUT /api/v1/runner/profile` - Update runner profile

### Run Results

- `POST /api/v1/run-results` - Submit run result
- `GET /api/v1/run-results` - Get user's run results

### Payments

- `POST /api/v1/manual-payments` - Submit manual payment
- `GET /api/v1/manual-payments` - Get user's payments

## License

This project is proprietary and confidential.
