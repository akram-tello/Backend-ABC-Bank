const { TransactionRepository } = require('../repositories/transactionRepository');
const { AccountRepository } = require('../repositories/accountRepository');

class TransactionService {
  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.accountRepository = new AccountRepository();
  }

  async deposit(accountId, amount, description) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const transaction = await this.transactionRepository.create({
      type: 'DEPOSIT',
      amount,
      fromAccountId: accountId,
      toAccountId: accountId,
      description
    });

    await this.accountRepository.updateBalance(accountId, amount);

    return {
      ...transaction,
      direction: 'IN'
    };
  }

  async transfer(fromAccountId, toAccountNumber, amount, description, recipientRef) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const fromAccount = await this.accountRepository.findById(fromAccountId);
    if (!fromAccount) {
      throw new Error('Your account not found');
    }

    const toAccount = await this.accountRepository.findByNumber(toAccountNumber);
    if (!toAccount) {
      throw new Error('Recipient account not found');
    }

    if (fromAccount.id === toAccount.id) {
      throw new Error('Cannot transfer to your own account');
    }

    if (fromAccount.balance < amount) {
      throw new Error('Insufficient funds');
    }

    const transaction = await this.transactionRepository.create({
      type: 'TRANSFER',
      amount,
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      description,
      recipientRef
    });

    await this.accountRepository.updateBalance(fromAccount.id, -amount);
    await this.accountRepository.updateBalance(toAccount.id, amount);

    return {
      ...transaction,
      direction: 'OUT',
      fromAccount: { number: fromAccount.number },
      toAccount: { number: toAccount.number }
    };
  }

  async getAccountTransactions(accountId) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const transactions = await this.transactionRepository.findByAccountId(accountId);
    
    return transactions.map(transaction => ({
      ...transaction,
      direction: transaction.fromAccountId === accountId && transaction.type === 'TRANSFER' ? 'OUT' : 'IN'
    }));
  }

  async getAccountBalance(accountId) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    return account.balance;
  }
}

module.exports = { TransactionService }; 