const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

/* ROUTES */
const adminRoutes = require("./routes/adminRoutes");
const batchRoutes = require("./routes/batchRoutes");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const aiRoutes = require("./routes/aiRoutes");
const studentRoutes = require("./routes/studentRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");

const app = express();

/* =========================
   Database (MongoDB Atlas)
========================= */
connectDB();

/* =========================
   Middleware
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cprs-psi.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   Routes
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/batch", batchRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/student", studentProfileRoutes);
app.use("/api/institution", institutionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/superadmin", superAdminRoutes);

/* =========================
   HTTP + Socket.IO
========================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://cprs-psi.vercel.app"
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

/* Make io accessible in routes */
app.set("io", io);

/* =========================
   Start Server
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
