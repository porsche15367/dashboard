#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

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

next.on("close", (code) => {});

next.on("error", (err) => {});

// Handle process termination
process.on("SIGINT", () => {
  next.kill("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  next.kill("SIGTERM");
  process.exit(0);
});
