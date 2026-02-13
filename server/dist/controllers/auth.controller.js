"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
const user_repository_1 = require("../repositories/user.repository");
class AuthController {
    async register(req, res) {
        try {
            const validatedData = auth_validator_1.registerSchema.parse(req.body);
            const result = await auth_service_1.authService.register(validatedData);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message || error });
        }
    }
    async login(req, res) {
        try {
            const validatedData = auth_validator_1.loginSchema.parse(req.body);
            const result = await auth_service_1.authService.login(validatedData);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(401).json({ success: false, error: error.message || error });
        }
    }
    async getMe(req, res) {
        try {
            // req.user is set by the authMiddleware
            const user = await user_repository_1.userRepository.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            const userObj = user.toObject();
            delete userObj.password;
            res.json({ success: true, data: userObj });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
    async getGoogleAuthUrl(req, res) {
        try {
            const url = auth_service_1.authService.getGoogleAuthUrl();
            res.json({ success: true, url });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Server Error' });
        }
    }
    async googleCallback(req, res) {
        try {
            const { code } = req.body;
            if (!code) {
                return res.status(400).json({ success: false, error: 'No authorization code provided' });
            }
            const result = await auth_service_1.authService.googleCallback(code);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Google authentication failed' });
        }
    }
    async googleCallbackGet(req, res) {
        try {
            const code = req.query.code;
            if (!code) {
                return res.redirect('http://localhost:5173/login?error=NoCodeProvided');
            }
            // Exchange code for token and user
            const result = await auth_service_1.authService.googleCallback(code);
            // Redirect the user back to the React frontend with the token securely in the URL query string
            res.redirect(`http://localhost:5173/oauth-callback?token=${result.token}`);
        }
        catch (error) {
            res.redirect('http://localhost:5173/login?error=GoogleAuthFailed');
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
