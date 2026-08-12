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

  const getAllData = `
  SELECT 
  investments.id AS investment_id, 
  investments.perf_return,
  investments.invested_amount,
  p.property_name,
  p.purchase_price,
  p.closing_date,
  i.name
  FROM investments
  INNER JOIN properties p
  ON investments.property_id = p.id
  INNER JOIN investors i
  ON investments.investor_id = i.id
  WHERE investments.property_id = $1 AND investments.investor_id = $2
  `;

  try {
    const response = await dataBasePool.query(getAllData, [
      propertyId,
      investorId,
    ]);

    return res.json(response.rows);
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

const updateInvestorField = async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  try {
    const result = await dataBasePool.query(
      `UPDATE investors
      SET ${field} = $1
      WHERE id = $2
      RETURNING *; `,
      [value, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

export { addingInvestorToProp, getInvestorByID, updateInvestorField };
