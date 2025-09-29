#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting Marketplace Admin Dashboard...");
console.log("📊 Dashboard will be available at: http://localhost:3001");
console.log(
  "🔗 Make sure your backend API is running on: http://localhost:3000"
);
console.log("");

// Set environment variables
process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// Start the Next.js development server
const next = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname),
  stdio: "inherit",
  shell: true,
});

next.on("close", (code) => {
  console.log(`Dashboard process exited with code ${code}`);
});

next.on("error", (err) => {
  console.error("Failed to start dashboard:", err);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down dashboard...");
  next.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down dashboard...");
  next.kill("SIGTERM");
  process.exit(0);
});
