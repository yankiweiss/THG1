import { response } from "express";
import dataBasePool from "../model/db.js";

const updateInvestmentReturn = async (req, res) => {
  const { property_id, investor_id } = req.body;

  const findInvestmentID = `
    SELECT id
    FROM investments
    WHERE property_id = $1
    AND investor_id = $2
  `;

  try {
    const response = await dataBasePool.query(findInvestmentID, [
      property_id,
      investor_id,
    ]);

    const investmentID = response.rows[0].id;

    const insertReturn = `INSERT INTO investment_return (investment_id ) VALUES ($1)`;

    const returnResponse = await dataBasePool.query(insertReturn, [
      investmentID,
    ]);

    return res.json(response.rows[0].id);
    console.log("this endpoint has been hit!");
  } catch (error) {
    console.error(error);
  }
};

export default updateInvestmentReturn;
