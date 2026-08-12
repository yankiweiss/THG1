import dataBasePool from "../model/db.js";

const postAEvent = async (req, res) => {
  console.log("this was hit");
  console.log(req.body)
  const {
    event_date,
    event_type,
    event_amount,
    notes,
    propertyId,
    investorId,
    to,
    from,
  } = req.body;

  // Normalize optional date fields so database receives null instead of undefined
  const eventDate = event_date ?? null;
  const fromDate = from ?? null;
  const toDate = to ?? null;

  const selectInvestmentID = await dataBasePool.query(
    `
      SELECT id
FROM investments
WHERE investor_id = $1 AND property_id = $2;`,
    [investorId, propertyId],
  );

  const investmentID = selectInvestmentID.rows[0].id;

  const postEvent = `
  INSERT INTO events (event_date, event_type, event_amount, notes, investment_id, "to", "from") VALUES($1, $2, $3, $4, $5, $6, $7)
  RETURNING *`;

  const results = await dataBasePool.query(postEvent, [
    eventDate,
    event_type,
    event_amount,
    notes,
    investmentID,
    toDate,
    fromDate,
  ]);

  res.json(results.rows[0]);
};

export default postAEvent;
