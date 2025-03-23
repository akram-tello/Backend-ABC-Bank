const { PrismaClient } = require('@prisma/client');

class UserRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(email, password, name) {
    return this.prisma.user.create({
      data: {
        email,
        password,
        name
      }
    });
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }
}

module.exports = { UserRepository }; 