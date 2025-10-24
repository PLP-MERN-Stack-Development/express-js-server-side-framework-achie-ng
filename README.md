# Express.js RESTful API - Products Management

A comprehensive RESTful API built with Express.js for managing products. This project includes custom middleware for authentication, logging, validation, and advanced features like filtering, pagination, and search.

# Features

- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Authentication**: API key-based authentication for protected routes
- **Validation**: Input validation middleware for data integrity
- **Logging**: Request logging for monitoring and debugging
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Filtering**: Filter products by category and price range
- **Pagination**: Paginated results for better performance
- **Search**: Full-text search across product names and descriptions
- **Sorting**: Sort products by any field in ascending or descending order

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Postman, Insomnia, or curl for API testing

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd < repository name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3000
API_KEY=your-secret-api-key
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📚 API Endpoints

### Base URL
```
http://localhost:3000
```

### Public Endpoints

#### 1. Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name and description
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Field to sort by (e.g., price, name)
- `order` (optional): Sort order (asc or desc)

**Example Request:**
```bash
curl http://localhost:3000/api/products?page=1&limit=5&category=Electronics&sortBy=price&order=asc
```

**Example Response:**
```json
{
  "success": true,
  "count": 4,
  "total": 4,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "id": 2,
      "name": "Mouse",
      "price": 29.99,
      "category": "Electronics",
      "stock": 150,
      "description": "Wireless mouse"
    },
    {
      "id": 3,
      "name": "Keyboard",
      "price": 79.99,
      "category": "Electronics",
      "stock": 100,
      "description": "Mechanical keyboard"
    }
  ]
}
```

#### 2. Get Product by ID
```http
GET /api/products/:id
```

**Example Request:**
```bash
curl http://localhost:3000/api/products/1
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50,
    "description": "High-performance laptop"
  }
}
```

### Protected Endpoints (Require Authentication)

All protected endpoints require an API key in the `x-api-key` header.

#### 3. Create Product
```http
POST /api/products
```

**Headers:**
```
x-api-key: your-secret-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Webcam",
  "price": 89.99,
  "category": "Electronics",
  "stock": 45,
  "description": "HD webcam for video calls"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "x-api-key: your-secret-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Webcam",
    "price": 89.99,
    "category": "Electronics",
    "stock": 45,
    "description": "HD webcam for video calls"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 6,
    "name": "Webcam",
    "price": 89.99,
    "category": "Electronics",
    "stock": 45,
    "description": "HD webcam for video calls"
  }
}
```

#### 4. Update Product
```http
PUT /api/products/:id
```

**Headers:**
```
x-api-key: your-secret-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Webcam Pro",
  "price": 129.99,
  "category": "Electronics",
  "stock": 40,
  "description": "Professional HD webcam"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/products/6 \
  -H "x-api-key: your-secret-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Webcam Pro",
    "price": 129.99,
    "category": "Electronics",
    "stock": 40,
    "description": "Professional HD webcam"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 6,
    "name": "Webcam Pro",
    "price": 129.99,
    "category": "Electronics",
    "stock": 40,
    "description": "Professional HD webcam"
  }
}
```

#### 5. Delete Product
```http
DELETE /api/products/:id
```

**Headers:**
```
x-api-key: your-secret-api-key
```

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/products/6 \
  -H "x-api-key: your-secret-api-key"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": 6,
    "name": "Webcam Pro",
    "price": 129.99,
    "category": "Electronics",
    "stock": 40,
    "description": "Professional HD webcam"
  }
}
```

## 🔐 Authentication

Protected endpoints require an API key to be passed in the `x-api-key` header. The default API key is set in the `.env` file.

**Example:**
```
x-api-key: your-secret-api-key
```

If authentication fails, you'll receive one of these responses:

**Missing API Key:**
```json
{
  "error": "Authentication required",
  "message": "Please provide an API key in the x-api-key header"
}
```

**Invalid API Key:**
```json
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid"
}
```

##  Validation

The API validates product data for POST and PUT requests. All fields are required and must meet the following criteria:

- **name**: Non-empty string
- **price**: Non-negative number
- **category**: Non-empty string
- **stock**: Non-negative integer
- **description**: String (optional)

**Validation Error Response:**
```json
{
  "error": "Validation failed",
  "details": [
    "Name is required and must be a non-empty string",
    "Price is required and must be a non-negative number"
  ]
}
```

## 🚨 Error Handling

The API includes comprehensive error handling with meaningful HTTP status codes:

- **200 OK**: Successful GET, PUT, DELETE
- **201 Created**: Successful POST
- **400 Bad Request**: Invalid input or validation errors
- **401 Unauthorized**: Missing authentication
- **403 Forbidden**: Invalid authentication credentials
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## 📊 Advanced Features

### Filtering
Filter products by category or price range:
```
GET /api/products?category=Electronics&minPrice=50&maxPrice=200
```

### Pagination
Control the number of results and page:
```
GET /api/products?page=2&limit=5
```

### Search
Search across product names and descriptions:
```
GET /api/products?search=laptop
```

### Sorting
Sort results by any field:
```
GET /api/products?sortBy=price&order=desc
```

### Combined Example
Combine multiple features:
```
GET /api/products?category=Electronics&search=keyboard&sortBy=price&order=asc&page=1&limit=10
```

## 🧪 Testing with Postman

1. Import the following collection or create requests manually
2. Set the base URL: `http://localhost:3000`
3. For protected routes, add header: `x-api-key: your-secret-api-key`
4. Test all CRUD operations and advanced features

## 📝 Project Structure

```
.
├── server.js           # Main Express server file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (not in git)
├── .env.example       # Environment variables template
└── README.md          # This file
```

## 🔧 Middleware

### 1. Request Logger
Logs all incoming requests with timestamp and method.

### 2. Authentication Middleware
Validates API keys for protected routes.

### 3. Validation Middleware
Ensures product data integrity before processing.

### 4. Error Handler
Catches and formats all errors consistently.

## 🎯 Future Enhancements

- [ ] Connect to a real database (MongoDB, PostgreSQL)
- [ ] Add user authentication with JWT
- [ ] Implement rate limiting
- [ ] Add unit and integration tests
- [ ] Create Swagger/OpenAPI documentation
- [ ] Add image upload for products
- [ ] Implement product categories management
- [ ] Add inventory tracking

## 📄 License

ISC
 GitHub Classroom Assignment