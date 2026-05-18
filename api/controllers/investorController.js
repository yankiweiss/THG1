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
    const response = await dataBasePool.query(
      `
      SELECT inv.perf_return,inv.invested_amount,
  i.name AS name,
  p.property_name AS property_name,
  p.secure_url AS image_url,
  p.closing_date AS closing_date,
  json_agg(json_build_object('event_date', e.event_date, 'event_amount', e.event_amount, 'event_type', e.event_type, 'from',e.from, 'to', e.to)) 
  FILTER (WHERE e.id IS NOT NULL) AS events
  FROM investments inv 
  INNER JOIN investors i 
  ON i.id = inv.investor_id
  INNER JOIN properties p 
  ON p.id = inv.property_id 
  LEFT JOIN events e 
  ON e.investment_id = inv.id 
  WHERE inv.investor_id = $1 
  AND inv.property_id = $2
  GROUP BY inv.id, i.name, p.property_name, p.secure_url, p.closing_date
  `,
      [investorId, propertyId],
    );

    return res.json(response.rows[0]);
  } catch (error) {
    console.log(error);
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
