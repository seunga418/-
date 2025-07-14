import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import { storage } from "./storage";
import { generateExcuse } from "./services/openai";
import { excuseRequestSchema, insertExcuseSchema } from "@shared/schema";

// Session middleware setup
function setupSession(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));
}

// Auth middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  setupSession(app);

  // Auth routes
  app.post('/api/auth/signup', async (req: any, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "모든 필드를 입력해주세요." });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        passwordHash,
      });

      res.status(201).json({ 
        message: "회원가입이 완료되었습니다.",
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
      }

      // Set session
      req.session.userId = user.id;

      res.json({ 
        message: "로그인 성공",
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃 실패" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "로그아웃 성공" });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "사용자 정보를 가져오는데 실패했습니다." });
    }
  });
  
  // Generate excuse endpoint (public access)
  app.post("/api/generate-excuse", async (req: any, res) => {
    try {
      const validatedData = excuseRequestSchema.parse(req.body);
      const userId = req.session?.userId;
      
      // Generate excuse using OpenAI
      const generatedExcuse = await generateExcuse(validatedData);
      
      // Save to storage
      const excuse = await storage.createExcuse({
        category: generatedExcuse.category,
        tone: generatedExcuse.tone,
        content: generatedExcuse.excuse,
        userInput: validatedData.userInput,
        isBookmarked: 0,
      }, userId);

      // Increment usage count
      await storage.incrementUsageCount(userId);

      res.json({
        id: excuse.id,
        excuse: excuse.content,
        category: excuse.category,
        tone: excuse.tone,
      });
    } catch (error) {
      console.error("Error generating excuse:", error);
      res.status(500).json({ 
        message: "핑계 생성에 실패했습니다. 다시 시도해주세요." 
      });
    }
  });

  // Get bookmarked excuses (public access)
  app.get("/api/excuses/bookmarked", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const excuses = await storage.getBookmarkedExcuses(userId);
      res.json(excuses);
    } catch (error) {
      console.error("Error fetching bookmarked excuses:", error);
      res.status(500).json({ 
        message: "저장된 핑계를 가져오는데 실패했습니다." 
      });
    }
  });

  // Get recent excuses (public access)
  app.get("/api/excuses/recent", async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.session?.userId;
      const excuses = await storage.getRecentExcuses(limit, userId);
      res.json(excuses);
    } catch (error) {
      console.error("Error fetching recent excuses:", error);
      res.status(500).json({ 
        message: "최근 핑계를 가져오는데 실패했습니다." 
      });
    }
  });

  // Bookmark/unbookmark excuse
  app.patch("/api/excuses/:id/bookmark", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { bookmarked } = req.body;
      
      let excuse;
      if (bookmarked) {
        excuse = await storage.bookmarkExcuse(id);
      } else {
        excuse = await storage.unbookmarkExcuse(id);
      }

      if (!excuse) {
        return res.status(404).json({ message: "핑계를 찾을 수 없습니다." });
      }

      res.json(excuse);
    } catch (error) {
      console.error("Error updating bookmark:", error);
      res.status(500).json({ 
        message: "북마크 업데이트에 실패했습니다." 
      });
    }
  });

  // Clear excuses endpoint (requires auth or allows public for guest users)
  app.delete("/api/excuses/clear", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      await storage.clearUserExcuses(userId);
      res.json({ message: "핑계 기록이 초기화되었습니다." });
    } catch (error) {
      console.error("Error clearing excuses:", error);
      res.status(500).json({ 
        message: "핑계 기록 초기화에 실패했습니다." 
      });
    }
  });

  // Get current week usage stats (public access)
  app.get("/api/usage/current-week", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const stats = await storage.getCurrentWeekUsage(userId);
      res.json({
        count: stats?.count || 0,
        lastUsed: stats?.lastUsed || null,
        warning: (stats?.count || 0) >= 3
      });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ 
        message: "사용 통계를 가져오는데 실패했습니다." 
      });
    }
  });

  // Get usage history (public access)
  app.get("/api/usage/history", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const history = await storage.getUsageHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching usage history:", error);
      res.status(500).json({ 
        message: "사용 기록을 가져오는데 실패했습니다." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
