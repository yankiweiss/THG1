import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from "react-router-dom";
import { BiHomeAlt } from "react-icons/bi";
import { LuFiles, LuChartColumnDecreasing, LuLogOut } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import MyBarChart from "./Chatrs";
import logo from "../src/assets/logo.png";
import "./css/index.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeIcon, setActiveIcon] = useState(null);

  return (
    <>
      <div className="navbar">
        <div>
          <img
            src={logo}
            alt="Company Logo"
            style={{ maxWidth: "99%", padding: "10% 15%" }}
            onClick={() => navigate("/")}
          />
        </div>

        <div className="icons">
          <Link to={"/dashboard"} style={{ textDecoration: "none" }}>
            <button
              className={`icon ${activeIcon === "file" ? "active" : " "} `}
              onClick={() => setActiveIcon("file")}
            >
              <LuFiles /> <span>Dashboard</span>
            </button>
          </Link>

          <Link to={"/"} style={{ textDecoration: "none" }}>
            <button
              className={`icon ${activeIcon === "home" ? "active" : " "} `}
              onClick={() => setActiveIcon("home")}
            >
              <BiHomeAlt />

              <span>Properties</span>
            </button>
          </Link>

          <button
            className={`icon ${activeIcon === "file" ? "active" : " "} `}
            onClick={() => setActiveIcon("file")}
          >
            <LuFiles /> <span>Files</span>
          </button>

          <Link to={"/reports"} style={{ textDecoration: "none" }}>
            <button
              className={`icon ${activeIcon === "chart" ? "active" : " "} `}
              onClick={() => setActiveIcon("chart")}
            >
              <LuChartColumnDecreasing /> <span>Reports</span>
            </button>
          </Link>

          <Link to={"/addDeal"}>
            <button
              className={`icon ${activeIcon === "plus" ? "active" : " "} `}
              onClick={() => setActiveIcon("plus")}
            >
              <FiPlus /> <span>Add Deal</span>
            </button>
          </Link>
          <button
  className="icon logout-btn"
  onClick={() => {
    logout();
    navigate("/login");
  }}
>
  <LuLogOut /> <span>Log Out</span>
</button>
        </div>

       
      </div>
    </>
  );
}

export default Navbar;
