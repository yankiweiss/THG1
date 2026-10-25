import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { authFetch } from "./authFetch";
import { useAuth } from "./AuthContext";
import Loading from "./Loading";

function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "investor") return;

    (async () => {
      const res = await authFetch("/me/investment");
      if (!res.ok) {
        setError("No investment is linked to this account yet.");
        return;
      }
      const me = await res.json();
      navigate(`/investorDetail/${me.property_id}/${me.investor_id}`, {
        replace: true,
      });
    })();
  }, [user, navigate]);

  if (user?.role === "admin") return <Navigate to="/" replace />;
  if (error) return <p className="loading">{error}</p>;
  return <Loading />;
}

export default MyPage;