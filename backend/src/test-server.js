const express = require("express");
const app = express();

app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "Simple test works" });
});

app.listen(4000, () => {
  console.log("Test server listening on port 4000");
});

