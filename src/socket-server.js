import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "@clerk/clerk-sdk-node"; // Dùng để xác thực Clerk JWT

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  origin: "*",
  cors: { origin: "*" },
});

// Xác thực Clerk JWT trước khi cho kết nối
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (!clerkSecret) return next(new Error("Missing Clerk Secret Key"));
  try {
    const userId = await verifyToken(token, {
      secretKey: clerkSecret,
    });
    socket.data.userId = userId.sub;
    socket.join(userId.sub); // Join vào "phòng" riêng theo userId
    next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

// Lắng nghe kết nối socket
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.data.userId);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.data.userId);
  });
});

// Export socket instance
export { io };

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () =>
  console.log(`🚀 Socket server running on port ${PORT}`)
);
