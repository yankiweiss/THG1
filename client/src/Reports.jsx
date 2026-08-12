import { useState } from "react";
import "./css/index.css";
import { useEffect } from "react";

import {
  AllDealsReturns
} from "./utils/CalculatingReturns.js";

function Reports() {
  const [dealData, setDealData] = useState();

  const getAllDeals = async () => {
    const url = "http://localhost:3000/api/investor";
    const response = await fetch(url);
    const data = await response.json();
    setDealData(data);
  };

  console.log(dealData);

  useEffect(() => {
    getAllDeals();
  }, []);

 AllDealsReturns(dealData);

  return (
    <>
      <div className="right-side">
        <div style={{ height: "150px" }}>
          <h1>Settings</h1>

          <label>Search Property Name</label>

          <input></input>

          <label>Search Bases On</label>
          <select>
            <option>Actual Return</option>
            <option>Expected Return</option>
          </select>

          <select>
            <option>Is less</option>
            <option>Is More</option>
          </select>

          <select>
            <option>Actual Return</option>
            <option>Expected Return</option>
          </select>

          {/* i want they should be able to search via investor and property */}
        </div>

        <div id="reports_table">
          <table>
            <thead>
              <tr>
                <th>Property Name:</th>
                <th>Investor Name:</th>
                <th>Closing Date:</th>
                <th>Expected Return:</th>
                <th>Actual Return:</th>
              </tr>
            </thead>
            <tbody>
              {dealData?.map((deal) => (
                <>
                  <tr>
                    {/* i would like to have that when clicking on the row it should go to investor detailed page */}
                    <td>{deal.property_name}</td>
                    <td>{deal.investor_name}</td>
                    <td>{deal.closing_date}</td>
                    <td>$500,0000</td>
                    <td>$500,0000</td>
                  </tr>
                </>
              ))}
              <tr></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Reports;
