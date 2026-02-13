"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const User_model_1 = require("../models/User.model");
class UserRepository {
    async create(userData) {
        const user = new User_model_1.User(userData);
        return user.save();
    }
    async findByEmail(email) {
        return User_model_1.User.findOne({ email });
    }
    async findById(id) {
        return User_model_1.User.findById(id);
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
