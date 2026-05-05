import "bootstrap/dist/css/bootstrap.min.css";

function SyndicatorDetails({ index, data, onChange }) {
  return (
    <>
      <div className="row g-3 mt-2 justify-content-center">
        <div className="col-md-3">
          <label className="form-label">Investor Name:</label>
          <input
            className="form-control"
            value={data.investor_name}
            onChange={(e) => onChange(index, "investor_name", e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Amount Invested:</label>
          <input
            className="form-control"
            value={data.invested_amount}
            onChange={(e) => onChange(index, "invested_amount", e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Preferred Return:</label>
          <input
            className="form-control"
            value={data.pref_return}
            onChange={(e) => onChange(index, "pref_return", e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

export default SyndicatorDetails;