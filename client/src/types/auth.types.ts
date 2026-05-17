export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  avatar?: string;
  streak: number;
  averageScore: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
