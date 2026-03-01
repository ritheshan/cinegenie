import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator';
import { userRepository } from '../repositories/user.repository';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || error });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message || error });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      // req.user is set by the authMiddleware
      const user = await userRepository.findById((req as any).user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      const userObj = user.toObject();
      delete userObj.password;
      
      res.json({ success: true, data: userObj });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }

  async getGoogleAuthUrl(req: Request, res: Response) {
    try {
      const url = authService.getGoogleAuthUrl();
      res.json({ success: true, url });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Server Error' });
    }
  }

  async googleCallback(req: Request, res: Response) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, error: 'No authorization code provided' });
      }
      const result = await authService.googleCallback(code);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Google authentication failed' });
    }
  }

  async googleCallbackGet(req: Request, res: Response) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.redirect(`${clientUrl}/login?error=NoCodeProvided`);
      }
      
      // Exchange code for token and user
      const result = await authService.googleCallback(code);
      
      // Redirect the user back to the React frontend with the token securely in the URL query string
      res.redirect(`${clientUrl}/oauth-callback?token=${result.token}`);
    } catch (error: any) {
      res.redirect(`${clientUrl}/login?error=GoogleAuthFailed`);
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const validatedData = updateProfileSchema.parse(req.body);
      const result = await authService.updateProfile(userId, validatedData);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || error });
    }
  }
}

export const authController = new AuthController();
