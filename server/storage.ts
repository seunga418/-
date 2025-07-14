import { 
  users, 
  excuses, 
  usageStats, 
  type User, 
  type UpsertUser, 
  type Excuse, 
  type InsertExcuse, 
  type UsageStats, 
  type InsertUsageStats 
} from "@shared/schema";

export interface IStorage {
  // User operations for local auth
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; email: string; passwordHash: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Excuse operations
  createExcuse(excuse: InsertExcuse, userId?: string): Promise<Excuse>;
  getExcuse(id: number): Promise<Excuse | undefined>;
  getBookmarkedExcuses(userId?: string): Promise<Excuse[]>;
  getRecentExcuses(limit?: number, userId?: string): Promise<Excuse[]>;
  bookmarkExcuse(id: number): Promise<Excuse | undefined>;
  unbookmarkExcuse(id: number): Promise<Excuse | undefined>;
  clearUserExcuses(userId?: string): Promise<void>;
  
  // Usage stats operations
  getCurrentWeekUsage(userId?: string): Promise<UsageStats | undefined>;
  incrementUsageCount(userId?: string): Promise<UsageStats>;
  getUsageHistory(userId?: string): Promise<UsageStats[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private excuses: Map<number, Excuse>;
  private usageStats: Map<string, UsageStats>;
  private currentExcuseId: number;
  private currentUsageId: number;

  constructor() {
    this.users = new Map();
    this.excuses = new Map();
    this.usageStats = new Map();
    this.currentExcuseId = 1;
    this.currentUsageId = 1;
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const usersArray = Array.from(this.users.values());
    return usersArray.find(user => user.username === username);
  }

  async createUser(userData: { username: string; email: string; passwordHash: string }): Promise<User> {
    const userId = Date.now().toString(); // Simple ID generation
    const user: User = {
      id: userId,
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userId, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  private getCurrentWeek(): string {
    const now = new Date();
    const year = now.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-${weekNumber.toString().padStart(2, '0')}`;
  }

  async createExcuse(insertExcuse: InsertExcuse, userId?: string): Promise<Excuse> {
    const id = this.currentExcuseId++;
    const excuse: Excuse = {
      id,
      userId: userId || null,
      category: insertExcuse.category,
      tone: insertExcuse.tone,
      content: insertExcuse.content,
      userInput: insertExcuse.userInput || null,
      createdAt: new Date(),
      isBookmarked: insertExcuse.isBookmarked || 0,
    };
    this.excuses.set(id, excuse);
    return excuse;
  }

  async getExcuse(id: number): Promise<Excuse | undefined> {
    return this.excuses.get(id);
  }

  async getBookmarkedExcuses(userId?: string): Promise<Excuse[]> {
    return Array.from(this.excuses.values())
      .filter(excuse => excuse.isBookmarked === 1 && (!userId || excuse.userId === userId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentExcuses(limit: number = 10, userId?: string): Promise<Excuse[]> {
    return Array.from(this.excuses.values())
      .filter(excuse => !userId || excuse.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async clearUserExcuses(userId?: string): Promise<void> {
    if (userId) {
      const toDelete: number[] = [];
      this.excuses.forEach((excuse, id) => {
        if (excuse.userId === userId) {
          toDelete.push(id);
        }
      });
      toDelete.forEach(id => this.excuses.delete(id));
    } else {
      this.excuses.clear();
    }
  }

  async bookmarkExcuse(id: number): Promise<Excuse | undefined> {
    const excuse = this.excuses.get(id);
    if (excuse) {
      const updated = { ...excuse, isBookmarked: 1 };
      this.excuses.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async unbookmarkExcuse(id: number): Promise<Excuse | undefined> {
    const excuse = this.excuses.get(id);
    if (excuse) {
      const updated = { ...excuse, isBookmarked: 0 };
      this.excuses.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getCurrentWeekUsage(userId?: string): Promise<UsageStats | undefined> {
    const currentWeek = this.getCurrentWeek();
    const key = userId ? `${currentWeek}-${userId}` : currentWeek;
    return this.usageStats.get(key);
  }

  async incrementUsageCount(userId?: string): Promise<UsageStats> {
    const currentWeek = this.getCurrentWeek();
    const key = userId ? `${currentWeek}-${userId}` : currentWeek;
    const existing = this.usageStats.get(key);
    
    if (existing) {
      const updated: UsageStats = {
        ...existing,
        count: existing.count + 1,
        lastUsed: new Date(),
      };
      this.usageStats.set(key, updated);
      return updated;
    } else {
      const newStats: UsageStats = {
        id: this.currentUsageId++,
        userId: userId || null,
        week: currentWeek,
        count: 1,
        lastUsed: new Date(),
      };
      this.usageStats.set(key, newStats);
      return newStats;
    }
  }

  async getUsageHistory(userId?: string): Promise<UsageStats[]> {
    return Array.from(this.usageStats.values())
      .filter(stats => !userId || stats.userId === userId)
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }
}

export const storage = new MemStorage();
