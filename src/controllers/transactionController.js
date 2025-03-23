const { TransactionService } = require('../services/transactionService');
const { prisma } = require('../lib/prisma');

class TransactionController {
  constructor() {
    this.transactionService = new TransactionService();
  }

  async deposit(req, res) {
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
      }

      // Get user's account
      const account = await prisma.account.findUnique({
        where: { userId }
      });

      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      const transaction = await this.transactionService.deposit(account.id, amount);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async transfer(req, res) {
    try {
      const { toAccountNumber, amount } = req.body;
      const userId = req.user.id;

      if (!toAccountNumber || !amount) {
        return res.status(400).json({ message: 'Recipient account number and amount are required' });
      }

      // Get sender's account
      const fromAccount = await prisma.account.findUnique({
        where: { userId }
      });

      if (!fromAccount) {
        return res.status(404).json({ message: 'Your account not found' });
      }

      const transaction = await this.transactionService.transfer(
        fromAccount.id,
        toAccountNumber,
        amount
      );
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getTransactions(req, res) {
    try {
      const { accountId } = req.params;

      if (!accountId) {
        return res.status(400).json({ message: 'Account ID is required' });
      }

      const transactions = await this.transactionService.getAccountTransactions(accountId);
      res.json(transactions);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getBalance(req, res) {
    try {
      const { accountId } = req.params;

      if (!accountId) {
        return res.status(400).json({ message: 'Account ID is required' });
      }

      const balance = await this.transactionService.getAccountBalance(accountId);
      res.json({ balance });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}

module.exports = { TransactionController }; 