"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
class AuthService {
    async register(data) {
        const existingUser = await user_repository_1.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const hashedPassword = await (0, hash_1.hashPassword)(data.password);
        const user = await user_repository_1.userRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        });
        const token = (0, jwt_1.generateToken)({ id: user._id });
        const userObj = user.toObject();
        delete userObj.password;
        return { user: userObj, token };
    }
    async login(data) {
        const user = await user_repository_1.userRepository.findByEmail(data.email);
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await (0, hash_1.comparePassword)(data.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = (0, jwt_1.generateToken)({ id: user._id });
        const userObj = user.toObject();
        delete userObj.password;
        return { user: userObj, token };
    }
    getGoogleAuthUrl() {
        const { google } = require('googleapis');
        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            prompt: 'consent',
        });
    }
    async googleCallback(code) {
        const { google } = require('googleapis');
        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: googleUser } = await oauth2.userinfo.get();
        if (!googleUser.email) {
            throw new Error('Google account has no email');
        }
        let user = await user_repository_1.userRepository.findByEmail(googleUser.email);
        if (!user) {
            user = await user_repository_1.userRepository.create({
                name: googleUser.name || googleUser.email.split('@')[0],
                email: googleUser.email,
                avatar: googleUser.picture || '',
                authProvider: 'google',
                googleId: googleUser.id || '',
            });
        }
        else if (user.googleId !== googleUser.id) {
            user.googleId = googleUser.id || '';
            user.authProvider = 'google';
            if (googleUser.picture && !user.avatar) {
                user.avatar = googleUser.picture;
            }
            await user.save();
        }
        const token = (0, jwt_1.generateToken)({ id: user._id });
        const userObj = user.toObject();
        delete userObj.password;
        return { user: userObj, token };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
