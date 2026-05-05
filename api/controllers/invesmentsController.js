import dataBasePool from "../model/db.js";

const getAllInvestments = async (req, res) => {
  try {
    const getAllInvestmentsDB = `
 SELECT
    i.id AS investment_id,
    i.property_id,
    i.investor_id,
    i.invested_amount,
    i.perf_return,
    p.property_name,
    inv.name AS investor_name,
    COALESCE(ev.events, '[]'::json) AS events
FROM investments i
JOIN properties p ON i.property_id = p.id
JOIN investors inv ON i.investor_id = inv.id
LEFT JOIN (
    SELECT
        investment_id,
        json_agg(
            json_build_object(
                'id', id,
                'event_type', event_type,
                'event_amount', event_amount,
                'date', event_date,
                'from_date', from_date,
                'to_date', to_date
            )
        ) AS events
    FROM events
    GROUP BY investment_id
) ev ON ev.investment_id = i.id`;

    const result = await dataBasePool.query(getAllInvestmentsDB);
    res.json(result.rows);
  } catch (error) {
    console.log(error);
  }
};

export { getAllInvestments };
