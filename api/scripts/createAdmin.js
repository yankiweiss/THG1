import bcrypt from "bcryptjs";
import dataBasePool from "../model/db.js";

const [email, password] = process.argv.slice(2);

if (!email || !password || password.length < 12) {
  console.error(
    "Usage: node scripts/createAdmin.js <email> <password (12+ chars)>",
  );
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 12);
  const result = await dataBasePool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     RETURNING id, email, role`,
    [email.toLowerCase().trim(), hash],
  );
  console.log("Admin created:", result.rows[0]);
} catch (error) {
  console.error("FAILED:", error.message);
} finally {
  await dataBasePool.end();
}
