import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { SolanaProvider } from "./contexts/SolanaContext";
import { WiseProvider } from "./contexts/WiseContext";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Payments from "./pages/Payments";
import PaymentHistory from "./pages/PaymentHistory";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import "./App.css";
import { Connection } from "@solana/web3.js";

function App() {
  const location = useLocation();
  const [activePage, setActivePage] = useState(
    location.pathname === "/" ? "dashboard" : location.pathname.slice(1)
  );

  // Initialize Solana connection
  const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  return (
    <SolanaProvider>
      <WiseProvider>
        <div className="app">
          <Topbar />
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="main-content">
            <Routes>
              <Route
                path="/"
                element={<Dashboard setActivePage={setActivePage} />}
              />
              <Route path="/employees" element={<Employees />} />
              <Route
                path="/payments"
                element={
                  <Payments
                    setActivePage={setActivePage}
                    connection={connection}
                  />
                }
              />
              <Route
                path="/payment-history"
                element={<PaymentHistory setActivePage={setActivePage} />}
              />
            </Routes>
          </main>
        </div>
      </WiseProvider>
    </SolanaProvider>
  );
}

export default App;
