# GigFlow API Documentation

This document provides comprehensive documentation for the GigFlow API endpoints.

## Base URL

All API endpoints are relative to the base URL of the application.

## Authentication

Currently, the API does not require authentication tokens. User identity is determined by the wallet address provided in the requests.

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses have the following format:

```json
{
  "error": "Error message"
}
```

## API Endpoints

### Users

#### Get User

Retrieves a user by their ID.

- **URL**: `/api/users`
- **Method**: `GET`
- **Query Parameters**:
  - `userId`: User ID (wallet address) to retrieve
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "userId": "0x123...",
      "username": "JohnDoe",
      "walletAddress": "0x123...",
      "skills": ["JavaScript", "React"],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "farcasterId": "12345",
      "farcasterUsername": "johndoe"
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "userId required" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to fetch user" }`

#### Create User

Creates a new user.

- **URL**: `/api/users`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userId": "0x123...",
    "username": "JohnDoe",
    "walletAddress": "0x123...",
    "skills": ["JavaScript", "React"],
    "farcasterId": "12345",
    "farcasterUsername": "johndoe"
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**: Created user object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "userId and walletAddress required" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to create user" }`

#### Update User

Updates an existing user.

- **URL**: `/api/users`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "userId": "0x123...",
    "skills": ["JavaScript", "React", "Node.js"],
    "username": "JohnDoe2",
    "farcasterId": "12345",
    "farcasterUsername": "johndoe"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: Updated user object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "userId required" }`
  - **Code**: 404
  - **Content**: `{ "error": "User not found" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to update user" }`

### Gigs

#### Get Gigs

Retrieves all gigs.

- **URL**: `/api/gigs`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200
  - **Content**: Array of gig objects
- **Error Response**:
  - **Code**: 500
  - **Content**: `{ "error": "Failed to fetch gigs" }`

#### Create Gig

Creates a new gig.

- **URL**: `/api/gigs`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "Build a React Component",
    "description": "Create a reusable React component for a dashboard",
    "skillsRequired": ["React", "JavaScript"],
    "payoutAmount": 50,
    "postedByUserId": "0x123..."
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**: Created gig object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "Missing required fields" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to create gig" }`

#### Update Gig

Updates an existing gig.

- **URL**: `/api/gigs`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "gigId": "abc123",
    "status": "completed",
    "completedByUserId": "0x456..."
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: Updated gig object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "gigId required" }`
  - **Code**: 404
  - **Content**: `{ "error": "Gig not found" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to update gig" }`

### Offerings

#### Get Offerings

Retrieves all offerings or offerings for a specific user.

- **URL**: `/api/offerings`
- **Method**: `GET`
- **Query Parameters**:
  - `userId` (optional): User ID to filter offerings by
- **Success Response**:
  - **Code**: 200
  - **Content**: Array of offering objects
- **Error Response**:
  - **Code**: 500
  - **Content**: `{ "error": "Failed to fetch offerings" }`

#### Create Offering

Creates a new offering.

- **URL**: `/api/offerings`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userId": "0x123...",
    "title": "React Development",
    "description": "I can build React components and applications",
    "skills": ["React", "JavaScript"],
    "basePrice": 50
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**: Created offering object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "Missing required fields" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to create offering" }`

#### Update Offering

Updates an existing offering.

- **URL**: `/api/offerings`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "offeringId": "abc123",
    "userId": "0x123...",
    "title": "Updated React Development",
    "description": "Updated description",
    "skills": ["React", "JavaScript", "TypeScript"],
    "basePrice": 60,
    "availability": "busy"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: Updated offering object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "offeringId and userId required" }`
  - **Code**: 404
  - **Content**: `{ "error": "Offering not found" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to update offering" }`

#### Delete Offering

Deletes an existing offering.

- **URL**: `/api/offerings`
- **Method**: `DELETE`
- **Query Parameters**:
  - `offeringId`: ID of the offering to delete
  - `userId`: User ID of the offering creator
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "message": "Offering deleted successfully" }`
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "offeringId and userId required" }`
  - **Code**: 404
  - **Content**: `{ "error": "Offering not found" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to delete offering" }`

### Transactions

#### Get Transactions

Retrieves transactions for a user.

- **URL**: `/api/transactions`
- **Method**: `GET`
- **Query Parameters**:
  - `userId`: User ID to get transactions for
- **Success Response**:
  - **Code**: 200
  - **Content**: Array of transaction objects
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "userId required" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to fetch transactions" }`

#### Create Transaction

Creates a new transaction.

- **URL**: `/api/transactions`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "gigId": "abc123",
    "fromUserId": "0x123...",
    "toUserId": "0x456...",
    "amount": 50
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**: Created transaction object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "Missing required fields" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to create transaction" }`

#### Update Transaction

Updates a transaction (typically to mark as completed).

- **URL**: `/api/transactions`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "transactionId": "abc123",
    "txHash": "0x789..."
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: Updated transaction object
- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "error": "transactionId and txHash required" }`
  - **Code**: 404
  - **Content**: `{ "error": "Transaction not found" }`
  - **Code**: 500
  - **Content**: `{ "error": "Failed to update transaction" }`

## Data Models

### User

```typescript
interface User {
  userId: string; // wallet address
  username?: string;
  walletAddress: string;
  skills: string[];
  createdAt: string;
  farcasterId?: string;
  farcasterUsername?: string;
}
```

### Gig

```typescript
interface Gig {
  gigId: string;
  title: string;
  description: string;
  skillsRequired: string[];
  payoutAmount: number;
  status: 'open' | 'accepted' | 'completed';
  postedByUserId: string;
  completedByUserId?: string;
  createdAt: string;
  completedAt?: string;
}
```

### Offering

```typescript
interface Offering {
  offeringId: string;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  basePrice: number;
  availability: 'available' | 'busy' | 'unavailable';
  createdAt: string;
  updatedAt: string;
}
```

### Transaction

```typescript
interface Transaction {
  transactionId: string;
  gigId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}
```

