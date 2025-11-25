
import { User, UserRole, ResourceProgress } from '../types';

const KEYS = {
  USERS: 'grameen_users',
  SESSION: 'grameen_session',
  PROGRESS: 'grameen_progress'
};

// Internal type for stored user with password
interface StoredUser extends User {
  passwordHash: string; // Simulating a hash
}

// Simulating network delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  private getUsers(): StoredUser[] {
    const usersJson = localStorage.getItem(KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: StoredUser[]) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  private hashPassword(password: string): string {
    // In a real app, use bcrypt. Here we just base64 encode for simple obfuscation.
    return btoa(password);
  }

  async register(name: string, email: string, password: string, village: string): Promise<User> {
    await delay(800);
    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error("User with this email already exists.");
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email,
      village,
      role: UserRole.CITIZEN,
      passwordHash: this.hashPassword(password)
    };

    users.push(newUser);
    this.saveUsers(users);
    this.createSession(newUser); // Auto login
    return this.sanitizeUser(newUser);
  }

  async login(email: string, password: string): Promise<User> {
    await delay(800);
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.passwordHash === this.hashPassword(password));

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    this.createSession(user);
    return this.sanitizeUser(user);
  }

  logout() {
    localStorage.removeItem(KEYS.SESSION);
  }

  getSession(): User | null {
    const sessionJson = localStorage.getItem(KEYS.SESSION);
    return sessionJson ? JSON.parse(sessionJson) : null;
  }

  private createSession(user: StoredUser) {
    const cleanUser = this.sanitizeUser(user);
    localStorage.setItem(KEYS.SESSION, JSON.stringify(cleanUser));
  }

  private sanitizeUser(user: StoredUser): User {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  // Progress Persistence
  getUserProgress(userId: string): Record<string, ResourceProgress> {
    const allProgress = JSON.parse(localStorage.getItem(KEYS.PROGRESS) || '{}');
    return allProgress[userId] || {};
  }

  saveUserProgress(userId: string, resourceId: string, progressData: Partial<ResourceProgress>) {
    const allProgress = JSON.parse(localStorage.getItem(KEYS.PROGRESS) || '{}');
    
    if (!allProgress[userId]) {
      allProgress[userId] = {};
    }

    allProgress[userId][resourceId] = {
      ...allProgress[userId][resourceId],
      ...progressData,
      resourceId
    };

    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(allProgress));
  }
}

export const db = new DatabaseService();
