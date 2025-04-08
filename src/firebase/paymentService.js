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
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';

const PAYMENTS_COLLECTION = 'payments';
const paymentsCollectionRef = collection(db, PAYMENTS_COLLECTION);

// Get all payments
export const getAllPayments = async () => {
  try {
    const q = query(paymentsCollectionRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      let date;
      
      // Handle both Firestore Timestamp and regular date string
      if (data.timestamp?.toDate) {
        date = data.timestamp.toDate().toLocaleDateString();
      } else if (data.date) {
        date = data.date;
      } else {
        date = 'N/A';
      }

      return {
        id: doc.id,
        ...data,
        date
      };
    });
  } catch (error) {
    console.error("Error getting payments: ", error);
    throw error;
  }
};

// Get recent payments
export const getRecentPayments = async (limitCount = 5) => {
  try {
    const q = query(
      paymentsCollectionRef, 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().timestamp?.toDate().toLocaleDateString() || 'N/A'
    }));
  } catch (error) {
    console.error("Error getting recent payments: ", error);
    throw error;
  }
};

// Get payments by employee ID
export const getPaymentsByEmployeeId = async (employeeId) => {
  try {
    const q = query(
      paymentsCollectionRef, 
      where('employeeId', '==', employeeId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().timestamp?.toDate().toLocaleDateString() || 'N/A'
    }));
  } catch (error) {
    console.error("Error getting payments by employee: ", error);
    throw error;
  }
};

// Add a new payment
export const addPayment = async (paymentData) => {
  try {
    const docRef = await addDoc(collection(db, "payments"), {
      ...paymentData,
      timestamp: Timestamp.fromDate(new Date()),
    });
    return { id: docRef.id, ...paymentData };
  } catch (error) {
    console.error("Error adding payment:", error);
    throw new Error("Failed to add payment");
  }
};

// Get payment by ID
export const getPaymentById = async (id) => {
  try {
    const docRef = doc(db, PAYMENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: data.timestamp?.toDate().toLocaleDateString() || 'N/A'
      };
    } else {
      throw new Error("Payment not found");
    }
  } catch (error) {
    console.error("Error getting payment: ", error);
    throw error;
  }
};

// Update a payment
export const updatePayment = async (id, paymentData) => {
  try {
    const paymentRef = doc(db, "payments", id);
    await updateDoc(paymentRef, {
      ...paymentData,
      updatedAt: new Date().toISOString(),
    });
    return { id, ...paymentData };
  } catch (error) {
    console.error("Error updating payment:", error);
    throw new Error("Failed to update payment");
  }
};

export const deletePayment = async (id) => {
  try {
    const paymentRef = doc(db, "payments", id);
    await deleteDoc(paymentRef);
    return id;
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw new Error("Failed to delete payment");
  }
};

export const getPayments = async () => {
  try {
    const paymentsRef = collection(db, "payments");
    const paymentsSnapshot = await getDocs(paymentsRef);
    return paymentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting payments:", error);
    throw new Error("Failed to get payments");
  }
};

export const getPaymentsByEmployee = async (employeeId) => {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("employeeId", "==", employeeId));
    const paymentsSnapshot = await getDocs(q);
    return paymentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employee payments:", error);
    throw new Error("Failed to get employee payments");
  }
};

export const getPayment = async (id) => {
  try {
    const paymentRef = doc(db, "payments", id);
    const paymentDoc = await getDoc(paymentRef);
    if (paymentDoc.exists()) {
      return { id: paymentDoc.id, ...paymentDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting payment:", error);
    throw new Error("Failed to get payment");
  }
}; 