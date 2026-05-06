import dataBasePool from "../model/db.js";

const addingInvestorToProp = async (req, res) => {
  const { investor_name, invested_amount, perf_return, property_id } = req.body;

  try {
    const investorResults = await dataBasePool.query(
      `INSERT INTO investors (name)
       VALUES ($1)
       RETURNING id`,
      [investor_name],
    );

    const investorID = investorResults.rows[0].id;

    const investmentResults = await dataBasePool.query(
      `INSERT INTO investments 
      (investor_id, property_id, invested_amount, perf_return) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [investorID, property_id, invested_amount, perf_return],
    );
    res.json(investmentResults.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getInvestorByID = async (req, res) => {
  const { propertyId, investorId } = req.params;

  try {
    // Investor
    const investorResult = await dataBasePool.query(
      `SELECT * FROM investors WHERE id = $1`,
      [investorId]
    );

    if (investorResult.rows.length === 0) {
      return res.status(404).json({ message: "Investor not found" });
    }

    const investor = investorResult.rows[0];

    // Investments
    const investmentsResult = await dataBasePool.query(
      `SELECT * FROM investments WHERE investor_id = $1 AND property_id = $2`,
      [investorId, propertyId]
    );

    if (investmentsResult.rows.length === 0) {
      return res.status(404).json({ message: "No investments found" });
    }

    const investment = investmentsResult.rows[0];

    // Events (safe)
    const eventsResult = await dataBasePool.query(
      `SELECT * FROM events WHERE investment_id = $1`,
      [investment.id] // 🔥 FIX: use correct column
    );

    // Property
    const propertyResult = await dataBasePool.query(
      `SELECT * FROM properties WHERE id = $1`,
      [propertyId]
    );

    return res.json({
      investor,
      property: propertyResult.rows[0] || null,
      investment,
      events: eventsResult.rows,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const allowedFields = ["name", "email", "phone"]; // ONLY allowed columns

const updateInvestorField = async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  try {
    // 1. Validate field (VERY IMPORTANT)
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: "Invalid field" });
    }

    // 2. Safe query (no injection possible)
    const query = `
      UPDATE investors
      SET ${field} = $1
      WHERE id = $2
      RETURNING *;
    `;

    const result = await dataBasePool.query(query, [value, id]);

    // 3. Handle missing row
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Investor not found" });
    }

    return res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Update failed" });
  }
};

export { addingInvestorToProp, getInvestorByID, updateInvestorField };
