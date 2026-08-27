import { Server } from "socket.io";
import { verifyToken } from "@clerk/express"; // Dùng để xác thực Clerk JWT

export let io;

export function initSocket(httpServer, corsOptions) {
  io = new Server(httpServer, {
    cors: corsOptions,
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

  return io;
}
