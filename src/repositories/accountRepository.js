const { PrismaClient } = require('@prisma/client');

class AccountRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(userId, accountNumber) {
    return this.prisma.account.create({
      data: {
        userId,
        number: accountNumber,
        balance: 0
      }
    });
  }

  async findById(id) {
    return this.prisma.account.findUnique({
      where: { id }
    });
  }

  async findByNumber(number) {
    return this.prisma.account.findUnique({
      where: { number }
    });
  }

  async updateBalance(id, amount) {
    return this.prisma.account.update({
      where: { id },
      data: {
        balance: {
          increment: amount
        }
      }
    });
  }
}

module.exports = { AccountRepository }; 