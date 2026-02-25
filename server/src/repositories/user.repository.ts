import { User, IUserDocument } from '../models/User.model';
import { IUser } from '../interfaces/auth.interface';

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUserDocument> {
    const user = new User(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email });
  }

  async findByUsername(username: string): Promise<IUserDocument | null> {
    return User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }
}

export const userRepository = new UserRepository();
