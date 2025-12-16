const express = require("express");
const app = express();

app.get("/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ message: "Works on port 3001" });
});

app.listen(3001, "127.0.0.1", () => {
  console.log("Server on 127.0.0.1:3001");
});

