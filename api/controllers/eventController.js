import dataBasePool from "../model/db.js";

const postAEvent = async (req, res) => {
  const {
    event_date,
    event_type,
    event_amount,
    notes,
    propertyId,
    investorId,
    to_date,
    from_date,
  } = req.body;

  const selectInvestmentID = await dataBasePool.query(
    `
      SELECT id
FROM investments
WHERE investor_id = $1 AND property_id = $2;`,
    [investorId,
    propertyId]
  );

  const investmentID = selectInvestmentID.rows[0].id;

  const postEvent = `
  INSERT INTO events (event_date, event_type, event_amount, notes, investment_id, to_date, from_date) VALUES($1, $2, $3, $4, $5, $6, $7)
  RETURNING *`;

  const results = await dataBasePool.query(postEvent, [
    event_date,
    event_type,
    event_amount,
    notes,
    investmentID,
    to_date,
    from_date
  ]);

  res.json( results.rows[0] );
};

export default postAEvent;
