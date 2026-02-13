import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth.validator';
import { AuthResponse } from '../interfaces/auth.interface';

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error('User with this username already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      username: data.username,
      password: hashedPassword,
    });

    const token = generateToken({ id: user._id });

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByUsername(data.username);
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({ id: user._id });

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }

  getGoogleAuthUrl(): string {
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });
  }

  async googleCallback(code: string): Promise<AuthResponse> {
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.email) {
      throw new Error('Google account has no email');
    }

    let user = await userRepository.findByEmail(googleUser.email);

    if (!user) {
      // Auto-generate a unique username
      let baseUsername = googleUser.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      if (baseUsername.length < 3) baseUsername = 'user_' + baseUsername;
      
      let uniqueUsername = baseUsername;
      let userExists = await userRepository.findByUsername(uniqueUsername);
      let count = 1;
      while (userExists) {
        uniqueUsername = `${baseUsername}_${count}`;
        userExists = await userRepository.findByUsername(uniqueUsername);
        count++;
      }

      user = await userRepository.create({
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        username: uniqueUsername,
        avatar: googleUser.picture || '',
        authProvider: 'google',
        googleId: googleUser.id || '',
      });
    } else if (user.googleId !== googleUser.id) {
      user.googleId = googleUser.id || '';
      user.authProvider = 'google';
      if (googleUser.picture && !user.avatar) {
        user.avatar = googleUser.picture;
      }
      await user.save();
    }

    const token = generateToken({ id: user._id });
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<any> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.username) {
      const existingUser = await userRepository.findByUsername(data.username);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error('Username is already taken');
      }
      user.username = data.username;
    }

    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error('Email is already taken');
      }
      user.email = data.email;
    }

    if (data.name) {
      user.name = data.name;
    }

    if (data.password) {
      user.password = await hashPassword(data.password);
    }

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}

export const authService = new AuthService();
