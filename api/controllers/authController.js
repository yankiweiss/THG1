import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dataBasePool from "../model/db.js";

// Used so a wrong email takes as long to reject as a wrong password
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

const login = async (req, res) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    return res.status(500).json({ error: "Server configuration error." });
  }

  const { email, password, role } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !["admin", "investor"].includes(role)
  ) {
    return res
      .status(400)
      .json({ error: "Email, password and role are required." });
  }

  try {
    const result = await dataBasePool.query(
      `SELECT id, email, password_hash, role, investor_id
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()],
    );

    const user = result.rows[0];
    const passwordOk = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_HASH,
    );

    if (!user || !passwordOk || user.role !== role) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, investor_id: user.investor_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        investor_id: user.investor_id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default login;