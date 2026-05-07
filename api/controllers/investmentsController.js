import dataBasePool from "../model/db.js";

const getAllInvestments = async (req, res) => {
  try {
    // 1. Get base investments only (FAST)
    const investmentsQuery = `
      SELECT 
        i.id AS investment_id,
        i.property_id,
        i.investor_id,
        i.invested_amount,
        i.perf_return,
        p.property_name,
        inv.name AS investor_name
      FROM investments i
      JOIN properties p ON i.property_id = p.id
      JOIN investors inv ON i.investor_id = inv.id
      ORDER BY i.id DESC
      LIMIT 100
    `;

    const investmentsResult = await dataBasePool.query(investmentsQuery);
    const investments = investmentsResult.rows;

    if (investments.length === 0) {
      return res.json([]);
    }

    // 2. Get all related investment IDs
    const investmentIds = investments.map((i) => i.investment_id);

    // 3. Fetch events separately (FAST + indexed-friendly)
    const eventsQuery = `
      SELECT *
      FROM events
      WHERE investment_id = ANY($1)
    `;

    const eventsResult = await dataBasePool.query(eventsQuery, [
      investmentIds,
    ]);

    // 4. Group events in memory (fast, avoids SQL aggregation)
    const eventsMap = {};

    for (const event of eventsResult.rows) {
      if (!eventsMap[event.investment_id]) {
        eventsMap[event.investment_id] = [];
      }
      eventsMap[event.investment_id].push(event);
    }

    // 5. Attach events to investments
    const enriched = investments.map((inv) => ({
      ...inv,
      events: eventsMap[inv.investment_id] || [],
    }));

    return res.json(enriched);
  } catch (error) {
    console.error("Investments error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default getAllInvestments;
