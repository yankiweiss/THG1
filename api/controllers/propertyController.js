import dataBasePool from "../model/db.js";

const postAProperty = async (req, res) => {
  const { property_name, purchase_price, investors, pictures, closing_date } =
    req.body;

  if (!Array.isArray(investors)) {
    return res.status(400).json({ error: "Invalid investors data" });
  }

  const client = await dataBasePool.connect();

  try {
    await client.query("BEGIN");

    const propertyResult = await client.query(
      `INSERT INTO properties(property_name, purchase_price, secure_url, closing_date)
       VALUES($1, $2, $3, $4) RETURNING id`,
      [property_name, purchase_price, pictures, closing_date],
    );

    if (!propertyResult.rows.length) {
      throw new Error("Property insert failed");
    }

    const propertyID = propertyResult.rows[0].id;

    for (const entry of investors) {
      const { investor_name, amount_invested, preferred_return } = entry;

      const investorResult = await client.query(
        `INSERT INTO investors (name) VALUES ($1) RETURNING id`,
        [investor_name],
      );

      const investorID = investorResult.rows[0].id;

      await client.query(
        `INSERT INTO investments (
          investor_id,
          property_id,
          invested_amount,
          perf_return
        ) VALUES ($1, $2, $3, $4)`,
        [investorID, propertyID, amount_invested, preferred_return],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ message: "Property created successfully" });
  } catch (error) {
    await client.query("ROLLBACK"); // ✅ critical
    console.error(error);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};

//const postAProperty = async (req, res) => {
//  const { property_name, purchase_price, investors, pictures, closing_date } =
//    req.body;
//
//  const client = await dataBasePool.connect();
//
//  try {
//    await client.query("BEGIN");
//
//    const propertyResult = await client.query(
//      `
//  INSERT INTO properties(property_name, purchase_price, secure_url, closing_date )
//  VALUES($1, $2, $3, $4) RETURNING id`,
//      [property_name, purchase_price, pictures, closing_date],
//    );
//
//    for (const entry of investors) {
//      const { investor_name, amount_invested, preferred_return } = entry;
//
//      const investorResult = await client.query(
//        `INSERT INTO investors (name)
//            VALUES ($1)
//            RETURNING id`,
//        [investor_name],
//      );
//
//      const propertyID = propertyResult.rows[0].id;
//
//      if (!propertyResult.rows.length) {
//  throw new Error("Property insert failed");
//}
//
//      const investorID = investorResult.rows[0].id;
//
//      await client.query(
//        `INSERT INTO investments (
//         investor_id,
//          property_id,
//          invested_amount,
//          perf_return)  VALUES ($1, $2, $3, $4)`,
//        [investorID, propertyID, amount_invested, preferred_return],
//      );
//    }
//
//    await client.query("COMMIT");
//
//    res.status(201).json({
//      message: "Property created successfully",
//    });
//  } catch (error) {
//    await client.query("ROLLBACK");
//    console.error(error);
//    res.status(500).json({ error: "Server error" });
//  } finally {
//    client.release();
//  }
//};

const getAllProperties = async (req, res) => {
  const getAllPropertiesDB = `
    SELECT * FROM properties`;

  console.log("query started");

  console.log(process.env.DATABASE_URL);

  let result;

  // will need to get for each property the investor associate data.

  try {
    result = await dataBasePool.query(getAllPropertiesDB);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }

  console.log("QUERY DONE");

  return res.json(result.rows);
};

const getPropertyById = async (req, res) => {
  const propertyId = parseInt(req.params.id, 10);

  try {
    const propertyResult = await dataBasePool.query(
      `SELECT *
        FROM properties WHERE id = $1`,
      [propertyId],
    );

    const investorResult = await dataBasePool.query(
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
      [propertyId],
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({
      ...propertyResult.rows[0],
      investors: investorResult.rows.map((row) => ({
        id: row.investor_id,
        name: row.investor_name,
        invested_amount: row.invested_amount,
        perf_return: row.perf_return,
        role: row.role,
        investment_id: row.investment_id,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
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
      [value, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

export {
  postAProperty,
  getAllProperties,
  getPropertyById,
  deleteProperty,
  updatePropertyField,
};
