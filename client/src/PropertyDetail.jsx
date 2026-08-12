import "./css/index.css";
import { MdOutlineUploadFile } from "react-icons/md";
import { useParams } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import Loading from "./Loading";

function PropertyDetail() {
  const [propertyData, setPropertyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addInvestor, setAddInvestor] = useState(false);
  

  let { id } = useParams();

  const fetchProperty = async () => {
    await fetch(`http://localhost:3000/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => setPropertyData(data));

    setLoading(true);
  };

  useEffect(() => {
    fetchProperty();
  }, []);

  const formatNumbers = (number) => {
    const usdFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    return usdFormatter.format(number);
  };

  const handleEditField = async (field, value) => {
    setPropertyData((prev) => ({
      ...prev,
      [field]: value,
    }));

    const payload = {
      field,
      value,
    };

    await fetch(`https://thg-1.vercel.app/api/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  console.log(propertyData);

  

  return (
    <>
      {loading ? (
        <div className="right-side">
          <div className="main-flex">
            <div className="property-content">
              <input
                className="fw600 input "
                id="big-font"
                type="text"
                value={propertyData?.property_name}
                onChange={(e) =>
                  handleEditField("property_name", e.target.value)
                }
              ></input>

              <div className="propertyDetail_flex">
                <div
                  style={{
                    width: "500px",
                    maxHeight: "200px",
                    maxWidth: "500px",
                    height: "200px",
                    borderRadius: "8px",
                    boxShadow: "4px 4px 5px 1px  #1B3C77BF",
                   
                  }}
                >

                  <>
                  
                    <img
                      src={propertyData.secure_url}
                      max-width={"100%"}
                      max-height={"100%"}
                      width={"475px"}
                      height={"200px"}
                      alt="property_picture"
                      
                  />
                  
                      <label htmlFor="pic_upload">
                        <MdOutlineUploadFile
                          fontSize={"75px"}
                          color="#2569C0"
                          style={{ cursor: "pointer" , zIndex: '9999', position: 'absolute', top: '15px', bottom: '50px'}}
                        />
                      </label>
                      <input
                        id="pic_upload"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        
                      ></input>
                    </>
                  
                </div>

                <div className="propertyDetail_fin_flex">
                  <div>
                    <h6 className="PropertyDetail-fin-text">Total Investors</h6>
                    <h6 className="PropertyDetail-fin-value">
                      {propertyData?.investors?.length}
                    </h6>
                  </div>
                  <div>
                    <h6 className="PropertyDetail-fin-text">Purchase Price</h6>
                    <h6 className="PropertyDetail-fin-value">
                      {formatNumbers(propertyData.purchase_price)}
                    </h6>
                  </div>
                  <div>
                    <h6 className="PropertyDetail-fin-text">Closing Date</h6>
                    <h6 className="PropertyDetail-fin-value">
                      {propertyData?.closing_date
                        ? format(
                            parseISO(propertyData.closing_date),
                            "MM/dd/yyyy",
                          )
                        : "Loading..."}
                    </h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="PD-in-sec">
              <h4 style={{ fontWeight: "600", marginBottom: "15px" }}>
                QUICK INVESTORS OVERVIEW
              </h4>

              <div className="PD-in-sec-dt">
                {propertyData?.investors?.map((inv) => (
                  <div className="investors_section">
                    <h3 className="fw600 item">{inv.name}</h3>

                    <Link to={`/investorDetail/${propertyData.id}/${inv.id}`}>
                      <div className="investor_details">
                        <h6
                          style={{
                            textAlign: "center",
                            color: "#2570C0",
                            fontWeight: "600",
                          }}
                          className="item k"
                        >
                          Investor<br></br> Portfolio<br></br> Details
                        </h6>

                        <div className="flex-column item k">
                          <h6 className="fw600">INVESTED</h6>
                          <h6 style={{ color: "#2570C0" }} className="fw600">
                            {formatNumbers(inv.invested_amount)}
                          </h6>
                        </div>

                        <div className="flex-column item k">
                          <h6 className="fw600">PERF RETURN</h6>
                          <h6 style={{ color: "#2570C0" }} className="fw600">
                            {inv.perf_return}%
                          </h6>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="add-investor-section">
            <button className="add-investor">
              <FiPlus style={{ fontSize: "26px" }} />
              Add Investor
            </button>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default PropertyDetail;
