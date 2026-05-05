import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
//import { calculateQuarterlyReturns, expectedQuarterReturn } from "./utils/CalculatingReturns";
import "chartjs-adapter-date-fns";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement, // <-- add this
  Tooltip,
  TimeScale,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement, // <-- add this
  PointElement, // <-- add this
  Tooltip,
  TimeScale,
  Legend,
);

function Reports() {


  // getting all data as useState
  const [data, setData] = useState();
  const [search, setSearch] = useState("");
  console.log(data)

  

  // get out unique years from the events from and to

  // need to understand this better

  const years = (events = []) => {
    const allYears = new Set();

    events.forEach((e) => {
      if(!e.from_date || !e.to_date) return;
      const from = new Date(e.from_date).getFullYear();
      const to = new Date(e.to_date).getFullYear();

      for (let y = from; y <= to; y++) {
        allYears.add(y);
      }
    });
    return [...allYears].sort();
  };

  const searchPandI = data?.filter(
    (i) =>
      i.property_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.investor_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: function (context) {
            const date = new Date(context[0].raw.x);

           return date.toLocaleDateString()
          },
          label: function (context) {
            const formattedAmount = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(context.raw.y);

            return `Amount: ${formattedAmount}`;
          },
        },
      },
    },

 scales: {
  x: {
    type: "time",
    time: {
      unit: "quarter",
    },
    title: {
      display: true,
      text: "Quarter",
    },
     ticks: {
      callback: function(value,index, ticks) {

       
        const date = new Date(value);
        if (date.getMonth() === 11 && date.getDate() === 31) {
          return "Yearly Total";
        }
        return `Q${Math.floor(date.getMonth() / 3) + 1}`;
      }
    }
  },
  y: {
    beginAtZero: true,
    title: {
      display: true,
      text: "Amount ($)",
    },
    ticks: {
      callback: function (value) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(value);
      },
    },
  },
}
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://thg-seven.vercel.app/api/investment");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
<>
    <style>
    {`
   .page-header {
  background: white;
  border-radius: 16px;
  padding: 25px 30px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  margin-bottom: 35px;
}
  .report-card {
  background: white;
  border-radius: 18px;
  padding: 28px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  transition: transform 0.2s ease;
}

.report-card:hover {
  transform: translateY(-4px);
}
  .report-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
}

.meta-label {
  font-size: 12px;
  text-transform: uppercase;
  color: #888;
  letter-spacing: .05em;
}

.meta-value {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}
  .year-tabs {
  border-bottom: none;
  margin-bottom: 20px;
}

.year-tabs .nav-link {
  border-radius: 50px;
  border: none;
  padding: 6px 16px;
  margin-right: 6px;
  background: #eef2f8;
  color: #444;
  font-weight: 500;
}

.year-tabs .nav-link.active {
  background: #2b6ef2;
  color: white;
}
  .chart-container {
  background: #fafbfe;
  border-radius: 12px;
  padding: 20px;
}
  .search-input {
  border-radius: 30px;
  padding-left: 18px;
  border: 1px solid #ddd;
  background: white;
}

.search-input:focus {
  border-color: #2b6ef2;
  box-shadow: 0 0 0 3px rgba(43,110,242,0.15);
}
    `}

    </style>
  
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-1 page-header">
        <div>
          <h2 className="fw-bold mb-0">Investment Reports</h2>
          <p className="text-muted mb-0 small">
            Quarterly performance breakdown
          </p>
        </div>

        <div style={{ maxWidth: "300px", width: "100%" }}>
          <input
            type="text"
            className="form-control rounded-pill search-input"
            placeholder="🔍 Search investor or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {searchPandI?.map((i, investorIndex) => {
        return (
          <div className="report-card">
            {/* Investor / Property Info */}
            <div className="report-meta">
              <div>
                <div className="meta-label">Investor</div>
                <div className="meta-value">{i.investor_name}</div>
              </div>

              <div>
                <div className="meta-label">Property</div>
                <div className="meta-value">{i.property_name}</div>
              </div>
            </div>

            <ul class="nav year-tabs" id={`myTab-${investorIndex}`} role="tablist">
              {years(i.events).map((y, index) => {
                return (
                  <li key={y} class="nav-item" role="presentation">
                    <button
                      className={`nav-link ${index === 0 ? "active" : ""}`}
                      id={`tab-${investorIndex}-${y}`}
                      data-bs-toggle="tab"
                      data-bs-target={`#content-${investorIndex}-${y}`}
                      type="button"
                      role="tab"
                    >
                      {y}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="tab-content">
              {years(i.events).length > 0 ? (
                years(i.events).map((y, index) => {
                  const chartDataPerYear = {
                    datasets: [
                      {
                        label: "ACTUAL RETURN", // the label shown in the tooltip/legend
                        data: calculateQuarterlyReturns(i.events, y),
                        backgroundColor: "rgba(29, 235, 98, 0.6)", // color of bars
                        barThickness: 40,
                        maxBarThickness: 29,
                      },
                        {
                        label: "MISSING RETURN", // the label shown in the tooltip/legend
                        data: calculateQuarterlyReturns(),
                        backgroundColor: "rgba(248, 86, 37, 0.88)", // color of bars
                        barThickness: 40,
                        maxBarThickness: 29,
                      },
                       {
                    
                        label: "EXPECTED RETURN", // the label shown in the tooltip/legend
                        data: expectedQuarterReturn(y, Number(i.invested_amount), Number(i.perf_return)),
                        backgroundColor: "rgba(37, 146, 248, 0.88)", // color of bars
                        barThickness: 40,
                        maxBarThickness: 29,
                      },
                       
                       
                    ],
                  };

                  return (
                    <div
                      key={y}
                      className={`tab-pane  ${index === 0 ? "show active" : ""}`}
                      id={`content-${investorIndex}-${y}`}
                      role="tabpanel"
                    >
                      <div className="chart-container">
                      <div style={{ height: "220px"}}>
                        <Bar data={chartDataPerYear} options={chartOptions} />
                      </div>
                    </div>
                    </div>
                  );
                })
              ) : (
                <div className="tab-pane show active">
                  <p className="text-center py-5">No events yet</p>
                </div>
              )}
            </div>
          

            {/* Table */}
          </div>
        );
      })}
    </div>
    </>
  );
}

export default Reports;
