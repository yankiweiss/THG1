import dataBasePool from "../model/db.js";

const postAProperty = async (req, res) => {
  const { property_name, purchase_price, investors, pictures, closing_date } =
    req.body;

  const client = await dataBasePool.connect();

  try {
    await client.query("BEGIN");

    const propertyResult = await client.query(`
  INSERT INTO properties(property_name, purchase_price, secure_url, closing_date )
  VALUES($1, $2, $3, $4) RETURNING id`, [
      property_name,
      purchase_price,
      pictures,
      closing_date,
    ]);



    for (const entry of investors) {
      const {
        investor_name,
        amount_invested,
        preferred_return


      } = entry;


      const investorResult = await client.query(
        `INSERT INTO investors (name)
            VALUES ($1)
            RETURNING id`, [investor_name]
      )


      const propertyID = propertyResult.rows[0].id;

      const investorID = investorResult.rows[0].id;

      await client.query(
        `INSERT INTO investments (
         investor_id,
          property_id,
          invested_amount,
          perf_return)  VALUES ($1, $2, $3, $4)`, [
        investorID,
        propertyID,
        amount_invested,
        preferred_return,
      ]
      )
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Property created successfully",

    });
  } catch (error) {
    console.error(error);
  } finally {
    client.release();
  }
};


const getAllProperties = async (req, res) => {
  const getAllPropertiesDB = `
    SELECT * FROM properties`;

  // will need to get for each property the investor associate data.

  const result = await dataBasePool.query(getAllPropertiesDB);

  res.json(result.rows);
};




const getPropertyById = async (req, res) => {
  const propertyId = parseInt(req.params.id, 10);

  const client = await dataBasePool.connect();

  try {
    const propertyResult = await client.query(
      `SELECT *
        FROM properties WHERE id = $1`,
      [propertyId]
    );




    const investorResult = await client.query(
      `
      SELECT 
        i.id AS investor_id,
        i.name AS investor_name,
        inv.invested_amount,
        inv.perf_return,
        inv.role,
        inv.id AS investment_id
      FROM investors i
      JOIN investments inv ON inv.investor_id = i.id
      WHERE inv.property_id = $1
      `,
      [propertyId]
    );



    res.json({
      ...propertyResult.rows[0],
      investors: investorResult.rows.map(row => ({
        id: row.investor_id,
        name: row.investor_name,
        invested_amount: row.invested_amount,
        perf_return: row.perf_return,
        role: row.role,
        investment_id: row.investment_id
      })),

    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  } finally {
    client.release();
  }
};


const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dataBasePool.query(
      `DELETE FROM properties WHERE id = $1 RETURNING *`,
      [id],
    );

    res.json({
      message: "Property deleted successfully",
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const updatePropertyField = async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  try {

    const result = await dataBasePool.query(
      `UPDATE properties
      SET ${field} = $1
      WHERE id = $2
      RETURNING *; `,
      [value, id]

    )

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }


}





export {
  postAProperty,
  getAllProperties,
  getPropertyById,
  deleteProperty,
  updatePropertyField
};
