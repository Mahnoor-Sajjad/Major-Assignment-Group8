// Authentication Module - Handles user registration, login, and session management

class AuthManager {
    constructor() {
        this.usersFile = '../data/users.txt.txt';
        this.currentUser = this.getCurrentUser();
    }

    // Initialize users file if empty
    async initUsersFile() {
        try {
            const response = await fetch(this.usersFile);
            const text = await response.text();
            if (!text.trim()) {
                await this.saveUsers([]);
            }
        } catch (error) {
            // File doesn't exist, create empty array
            await this.saveUsers([]);
        }
    }

    // Read users from file
    async getUsers() {
        try {
            const response = await fetch(this.usersFile);
            const text = await response.text();
            if (text && text.trim()) {
                const users = JSON.parse(text);
                localStorage.setItem('lms_users', JSON.stringify(users));
                return users;
            }
        } catch (error) {
            console.warn('Falling back to localStorage for users:', error);
        }

        try {
            const stored = localStorage.getItem('lms_users');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error parsing users from localStorage:', error);
            return [];
        }
    }

    // Save users to file
    async saveUsers(users) {
        // In a real implementation, this would use a server endpoint
        // For client-side only, we'll use localStorage as fallback
        localStorage.setItem('lms_users', JSON.stringify(users));
        return true;
    }

    // Register a new user
    async register(userData) {
        const { username, email, password, role = 'student' } = userData;
        
        // Validate input
        if (!username || username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters' };
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { success: false, message: 'Invalid email address' };
        }
        if (!password || password.length < 8) {
            return { success: false, message: 'Password must be at least 8 characters' };
        }

        const users = await this.getUsers();
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Username already taken' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password, // In production, this should be hashed
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await this.saveUsers(users);

        return { success: true, message: 'Registration successful', user: newUser };
    }

    // Login user
    async login(email, password) {
        const users = await this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Store current user in session
        this.setCurrentUser(user);
        return { success: true, message: 'Login successful', user };
    }

    // Logout user
    logout() {
        localStorage.removeItem('lms_current_user');
        this.currentUser = null;
        return { success: true, message: 'Logged out successfully' };
    }

    // Get current logged-in user
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('lms_current_user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            return null;
        }
    }

    // Set current user
    setCurrentUser(user) {
        localStorage.setItem('lms_current_user', JSON.stringify(user));
        this.currentUser = user;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user is teacher
    isTeacher() {
        return this.currentUser && this.currentUser.role === 'teacher';
    }

    // Check if user is student
    isStudent() {
        return this.currentUser && this.currentUser.role === 'student';
    }

    // Get user by ID
    async getUserById(userId) {
        const users = await this.getUsers();
        return users.find(u => u.id === userId);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

