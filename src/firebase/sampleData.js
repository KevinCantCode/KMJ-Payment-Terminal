import { db } from './config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  limit,
  writeBatch,
  doc,
  Timestamp
} from 'firebase/firestore';

// Sample employee data
const sampleEmployees = [
  {
    name: "Michael Johnson",
    position: "Developer",
    team: "Engineering",
    hourlyRate: 25,
    weeklyRate: 1000,
    hoursWorked: 160,
    paymentMethod: "PayPal",
    hireDate: "2022-01-15",
    schedule: "Monday-Friday, 9AM-5PM",
    payday: "Every Friday",
    notes: "Senior developer working on the frontend team. Excellent performance.",
  },
  {
    name: "Sarah Williams",
    position: "Designer",
    team: "Creative",
    hourlyRate: 22,
    weeklyRate: 880,
    hoursWorked: 120,
    paymentMethod: "Wise",
    hireDate: "2022-03-10",
    schedule: "Monday-Thursday, 10AM-6PM",
    payday: "Bi-weekly, Fridays",
    notes: "Part-time UI/UX designer.",
  },
  {
    name: "David Clark",
    position: "Marketing Specialist",
    team: "Marketing",
    hourlyRate: 20,
    weeklyRate: 800,
    hoursWorked: 140,
    paymentMethod: "Solana",
    hireDate: "2022-05-20",
    schedule: "Monday-Friday, 8AM-4PM",
    payday: "Last day of month",
    notes: "Handles social media campaigns and email marketing.",
  },
  {
    name: "Emily Brown",
    position: "Customer Support",
    team: "Operations",
    hourlyRate: 18,
    weeklyRate: 720,
    hoursWorked: 160,
    paymentMethod: "PayPal",
    hireDate: "2022-02-01",
    schedule: "Tuesday-Saturday, 9AM-5PM",
    payday: "Every Friday",
    notes: "Provides technical support to customers.",
  },
  {
    name: "Robert Lee",
    position: "Developer",
    team: "Engineering",
    hourlyRate: 28,
    weeklyRate: 1120,
    hoursWorked: 140,
    paymentMethod: "Wise",
    hireDate: "2021-11-15",
    schedule: "Monday-Friday, 9AM-5PM",
    payday: "Every Friday",
    notes: "Backend developer working on API development.",
  },
];

// Generate sample payment data (will be populated after employees are added)
const generateSamplePayments = (employees) => {
  const payments = [];
  const now = new Date();
  
  // Create some payment history
  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    
    // Add 2-4 payments per employee
    const numPayments = 2 + Math.floor(Math.random() * 3);
    
    for (let j = 0; j < numPayments; j++) {
      // Generate a date within the last 30 days
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      payments.push({
        employeeId: employee.id,
        employee: employee.name,
        amount: (employee.hourlyRate * 40).toFixed(2), // Typical weekly pay
        timestamp: Timestamp.fromDate(date),
        status: "completed",
        method: employee.paymentMethod,
        description: `Weekly payment - ${j + 1}`
      });
    }
  }
  
  return payments;
};

// Initialize sample data in Firestore
export const initSampleData = async () => {
  try {
    // Check if we already have employees
    const employeesRef = collection(db, 'employees');
    const employeesQuery = query(employeesRef, limit(1));
    const employeesSnapshot = await getDocs(employeesQuery);
    
    // Only add sample data if the collection is empty
    if (employeesSnapshot.empty) {
      console.log("Initializing sample data...");
      
      // Add employees first
      const addedEmployees = [];
      for (const employee of sampleEmployees) {
        const docRef = await addDoc(employeesRef, employee);
        addedEmployees.push({
          id: docRef.id,
          ...employee
        });
      }
      
      // Now generate and add payments
      const paymentsRef = collection(db, 'payments');
      const payments = generateSamplePayments(addedEmployees);
      
      // Add payments individually (batch has limitations with auto-generated IDs)
      for (const payment of payments) {
        await addDoc(paymentsRef, payment);
      }
      
      console.log(`Added ${addedEmployees.length} employees and ${payments.length} payments`);
      
      return true;
    } else {
      console.log("Sample data already exists");
      return false;
    }
  } catch (error) {
    console.error("Error initializing sample data:", error);
    return false;
  }
};

// Check if we need to initialize data and do it if needed
export const checkAndInitSampleData = async () => {
  try {
    const employeesRef = collection(db, 'employees');
    const employeesQuery = query(employeesRef, limit(1));
    const employeesSnapshot = await getDocs(employeesQuery);
    
    if (employeesSnapshot.empty) {
      return await initSampleData();
    }
    return false;
  } catch (error) {
    console.error("Error checking sample data:", error);
    return false;
  }
}; 