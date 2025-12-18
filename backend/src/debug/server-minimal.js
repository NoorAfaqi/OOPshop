const app = require("./app-minimal");
const logger = require("./config/logger");

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`✅ Minimal server listening on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/health`);
  console.log(`Test: http://localhost:${PORT}/products`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
});

