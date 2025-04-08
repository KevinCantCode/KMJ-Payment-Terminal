import { db } from './config';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  setDoc
} from 'firebase/firestore';

const EMPLOYEES_COLLECTION = 'kmj-payments';
const employeesCollectionRef = collection(db, EMPLOYEES_COLLECTION);

// Get all employees
export const getAllEmployees = async () => {
  try {
    const snapshot = await getDocs(employeesCollectionRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.id, // Using document ID as the employee name
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting employees: ", error);
    throw error;
  }
};

// Get employee by ID
export const getEmployeeById = async (id) => {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        name: docSnap.id, // Using document ID as the employee name
        ...docSnap.data()
      };
    } else {
      throw new Error("Employee not found");
    }
  } catch (error) {
    console.error("Error getting employee: ", error);
    throw error;
  }
};

// Get employee payment method
export const getEmployeePaymentMethod = async (id) => {
  try {
    const employee = await getEmployeeById(id);
    return employee["payment-method"] || '';
  } catch (error) {
    console.error("Error getting employee payment method: ", error);
    throw error;
  }
};

// Add a new employee
export const addEmployee = async (employee) => {
  try {
    // Use the employee name as the document ID
    const employeeDocRef = doc(db, EMPLOYEES_COLLECTION, employee.name);
    await setDoc(employeeDocRef, {
      "payment-method": employee["payment-method"] || '',
      role: employee.role || '',
      department: employee.department || '',
      hourly: employee.hourly || 0,
      weekly: employee.weekly || 0,
      "hire-date": employee["hire-date"] || '',
      schedule: employee.schedule || '',
      payday: employee.payday || '',
      notes: employee.notes || '',
      solanaAddress: employee.solanaAddress || '',
      wiseAccountId: employee.wiseAccountId || '',
      currency: employee.currency || 'USD',
      // Add any other fields from your kmj-payments collection
    });
    
    return {
      id: employee.name,
      name: employee.name,
      ...employee
    };
  } catch (error) {
    console.error("Error adding employee: ", error);
    throw error;
  }
};

// Update an employee
export const updateEmployee = async (id, updatedEmployee) => {
  try {
    const employeeDoc = doc(db, EMPLOYEES_COLLECTION, id);
    
    // Remove the name from updatedEmployee as it's the document ID
    const { name, ...dataToUpdate } = updatedEmployee;
    
    await updateDoc(employeeDoc, dataToUpdate);
    return {
      id,
      name: id, // Using document ID as the employee name
      ...dataToUpdate
    };
  } catch (error) {
    console.error("Error updating employee: ", error);
    throw error;
  }
};

// Delete an employee
export const deleteEmployee = async (id) => {
  try {
    const employeeDoc = doc(db, EMPLOYEES_COLLECTION, id);
    await deleteDoc(employeeDoc);
    return id;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
}; 