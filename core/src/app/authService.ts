import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../core/user';

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'supersecret';
  private jwtExpires = '15m';

  async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: User): string {
    const payload = { sub: user.id, role: user.role, permissions: user.permissions };
  const options: SignOptions = { expiresIn: this.jwtExpires as any };
  return jwt.sign(payload, this.jwtSecret, options);
  }

  verifyToken(token: string) {
    return jwt.verify(token, this.jwtSecret);
  }
}
