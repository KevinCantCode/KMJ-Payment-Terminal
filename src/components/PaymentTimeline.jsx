import React from "react";
import "../styles/PaymentTimeline.css";

function PaymentTimeline({ employees }) {
  // Get next 4 Saturdays
  const getNextSaturdays = (count) => {
    const saturdays = [];
    const today = new Date();
    let nextSaturday = new Date(today);

    // Find next Saturday
    while (nextSaturday.getDay() !== 6) {
      nextSaturday.setDate(nextSaturday.getDate() + 1);
    }

    // Add next 4 Saturdays
    for (let i = 0; i < count; i++) {
      saturdays.push(new Date(nextSaturday));
      nextSaturday.setDate(nextSaturday.getDate() + 7);
    }

    return saturdays;
  };

  const nextSaturdays = getNextSaturdays(4);

  // Group employees by payday
  const weeklyEmployees = employees.filter(
    (emp) => emp.payday === "Saturdays Weekly"
  );
  const biweeklyEmployees = employees.filter(
    (emp) => emp.payday === "Saturdays Bi-weekly"
  );

  return (
    <div className="payment-timeline">
      <h2 className="card-title">Upcoming Payments</h2>
      <div className="timeline-container">
        {nextSaturdays.map((date, index) => {
          const isBiweekly = index % 2 === 0; // Bi-weekly payments on even weeks
          const relevantEmployees = isBiweekly
            ? [...weeklyEmployees, ...biweeklyEmployees]
            : weeklyEmployees;

          return (
            <div key={date.toISOString()} className="timeline-week">
              <div className="timeline-date">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
              <div className="timeline-payments">
                {relevantEmployees.map((employee) => (
                  <div key={employee.id} className="timeline-payment">
                    <span className="employee-name">{employee.name}</span>
                    <span className="payment-amount">
                      $
                      {(employee.payday === "Saturdays Bi-weekly"
                        ? (employee.weekly || 0) * 2
                        : employee.weekly || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentTimeline;
