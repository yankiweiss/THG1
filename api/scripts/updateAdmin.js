import bcrypt from "bcryptjs";
import dataBasePool from "../model/db.js";

const [currentEmail, newEmail, newPassword] = process.argv.slice(2);

if (!currentEmail || !newEmail || !newPassword || newPassword.length < 12) {
  console.error(
    "Usage: node scripts/updateAdmin.js <current email> <new email> <new password (12+ chars)>",
  );
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(newPassword, 12);
  const result = await dataBasePool.query(
    `UPDATE users
     SET email = $2, password_hash = $3
     WHERE email = $1 AND role = 'admin'
     RETURNING id, email, role`,
    [currentEmail.toLowerCase().trim(), newEmail.toLowerCase().trim(), hash],
  );

  if (result.rows.length === 0) {
    console.error("No admin found with that current email. Nothing changed.");
  } else {
    console.log("Admin updated:", result.rows[0]);
  }
} catch (error) {
  console.error("FAILED:", error.message);
} finally {
  await dataBasePool.end();
}
