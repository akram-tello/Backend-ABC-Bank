const { PrismaClient } = require('@prisma/client');

class TransactionRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create({ type, amount, fromAccountId, toAccountId }) {
    return this.prisma.transaction.create({
      data: {
        type,
        amount,
        fromAccountId,
        toAccountId
      }
    });
  }

  async findByAccountId(accountId) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        fromAccount: {
          select: {
            number: true
          }
        },
        toAccount: {
          select: {
            number: true
          }
        }
      }
    });
  }
}

module.exports = { TransactionRepository }; 