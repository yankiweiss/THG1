import dataBasePool from "../model/db.js";

const getMyInvestment = async (req, res) => {
  if (req.user?.role !== "investor") {
    return res.status(403).json({ error: "Investors only." });
  }

  try {
    const result = await dataBasePool.query(
      `SELECT property_id, investor_id
       FROM investments
       WHERE investor_id = $1
       LIMIT 1`,
      [req.user.investor_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No investment found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default getMyInvestment;
