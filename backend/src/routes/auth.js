const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM managers WHERE email = ?", [
      email,
    ]);
    const manager = rows[0];

    if (!manager) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordOk = await bcrypt.compare(
      password,
      manager.password_hash || ""
    );
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: manager.id, email: manager.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.json({
      token,
      manager: {
        id: manager.id,
        email: manager.email,
        first_name: manager.first_name,
        last_name: manager.last_name,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;


