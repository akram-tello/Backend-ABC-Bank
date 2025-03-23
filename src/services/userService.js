const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../repositories/userRepository');
const { AccountRepository } = require('../repositories/accountRepository');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.accountRepository = new AccountRepository();
  }

  async register(email, password, name) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create(email, hashedPassword, name);

    // Create account for user
    const accountNumber = this.generateAccountNumber();
    await this.accountRepository.create(user.id, accountNumber);

    const token = this.generateToken(user.id, user.email);
    return { user, token };
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const token = this.generateToken(user.id, user.email);
    return { user, token };
  }

  generateToken(userId, email) {
    return jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
}

module.exports = { UserService }; 