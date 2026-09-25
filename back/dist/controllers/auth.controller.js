"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const register = async (req, res) => {
    try {
        const user = await (0, auth_service_1.registerUser)(req.body.username, req.body.password);
        res.status(201).json({ success: true, user });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const result = await (0, auth_service_1.loginUser)(req.body.username, req.body.password);
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        res.status(401).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.login = login;
