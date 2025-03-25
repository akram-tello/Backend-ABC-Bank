const { TransactionService } = require('../services/transactionService');
const { prisma } = require('../lib/prisma');

class TransactionController {
  constructor() {
    this.transactionService = new TransactionService();
  }

  /**
   * @swagger
   * /api/transactions/deposit:
   *   post:
   *     summary: Deposit money into user's account
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *             properties:
   *               amount:
   *                 type: number
   *                 minimum: 0
   *                 description: Amount to deposit
   *     responses:
   *       200:
   *         description: Deposit successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Deposit successful
   *                 newBalance:
   *                   type: number
   *       400:
   *         description: Invalid amount
   *       401:
   *         description: Unauthorized
   */
  async deposit(req, res) {
    try {
      const { amount, description } = req.body;
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

      const transaction = await this.transactionService.deposit(account.id, amount, description);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  /**
   * @swagger
   * /api/transactions/transfer:
   *   post:
   *     summary: Transfer money to another account
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - recipientAccountNumber
   *               - amount
   *             properties:
   *               recipientAccountNumber:
   *                 type: string
   *                 description: Account number of the recipient
   *               amount:
   *                 type: number
   *                 minimum: 0
   *                 description: Amount to transfer
   *     responses:
   *       200:
   *         description: Transfer successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Transfer successful
   *                 newBalance:
   *                   type: number
   *       400:
   *         description: Invalid amount or insufficient funds
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Recipient account not found
   */
  async transfer(req, res) {
    try {
      const { toAccountNumber, amount, description, recipientRef } = req.body;
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
        amount,
        description,
        recipientRef
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

  /**
   * @swagger
   * /api/transactions/{accountId}:
   *   get:
   *     summary: Get transaction history for an account
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         schema:
   *           type: string
   *         description: Account ID
   *     responses:
   *       200:
   *         description: List of transactions
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   type:
   *                     type: string
   *                     enum: [DEPOSIT, TRANSFER]
   *                   amount:
   *                     type: number
   *                   timestamp:
   *                     type: string
   *                     format: date-time
   *                   status:
   *                     type: string
   *                     enum: [COMPLETED, FAILED]
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Account not found
   */
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

  /**
   * @swagger
   * /api/balance/{accountId}:
   *   get:
   *     summary: Get current account balance
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         schema:
   *           type: string
   *         description: Account ID
   *     responses:
   *       200:
   *         description: Current account balance
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 balance:
   *                   type: number
   *                   description: Current account balance
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Account not found
   */
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