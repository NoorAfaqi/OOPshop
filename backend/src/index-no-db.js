const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ message: "Works without database" });
});

app.listen(4000, () => {
  console.log("Server without DB listening on 4000");
});

