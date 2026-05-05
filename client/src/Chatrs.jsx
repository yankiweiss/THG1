import "bootstrap/dist/js/bootstrap.bundle.min.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function MyBarChart() {

    
 const data = {
  labels: ["Q1", "Q2", "Q3"],
  datasets: [
    {
      label: "Income",
      data: [5000, 7000, 8000],
    },
    {
      label: "Expenses",
      data: [3000, 4000, 6000],
    },
  ],
};


  return (
  <>  

<ul className="nav nav-tabs mx-5" role="tablist">
  <li className="nav-item">
    <button
      className="nav-link active"
      data-bs-toggle="tab"
      data-bs-target="#year2023"
      type="button"
    >
      2023
    </button>
  </li>

  <li className="nav-item">
    <button
      className="nav-link"
      data-bs-toggle="tab"
      data-bs-target="#year2024"
      type="button"
    >
      2024
    </button>
  </li>

  <li className="nav-item">
    <button
      className="nav-link"
      data-bs-toggle="tab"
      data-bs-target="#year2025"
      type="button"
    >
      2025
    </button>
  </li>
</ul>


<div className="tab-content mt-3 mx-5">

  <div className="tab-pane fade show active" id="year2023">
    <Bar data={data} />
  </div>

  <div className="tab-pane fade" id="year2024">
    <Bar data={data} />
  </div>

  <div className="tab-pane fade" id="year2025">
     <Bar data={data} />
  </div>

</div>


  </>


  )
  ;

  
  
}

export default MyBarChart;