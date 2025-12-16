const express = require("express");
const app = express();

app.get("/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ message: "Works" });
});

app.listen(4000, () => {
  console.log("Minimal server on 4000");
  console.log("Test with: curl http://localhost:4000/test");
});

