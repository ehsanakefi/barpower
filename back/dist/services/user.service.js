"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
// Mock user data
let mockUsers = [
    {
        id: '1',
        name: 'احمد محمدی',
        username: 'a.mohammadi',
        email: 'a.mohammadi@example.com',
        role: 'ADMIN',
        status: 'active',
        lastLogin: '1403/11/19 - 14:30',
        createdAt: '1403/01/01'
    },
    {
        id: '2',
        name: 'سارا احمدی',
        username: 's.ahmadi',
        email: 's.ahmadi@example.com',
        role: 'EDITOR',
        status: 'active',
        lastLogin: '1403/11/19 - 13:15',
        createdAt: '1403/02/10'
    },
    {
        id: '3',
        name: 'علی کریمی',
        username: 'a.karimi',
        email: 'a.karimi@example.com',
        role: 'VIEWER',
        status: 'active',
        lastLogin: '1403/11/19 - 12:45',
        createdAt: '1403/03/05'
    },
    {
        id: '4',
        name: 'مهدی رضایی',
        username: 'm.rezaei',
        email: 'm.rezaei@example.com',
        role: 'EDITOR',
        status: 'active',
        lastLogin: '1403/11/18 - 16:20',
        createdAt: '1403/04/12'
    },
    {
        id: '5',
        name: 'فاطمه نوری',
        username: 'f.nouri',
        email: 'f.nouri@example.com',
        role: 'VIEWER',
        status: 'inactive',
        lastLogin: '1403/11/10 - 09:30',
        createdAt: '1403/05/20'
    },
    {
        id: '6',
        name: 'حسین صادقی',
        username: 'h.sadeghi',
        email: 'h.sadeghi@example.com',
        role: 'ADMIN',
        status: 'active',
        lastLogin: '1403/11/19 - 11:00',
        createdAt: '1403/06/15'
    }
];
class UserService {
    async getAllUsers() {
        return mockUsers;
    }
    async getUserById(id) {
        const user = mockUsers.find(u => u.id === id);
        return user || null;
    }
    async createUser(data) {
        const newUser = {
            id: String(mockUsers.length + 1),
            name: data.name,
            username: data.username,
            email: data.email,
            role: data.role,
            status: 'active',
            lastLogin: 'هرگز',
            createdAt: new Date().toLocaleDateString('fa-IR')
        };
        mockUsers.push(newUser);
        return newUser;
    }
    async updateUserRole(id, role) {
        const user = mockUsers.find(u => u.id === id);
        if (!user) {
            throw new Error('User not found');
        }
        user.role = role;
        return user;
    }
    async toggleUserStatus(id) {
        const user = mockUsers.find(u => u.id === id);
        if (!user) {
            throw new Error('User not found');
        }
        user.status = user.status === 'active' ? 'inactive' : 'active';
        return user;
    }
    async getUserStats() {
        const totalUsers = mockUsers.length;
        const activeUsers = mockUsers.filter(u => u.status === 'active').length;
        const adminUsers = mockUsers.filter(u => u.role === 'ADMIN').length;
        const inactiveUsers = mockUsers.filter(u => u.status === 'inactive').length;
        return {
            totalUsers,
            activeUsers,
            adminUsers,
            inactiveUsers
        };
    }
}
exports.userService = new UserService();
