# Bank ABC Backend API

This is the backend API for Bank ABC's banking system. It provides endpoints for user authentication, account management, and transactions.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bank_abc?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   PORT=3000
   ```
4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Register
- **POST** `/api/auth/register`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Transactions

All transaction endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### Deposit
- **POST** `/api/transactions/deposit`
- Body:
  ```json
  {
    "accountId": "1234567890",
    "amount": 100.00
  }
  ```

#### Transfer
- **POST** `/api/transactions/transfer`
- Body:
  ```json
  {
    "fromAccountId": "1234567890",
    "toAccountId": "0987654321",
    "amount": 50.00
  }
  ```

#### Get Transactions
- **GET** `/api/transactions/:accountId`

#### Get Balance
- **GET** `/api/balance/:accountId`

## Error Handling

The API returns appropriate HTTP status codes and error messages in the following format:
```json
{
  "message": "Error message here"
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Development

- Run tests: `npm test`
- Build: `npm run build`
- Start production server: `npm start` 