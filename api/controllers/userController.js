import bcrypt from "bcryptjs";
import dataBasePool from "../model/db.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createInvestorUser = async (req, res) => {
  const { investor_id, email, password } = req.body ?? {};
  const investorId = Number(investor_id);

  if (
    !Number.isInteger(investorId) ||
    investorId < 1 ||
    typeof email !== "string" ||
    !EMAIL_PATTERN.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 72
  ) {
    return res.status(400).json({
      error:
        "A valid investor, a valid email and a password of 12 to 72 characters are required.",
    });
  }

  try {
    const investor = await dataBasePool.query(
      "SELECT id FROM investors WHERE id = $1",
      [investorId],
    );

    if (investor.rows.length === 0) {
      return res.status(404).json({ error: "Investor not found." });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await dataBasePool.query(
      `INSERT INTO users (email, password_hash, role, investor_id)
       VALUES ($1, $2, 'investor', $3)
       RETURNING id, email, role, investor_id`,
      [email.toLowerCase().trim(), hash, investorId],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "That email is already in use." });
    }
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default createInvestorUser;