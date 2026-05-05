import dataBasePool from "../model/db.js";

const addingInvestorToProp = async (req, res) => {
  const { investor_name, invested_amount, perf_return, property_id } = req.body;

  try {
    const investorResults = await dataBasePool.query(
      `INSERT INTO investors (name)
       VALUES ($1)
       RETURNING id`,
      [investor_name]
    )

    const investorID = investorResults.rows[0].id;

    await dataBasePool.query(
      `INSERT INTO investments 
      (investor_id, property_id, invested_amount, perf_return) VALUES ($1, $2, $3, $4)`,
       [investorID, property_id, invested_amount, perf_return]
    )
    res.json( results.rows[0] );
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }

};

const getInvestorByID = async (req, res) => {
  const { propertyId, investorId } = req.params;

  try {
    // 1️⃣ Get investor info
    const investorResult = await dataBasePool.query(
      `SELECT * FROM investors WHERE id = $1`,
      [investorId]
    );
    if (investorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Investor not found!' });
    }
    const investor = investorResult.rows[0];

    // 2️⃣ Get all investments for this investor for this property
    const investmentsResult = await dataBasePool.query(
      `SELECT * FROM investments WHERE investor_id = $1 AND property_id = $2`,
      [investorId, propertyId]
    );

    const investments = investmentsResult.rows[0];

    // 3️⃣ Get all events linked to each investment
    // Map each investment to its events
    
    let events = [];
   
      const eventsResult = await dataBasePool.query(
        `SELECT * FROM events WHERE investment_id = $1`,
        [investments.id]
      );
      events = eventsResult.rows;
    

    // Attach events to corresponding investment
   

    // 4️⃣ Get property info
    const propertyResult = await dataBasePool.query(
      `SELECT * FROM properties WHERE id = $1`,
      [propertyId]
    );
    const property = propertyResult.rows[0] || null;

    // 5️⃣ Return combined data
    res.json({
      investor,
      property,
      investments,
      events
      
    });
    

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInvestorField = async (req, res) => {
  const {id }  = req.params;
  const {field, value } = req.body;

  try {

    const result = await dataBasePool.query (
      `UPDATE investors
      SET ${field} = $1
      WHERE id = $2
      RETURNING *; `, 
      [value , id]

    )
    
    res.json(result.rows[0]);
    
  } catch (err) {
     console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
}
   
  



export {
    addingInvestorToProp, getInvestorByID, updateInvestorField
}