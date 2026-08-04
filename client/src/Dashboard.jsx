import { useEffect, useRef, useState } from "react";

function Dashboard() {
  const [activeView, setActiveView] = useState("properties");
  return (
    <>
      <div className="right-side">
        

        <ul style={{ display: "flex", gap: "50px", listStyleType: 'none'}}>
          <button type="button" onClick={() => setActiveView("properties")}>
            <li>
              <b>Properties</b>
            </li>
          </button>
          <button type="button" onClick={() => setActiveView("investors")}>
            <li>
              <b>Investors</b>
            </li>
          </button>
        </ul>
        <hr></hr>

        {activeView === "properties" && (
          <>
            <div>
              <input placeholder="search Properties"></input>
            </div>
            <div className="property_table">
              <table>
                <thead>
                  <tr>
                    <th>Property Pic</th>
                    <th>Property Name</th>
                    <th>Purchase Price</th>
                    <th>Closing Date</th>
                    <th>Total Investors</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td>18 Pulaski st</td>
                    <td>$100,000</td>
                    <td>10/28/29</td>
                    <td style={{ textAlign: "center", padding: "none" }}>
                      Jacob Weiss, yechial morgenstern
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>18 Pulaski st</td>
                    <td>$100,000</td>
                    <td>10/28/29</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeView === "investors" && (
          <>
            <div>
              <input placeholder="search Properties"></input>
            </div>
            <div className="property_table">
              <table>
                <thead>
                  <tr>
                    <th>investor Name</th>
                    <th>Total Investments</th>
                    <th>Purchase Price</th>
                    <th>Closing Date</th>
                    <th>Property Investors</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td>18 Pulaski st</td>
                    <td>$100,000</td>
                    <td>10/28/29</td>
                    <td style={{ textAlign: "center", padding: "none" }}>
                      Jacob Weiss, yechial morgenstern
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>18 Pulaski st</td>
                    <td>$100,000</td>
                    <td>10/28/29</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
