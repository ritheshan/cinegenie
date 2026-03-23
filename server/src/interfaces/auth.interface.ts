export interface IUser {
  _id?: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  avatar?: string;
  authProvider?: 'local' | 'google';
  googleId?: string;
  streak: number;
  averageScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}
