# Happr API 

<img src="./public/docs.png" />

## Overview
Happr API is a robust backend service built with TypeScript, NestJS, and Prisma, designed to power a creator platform where fans can send instant "Smiles" (donations). It integrates with Redis for job queuing (BullMQ), Cloudinary for media uploads, and Nodemailer for email services, ensuring a scalable and high-performance foundation.

## Features
-   **Authentication & Authorization**: Secure user registration, login with JWT, email verification, and refresh token management using Argon2 for password hashing.
-   **User Management**: Retrieve and update user profiles, including avatar uploads via Cloudinary and BullMQ queues.
-   **Email Services**: Asynchronous email sending for verification and welcome messages powered by Nodemailer and BullMQ.
-   **Background Job Processing**: Efficiently handle tasks like image uploads and email delivery using Redis and BullMQ.
-   **Database Management**: PostgreSQL database integration via Prisma ORM for seamless data interactions and schema migrations.
-   **API Documentation**: Interactive Swagger UI for comprehensive API exploration and testing (password protected).
-   **Containerization**: Docker support for easy deployment and environment consistency.
-   **Rate Limiting**: Built-in API rate limiting using NestJS Throttler.

## Getting Started
To get the Happr API up and running on your local machine, follow these steps.

### Installation
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Charmingdc/Happr.git
    cd Happr/server
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```

4.  **Database Migration**:
    Ensure your PostgreSQL database is running and the `DATABASE_URL` environment variable is correctly set.
    ```bash
    npx prisma migrate deploy
    ```
    For local development with schema changes, you might use:
    ```bash
    npx prisma migrate dev --name init --schema ./prisma/schema.prisma
    ```

5.  **Build the Project**:
    ```bash
    npm run build
    ```

### Environment Variables
Create a `.env` file in the `server` directory and populate it with the following variables. Examples are provided for clarity.

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
JWT_SECRET="a_very_strong_and_long_jwt_secret_key_randomly_generated"
GMAIL_AUTH_USER="your-email@gmail.com"
GMAIL_AUTH_PASS="your_gmail_app_password"
FRONTEND_DOMAIN="http://localhost:5173"
BACKEND_DOMAIN="http://localhost:8080"
PORT=8080
REDIS_URL="rediss://default:your_redis_password@your_redis_host:port"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
SWAGGER_AUTH_USER="delusional"
SWAGGER_AUTH_PASS="asdf"
AUTH0_DOMAIN="your-auth0-domain.us.auth0.com" # Currently not used
AUTH0_CLIENT_ID="your-client-id" # Currently not used
AUTH0_CLIENT_SECRET="your-client-secret" # Currently not used
```
**Note**: For `GMAIL_AUTH_PASS`, you need to generate an App Password for your Gmail account if you have 2-Factor Authentication enabled.

### Running the Application
To start the application in development mode:
```bash
npm run start:dev
```
To start the application in production mode:
```bash
npm run start:prod
```
The application will be accessible at `http://localhost:8080` (or the `PORT` you configured). The API documentation (Swagger UI) will be available at `http://localhost:8080` as well, protected by Basic Auth credentials (`SWAGGER_AUTH_USER`, `SWAGGER_AUTH_PASS`).

## API Documentation
The API provides a comprehensive set of endpoints for user authentication, profile management, and more. All endpoints are prefixed with `/api/v1`.

### Base URL
`http://localhost:8080/api/v1` (or your configured `BACKEND_DOMAIN`)

### Endpoints

#### GET /auth/username-availability
**Overview**: Checks if a given username is available for registration.
**Request**:
```json
// Query Parameters
{
  "username": "example_username"
}
```
**Response**:
```json
{
  "success": true,
  "data": [],
  "message": "example_username is available"
}
```
**Errors**:
-   `400 Bad Request`: "example_username" is already taken

#### POST /auth/register
**Overview**: Registers a new user with email, username, and password. An email verification link is sent upon successful registration.
**Request**:
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "StrongPassword123!"
}
```
**Response**:
```json
{
  "success": true,
  "data": [],
  "message": "Account created. Please verify your email"
}
```
**Errors**:
-   `400 Bad Request`: Validation errors (e.g., "Email is required", "Password must contain at least one uppercase letter", "Account already exists")

#### GET /auth/verify-email
**Overview**: Verifies a user's email address using a token received in their mailbox.
**Request**:
```json
// Query Parameters
{
  "token": "generated_jwt_token_for_email_verification"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "data": []
}
```
**Errors**:
-   `400 Bad Request`: "Invalid or expired token!", "User not found", "Email already verified, just login!"

#### POST /auth/signin
**Overview**: Authenticates a user with their email and password. Sets `access_token` and `refresh_token` as HTTP-only cookies.
**Request**:
```json
{
  "email": "test@example.com",
  "password": "StrongPassword123!"
}
```
**Response**:
```json
{
  "success": true,
  "message": "User signedin successfully",
  "token": "jwt_access_token_string",
  "data": []
}
```
**Errors**:
-   `401 Unauthorized`: "Invalid credentials", "Your account has not been verified yet, kindly check your email"
-   `400 Bad Request`: Validation errors (e.g., "Email is required", "password must be at least 5 characters long")

#### GET /user/me
**Overview**: Retrieves the detailed profile information of the authenticated user.
**Authorization**: Bearer Token
**Request**:
_No request body_
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cuid_id_string",
    "email": "user@example.com",
    "username": "testuser",
    "bio": "A passionate creator.",
    "display_name": "Test User",
    "avatar_url": "https://res.cloudinary.com/your_cloud_name/image/upload/v123456789/happr/avatars/avatar.jpg",
    "phone_number": "+2348012345678",
    "auth_provider": "local",
    "is_verified": true,
    "created_at": "2023-10-27T10:00:00.000Z",
    "updated_at": "2023-10-27T10:30:00.000Z",
    "bank_account": {
      "bank_name": "Example Bank",
      "account_name": "Test User",
      "account_number": "1234567890"
    },
    "stats": {
      "total_donations_received": 5,
      "total_donations_given": 2,
      "total_amount_received": 150.00,
      "total_amount_given": 25.00,
      "total_supporters": 3
    },
    "recent_donations": [
      {
        "id": "donation_cuid_1",
        "amount": 10.00,
        "message": "Great content!",
        "name": "Anonymous Fan",
        "email": null,
        "is_guest": true,
        "created_at": "2024-07-20T10:00:00.000Z",
        "supporter": null
      }
    ]
  },
  "message": "User details and donation stats fetched successfully!"
}
```
**Errors**:
-   `401 Unauthorized`: "No token provided", "Invalid or expired token"
-   `404 Not Found`: "User does not exist"
-   `403 Forbidden`: "You account is not verified yet, check your email"

#### PATCH /user/:id
**Overview**: Updates specific user profile information. Supports optional avatar upload.
**Authorization**: Bearer Token
**Request**:
```json
// Path Parameter: id - User ID
// Example Body with form-data (for avatar upload) or JSON (for other fields)
{
  "username": "new_testuser",
  "bio": "Updated bio text.",
  "display_name": "New Display Name",
  "phone_number": "+2349012345678",
  "avatar": "<File: avatar.jpg>" // Use form-data for file upload
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cuid_id_string",
    "email": "user@example.com",
    "username": "new_testuser",
    "bio": "Updated bio text.",
    "display_name": "New Display Name",
    "avatar_url": "https://res.cloudinary.com/your_cloud_name/image/upload/v123456789/happr/avatars/new_avatar.jpg",
    "phone_number": "+2349012345678",
    "auth_provider": "local",
    "is_verified": true,
    "created_at": "2023-10-27T10:00:00.000Z",
    "updated_at": "2023-10-27T11:00:00.000Z"
  },
  "message": "User profile updated successfuly!"
}
```
**Errors**:
-   `401 Unauthorized`: "No token provided", "Invalid or expired token"
-   `404 Not Found`: "User does not exist"
-   `403 Forbidden`: "You account is not verified yet, check your email"
-   `415 Unsupported Media Type`: "Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed." (for avatar upload)
-   `400 Bad Request`: Validation errors (e.g., "phone_number must be a valid phone number")

#### DELETE /user/:id
**Overview**: Deletes the authenticated user's account. The `id` in the path must match the authenticated user's ID.
**Authorization**: Bearer Token
**Request**:
_No request body_
**Response**:
```json
{
  "success": true,
  "data": [],
  "message": "user account deleted successfully!"
}
```
**Errors**:
-   `401 Unauthorized`: "No token provided", "Invalid or expired token"
-   `403 Forbidden`: "You are not authorized to delete this account", "You account is not verified yet, check your email"
-   `404 Not Found`: "user does not exist"

## Technologies Used

| Technology       | Description                                                 | Link                                               |
| :--------------- | :---------------------------------------------------------- | :------------------------------------------------- |
| **Node.js**      | JavaScript runtime for server-side execution.               | [nodejs.org](https://nodejs.org/en/)               |
| **NestJS**       | Progressive Node.js framework for building efficient APIs.  | [nestjs.com](https://nestjs.com/)                  |
| **TypeScript**   | Statically typed superset of JavaScript.                    | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Prisma**       | Next-generation ORM for Node.js and TypeScript.             | [prisma.io](https://www.prisma.io/)                |
| **PostgreSQL**   | Powerful, open-source relational database system.           | [postgresql.org](https://www.postgresql.org/)      |
| **BullMQ**       | Robust, Redis-backed queue for Node.js.                     | [docs.bullmq.io](https://docs.bullmq.io/)          |
| **Redis**        | In-memory data store for caching and message brokering.     | [redis.io](https://redis.io/)                      |
| **Cloudinary**   | Cloud-based image and video management.                     | [cloudinary.com](https://cloudinary.com/)          |
| **Nodemailer**   | Module for sending emails from Node.js applications.        | [nodemailer.com](https://nodemailer.com/)          |
| **JWT**          | JSON Web Tokens for secure API authentication.              | [jwt.io](https://jwt.io/)                          |
| **Argon2**       | Strong password hashing function.                           | [github.com/argon2/argon2](https://github.com/P-H-C/phc-winner-argon2) |
| **Docker**       | Containerization platform for consistent environments.      | [docker.com](https://www.docker.com/)              |
| **Swagger**      | API documentation with interactive UI.                      | [swagger.io](https://swagger.io/)                  |
| **Helmet**       | Express middleware for securing Node.js apps.               | [helmetjs.github.io](https://helmetjs.github.io/)  |
| **Throttler**    | NestJS module for rate limiting.                            | [docs.nestjs.com/security/rate-limiting](https://docs.nestjs.com/security/rate-limiting) |

## Contributing
We welcome contributions to the Happr API project! 🎉 To contribute:

1.  **Fork the repository** and clone it to your local machine.
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name`.
3.  **Implement your changes**, ensuring they adhere to the project's coding standards.
4.  **Write comprehensive tests** for your new features or bug fixes.
5.  **Run tests** to ensure everything passes: `npm test`.
6.  **Commit your changes** with a clear and descriptive message.
7.  **Push your branch** to your forked repository.
8.  **Open a Pull Request** to the `main` branch of the original repository.

Please ensure your code is well-documented and follows the existing architectural patterns.

## License
This project is licensed under the UNLICENSED.

## Author Info

Connect with the project maintainer:

-   **LinkedIn**: [Your LinkedIn Profile](https://www.linkedin.com/in/your_username)
-   **Twitter**: [Your Twitter Handle](https://twitter.com/your_username)
-   **Portfolio**: [Your Personal Website](https://www.yourportfolio.com)

---

[![Node.js](https://img.shields.io/badge/Node.js-20-brightgreen)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-blueviolet)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-blue)](https://www.postgresql.org/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5.x-orange)](https://docs.bullmq.io/)
[![Redis](https://img.shields.io/badge/Redis-Queue-red)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Container-blue)](https://www.docker.com/)
[![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-lightgrey)](https://choosealicense.com/licenses/unlicense/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)