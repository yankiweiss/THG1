import Navbar from "./Navbar";

import Properties from "./Properties";
import { Routes, Route } from "react-router-dom";
import Documents from "./Documents";
import PropertyDetail from "./PropertyDetail";
import Reports from "./Reports";
import InvestorDetail from "./InvestorDetail";
import "./css/index.css";
import AddDeal from "./AddDeal";
import Test from './Test'
import ScrollToTop from "./ScrollToTop";
import Dashboard from "./Dashboard";

function App() {
  return (
    <>
      <div className="app">
        <Navbar />
        <ScrollToTop/>

        <Routes>
          <Route path="/" element={<Properties />} />

          <Route path="/properties" element={<Properties />} />

          <Route path="/addDeal" element={<AddDeal/>} />

          <Route path="/dashboard" element={<Dashboard/>} />

          <Route path="/test" element={<Test/>}/>

           <Route path="/reports" element={<Reports />} />
         
          <Route
            path="/investorDetail/:propertyId/:investorId"
            element={<InvestorDetail />}
          />

          <Route path="/documents" element={<Documents />} />
          <Route path="/propertyDetail/:id" element={<PropertyDetail />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
