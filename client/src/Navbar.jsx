import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from "react-router-dom";
import { BiHomeAlt } from "react-icons/bi";
import { LuFiles, LuChartColumnDecreasing } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import MyBarChart from "./Chatrs";
import logo from "../src/assets/logo.png";
import "./css/index.css";
import { useState } from "react";
import {Link} from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate();

  const [activeIcon, setActiveIcon] = useState(null);

  return (
    <>
      <div className="navbar">
      <div >
          <img
            src={logo}
            alt="Company Logo"
            style={{ maxWidth: "99%",  padding: '10% 15%'}}
            onClick={() => navigate("/")}
          />
          </div>
      

        <div className="icons">
          <Link  to={'/'} style={{ textDecoration: 'none' }}><button
            className={`icon ${activeIcon === "home" ? "active" : " "} `}
            onClick={() => setActiveIcon("home")}
          >
            <BiHomeAlt />

           <span>Properties</span> 
          </button></Link>

          <button
            className={`icon ${activeIcon === "file" ? "active" : " "} `}
            onClick={() => setActiveIcon("file")}
          >
            <LuFiles /> <span>Files</span>
          </button>

          <button
            className={`icon ${activeIcon === "chart" ? "active" : " "} `}
            onClick={() => setActiveIcon("chart")}
          >
            <LuChartColumnDecreasing /> <span>Reports</span>
          </button>
<Link to={'/addDeal'}>
          <button
            className={`icon ${activeIcon === "plus" ? "active" : " "} `}
            onClick={() => setActiveIcon("plus")}
          >
            <FiPlus /> <span>Add Deal</span>
          </button>
          </Link>
        </div>

        {/*<section className="log">
          <button className="logOut">Log Out</button>
        </section>*/}
      </div>
    </>
  );
}

export default Navbar;
