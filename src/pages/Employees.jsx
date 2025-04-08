import React, { useState, useRef, useEffect } from "react";
import Modal from "../components/Modal";
import "../styles/Employees.css";
import {
  getAllEmployees,
  updateEmployee,
  addEmployee,
  deleteEmployee,
} from "../firebase/employeeService";
import { useNavigate } from "react-router-dom";

function Employees() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [originalNotes, setOriginalNotes] = useState("");
  const notesTextareaRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New employee form state
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    department: "",
    "hire-date": "",
    hourly: "",
    weekly: "",
    "payment-method": "",
    schedule: "",
    payday: "",
    notes: "",
    solanaAddress: "",
    wiseAccountId: "",
    currency: "USD",
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleOpenModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    setIsEditMode(false);
    setNotes(employee.notes || "");
    setOriginalNotes(employee.notes || "");
  };

  const closeModal = () => {
    // Don't save automatically when closing modal
    if (isEditMode) {
      // Revert to original notes if not saved
      setNotes(originalNotes);
    }

    setIsModalOpen(false);
    setSelectedEmployee(null);
    setIsEditMode(false);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    // Reset the form
    setNewEmployee({
      name: "",
      role: "",
      department: "",
      "hire-date": "",
      hourly: "",
      weekly: "",
      "payment-method": "",
      schedule: "",
      payday: "",
      notes: "",
      solanaAddress: "",
      wiseAccountId: "",
      currency: "USD",
    });
    setFormErrors({});
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleNotesClick = () => {
    if (!isEditMode) {
      setIsEditMode(true);

      // Focus the textarea when entering edit mode
      setTimeout(() => {
        if (notesTextareaRef.current) {
          notesTextareaRef.current.focus();
        }
      }, 50);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const saveNotes = async () => {
    setIsEditMode(false);
    try {
      // Update the notes in Firebase
      await updateEmployee(selectedEmployee.id, {
        ...selectedEmployee,
        notes: notes,
      });

      // Update local state
      setEmployees(
        employees.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, notes: notes } : emp
        )
      );

      // Update original notes to reflect saved state
      setOriginalNotes(notes);
    } catch (err) {
      console.error("Error saving notes:", err);
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    // Restore original notes
    setNotes(originalNotes);
  };

  // Handle keyboard events (Enter to save)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      saveNotes();
    }

    // Shift+Enter is allowed to pass through for new lines
  };

  // Handle new employee form changes
  const handleNewEmployeeChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!newEmployee.name || newEmployee.name.trim() === "") {
      errors.name = "Name is required";
    }

    if (
      !newEmployee["payment-method"] ||
      newEmployee["payment-method"].trim() === ""
    ) {
      errors["payment-method"] = "Payment method is required";
    }

    if (!newEmployee.role || newEmployee.role.trim() === "") {
      errors.role = "Position is required";
    }

    return errors;
  };

  // Handle form submission
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setAddingEmployee(true);

      // Convert hourly and weekly to numbers
      const employeeData = {
        ...newEmployee,
        hourly: newEmployee.hourly ? parseFloat(newEmployee.hourly) : 0,
        weekly: newEmployee.weekly ? parseFloat(newEmployee.weekly) : 0,
      };

      // Add employee to Firebase
      const addedEmployee = await addEmployee(employeeData);

      // Update local state
      setEmployees([...employees, addedEmployee]);

      // Close modal
      closeAddModal();
    } catch (err) {
      console.error("Error adding employee:", err);
      setFormErrors({
        submit: "Failed to add employee. Please try again.",
      });
    } finally {
      setAddingEmployee(false);
    }
  };

  // Handle clicking outside the textarea - now just cancels editing without saving
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isEditMode &&
        notesTextareaRef.current &&
        !notesTextareaRef.current.contains(e.target)
      ) {
        cancelEdit();
      }
    };

    if (isEditMode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditMode, selectedEmployee]);

  const handleEditClick = (e, employee) => {
    e.stopPropagation(); // Prevent modal from opening
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
    setEditFormErrors({});
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleEditEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editingEmployee.name || editingEmployee.name.trim() === "") {
      errors.name = "Name is required";
    }

    if (
      !editingEmployee["payment-method"] ||
      editingEmployee["payment-method"].trim() === ""
    ) {
      errors["payment-method"] = "Payment method is required";
    }

    if (!editingEmployee.role || editingEmployee.role.trim() === "") {
      errors.role = "Position is required";
    }

    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      setIsUpdating(true);

      // Convert hourly and weekly to numbers
      const employeeData = {
        ...editingEmployee,
        hourly: editingEmployee.hourly ? parseFloat(editingEmployee.hourly) : 0,
        weekly: editingEmployee.weekly ? parseFloat(editingEmployee.weekly) : 0,
      };

      // Update employee in Firebase
      const updatedEmployee = await updateEmployee(
        editingEmployee.id,
        employeeData
      );

      // Update local state
      setEmployees(
        employees.map((emp) =>
          emp.id === editingEmployee.id ? updatedEmployee : emp
        )
      );

      // Close modal
      closeEditModal();
    } catch (err) {
      console.error("Error updating employee:", err);
      setEditFormErrors({
        submit: "Failed to update employee. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (e, employee) => {
    e.stopPropagation(); // Prevent modal from opening
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    try {
      setIsDeleting(true);
      await deleteEmployee(employeeToDelete.id);

      // Update local state
      setEmployees(employees.filter((emp) => emp.id !== employeeToDelete.id));

      // Close modal
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting employee:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePayClick = (e, employee) => {
    e.stopPropagation(); // Prevent modal from opening
    navigate(`/payments?employee=${encodeURIComponent(employee.name)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newEmployee.name ||
      !newEmployee.role ||
      !newEmployee.department ||
      !newEmployee.hourly ||
      !newEmployee.weekly ||
      !newEmployee["payment-method"] ||
      !newEmployee.schedule ||
      !newEmployee.payday
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const employeeData = {
        ...newEmployee,
        hourly: parseFloat(newEmployee.hourly),
        weekly: parseFloat(newEmployee.weekly),
        "payment-method": newEmployee["payment-method"],
        ...(newEmployee["payment-method"] === "Solana" && {
          solanaAddress: newEmployee.solanaAddress,
        }),
        ...(newEmployee["payment-method"] === "Wise" && {
          wiseAccountId: newEmployee.wiseAccountId,
          currency: newEmployee.currency,
        }),
        createdAt: new Date().toISOString(),
      };

      const addedEmployee = await addEmployee(employeeData);

      // Reset form
      setNewEmployee({
        name: "",
        role: "",
        department: "",
        "hire-date": "",
        hourly: "",
        weekly: "",
        "payment-method": "",
        schedule: "",
        payday: "",
        notes: "",
        solanaAddress: "",
        wiseAccountId: "",
        currency: "USD",
      });

      // Refresh employees list
      const employeesData = await getAllEmployees();
      setEmployees(employeesData);
    } catch (err) {
      console.error("Error adding employee:", err);
      setError(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="employees-page">
        <div className="loading-spinner">Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employees-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="employees-header">
        <h1 className="page-title">Employees</h1>
        <button
          className="btn btn-primary add-employee-btn"
          onClick={openAddModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Employee
        </button>
      </div>

      <div className="card employees-card">
        <div className="employees-table-container">
          {employees.length === 0 ? (
            <div className="no-data-message">No employees found</div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Total Earnings</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  employees.reduce((acc, employee) => {
                    const team = employee.department || "Unassigned";
                    if (!acc[team]) {
                      acc[team] = [];
                    }
                    acc[team].push(employee);
                    return acc;
                  }, {})
                ).map(([team, teamEmployees]) =>
                  teamEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      onClick={() => handleOpenModal(employee)}
                      className="employee-row"
                    >
                      <td>{team}</td>
                      <td>{employee.name}</td>
                      <td>{employee.role || "N/A"}</td>
                      <td>
                        $
                        {(
                          (employee.hourly || 0) * (employee.hoursWorked || 0)
                        ).toFixed(2)}
                      </td>
                      <td>{employee["payment-method"] || "N/A"}</td>
                      <td
                        className="actions-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="action-icon pay-icon"
                          title="Pay"
                          onClick={(e) => handlePayClick(e, employee)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                          >
                            <path
                              fill="currentColor"
                              d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
                            />
                          </svg>
                        </button>
                        <button
                          className="action-icon edit-icon"
                          title="Edit"
                          onClick={(e) => handleEditClick(e, employee)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                          >
                            <path
                              fill="currentColor"
                              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                            />
                          </svg>
                        </button>
                        <button
                          className="action-icon delete-icon"
                          title="Delete"
                          onClick={(e) => handleDeleteClick(e, employee)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                          >
                            <path
                              fill="currentColor"
                              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedEmployee && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedEmployee.name}
          isEditing={isEditMode}
          onCancelEdit={cancelEdit}
        >
          <div className="employee-details">
            <div className="detail-columns">
              <div className="detail-column">
                <div className="detail-group">
                  <h3>Job Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">
                      {selectedEmployee.role || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Team:</span>
                    <span className="detail-value">
                      {selectedEmployee.department || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Hire Date:</span>
                    <span className="detail-value">
                      {selectedEmployee["hire-date"] || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Payment Details</h3>
                  <div className="detail-item">
                    <span className="detail-label">Hourly Rate:</span>
                    <span className="detail-value">
                      ${selectedEmployee.hourly?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Weekly Rate:</span>
                    <span className="detail-value">
                      ${selectedEmployee.weekly?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">
                      {selectedEmployee["payment-method"] || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-column">
                <div className="detail-group">
                  <h3>Schedule</h3>
                  <div className="detail-item">
                    <span className="detail-label">Work Schedule:</span>
                    <span className="detail-value">
                      {selectedEmployee.schedule || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payday:</span>
                    <span className="detail-value">
                      {selectedEmployee.payday || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Notes</h3>
                  {isEditMode ? (
                    <div className="notes-editor-container">
                      <textarea
                        className="notes-textarea"
                        value={notes}
                        onChange={handleNotesChange}
                        ref={notesTextareaRef}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter notes about this employee..."
                      ></textarea>
                      <div className="notes-editor-hint">
                        Press <kbd>Enter</kbd> to save or <kbd>Esc</kbd> to
                        cancel
                      </div>
                    </div>
                  ) : (
                    <div
                      className="notes-display clickable"
                      onClick={handleNotesClick}
                    >
                      {notes || "Click to add notes..."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Add New Employee"
      >
        <form className="add-employee-form" onSubmit={handleSubmit}>
          {formErrors.submit && (
            <div className="error-message">{formErrors.submit}</div>
          )}

          <div className="modal-form-group">
            <label className="modal-label" htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`modal-input ${formErrors.name ? "error" : ""}`}
              value={newEmployee.name}
              onChange={handleNewEmployeeChange}
              placeholder="Enter employee's full name"
              required
            />
            {formErrors.name && (
              <div className="field-error">{formErrors.name}</div>
            )}
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="role">
                Position <span className="required">*</span>
              </label>
              <input
                type="text"
                id="role"
                name="role"
                className={`modal-input ${formErrors.role ? "error" : ""}`}
                value={newEmployee.role}
                onChange={handleNewEmployeeChange}
                placeholder="e.g. Chatter"
                required
              />
              {formErrors.role && (
                <div className="field-error">{formErrors.role}</div>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="department">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className="modal-input"
                value={newEmployee.department}
                onChange={handleNewEmployeeChange}
                placeholder="e.g. Hayley"
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="hire-date">
                Hire Date
              </label>
              <input
                type="text"
                id="hire-date"
                name="hire-date"
                className="modal-input"
                value={newEmployee["hire-date"]}
                onChange={handleNewEmployeeChange}
                placeholder="e.g. June 2023"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="payment-method">
                Payment Method <span className="required">*</span>
              </label>
              <select
                id="payment-method"
                name="payment-method"
                value={newEmployee["payment-method"]}
                onChange={handleNewEmployeeChange}
                required
              >
                <option value="">Select payment method</option>
                <option value="Wise">Wise</option>
                <option value="Solana">Solana</option>
                <option value="USDT TRC 20">USDT TRC 20</option>
              </select>
              {formErrors["payment-method"] && (
                <div className="error-message">
                  {formErrors["payment-method"]}
                </div>
              )}
            </div>
          </div>

          {newEmployee["payment-method"] === "Solana" && (
            <div className="form-group">
              <label htmlFor="solanaAddress">Solana Wallet Address</label>
              <input
                type="text"
                id="solanaAddress"
                name="solanaAddress"
                value={newEmployee.solanaAddress}
                onChange={handleNewEmployeeChange}
                className="modal-input"
                placeholder="Enter Solana wallet address"
              />
              {formErrors.solanaAddress && (
                <span className="error-message">
                  {formErrors.solanaAddress}
                </span>
              )}
            </div>
          )}

          {newEmployee["payment-method"] === "Wise" && (
            <>
              <div className="form-group">
                <label htmlFor="wise-account-id">
                  Wise Account ID (Membership Number)
                </label>
                <input
                  type="text"
                  id="wise-account-id"
                  name="wiseAccountId"
                  value={newEmployee.wiseAccountId}
                  onChange={handleNewEmployeeChange}
                  placeholder="Enter Wise membership number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={newEmployee.currency}
                  onChange={handleNewEmployeeChange}
                  required
                >
                  <option value="USD">USD</option>
                  <option value="PHP">PHP</option>
                </select>
              </div>
            </>
          )}

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="hourly">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                id="hourly"
                name="hourly"
                className="modal-input"
                value={newEmployee.hourly}
                onChange={handleNewEmployeeChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="weekly">
                Weekly Rate ($)
              </label>
              <input
                type="number"
                id="weekly"
                name="weekly"
                className="modal-input"
                value={newEmployee.weekly}
                onChange={handleNewEmployeeChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="modal-form-row">
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="schedule">
                Work Schedule
              </label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                className="modal-input"
                value={newEmployee.schedule}
                onChange={handleNewEmployeeChange}
                placeholder="e.g. Monday-Friday, 9AM-5PM"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="payday">
                Payday
              </label>
              <select
                id="payday"
                name="payday"
                className="modal-select"
                value={newEmployee.payday}
                onChange={handleNewEmployeeChange}
              >
                <option value="">Select Payday</option>
                <option value="Saturdays Weekly">Saturdays Weekly</option>
                <option value="Saturdays Bi-weekly">Saturdays Bi-weekly</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-label" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              className="modal-textarea"
              value={newEmployee.notes}
              onChange={handleNewEmployeeChange}
              placeholder="Additional notes about this employee..."
              rows="3"
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeAddModal}
              disabled={addingEmployee}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addingEmployee}
            >
              {addingEmployee ? "Adding Employee..." : "Add Employee"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          title="Edit Employee"
        >
          <form className="add-employee-form" onSubmit={handleEditSubmit}>
            {editFormErrors.submit && (
              <div className="error-message">{editFormErrors.submit}</div>
            )}

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="edit-name">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                className={`modal-input ${editFormErrors.name ? "error" : ""}`}
                value={editingEmployee.name}
                onChange={handleEditEmployeeChange}
                placeholder="Enter employee's full name"
                required
              />
              {editFormErrors.name && (
                <div className="field-error">{editFormErrors.name}</div>
              )}
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-label" htmlFor="edit-role">
                  Position <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="edit-role"
                  name="role"
                  className={`modal-input ${
                    editFormErrors.role ? "error" : ""
                  }`}
                  value={editingEmployee.role}
                  onChange={handleEditEmployeeChange}
                  placeholder="e.g. Chatter"
                  required
                />
                {editFormErrors.role && (
                  <div className="field-error">{editFormErrors.role}</div>
                )}
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="edit-department">
                  Department
                </label>
                <input
                  type="text"
                  id="edit-department"
                  name="department"
                  className="modal-input"
                  value={editingEmployee.department}
                  onChange={handleEditEmployeeChange}
                  placeholder="e.g. Hayley"
                />
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-label" htmlFor="edit-hire-date">
                  Hire Date
                </label>
                <input
                  type="text"
                  id="edit-hire-date"
                  name="hire-date"
                  className="modal-input"
                  value={editingEmployee["hire-date"]}
                  onChange={handleEditEmployeeChange}
                  placeholder="e.g. June 2023"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="edit-payment-method">
                  Payment Method <span className="required">*</span>
                </label>
                <select
                  id="edit-payment-method"
                  name="payment-method"
                  className={`modal-select ${
                    editFormErrors["payment-method"] ? "error" : ""
                  }`}
                  value={editingEmployee["payment-method"]}
                  onChange={handleEditEmployeeChange}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="Wise">Wise</option>
                  <option value="Solana">Solana</option>
                  <option value="USDT TRC 20">USDT TRC 20</option>
                </select>
                {editFormErrors["payment-method"] && (
                  <div className="field-error">
                    {editFormErrors["payment-method"]}
                  </div>
                )}
              </div>
            </div>

            {editingEmployee["payment-method"] === "Solana" && (
              <div className="form-group">
                <label htmlFor="edit-solanaAddress">
                  Solana Wallet Address
                </label>
                <input
                  type="text"
                  id="edit-solanaAddress"
                  name="solanaAddress"
                  value={editingEmployee.solanaAddress || ""}
                  onChange={handleEditEmployeeChange}
                  className="modal-input"
                  placeholder="Enter Solana wallet address"
                />
                {editFormErrors.solanaAddress && (
                  <span className="error-message">
                    {editFormErrors.solanaAddress}
                  </span>
                )}
              </div>
            )}

            {editingEmployee["payment-method"] === "Wise" && (
              <>
                <div className="form-group">
                  <label htmlFor="edit-wise-account-id">
                    Wise Account ID (Membership Number)
                  </label>
                  <input
                    type="text"
                    id="edit-wise-account-id"
                    name="wiseAccountId"
                    value={editingEmployee.wiseAccountId || ""}
                    onChange={handleEditEmployeeChange}
                    className="modal-input"
                    placeholder="Enter Wise membership number"
                  />
                  {editFormErrors.wiseAccountId && (
                    <span className="error-message">
                      {editFormErrors.wiseAccountId}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-currency">Currency</label>
                  <select
                    id="edit-currency"
                    name="currency"
                    value={editingEmployee.currency || "USD"}
                    onChange={handleEditEmployeeChange}
                    className="modal-select"
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="PHP">PHP</option>
                  </select>
                  {editFormErrors.currency && (
                    <span className="error-message">
                      {editFormErrors.currency}
                    </span>
                  )}
                </div>
              </>
            )}

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-label" htmlFor="edit-hourly">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  id="edit-hourly"
                  name="hourly"
                  className="modal-input"
                  value={editingEmployee.hourly}
                  onChange={handleEditEmployeeChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="edit-weekly">
                  Weekly Rate ($)
                </label>
                <input
                  type="number"
                  id="edit-weekly"
                  name="weekly"
                  className="modal-input"
                  value={editingEmployee.weekly}
                  onChange={handleEditEmployeeChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label className="modal-label" htmlFor="edit-schedule">
                  Work Schedule
                </label>
                <input
                  type="text"
                  id="edit-schedule"
                  name="schedule"
                  className="modal-input"
                  value={editingEmployee.schedule}
                  onChange={handleEditEmployeeChange}
                  placeholder="e.g. Monday-Friday, 9AM-5PM"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="edit-payday">
                  Payday
                </label>
                <select
                  id="edit-payday"
                  name="payday"
                  className="modal-select"
                  value={editingEmployee.payday}
                  onChange={handleEditEmployeeChange}
                >
                  <option value="">Select Payday</option>
                  <option value="Saturdays Weekly">Saturdays Weekly</option>
                  <option value="Saturdays Bi-weekly">
                    Saturdays Bi-weekly
                  </option>
                </select>
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-label" htmlFor="edit-notes">
                Notes
              </label>
              <textarea
                id="edit-notes"
                name="notes"
                className="modal-textarea"
                value={editingEmployee.notes}
                onChange={handleEditEmployeeChange}
                placeholder="Additional notes about this employee..."
                rows="3"
              ></textarea>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeEditModal}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Employee"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          title="Delete Employee"
        >
          <div className="delete-confirmation">
            <p>
              Are you sure you want to delete{" "}
              <strong>{employeeToDelete.name}</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Employee"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Employees;
