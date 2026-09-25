"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.toggleUserStatus = exports.updateUserRole = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const user_service_1 = require("../services/user.service");
const getUsers = async (req, res) => {
    try {
        const users = await user_service_1.userService.getAllUsers();
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_service_1.userService.getUserById(String(id));
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { name, username, email, role } = req.body;
        if (!name || !username || !email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        const user = await user_service_1.userService.createUser({ name, username, email, role });
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createUser = createUser;
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role is required'
            });
        }
        const user = await user_service_1.userService.updateUserRole(String(id), role);
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update user role',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateUserRole = updateUserRole;
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_service_1.userService.toggleUserStatus(String(id));
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to toggle user status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.toggleUserStatus = toggleUserStatus;
const getUserStats = async (req, res) => {
    try {
        const stats = await user_service_1.userService.getUserStats();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getUserStats = getUserStats;
