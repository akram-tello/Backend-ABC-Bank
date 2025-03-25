const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { UserController } = require('./controllers/userController');
const { TransactionController } = require('./controllers/transactionController');
const { authenticateToken } = require('./middleware/auth');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Controllers
const userController = new UserController();
const transactionController = new TransactionController();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Auth routes
app.post('/api/auth/register', userController.register.bind(userController));
app.post('/api/auth/login', userController.login.bind(userController));

// Transaction routes (protected)
app.post('/api/transactions/deposit', authenticateToken, transactionController.deposit.bind(transactionController));
app.post('/api/transactions/transfer', authenticateToken, transactionController.transfer.bind(transactionController));
app.get('/api/transactions/:accountId', authenticateToken, transactionController.getTransactions.bind(transactionController));
app.get('/api/balance/:accountId', authenticateToken, transactionController.getBalance.bind(transactionController));

// Account routes
app.get('/api/accounts/balance', authenticateToken, async (req, res) => {
  try {
    const account = await prisma.account.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json({ 
      id: account.id,
      number: account.number,
      balance: account.balance 
    });
  } catch (error) {
    console.error('Error getting account balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Find account by account number
app.get('/api/accounts/:accountNumber', authenticateToken, async (req, res) => {
  try {
    const account = await prisma.account.findUnique({
      where: { number: req.params.accountNumber },
      select: {
        id: true,
        number: true,
        // Don't send balance for security
      }
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
    console.error('Error finding account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Basic health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  
  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({ message: 'Unique constraint violation' });
      case 'P2025':
        return res.status(404).json({ message: 'Record not found' });
      default:
        return res.status(500).json({ message: 'Database error' });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Default error
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 