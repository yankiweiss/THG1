import dataBasePool from "../model/db.js";

const testApi = async (req, res) => {
    try {
        const test = await dataBasePool.query(`
            SELECT p.* ,

            json_agg(
            json_build_object(
            'investment_id', i.id,
            'investor_name',  i.name
             )) AS investors

             FROM properties p

           LEFT JOIN investments inv
           ON inv.property_id = p.id

           LEFT JOIN investors i
           ON i.id = inv.investor_id

        GROUP BY p.id`);

        return res.json(test.rows);
    } catch (error) {
        console.log(error);
    }
};

export default testApi;
