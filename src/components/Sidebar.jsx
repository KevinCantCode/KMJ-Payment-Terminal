import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();

  const handleNavigation = (page, path) => {
    setActivePage(page);
    navigate(path);
  };

  // Calculate the transform for the indicator using index positions
  const getIndicatorPosition = () => {
    const positions = {
      dashboard: 0,
      employees: 1,
      payments: 2,
      "payment-history": 3,
    };

    // Return the index position * CSS variable that represents icon height + gap
    const index = positions[activePage] || 0;

    // Use different transform for different screen sizes
    return {
      // For desktop (translateY)
      transform: `translateY(calc(${index} * var(--icon-total-height)))`,
      // For mobile (translateX) - this will be used by media query in CSS
      "--mobile-position": index,
    };
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-icons">
        <div className="sidebar-indicator" style={getIndicatorPosition()} />

        <div
          className="sidebar-icon"
          onClick={() => handleNavigation("dashboard", "/")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              fill="currentColor"
              d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
            />
          </svg>
          <span className="icon-tooltip">Dashboard</span>
        </div>

        <div
          className="sidebar-icon"
          onClick={() => handleNavigation("employees", "/employees")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              fill="currentColor"
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          <span className="icon-tooltip">Employees</span>
        </div>

        <div
          className="sidebar-icon"
          onClick={() => handleNavigation("payments", "/payments")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              fill="currentColor"
              d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
            />
          </svg>
          <span className="icon-tooltip">Payments</span>
        </div>

        <div
          className="sidebar-icon"
          onClick={() =>
            handleNavigation("payment-history", "/payment-history")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              fill="currentColor"
              d="M13.5 8H12v5l4.28 2.54.72-1.21-3.5-2.08V8zM13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 1 0 0-18z"
            />
          </svg>
          <span className="icon-tooltip">Payment History</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
