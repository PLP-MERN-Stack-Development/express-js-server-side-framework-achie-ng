const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory database (replace with real database in production)
let products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 50, description: 'High-performance laptop' },
  { id: 2, name: 'Mouse', price: 29.99, category: 'Electronics', stock: 150, description: 'Wireless mouse' },
  { id: 3, name: 'Keyboard', price: 79.99, category: 'Electronics', stock: 100, description: 'Mechanical keyboard' },
  { id: 4, name: 'Monitor', price: 299.99, category: 'Electronics', stock: 75, description: '27-inch 4K monitor' },
  { id: 5, name: 'Desk Chair', price: 199.99, category: 'Furniture', stock: 30, description: 'Ergonomic office chair' }
];

// Custom Middleware

// 1. Request Logger Middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
};

// 2. Simple Authentication Middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'your-secret-api-key';

  if (!apiKey) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please provide an API key in the x-api-key header'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
};

// 3. Product Validation Middleware
const validateProduct = (req, res, next) => {
  const { name, price, category, stock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }

  if (stock === undefined || typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
    errors.push('Stock is required and must be a non-negative integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Apply global middleware
app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Products API',
    version: '1.0.0',
    endpoints: {
      'GET /api/products': 'Get all products (supports filtering, pagination, search)',
      'GET /api/products/:id': 'Get a specific product',
      'POST /api/products': 'Create a new product (requires authentication)',
      'PUT /api/products/:id': 'Update a product (requires authentication)',
      'DELETE /api/products/:id': 'Delete a product (requires authentication)'
    }
  });
});

// API Routes

// GET /api/products - Get all products with filtering, pagination, and search
app.get('/api/products', (req, res) => {
  try {
    let filteredProducts = [...products];

    // Search functionality
    const { search } = req.query;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    const { category } = req.query;
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by price range
    const { minPrice, maxPrice } = req.query;
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Sorting
    const { sortBy, order } = req.query;
    if (sortBy) {
      filteredProducts.sort((a, b) => {
        let comparison = 0;
        if (a[sortBy] < b[sortBy]) comparison = -1;
        if (a[sortBy] > b[sortBy]) comparison = 1;
        return order === 'desc' ? -comparison : comparison;
      });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      success: true,
      count: paginatedProducts.length,
      total: filteredProducts.length,
      page,
      totalPages: Math.ceil(filteredProducts.length / limit),
      data: paginatedProducts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a valid number'
      });
    }

    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with ID ${id}`
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/products - Create a new product (requires authentication)
app.post('/api/products', authenticate, validateProduct, (req, res) => {
  try {
    const { name, price, category, stock, description } = req.body;

    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name: name.trim(),
      price,
      category: category.trim(),
      stock,
      description: description ? description.trim() : ''
    };

    products.push(newProduct);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PUT /api/products/:id - Update a product (requires authentication)
app.put('/api/products/:id', authenticate, validateProduct, (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a valid number'
      });
    }

    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with ID ${id}`
      });
    }

    const { name, price, category, stock, description } = req.body;

    products[productIndex] = {
      ...products[productIndex],
      name: name.trim(),
      price,
      category: category.trim(),
      stock,
      description: description ? description.trim() : products[productIndex].description
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: products[productIndex]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /api/products/:id - Delete a product (requires authentication)
app.delete('/api/products/:id', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid product ID',
        message: 'Product ID must be a valid number'
      });
    }

    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with ID ${id}`
      });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 404 Handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global Error Handler - Must be last
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/products`);
});

module.exports = app;