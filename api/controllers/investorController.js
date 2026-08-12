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
  i.name AS investor_name,
  investments.id AS investment_id, 
  investments.perf_return,
  investments.invested_amount,
  p.property_name,
  p.purchase_price,
  to_char(p.closing_date, 'YYYY-MM-DD') AS closing_date,

  COALESCE(
    json_agg(
      json_build_object(
        'id', e.id,
        'event_date', e.event_date,
        'event_amount', e.event_amount,
        'event_type', e.event_type,
        'notes', e.notes,
        'from', e.from,
        'to', e.to
      )
      ORDER BY e.event_date
    ) FILTER (WHERE e.id IS NOT NULL),
    '[]'
  ) AS events

  FROM investments

  INNER JOIN properties p
  ON investments.property_id = p.id

  LEFT JOIN events e
  ON e.investment_id = investments.id

  INNER JOIN investors i
  ON investments.investor_id = i.id
  WHERE investments.property_id = $1 
  AND investments.investor_id = $2

  GROUP BY
  i.name,
  investments.id,
  investments.perf_return,
  investments.invested_amount,
  p.property_name,
  p.purchase_price,
  p.closing_date::date;
  `;

  try {
    const response = await dataBasePool.query(getAllData, [
      propertyId,
      investorId,
    ]);

    return res.json(response.rows[0]);
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

const getAllDeals = async (req, res) => {
  const getAllInvestments = `
  
  SELECT
  inv.invested_amount,
  inv.perf_return,
  inv.property_id,
  inv.investor_id,
  i.name AS investor_name,
  to_char(p.closing_date, 'YYYY-MM-DD') AS closing_date,
  p.property_name
  

  FROM investments inv

  INNER JOIN properties p 
  ON inv.property_id = p.id
  
  INNER JOIN investors i
  ON inv.investor_id = i.id`;

  try {
    const result = await dataBasePool.query
    (
      getAllInvestments
    )

    return res.json(result.rows)
  } catch (error) {
    
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

export { addingInvestorToProp, getInvestorByID, updateInvestorField, getAllDeals };
