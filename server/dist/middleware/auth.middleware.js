"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const protect = (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};
exports.protect = protect;
