import "./css/index.css";
import { useParams, Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { MdOutlineUploadFile } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import Loading from "./Loading";
import { authFetch } from "./authFetch";

const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/dhwtnj8eb/image/upload";
const CLOUDINARY_PRESET = "thehamiltongroup";

function PropertyDetail() {
  const [propertyData, setPropertyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pictureError, setPictureError] = useState("");
  const [showAddInvestor, setShowAddInvestor] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  let { id } = useParams();

  const fetchProperty = async () => {
    const res = await authFetch(`/properties/${id}`);
    const data = await res.json();
    setPropertyData(data);
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

    await authFetch(`/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });
  };

  const savePictureUrl = async (value) => {
    const res = await authFetch(`/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: "secure_url", value }),
    });
    if (!res.ok) throw new Error("Could not save the picture.");
    setPropertyData((prev) => ({ ...prev, secure_url: value }));
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setPictureError("Please choose an image under 10 MB.");
      return;
    }

    setPictureError("");
    setUploading(true);
    try {
      // Plain fetch on purpose: the login token must never go to Cloudinary
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", CLOUDINARY_PRESET);
      const up = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
      const uploaded = await up.json();
      if (!up.ok || !uploaded.secure_url) throw new Error("Upload failed.");
      await savePictureUrl(uploaded.secure_url);
    } catch {
      setPictureError("The picture could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm("Remove this picture from the property?")) return;
    setPictureError("");
    try {
      await savePictureUrl(null);
    } catch {
      setPictureError("The picture could not be removed. Please try again.");
    }
  };

  const handleAddInvestor = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setAddError("");

    const name = form.investor_name.value.trim();
    const rawAmount = form.invested_amount.value;
    const rawPref = form.perf_return.value;
    const amount = Number(rawAmount);
    const pref = Number(rawPref);

    if (
      !name ||
      rawAmount === "" ||
      rawPref === "" ||
      !Number.isFinite(amount) ||
      !Number.isFinite(pref) ||
      amount < 0 ||
      pref < 0 ||
      pref > 100
    ) {
      setAddError(
        "Enter a name, an amount, and a preferred return between 0 and 100.",
      );
      return;
    }

    setAdding(true);
    try {
      const res = await authFetch("/investor/addInvestor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investor_name: name,
          invested_amount: amount,
          perf_return: pref,
          property_id: Number(id),
        }),
      });
      if (!res.ok) throw new Error("Add failed.");

      await fetchProperty();
      form.reset();
      setShowAddInvestor(false);
    } catch {
      setAddError("The investor could not be added. Please try again.");
    } finally {
      setAdding(false);
    }
  };

const handleCancelAddInvestor = (e) => {
  e.currentTarget.form?.reset();
  setAddError("");
  setShowAddInvestor(false);
};

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
                value={propertyData?.property_name ?? ""}
                onChange={(e) =>
                  handleEditField("property_name", e.target.value)
                }
              ></input>

              <div className="propertyDetail_flex">
                <div className="pd-picture">
                  {propertyData.secure_url ? (
                    <img
                      src={propertyData.secure_url}
                      alt="property_picture"
                      className="pd-picture-img"
                    />
                  ) : (
                    <div className="pd-picture-empty">No picture yet</div>
                  )}

                  <div className="pd-picture-actions">
                    <label htmlFor="pic_upload" className="pd-btn">
                      <MdOutlineUploadFile />
                      {uploading
                        ? "Uploading..."
                        : propertyData.secure_url
                          ? "Edit"
                          : "Upload"}
                    </label>

                    {propertyData.secure_url && (
                      <button
                        type="button"
                        className="pd-btn pd-btn-danger"
                        onClick={handleDeletePicture}
                        disabled={uploading}
                      >
                        <RiDeleteBin5Line /> Delete
                      </button>
                    )}
                  </div>

                  <input
                    id="pic_upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePictureChange}
                    disabled={uploading}
                  ></input>
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

              {pictureError && <p className="pd-error">{pictureError}</p>}
            </div>

            <div className="PD-in-sec">
              <h4 style={{ fontWeight: "600", marginBottom: "15px" }}>
                QUICK INVESTORS OVERVIEW
              </h4>

              <div className="PD-in-sec-dt">
                {propertyData?.investors?.map((inv) => (
                  <div
                    className="investors_section"
                    key={inv.investment_id ?? inv.id}
                  >
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
        {!showAddInvestor && (
  <button
    type="button"
    className="add-investor"
    onClick={() => {
      setShowAddInvestor(true);
      setAddError("");
    }}
  >
    <FiPlus style={{ fontSize: "26px" }} />
    Add Investor
  </button>
)}

            {showAddInvestor && (
              <form className="add-investor-form" onSubmit={handleAddInvestor}>
                <div className="column-flex" style={{ alignItems: "start" }}>
                  <label htmlFor="new_investor_name" className="fw600">
                    Investor Name
                  </label>
                  <input
                    id="new_investor_name"
                    name="investor_name"
                    type="text"
                    className="deal-input"
                    autoFocus
                    required
                  ></input>
                </div>

                <div className="column-flex" style={{ alignItems: "start" }}>
                  <label htmlFor="new_invested_amount" className="fw600">
                    Amount Invested
                  </label>
                  <input
                    id="new_invested_amount"
                    name="invested_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="deal-input"
                    required
                  ></input>
                </div>

                <div className="column-flex" style={{ alignItems: "start" }}>
                  <label htmlFor="new_perf_return" className="fw600">
                    Preferred Return (%)
                  </label>
                  <input
                    id="new_perf_return"
                    name="perf_return"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="deal-input"
                    required
                  ></input>
                </div>

                <div className="add-investor-actions">
  <button
    type="button"
    className="add-investor add-investor-cancel"
    onClick={handleCancelAddInvestor}
    disabled={adding}
  >
    Cancel
  </button>
  <button type="submit" className="add-investor" disabled={adding}>
    {adding ? "Saving..." : "Save Investor"}
  </button>
</div>

                {addError && <p className="pd-error">{addError}</p>}
              </form>
            )}
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default PropertyDetail;

