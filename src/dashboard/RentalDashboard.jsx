import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from "recharts";
import RentalStatus from "./Status";

const RentalDashboard = ({ c }) => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("last8Month");
  const [monthlyData, setMonthlyData] = useState([]);

  const processMonthlyData = (contracts) => {
  
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = months.map((month) => ({ month, earnings: 0, bookings: 0 }));
    contracts.forEach((contract) => {
      const date = new Date(contract.datedebut);
      if (contract.statut === "confirmed") {
        const monthIndex = date.getMonth(); 
        if (data[monthIndex]) {
          data[monthIndex].earnings += contract.total || 0; 
          data[monthIndex].bookings += 1; 
        }
      }
    });

    return data;
  };

  const handlePointClick = (payload) => {

    const clickedMonth = payload.month;
    navigate(`/contrats`, { state: { fromRentalDashboard: true, selectedMonth: clickedMonth } });
  };

  useEffect(() => {
    setMonthlyData(processMonthlyData(c)); 
  }, [c]);

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Earnings Summary</h5>
              <select
                className="form-select form-select-sm"
                style={{ width: "auto", minWidth: "140px" }}
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="last8Month">Last 8 Month</option>
              </select>
            </div>
            <div className="card-body">
              <ResponsiveContainer height={300}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} padding={{ left: 10, right: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} width={60} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#ff4d4f"
                    strokeWidth={2}
                    dot={<Dot r={5} fill="#ff4d4f" stroke="white" strokeWidth={2} cursor="pointer" onClick={(e) => handlePointClick(e.payload)} />}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <RentalStatus c={c} />
        </div>
      </div>
    </div>
  );
};

export default RentalDashboard;
